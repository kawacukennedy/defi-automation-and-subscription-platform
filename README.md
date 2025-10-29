# FlowFi - DeFi Automation & Subscription Platform

FlowFi is a fully decentralized Web3 platform on Flow that allows users to automate DeFi actions, recurring crypto payments, staking, swaps, NFT rewards, DAO governance, and community workflows using Forte Actions and Workflows.

## Features

- **Automated Recurring Payments**: Schedule recurring crypto payments with retries and notifications
- **DeFi Workflow Automation**: Create reusable workflows for staking, swapping, lending, and DAO votes
- **NFT Achievements & Gamification**: Earn badges, compete on leaderboards, share templates
- **Analytics & Insights**: Detailed metrics, charts, and export capabilities
- **Multi-Wallet Support**: Dapper, Blocto, Lilico, and more
- **Fiat Onboarding**: Via Moonpay integration

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express, WebSocket, MongoDB, Redis
- **Blockchain**: Flow, Cadence Smart Contracts
- **Integrations**: QuickNode, Moonpay, Privy, Thirdweb, Crossmint, Dune Analytics

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Redis
- Flow CLI (for smart contracts)

### Installation

1. Clone the repository
```bash
git clone https://github.com/kawacukennedy/defi-automation-and-subscription-platform.git
cd defi-automation-and-subscription-platform
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd ../backend
npm install
```

4. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your API keys
```

5. Start the backend
```bash
npm run dev
```

6. Start the frontend (in another terminal)
```bash
cd ../frontend
npm run dev
```

## Project Structure

```
├── frontend/          # Next.js frontend
├── backend/           # Node.js backend
├── contracts/         # Cadence smart contracts
├── README.md
└── ...
```

## Contributing

This project is for Forte Hacks 2025. Contributions welcome!

## License

ISC