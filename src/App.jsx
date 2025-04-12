import React from 'react';
import { ChakraProvider, Container, VStack, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';
import TokenCreator from './components/TokenCreator';
import TokenTransfer from './components/TokenTransfer';
import WalletConnection from './components/WalletConnection';

const App = () => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ];

  return (
    <ChakraProvider>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Router>
              <Box minH="100vh" bg="var(--primary-gradient)">
                <Container maxW="container.md" pt={8} pb={10}>
                  <WalletConnection />
                  <Routes>
                    <Route path="/" element={<TokenCreator />} />
                    <Route path="/create" element={<TokenCreator />} />
                    <Route path="/transfer" element={<TokenTransfer />} />
                  </Routes>
                </Container>
              </Box>
            </Router>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ChakraProvider>
  );
};

export default App;