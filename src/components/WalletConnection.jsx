import React from 'react';
import { Button, HStack, Text, useToast, Box, Icon } from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '../styles/global.css';
import { FaWallet } from 'react-icons/fa';

const WalletConnection = () => {
  const { publicKey, connected } = useWallet();
  const toast = useToast();

  const displayAddress = (address) => {
    return `${address.toString().slice(0, 4)}...${address.toString().slice(-4)}`;
  };

  return (
    <Box className="glass-card" mb={6}>
      <HStack 
        justify="space-between" 
        p={6} 
        spacing={4}
        align="center"
      >
        <HStack spacing={3}>
          <Icon 
            as={FaWallet} 
            w={6} 
            h={6} 
            color={connected ? 'green.500' : 'gray.400'} 
            transition="all 0.3s ease"
          />
          <Text 
            fontSize="lg" 
            fontWeight="medium"
            color={connected ? 'gray.800' : 'gray.600'}
          >
            {connected
              ? `Connected: ${displayAddress(publicKey)}`
              : 'Connect your wallet to get started'}
          </Text>
        </HStack>
        <WalletMultiButton 
          className="wallet-button"
          style={{
            background: connected ? 'rgba(72, 187, 120, 0.1)' : 'var(--primary-color)',
            color: connected ? '#2F855A' : 'white',
            border: connected ? '1px solid rgba(72, 187, 120, 0.3)' : 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            fontWeight: '600',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
          }}
        />
      </HStack>
    </Box>
  );
};

export default WalletConnection;