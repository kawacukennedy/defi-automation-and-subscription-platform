const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  walletType: {
    type: String,
    enum: ['dapper', 'blocto', 'lilico', 'ledger', 'metamask'],
    required: true
  },
  email: String,
  telegramId: String,
  discordId: String,
  notificationPreferences: {
    email: { type: Boolean, default: true },
    telegram: { type: Boolean, default: false },
    discord: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true }
  },
  profile: {
    username: String,
    avatar: String,
    bio: String
  },
  stats: {
    totalWorkflows: { type: Number, default: 0 },
    activeWorkflows: { type: Number, default: 0 },
    totalExecutions: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    reputationScore: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now }
  },
  achievements: [{
    badgeId: String,
    badgeType: String,
    earnedAt: { type: Date, default: Date.now },
    metadata: mongoose.Schema.Types.Mixed
  }],
  settings: {
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
    language: { type: String, default: 'en' },
    timezone: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
userSchema.index({ 'stats.reputationScore': -1 });
userSchema.index({ 'stats.totalWorkflows': -1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);