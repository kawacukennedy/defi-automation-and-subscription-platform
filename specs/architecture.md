title FlowFi - DeFi Automation & Subscription Platform Architecture

// User Layer
Users [icon: users] {
  Onboarding [icon: user-plus]
  Wallets [icon: wallet]
  Fiat Onboarding [icon: credit-card]
  Accessibility [icon: eye]
}

// Frontend Platform
Frontend Platform [icon: react] {
  Dashboard [icon: layout]
  Create Workflow [icon: plus-square]
  Analytics Page [icon: bar-chart-2, label: "Analytics"]
  Community Hub [icon: users, label: "Community"]
  Admin Panel [icon: settings]
  Settings Page [icon: sliders, label: "Settings"]
}

// Core Features Layer
Core Features [icon: zap] {
  Recurring Payments [icon: repeat]
  DeFi Automation [icon: cpu]
  Subscription Management [icon: calendar]
  Notifications [icon: bell]
  Gamification [icon: award]
  Analytics Engine [icon: pie-chart, label: "Analytics"]
  Wallet Support [icon: wallet]
  Privacy & Security [icon: shield]
  Edge Case Handling [icon: alert-triangle]
  Monitoring [icon: activity]
}

// Smart Contracts (Cadence)
Cadence Contracts [icon: code] {
  WorkflowContract [icon: code, label: "Workflow"]
  SubscriptionManager [icon: repeat, label: "Subscription"]
  NFTRewards [icon: gift, label: "NFT Rewards"]
  DAOManager [icon: users, label: "DAO Manager"]
}

// Backend & Integrations
Backend [icon: server] {
  Node Server [icon: node-dot-js, label: "Node.js API"]
  WebSocket Service [icon: radio]
  MongoDB Database [icon: mongodb]
  Firebase Database [icon: firebase]
  Redis Cache [icon: database]
  Notification Service [icon: send]
  Analytics Service [icon: bar-chart]
  Job Queue [icon: list]
  Monitoring Service [icon: activity]
  Logging Service [icon: file-text]
  Admin Tools [icon: tool]
  API Layer [icon: cloud]
}

// Web3 & Partner Integrations
Web3 Integrations [icon: globe] {
  Flow JS SDK [icon: code]
  QuickNode RPC [icon: rocket]
  Moonpay [icon: moonpay]
  Privy [icon: lock]
  Thirdweb [icon: thirdweb]
  Crossmint [icon: crossmint]
  Dune Analytics [icon: duneanalytics]
}

// Deployment & CI/CD
Deployment [icon: upload] {
  Vercel Hosting [icon: vercel]
  Netlify Hosting [icon: netlify]
  Railway Hosting [icon: railway]
  Render Hosting [icon: render]
  GitHub Actions [icon: github]
}

// Security & Testing
Security & Testing [icon: shield] {
  Authentication [icon: log-in]
  "Multi-sig" [icon: key]
  Encryption [icon: lock]
  Validation [icon: check-circle]
  Threat Mitigation [icon: alert-octagon]
  Testing Suites [icon: check-square]
}

// Analytics & Gamification
Analytics & Gamification [icon: trending-up] {
  Metrics Engine [icon: bar-chart-2, label: "Metrics"]
  NFT Badges [icon: award]
  Leaderboard [icon: list-ol]
  Achievements [icon: star]
}

// Scalability & Stretch Goals
Scalability & Stretch Goals [icon: trending-up] {
  AI Assistant [icon: cpu]
  "Cross-chain Bridge" [icon: shuffle]
  Mobile App [icon: smartphone]
  Workflow Marketplace [icon: shopping-bag]
  "On-chain Leaderboard" [icon: list]
  Predictive Analytics [icon: activity]
  Localization [icon: globe]
  Voice Control [icon: mic]
  Layer2 Integration [icon: layers]
  Dynamic Gas Optimization [icon: zap]
}

// Connections

// User Layer to Frontend
Users > Frontend Platform

// Fiat onboarding and wallets to Web3 integrations
Fiat Onboarding > Moonpay
Wallets > Web3 Integrations

// Frontend to Core Features
Frontend Platform > Core Features

// Frontend to Backend
Frontend Platform > Backend

// Core Features to Backend
Core Features > Backend

// Core Features to Analytics & Gamification
Core Features > Analytics & Gamification

// Core Features to Security & Testing
Core Features > Security & Testing

// Backend to Cadence Contracts (Smart Contracts)
Backend > Cadence Contracts

// Backend to Web3 Integrations
Backend > Web3 Integrations

// Backend to Analytics & Gamification
Backend > Analytics & Gamification

// Backend to Security & Testing
Backend > Security & Testing

// Backend to Deployment
Backend > Deployment

// Cadence Contracts to Web3 Integrations (Flow, QuickNode, etc)
Cadence Contracts > Web3 Integrations

// Cadence Contracts to Analytics & Gamification (for NFT badges, leaderboard)
Cadence Contracts > Analytics & Gamification

// Cadence Contracts to Security & Testing (validation, multi-sig, etc)
Cadence Contracts > Security & Gamification

// Analytics & Gamification to Frontend (for display)

Frontend Platform < Analytics & Gamification
Frontend Platform < Security & Testing
Frontend Platform < Deployment