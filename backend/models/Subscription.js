const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  subscriptionId: {
    type: String,
    required: true,
    unique: true
  },
  userAddress: {
    type: String,
    required: true,
    index: true
  },
  recipient: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  fee: {
    type: Number,
    default: 0.01
  },
  interval: {
    type: Number, // seconds
    required: true,
    default: 86400 // 1 day
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired'],
    default: 'active'
  },
  nextPayment: {
    type: Date,
    required: true
  },
  lastPayment: {
    type: Date
  },
  totalPayments: {
    type: Number,
    default: 0
  },
  maxPayments: {
    type: Number,
    default: 0 // 0 = unlimited
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  composableWorkflows: [{
    type: String
  }],
  maxRetries: {
    type: Number,
    default: 3
  },
  gasLimit: {
    type: Number,
    default: 100000
  },
  stats: {
    successfulPayments: { type: Number, default: 0 },
    failedPayments: { type: Number, default: 0 },
    totalVolume: { type: Number, default: 0 },
    gasUsed: { type: Number, default: 0 }
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
subscriptionSchema.index({ userAddress: 1, status: 1 });
subscriptionSchema.index({ nextPayment: 1, status: 1 });
subscriptionSchema.index({ recipient: 1 });

// Update updatedAt on save
subscriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);