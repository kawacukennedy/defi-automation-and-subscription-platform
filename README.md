# FlowFi - DeFi Automation & Subscription Platform 🚀

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Flow Blockchain](https://img.shields.io/badge/Flow-Mainnet-blue)](https://flow.com/)
[![Forte Hacks 2025](https://img.shields.io/badge/Forte-Hacks%202025-orange)](https://forte.io/hacks)

FlowFi is a fully decentralized Web3 platform on Flow that allows users to automate DeFi actions, recurring crypto payments, staking, swaps, NFT rewards, DAO governance, and community workflows using Forte Actions and Workflows.

![FlowFi Architecture](https://img.shields.io/badge/Architecture-Modular-blue)
![Status](https://img.shields.io/badge/Status-Active-success)

## ✨ Features

### Core Functionality
- **🔄 Automated Recurring Payments**: Schedule FLOW, USDC, or partner token payments with intelligent retries and notifications
- **⚡ DeFi Workflow Automation**: Create reusable workflows for staking, swapping, lending, compounding, and DAO governance
- **🏆 NFT Achievements & Gamification**: Earn badges for milestones, compete on leaderboards, share templates
- **📊 Analytics & Insights**: Detailed metrics, interactive charts, CSV/JSON export, and predictive analytics
- **👛 Multi-Wallet Support**: Dapper, Blocto, Lilico, Ledger, and MetaMask (EVM bridging)
- **💰 Fiat Onboarding**: Seamless integration with Moonpay for fiat-to-crypto conversion

### Advanced Features
- **🤖 AI-Powered Credit Scoring**: Transparent trust evaluation using SHAP/LIME explainers
- **🌱 Carbon Credits**: Verified climate impact tracking and tokenized carbon credits
- **📡 IoT & Satellite Data**: Real-time secure data feeds from IoT sensors and satellites
- **🏛️ DAO Governance**: Multi-sig workflows and community voting mechanisms
- **🔒 Privacy & Security**: Privy-encrypted data, zero-knowledge proofs, and multi-sig controls

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ with App Router
- **UI**: React 19, TailwindCSS, Framer Motion
- **Wallet**: @onflow/fcl, Flow JS SDK
- **State**: React Context, local state management

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with WebSocket support
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for real-time data
- **Logging**: Winston with structured logging

### Blockchain
- **Platform**: Flow Blockchain (Testnet/Mainnet)
- **Language**: Cadence Smart Contracts
- **Tools**: Flow CLI, Forte Actions

### Integrations
- **Infrastructure**: QuickNode RPC, IPFS/Flow Storage
- **Payments**: Moonpay, Thirdweb, Crossmint
- **Analytics**: Dune Analytics, Privy
- **Notifications**: Telegram, Discord, Email webhooks

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0+
- MongoDB 5.0+
- Redis 6.0+
- Flow CLI (for contracts)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kawacukennedy/defi-automation-and-subscription-platform.git
   cd defi-automation-and-subscription-platform
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Install dependencies**
   ```bash
   # Frontend
   cd frontend && npm install

   # Backend
   cd ../backend && npm install
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev

   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api/health

For detailed setup instructions, see [Setup Guide](docs/Setup.md).

## 📁 Project Structure

```
flowfi/
├── frontend/              # Next.js frontend application
│   ├── src/
│   │   ├── app/          # App Router pages & layouts
│   │   ├── components/   # Reusable React components
│   │   └── lib/          # Utilities & configurations
│   └── package.json
├── backend/               # Node.js backend API
│   ├── routes/           # Express routes
│   ├── services/         # Business logic services
│   ├── models/           # MongoDB schemas
│   └── package.json
├── contracts/             # Cadence smart contracts
│   ├── FlowFiWorkflowContract.cdc
│   ├── FlowFiSubscriptionManager.cdc
│   ├── FlowFiNFTRewards.cdc
│   └── FlowFiDAOManager.cdc
├── docs/                  # Documentation
│   ├── API.md            # API reference
│   ├── Architecture.md   # System architecture
│   ├── Setup.md          # Setup instructions
│   ├── Contributing.md   # Contribution guidelines
│   └── Deployment.md     # Deployment guide
├── specs/                 # Specifications & requirements
│   ├── app_specs.json    # Application specifications
│   └── architecture.md   # Architecture diagram
├── .env.example          # Environment template
├── vercel.json           # Vercel deployment config
└── README.md
```

## 📚 Documentation

- **[🏗️ Architecture](docs/Architecture.md)**: System design and component relationships
- **[🔌 API Reference](docs/API.md)**: Complete API documentation with examples
- **[⚙️ Setup Guide](docs/Setup.md)**: Detailed installation and configuration
- **[🚀 Deployment](docs/Deployment.md)**: Production deployment instructions
- **[🤝 Contributing](docs/Contributing.md)**: Guidelines for contributors

## 🎯 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workflows` | Get user workflows |
| POST | `/api/workflows` | Create new workflow |
| GET | `/api/analytics/user` | Get user analytics |
| GET | `/api/community/templates/trending` | Get trending templates |
| POST | `/api/community/templates/:id/fork` | Fork a template |
| GET | `/api/admin/workflows` | Admin: Get all workflows |
| POST | `/api/admin/workflows/:id/retry` | Admin: Retry workflow |

See [API Documentation](docs/API.md) for complete reference.

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests

# Smart Contracts
flow test           # Run contract tests
flow project deploy # Deploy contracts
```

### Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests (future)
npm run test:e2e
```

### Code Quality

- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode
- **Security**: Dependency scanning

## 🚀 Deployment

### Frontend (Vercel)
```bash
vercel --prod
```

### Backend (Railway/Render)
```bash
railway up
```

### Smart Contracts (Flow)
```bash
flow project deploy --network mainnet
```

See [Deployment Guide](docs/Deployment.md) for detailed instructions.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/Contributing.md) for details.

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Workflow
- Use conventional commits
- Follow existing code style
- Add documentation for new features
- Test thoroughly before submitting

## 🏆 Achievements & Recognition

FlowFi is participating in **Forte Hacks 2025** and aims to:

- 🥇 **Best DeFi Automation Platform**
- 🥈 **Most Innovative Use of Forte Actions**
- 🥉 **Best User Experience**

### Community Recognition
- NFT badges for contributors
- Leaderboard rankings
- Special mentions in releases

## 📊 Performance & Metrics

- **API Response Time**: <100ms average
- **Uptime**: 99.9% target
- **Test Coverage**: 85%+ target
- **Bundle Size**: <200KB gzipped

## 🔒 Security

- Wallet-based authentication only
- End-to-end encryption with Privy
- Multi-sig support for DAOs
- Regular security audits
- Bug bounty program (future)

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core workflow automation
- ✅ NFT achievements system
- ✅ Basic analytics dashboard
- ✅ Multi-wallet support

### Phase 2 (Q2 2025)
- 🔄 Cross-chain interoperability
- 🤖 AI-powered optimization
- 📱 Mobile app development
- 🌐 Multi-language support

### Phase 3 (Q3 2025)
- 🔗 Layer 2 scaling solutions
- 📊 Advanced predictive analytics
- 🏛️ Enhanced DAO features
- 🎮 Gamification expansion

## 📞 Support

- **📧 Email**: support@flowfi.com
- **💬 Discord**: [Join our community](https://discord.gg/flowfi)
- **🐛 Issues**: [GitHub Issues](https://github.com/kawacukennedy/defi-automation-and-subscription-platform/issues)
- **💡 Discussions**: [GitHub Discussions](https://github.com/kawacukennedy/defi-automation-and-subscription-platform/discussions)

## 📜 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Flow Blockchain** for the amazing platform
- **Forte** for the Actions and Workflows infrastructure
- **QuickNode** for reliable RPC services
- **Moonpay** for fiat onboarding
- **All contributors** and the Flow community

---

**Built with ❤️ for the Flow ecosystem**

[![Made with Flow](https://img.shields.io/badge/Made%20with-Flow-00EF8B)](https://flow.com/)
[![Forte Powered](https://img.shields.io/badge/Powered%20by-Forte-FF6B35)](https://forte.io/)