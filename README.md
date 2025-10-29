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

## Deployment to Vercel

### Frontend Deployment

1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend/`
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_FLOW_ACCESS_NODE`
   - `NEXT_PUBLIC_FLOW_WALLET_DISCOVERY`

### Backend Deployment

1. Create a new Vercel project for the backend
2. Set the root directory to `backend/`
3. Add environment variables:
   - `MONGODB_URI`
   - `REDIS_URL`
   - `FLOW_ACCESS_NODE`
   - `QUICKNODE_API_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `MOONPAY_API_KEY`
   - `PRIVY_API_KEY`
   - `THIRDWEB_API_KEY`

### Smart Contracts

Deploy contracts to Flow Testnet/Mainnet using Flow CLI:

```bash
flow project deploy --network testnet
```

## Project Structure

```
├── frontend/          # Next.js frontend with futuristic UI
├── backend/           # Node.js backend with monitoring & admin
├── contracts/         # Cadence smart contracts
├── specs/             # App specifications and architecture
├── vercel.json        # Vercel deployment configuration
├── .env.example       # Environment variables template
└── README.md
```

## API Endpoints

- `GET /api/workflows` - Get user workflows
- `POST /api/workflows` - Create new workflow
- `GET /api/analytics/user` - Get user analytics
- `GET /api/community/templates/trending` - Get trending templates
- `POST /api/community/templates/:id/fork` - Fork a template
- `GET /api/admin/workflows` - Admin: Get all workflows
- `POST /api/admin/workflows/:id/retry` - Admin: Retry workflow

## Contributing

This project is for Forte Hacks 2025. Contributions welcome!

## License

ISC