import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  useToast,
  Skeleton,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import '../styles/global.css';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';

// Utility function for exponential backoff retry
const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0 || !error.message.includes('429')) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2);
  }
};

const TokenBalance = ({ mintKey }) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const toast = useToast();
  
  // Convert mintKey string to PublicKey object
  const mintPubKey = mintKey ? new PublicKey(mintKey) : null;

  const [solBalance, setSolBalance] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!publicKey) {
        setSolBalance(null);
        setTokenBalance(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch SOL balance with retry
        const balance = await retry(async () => {
          return await connection.getBalance(publicKey);
        });
        setSolBalance(balance / LAMPORTS_PER_SOL);

        // Fetch token balance if mintKey exists
        if (mintPubKey) {
          const associatedTokenAddress = await getAssociatedTokenAddress(
            mintPubKey,
            publicKey
          );

          try {
            const tokenAccount = await retry(async () => {
              return await getAccount(connection, associatedTokenAddress);
            });
            setTokenBalance(Number(tokenAccount.amount));
          } catch (error) {
            if (!error.message.includes('not found')) {
              console.error('Error fetching token account:', error);
            }
            setTokenBalance(0);
          }
        }
      } catch (error) {
        console.error('Error fetching balances:', error);
        const isRateLimit = error.message.includes('429');
        toast({
          title: 'Error fetching balances',
          description: isRateLimit ? 'Rate limit exceeded. Please try again later.' : error.message,
          status: 'error',
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();

    // Set up balance polling with increased interval to reduce rate limiting
    const intervalId = setInterval(fetchBalances, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId);
  }, [publicKey, connection, mintPubKey]);

  if (!publicKey) {
    return null;
  }

  const countUpAnimation = keyframes`
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.95);
      filter: blur(2px);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
      filter: blur(0);
    }
  `;

  return (
    <Box
      p={6}
      className="glass-card stat-card"
      _hover={{ transform: 'translateY(-4px)' }}
      transition="all 0.3s ease"
    >
      <StatGroup spacing={8}>
        <Stat
          animation={`${countUpAnimation} 0.5s ease-out`}
          p={4}
          borderRadius="lg"
          bg="rgba(255, 255, 255, 0.1)"
          backdropFilter="blur(10px)"
        >
          <StatLabel fontSize="lg" color="gray.600" mb={2}>
            SOL Balance
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold">
            <Skeleton
              isLoaded={!loading}
              startColor="rgba(255, 255, 255, 0.1)"
              endColor="rgba(255, 255, 255, 0.3)"
            >
              {solBalance !== null ? `${solBalance.toFixed(4)} SOL` : '0 SOL'}
            </Skeleton>
          </StatNumber>
        </Stat>

        {mintKey && (
          <Stat
            animation={`${countUpAnimation} 0.5s ease-out`}
            p={4}
            borderRadius="lg"
            bg="rgba(255, 255, 255, 0.1)"
            backdropFilter="blur(10px)"
          >
            <StatLabel fontSize="lg" color="gray.600" mb={2}>
              Token Balance
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold">
              <Skeleton
                isLoaded={!loading}
                startColor="rgba(255, 255, 255, 0.1)"
                endColor="rgba(255, 255, 255, 0.3)"
              >
                {tokenBalance !== null ? tokenBalance.toString() : '0'}
              </Skeleton>
            </StatNumber>
          </Stat>
        )}
      </StatGroup>
    </Box>
  );
};

export default TokenBalance;