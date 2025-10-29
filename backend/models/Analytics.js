const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly'],
    index: true
  },
  metrics: {
    totalUsers: { type: Number, default: 0 },
    newUsers: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    totalWorkflows: { type: Number, default: 0 },
    newWorkflows: { type: Number, default: 0 },
    activeWorkflows: { type: Number, default: 0 },
    totalExecutions: { type: Number, default: 0 },
    successfulExecutions: { type: Number, default: 0 },
    failedExecutions: { type: Number, default: 0 },
    totalVolume: { type: String, default: '0' }, // BigInt as string
    gasUsed: { type: Number, default: 0 },
    topActions: [{
      action: String,
      count: Number
    }],
    topTokens: [{
      token: String,
      volume: String
    }]
  },
  userBreakdown: {
    byWalletType: mongoose.Schema.Types.Mixed,
    byCountry: mongoose.Schema.Types.Mixed,
    byAction: mongoose.Schema.Types.Mixed
  },
  performance: {
    avgExecutionTime: Number,
    avgGasPrice: String,
    successRate: Number,
    errorRate: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes
analyticsSchema.index({ date: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', analyticsSchema);