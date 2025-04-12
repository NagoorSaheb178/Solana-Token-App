import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  NumberInput,
  NumberInputField,
  Spinner,
  FormErrorMessage,
  Icon,
  HStack,
} from '@chakra-ui/react';
import { FaPaperPlane, FaUser } from 'react-icons/fa';
import '../styles/global.css';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, getAccount } from '@solana/spl-token';

const TokenTransfer = ({ mintKey }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const toast = useToast();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [recipientError, setRecipientError] = useState('');

  const validateRecipient = (address) => {
    try {
      new PublicKey(address);
      setRecipientError('');
      return true;
    } catch (error) {
      setRecipientError('Invalid Solana address');
      return false;
    }
  };

  const handleTransfer = async () => {
    if (!publicKey || !mintKey) {
      toast({
        title: 'Wallet not connected',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!validateRecipient(recipient)) {
      return;
    }

    try {
      setLoading(true);
      const recipientPubKey = new PublicKey(recipient);

      // Get source token account
      const sourceTokenAccount = await getAssociatedTokenAddress(
        mintKey,
        publicKey
      );

      // Get destination token account
      const destinationTokenAccount = await getAssociatedTokenAddress(
        mintKey,
        recipientPubKey
      );

      // Verify source account has enough tokens
      const sourceAccount = await getAccount(connection, sourceTokenAccount);
      if (Number(sourceAccount.amount) < amount) {
        throw new Error('Insufficient token balance');
      }

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        sourceTokenAccount,
        destinationTokenAccount,
        publicKey,
        BigInt(amount)
      );

      // Send transaction
      const transaction = await sendTransaction(transferInstruction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(transaction);

      toast({
        title: 'Transfer Successful!',
        description: `${amount} tokens transferred to ${recipient.slice(0, 8)}...`,
        status: 'success',
        duration: 5000,
      });

      // Reset form
      setRecipient('');
      setAmount(1);
    } catch (error) {
      console.error('Error transferring tokens:', error);
      toast({
        title: 'Error transferring tokens',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey || !mintKey) {
    return null;
  }

  return (
    <Box 
      className="glass-card" 
      p={8} 
      _hover={{ transform: 'translateY(-4px)' }}
      transition="all 0.3s ease"
    >
      <VStack spacing={6} align="stretch">
        <FormControl isInvalid={!!recipientError}>
          <FormLabel fontSize="lg" color="gray.700" mb={2}>
            Recipient Address
          </FormLabel>
          <Input
            value={recipient}
            onChange={(e) => {
              setRecipient(e.target.value);
              validateRecipient(e.target.value);
            }}
            placeholder="Enter recipient's Solana address"
            size="lg"
            bg="rgba(255, 255, 255, 0.9)"
            border="1px solid"
            borderColor="gray.200"
            _hover={{ borderColor: 'gray.300' }}
            _focus={{ 
              borderColor: 'purple.300',
              boxShadow: '0 0 0 3px rgba(159, 122, 234, 0.2)'
            }}
            leftElement={
              <Icon as={FaUser} color="gray.400" ml={3} />
            }
          />
          <FormErrorMessage fontSize="md">{recipientError}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel fontSize="lg" color="gray.700" mb={2}>
            Amount
          </FormLabel>
          <NumberInput
            value={amount}
            onChange={(value) => setAmount(parseInt(value))}
            min={1}
            size="lg"
          >
            <NumberInputField 
              bg="rgba(255, 255, 255, 0.9)"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ borderColor: 'gray.300' }}
              _focus={{ 
                borderColor: 'purple.300',
                boxShadow: '0 0 0 3px rgba(159, 122, 234, 0.2)'
              }}
            />
          </NumberInput>
        </FormControl>

        <Button
          size="lg"
          bg="var(--primary-gradient)"
          color="white"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(41, 98, 255, 0.3)'
          }}
          _active={{
            transform: 'translateY(0)'
          }}
          onClick={handleTransfer}
          isLoading={loading}
          loadingText="Transferring"
          leftIcon={loading ? <Spinner size="sm" /> : <Icon as={FaPaperPlane} />}
          transition="all 0.3s ease"
        >
          Transfer Tokens
        </Button>
      </VStack>
    </Box>
  );
};

export default TokenTransfer;