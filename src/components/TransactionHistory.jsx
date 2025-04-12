import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Skeleton,
  Link,
} from '@chakra-ui/react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

const TransactionHistory = ({ mintKey }) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!publicKey) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const signatures = await connection.getSignaturesForAddress(
          publicKey,
          { limit: 10 }
        );

        const txDetails = await Promise.all(
          signatures.map(async (sig) => {
            const tx = await connection.getTransaction(sig.signature);
            return {
              signature: sig.signature,
              timestamp: sig.blockTime ? new Date(sig.blockTime * 1000) : new Date(),
              status: sig.confirmationStatus,
              type: tx?.meta?.logMessages?.some(msg => msg.includes('Initialize mint')) ? 'Create' :
                    tx?.meta?.logMessages?.some(msg => msg.includes('Transfer')) ? 'Transfer' :
                    tx?.meta?.logMessages?.some(msg => msg.includes('Mint to')) ? 'Mint' : 'Other'
            };
          })
        );

        setTransactions(txDetails);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
    const intervalId = setInterval(fetchTransactions, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId);
  }, [publicKey, connection]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'finalized':
        return 'green';
      case 'confirmed':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Create':
        return 'purple';
      case 'Transfer':
        return 'blue';
      case 'Mint':
        return 'green';
      default:
        return 'gray';
    }
  };

  if (!publicKey) {
    return null;
  }

  return (
    <Box p={4} borderWidth={1} borderRadius="lg" overflow="auto">
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Recent Transactions
      </Text>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Type</Th>
            <Th>Time</Th>
            <Th>Status</Th>
            <Th>Signature</Th>
          </Tr>
        </Thead>
        <Tbody>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <Tr key={i}>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
                <Td><Skeleton height="20px" /></Td>
              </Tr>
            ))
          ) : transactions.length === 0 ? (
            <Tr>
              <Td colSpan={4} textAlign="center">
                No transactions found
              </Td>
            </Tr>
          ) : (
            transactions.map((tx) => (
              <Tr key={tx.signature}>
                <Td>
                  <Badge colorScheme={getTypeColor(tx.type)}>
                    {tx.type}
                  </Badge>
                </Td>
                <Td>{tx.timestamp.toLocaleString()}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(tx.status)}>
                    {tx.status}
                  </Badge>
                </Td>
                <Td>
                  <Link
                    href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                    isExternal
                    color="blue.500"
                    fontSize="sm"
                  >
                    {`${tx.signature.slice(0, 8)}...${tx.signature.slice(-8)}`}
                  </Link>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

export default TransactionHistory;