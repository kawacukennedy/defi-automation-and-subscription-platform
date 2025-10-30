# FlowFi Deployment Guide

This guide covers deploying FlowFi to production environments.

## Deployment Overview

FlowFi uses a multi-service architecture deployed across different platforms:

- **Frontend**: Vercel/Netlify (static hosting)
- **Backend**: Railway/Render (Node.js hosting)
- **Database**: MongoDB Atlas (cloud database)
- **Cache**: Redis Cloud (cloud cache)
- **Blockchain**: Flow Mainnet (smart contracts)

## Prerequisites

### Accounts and Services
- [Vercel](https://vercel.com) or [Netlify](https://netlify.com) account
- [Railway](https://railway.app) or [Render](https://render.com) account
- [MongoDB Atlas](https://mongodb.com/atlas) account
- [Redis Cloud](https://redis.com/try-free) account
- Flow Mainnet account with FLOW tokens

### Domain (Optional)
- Custom domain for production
- SSL certificate (provided by hosting platforms)

## Environment Configuration

### Production Environment Variables

Create `.env.production` with production values:

```env
# Frontend (.env.example)
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_FLOW_ACCESS_NODE=https://access-mainnet.onflow.org
NEXT_PUBLIC_FLOW_DISCOVERY_WALLET=https://fcl-discovery.onflow.org/mainnet/authn
NEXT_PUBLIC_FLOW_TOKEN=0x7e60df042a9c0868
NEXT_PUBLIC_FUNGIBLE_TOKEN=0x9a0766d93b6608b7
NEXT_PUBLIC_NON_FUNGIBLE_TOKEN=0x1d7e57aa55817448
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
ANALYZE=false

# Backend (.env)
PORT=3001
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/flowfi_prod
REDIS_URL=rediss://username:password@host:port
FLOW_ACCESS_NODE=https://access-mainnet.onflow.org
QUICKNODE_API_KEY=your_production_quicknode_key
MOONPAY_API_KEY=your_production_moonpay_key
PRIVY_API_KEY=your_production_privy_key
THIRDWEB_API_KEY=your_production_thirdweb_key
TELEGRAM_BOT_TOKEN=your_production_telegram_token
JWT_SECRET=your_secure_jwt_secret
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Vercel CLI
   vercel login
   vercel link
   ```

2. **Configure Build Settings**
    ```json
    {
      "version": 2,
      "builds": [
        {
          "src": "frontend/package.json",
          "use": "@vercel/next"
        },
        {
          "src": "backend/index.js",
          "use": "@vercel/node"
        }
      ],
      "routes": [
        {
          "src": "/api/(.*)",
          "dest": "/backend/index.js"
        },
        {
          "src": "/(.*)",
          "dest": "/frontend/$1"
        }
      ],
      "env": {
        "NODE_ENV": "production"
      },
      "functions": {
        "backend/index.js": {
          "maxDuration": 30
        }
      }
    }
    ```

3. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_FLOW_ACCESS_NODE
   vercel env add NEXT_PUBLIC_FLOW_WALLET_DISCOVERY
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. **Connect Repository**
   - Go to Netlify dashboard
   - New site from Git
   - Connect GitHub repository

2. **Build Settings**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

3. **Environment Variables**
   - Add variables in site settings

4. **Deploy**
   - Automatic on push to main branch

## Backend Deployment

### Option 1: Railway

1. **Create Project**
   ```bash
   # Railway CLI
   railway login
   railway init
   ```

2. **Configure Service**
   ```bash
   railway up
   ```

3. **Environment Variables**
   ```bash
   railway variables set MONGODB_URI=your_mongodb_uri
   railway variables set REDIS_URL=your_redis_url
   # ... other variables
   ```

4. **Database Connection**
   ```bash
   railway connect
   ```

### Option 2: Render

1. **Create Web Service**
   - Go to Render dashboard
   - New Web Service
   - Connect GitHub repository

2. **Service Configuration**
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

3. **Environment Variables**
   - Add all required variables in service settings

## Database Setup

### MongoDB Atlas

1. **Create Cluster**
   - Choose provider and region
   - Select cluster tier (M10+ for production)

2. **Database User**
   ```javascript
   // Create user with read/write access
   db.createUser({
     user: "flowfi_prod",
     pwd: "secure_password",
     roles: ["readWrite"]
   })
   ```

3. **Network Access**
   - Add IP addresses (0.0.0.0/0 for development)
   - Or configure VPC peering for production

4. **Connection String**
   ```
   mongodb+srv://flowfi_prod:password@cluster.mongodb.net/flowfi_prod?retryWrites=true&w=majority
   ```

### Redis Cloud

1. **Create Database**
   - Choose cloud provider
   - Select plan (100MB+ for production)

2. **Connection Details**
   - Get Redis URL: `rediss://username:password@host:port`

## Smart Contract Deployment

### Mainnet Deployment

1. **Update Flow Configuration**
   ```json
   {
     "accounts": {
       "mainnet-account": {
         "address": "YOUR_MAINNET_ADDRESS",
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
       "mainnet": "https://access-mainnet.onflow.org"
     }
   }
   ```

2. **Deploy Contracts**
   ```bash
   flow project deploy --network mainnet
   ```

3. **Verify Deployment**
   ```bash
   flow scripts execute check_deployment.cdc --network mainnet
   ```

4. **Update Frontend Config**
   - Change access node to mainnet
   - Update contract addresses

## CDN and Performance

### Static Asset Optimization

1. **Image Optimization**
   ```typescript
   // next.config.js
   module.exports = {
     images: {
       domains: ['your-cdn.com'],
       formats: ['image/webp', 'image/avif'],
     },
   }
   ```

2. **Font Optimization**
   ```typescript
   // layout.tsx
   import { Geist, Geist_Mono } from 'next/font/google'

   const geist = Geist({
     subsets: ['latin'],
     display: 'swap',
   })
   ```

### Caching Strategy

1. **API Response Caching**
   ```javascript
   // Redis caching middleware
   app.use('/api/analytics', cache('5 minutes'));
   ```

2. **Static Asset Caching**
   ```nginx
   # Nginx configuration
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
     expires 1y;
     add_header Cache-Control "public, immutable";
   }
   ```

## Monitoring and Analytics

### Application Monitoring

1. **Uptime Monitoring**
   - Use services like Pingdom or UptimeRobot
   - Monitor `/api/health` endpoint

2. **Error Tracking**
   ```javascript
   // Sentry integration
   import * as Sentry from '@sentry/nextjs';

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
   });
   ```

3. **Performance Monitoring**
   - Vercel Analytics
   - Custom performance metrics

### Blockchain Monitoring

1. **Transaction Monitoring**
   - Monitor contract events
   - Track gas usage

2. **Alerting**
   - Set up alerts for failed transactions
   - Monitor contract balance

## Security Checklist

### Pre-Deployment
- [ ] Environment variables secured
- [ ] API keys rotated for production
- [ ] Database credentials updated
- [ ] HTTPS enabled
- [ ] CORS configured properly

### Post-Deployment
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] Error logging configured
- [ ] Backup strategy in place

## Rollback Strategy

### Quick Rollback
```bash
# Vercel
vercel rollback

# Git rollback
git revert HEAD
git push origin main
```

### Database Rollback
```javascript
// MongoDB backup
mongodump --db flowfi_prod --out backup

// Restore
mongorestore backup
```

## Scaling

### Horizontal Scaling

1. **Backend Scaling**
   ```bash
   # Railway/Render auto-scaling
   # Configure min/max instances
   ```

2. **Database Scaling**
   - Upgrade MongoDB Atlas cluster
   - Enable sharding if needed

3. **CDN Scaling**
   - Use multiple CDN providers
   - Implement geo-distribution

### Performance Optimization

1. **Frontend**
   ```bash
   npm run build:analyze  # Bundle analyzer
   ```

2. **Backend**
   ```javascript
   // Compression middleware
   app.use(compression());

   // Gzip compression
   app.use(express.json({ limit: '10mb' }));
   ```

## Backup Strategy

### Database Backup
```bash
# Automated backup script
mongodump --db flowfi_prod --out /backups/$(date +%Y%m%d_%H%M%S)
```

### File Backup
```bash
# Contract artifacts
aws s3 sync contracts/ s3://flowfi-backups/contracts/
```

### Configuration Backup
```bash
# Environment variables
aws s3 cp .env.production s3://flowfi-backups/config/
```

## Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Review logs weekly
- [ ] Monitor performance metrics
- [ ] Update SSL certificates
- [ ] Backup verification

### Emergency Procedures
1. **Service Outage**
   - Check status page
   - Restart services
   - Contact hosting provider

2. **Security Incident**
   - Isolate affected systems
   - Change credentials
   - Notify users
   - Post-mortem analysis

## Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

**Database Connection**
```javascript
// Test connection
mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

**Contract Deployment**
```bash
# Check account balance
flow accounts get mainnet-account --network mainnet
```

## Support

- **Hosting Documentation**
  - [Vercel Docs](https://vercel.com/docs)
  - [Railway Docs](https://docs.railway.app)
  - [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)

- **Flow Documentation**
  - [Flow Developer Docs](https://developers.flow.com)
  - [Flow CLI Docs](https://docs.onflow.org/flow-cli)

For deployment issues, check [GitHub Issues](https://github.com/kawacukennedy/defi-automation-and-subscription-platform/issues) or contact maintainers.