# Solana-Token-App
🚀 Solana Token Creator & Minting dApp
A modern, responsive frontend application built with React and integrated with the Solana blockchain. This decentralized app (dApp) allows users to:

Connect their Solana wallet (Phantom, Solflare, etc.)

Create new SPL tokens

Mint tokens

Send tokens to other users

View wallet balance and transaction history
All powered by the Solana SPL Token Program on Devnet.

📦 Features
✅ Wallet Integration
Phantom and Solflare support

Connect/disconnect with 1 click

Display SOL balance and public key

Handles failed connections gracefully

🔄 Smart Contract Interactions
✅ Create custom tokens using SPL Token Program

✅ Mint tokens with real-time feedback

✅ Transfer tokens to other wallet addresses

⏱️ Live transaction status & confirmation

🎨 UI/UX Design
Clean, modern design with Tailwind CSS

Fully responsive for mobile and desktop

Intuitive flows for token creation & minting

Toast notifications for all transactions

📊 Blockchain Data
Real-time wallet SOL/token balance

Token metadata display

Transaction history display with timestamps

🛠️ Tech Stack
Framework: React (Vite/CRA)

Solana SDK: @solana/web3.js, @solana/spl-token

Wallet Adapter: @solana/wallet-adapter

Styling: Tailwind CSS

Deployment: Vercel / Netlify

src/
├── components/
│   ├── WalletConnectButton.tsx
│   ├── TokenCreator.tsx
│   ├── TokenMinter.tsx
│   └── TransactionHistory.tsx
├── hooks/
│   └── useWalletBalance.ts
├── utils/
│   ├── solana.ts
│   └── token.ts
├── App.tsx
└── main.tsx
git clone https://github.com/Nagoorsaheb178/solana-token-dapp.git
cd solana-token-dapp
2. Install Dependencies
bash
Copy
Edit
npm install
# or
yarn
3. Run Locally
bash
Copy
Edit
npm run dev
# or
yarn dev

