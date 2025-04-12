import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Text,
  NumberInput,
  NumberInputField,
  Divider,
  Spinner,
  HStack,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import '../styles/TokenCreator.css';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import { Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';

// Import new components
import TokenBalance from './TokenBalance';
import TokenTransfer from './TokenTransfer';
import TransactionHistory from './TransactionHistory';

const TokenCreator = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const toast = useToast();

  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [decimals, setDecimals] = useState(9);
  const [mintAmount, setMintAmount] = useState(1);
  const [mintKey, setMintKey] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreateToken = async () => {
    if (!publicKey) {
      toast({
        title: 'Wallet not connected',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const mintAuthority = Keypair.generate();
      
      // Request airdrop with retry logic
      const requestAirdrop = async (retries = 3, delay = 1000) => {
        try {
          const airdropSignature = await connection.requestAirdrop(
            mintAuthority.publicKey,
            LAMPORTS_PER_SOL
          );
          await connection.confirmTransaction(airdropSignature, 'confirmed');
          
          // Verify the balance
          const balance = await connection.getBalance(mintAuthority.publicKey);
          if (balance < LAMPORTS_PER_SOL) {
            throw new Error('Insufficient SOL balance after airdrop');
          }
        } catch (error) {
          if (retries === 0 || !error.message.includes('429')) throw error;
          await new Promise(resolve => setTimeout(resolve, delay));
          return requestAirdrop(retries - 1, delay * 2);
        }
      };

      await requestAirdrop();

      // Create new token mint with retry logic
      const createTokenMint = async (retries = 3, delay = 1000) => {
        try {
          return await createMint(
            connection,
            mintAuthority,
            publicKey,
            publicKey,
            decimals
          );
        } catch (error) {
          if (retries === 0 || !error.message.includes('429')) throw error;
          await new Promise(resolve => setTimeout(resolve, delay));
          return createTokenMint(retries - 1, delay * 2);
        }
      };

      const mint = await createTokenMint();
      setMintKey(mint.toString());
      
      toast({
        title: 'Token Created!',
        description: `Mint address: ${mint.toString()}`,
        status: 'success',
        duration: 5000,
      });
    } catch (error) {
      console.error('Error creating token:', error);
      const isRateLimit = error.message.includes('429');
      toast({
        title: 'Error creating token',
        description: isRateLimit ? 'Rate limit exceeded. Please try again later.' : error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMintTokens = async () => {
    if (!publicKey || !mintKey) {
      toast({
        title: 'Please create a token first',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      
      // Get or create associated token account
      const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        publicKey,
        mintKey,
        publicKey
      );

      // Mint tokens
      await mintTo(
        connection,
        publicKey,
        mintKey,
        associatedTokenAccount.address,
        publicKey,
        mintAmount * (10 ** decimals)
      );

      toast({
        title: 'Tokens Minted!',
        description: `${mintAmount} tokens minted to your account`,
        status: 'success',
        duration: 5000,
      });
    } catch (error) {
      console.error('Error minting tokens:', error);
      toast({
        title: 'Error minting tokens',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={6} borderWidth={1} borderRadius="lg" className="token-creator-container">
      <VStack spacing={4} align="stretch">
        {mintKey && <TokenBalance mintKey={mintKey} />}
        
        <Tabs isFitted variant="enclosed">
          <TabList mb="1em">
            <Tab>Create & Mint</Tab>
            <Tab isDisabled={!mintKey}>Transfer</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Text fontSize="xl" fontWeight="bold">Create and Mint Tokens</Text>
        
        <FormControl className="form-control">
          <FormLabel>Token Name</FormLabel>
          <Input
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            placeholder="Enter token name"
            className="input-field"
          />
        </FormControl>

        <FormControl className="form-control">
          <FormLabel>Token Symbol</FormLabel>
          <Input
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
            placeholder="Enter token symbol"
            className="input-field"
          />
        </FormControl>

        <FormControl className="form-control">
          <FormLabel>Decimals</FormLabel>
          <NumberInput
            value={decimals}
            onChange={(value) => setDecimals(parseInt(value))}
            min={0}
            max={9}
          >
            <NumberInputField />
          </NumberInput>
        </FormControl>

        <Box className="button-container">
          <Button
            colorScheme="blue"
            onClick={handleCreateToken}
            isLoading={loading}
            loadingText="Creating Token"
            className="action-button"
            leftIcon={loading ? <Spinner size="sm" /> : null}
          >
          Create Token
          </Button>
          {mintKey && (
            <HStack mt={2} spacing={2}>
              <Badge colorScheme="green">Token Created</Badge>
              <Text fontSize="sm" color="gray.600">
                {mintKey.slice(0, 8)}...{mintKey.slice(-8)}
              </Text>
            </HStack>
          )}
        </Box>

        <Divider className="divider" />

        <FormControl className="form-control">
          <FormLabel>Mint Amount</FormLabel>
          <NumberInput
            value={mintAmount}
            onChange={(value) => setMintAmount(parseInt(value))}
            min={1}
          >
            <NumberInputField />
          </NumberInput>
        </FormControl>

        <Box className="button-container">
          <Button
            colorScheme="green"
            onClick={handleMintTokens}
            isLoading={loading}
            loadingText="Minting Tokens"
            isDisabled={!mintKey}
            className="action-button"
            leftIcon={loading ? <Spinner size="sm" /> : null}
          >
          Mint Tokens
          </Button>
          {mintKey && (
            <HStack mt={2} spacing={2}>
              <Badge colorScheme="green">Token Created</Badge>
              <Text fontSize="sm" color="gray.600">
                {mintKey.slice(0, 8)}...{mintKey.slice(-8)}
              </Text>
            </HStack>
          )}
        </Box>
            </TabPanel>

            <TabPanel>
              <TokenTransfer mintKey={mintKey} />
            </TabPanel>
          </TabPanels>
        </Tabs>

        {mintKey && <TransactionHistory mintKey={mintKey} />}
      </VStack>
    </Box>
  );
};

export default TokenCreator;