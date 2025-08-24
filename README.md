# Apex DeFi - Lending & Borrowing Protocol

Apex DeFi is a decentralized lending and borrowing protocol built on the Aptos blockchain. Users can deposit APT as collateral and borrow APEX tokens, with automated liquidation mechanisms and competitive interest rates.

## Features

- **Collateral Management** - Deposit and withdraw APT as collateral
- **Borrowing** - Borrow APEX tokens against your APT collateral
- **Automated Liquidation** - 10% liquidator rewards for maintaining protocol safety
- **Interest Accrual** - Fixed 5% annual interest rate on borrowed amounts
- **Protocol Fees** - Small fees on borrow and repay operations
- **Real-time Data** - Live protocol statistics and market data
- **Beautiful UI** - Modern, responsive interface with soft, eye-friendly design

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Blockchain**: Aptos blockchain with Move smart contracts
- **Wallet Integration**: Aptos Wallet Adapter
- **State Management**: React hooks with SWR for data fetching
- **Deployment**: Vercel-ready with PWA capabilities

## Smart Contracts

The protocol consists of three main Move modules:

- **apex_token.move** - APEX token implementation (ERC20 equivalent)
- **apex_dex.move** - Automated Market Maker for APT/APEX swaps
- **lending.move** - Core lending and borrowing logic

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Aptos CLI
- An Aptos wallet (Petra, Martian, etc.)

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Deploy contracts: `npm run move:publish`
5. Start development server: `npm run dev`

### Available Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run move:compile` - Compile Move contracts
- `npm run move:test` - Run Move unit tests
- `npm run move:publish` - Deploy contracts to testnet
- `npm run move:upgrade` - Upgrade deployed contracts
- `npm run deploy` - Deploy to Vercel

## Protocol Parameters

- **Collateral Ratio**: 120% minimum
- **Liquidator Reward**: 10% of liquidated collateral
- **Annual Interest Rate**: 5% fixed
- **Borrow Fee**: 0.1%
- **Repay Fee**: 0.05%

## Security

- Emergency pause functionality
- Automated liquidation mechanisms
- Comprehensive error handling
- Extensive testing coverage

## Contributing

This is an open-source project. Contributions are welcome!

## License

Apache-2.0 License
