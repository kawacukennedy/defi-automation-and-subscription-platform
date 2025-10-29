# FlowFi Setup Guide

This guide will help you set up FlowFi for development, testing, and production deployment.

## Prerequisites

Before you begin, ensure you have the following installed:

### System Requirements
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **MongoDB**: Version 5.0 or higher
- **Redis**: Version 6.0 or higher
- **Git**: Version 2.30 or higher

### Development Tools
- **Flow CLI**: For smart contract development
- **VS Code**: Recommended IDE with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - Prettier
  - ESLint

### Blockchain Requirements
- **Flow Account**: Testnet and mainnet accounts
- **FLOW tokens**: For transaction fees and testing

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/kawacukennedy/defi-automation-and-subscription-platform.git
cd defi-automation-and-subscription-platform
```

### 2. Environment Setup

Copy the environment template and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Frontend Environment Variables
NEXT_PUBLIC_FLOW_ACCESS_NODE=https://access-testnet.onflow.org
NEXT_PUBLIC_FLOW_WALLET_DISCOVERY=https://fcl-discovery.onflow.org/testnet/authn

# Backend Environment Variables
MONGODB_URI=mongodb://localhost:27017/flowfi
REDIS_URL=redis://localhost:6379
FLOW_ACCESS_NODE=https://access-testnet.onflow.org
QUICKNODE_API_KEY=your_quicknode_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
MOONPAY_API_KEY=your_moonpay_api_key
PRIVY_API_KEY=your_privy_api_key
THIRDWEB_API_KEY=your_thirdweb_api_key
PORT=3001
```

### 3. Install Dependencies

#### Frontend Dependencies
```bash
cd frontend
npm install
```

#### Backend Dependencies
```bash
cd ../backend
npm install
```

### 4. Start Development Servers

#### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```

#### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

### 5. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/health

## Detailed Setup

### Database Setup

#### MongoDB Installation

**macOS (with Homebrew):**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**Windows:**
Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)

#### Redis Installation

**macOS (with Homebrew):**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

**Windows:**
Download from [Redis for Windows](https://redis.io/download)

### Flow Blockchain Setup

#### Install Flow CLI

**macOS:**
```bash
brew install flow-cli
```

**Other platforms:**
```bash
# Download from https://github.com/onflow/flow-cli/releases
# Add to PATH
```

#### Initialize Flow Project

```bash
flow init
```

#### Configure Flow Accounts

Create `flow.json` in the project root:

```json
{
  "accounts": {
    "testnet-account": {
      "address": "YOUR_TESTNET_ADDRESS",
      "key": {
        "type": "hex",
        "index": 0,
        "signatureAlgorithm": "ECDSA_P256",
        "hashAlgorithm": "SHA3_256",
        "privateKey": "YOUR_PRIVATE_KEY"
      }
    }
  },
  "networks": {
    "testnet": "https://access-testnet.onflow.org",
    "mainnet": "https://access-mainnet.onflow.org"
  },
  "contracts": {},
  "deployments": {}
}
```

### Smart Contract Deployment

#### Deploy to Testnet

1. Update contract addresses in `flow.json`
2. Deploy contracts:

```bash
flow project deploy --network testnet
```

#### Verify Deployment

```bash
flow scripts execute cadence/check_contract.cdc --network testnet
```

### API Configuration

#### Wallet Configuration

Update frontend wallet configuration in `frontend/lib/flow.ts`:

```typescript
import * as fcl from '@onflow/fcl';

fcl.config({
  'accessNode.api': process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE,
  'discovery.wallet': process.env.NEXT_PUBLIC_FLOW_WALLET_DISCOVERY,
  'app.detail.title': 'FlowFi',
  'app.detail.icon': 'https://flowfi.com/icon.png',
  'app.detail.description': 'DeFi Automation Platform'
});
```

#### Third-party Integrations

##### Moonpay Setup
1. Sign up at [Moonpay](https://www.moonpay.com/)
2. Get API keys from dashboard
3. Configure webhook endpoints

##### QuickNode Setup
1. Sign up at [QuickNode](https://www.quicknode.com/)
2. Create Flow endpoint
3. Get API key

##### Privy Setup
1. Sign up at [Privy](https://privy.io/)
2. Create application
3. Configure encryption settings

### Testing Setup

#### Unit Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test
```

#### Integration Tests

```bash
# Run with test database
MONGODB_URI=mongodb://localhost:27017/flowfi_test npm run test:integration
```

#### Smart Contract Tests

```bash
flow test
```

### Development Workflow

#### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

#### Git Workflow

1. Create feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make changes and commit:
```bash
git add .
git commit -m "feat: add your feature"
```

3. Push and create PR:
```bash
git push origin feature/your-feature-name
```

### Production Deployment

#### Frontend Deployment (Vercel)

1. Connect GitHub repository to Vercel
2. Set build settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
3. Add environment variables in Vercel dashboard

#### Backend Deployment (Railway/Render)

1. Create new service
2. Connect GitHub repository
3. Set build settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Configure environment variables

#### Database Setup (Production)

**MongoDB Atlas:**
1. Create cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Get connection string
3. Configure IP whitelist
4. Set up database user

**Redis Cloud:**
1. Create database at [Redis Cloud](https://redis.com/try-free/)
2. Get connection URL

#### Smart Contract Deployment (Mainnet)

```bash
# Update flow.json for mainnet
flow project deploy --network mainnet
```

### Monitoring Setup

#### Application Monitoring

```bash
# Install PM2 for process management
npm install -g pm2

# Start application with PM2
pm2 start ecosystem.config.js
pm2 monit
```

#### Logging

Logs are automatically configured with Winston:
- Error logs: `backend/logs/error.log`
- Combined logs: `backend/logs/combined.log`

#### Health Checks

Health endpoint: `GET /api/health`

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "uptime": 3600
}
```

### Troubleshooting

#### Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running: `brew services start mongodb-community`
- Check connection string in `.env`
- Verify network connectivity

**Redis Connection Error:**
- Ensure Redis is running: `brew services start redis`
- Check Redis URL in `.env`

**Flow CLI Issues:**
- Verify Flow CLI installation: `flow version`
- Check account configuration in `flow.json`

**Build Errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version`
- Verify environment variables

**Wallet Connection Issues:**
- Check Flow access node URL
- Verify wallet discovery endpoint
- Ensure HTTPS in production

#### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run dev
```

#### Performance Optimization

```bash
# Bundle analyzer
npm run build:analyze

# Lighthouse audit
npm run lighthouse
```

### Contributing

See [Contributing Guide](Contributing.md) for detailed contribution guidelines.

### Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/kawacukennedy/defi-automation-and-subscription-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/kawacukennedy/defi-automation-and-subscription-platform/discussions)

For additional help, join our [Discord community](https://discord.gg/flowfi).