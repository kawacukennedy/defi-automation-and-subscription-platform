const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  workflowId: {
    type: String,
    required: true,
    unique: true
  },
  userAddress: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  action: {
    type: String,
    required: true,
    enum: ['stake', 'swap', 'send', 'mint_nft', 'dao_vote', 'subscription']
  },
  token: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'monthly', 'custom'],
    default: 'once'
  },
  schedule: {
    type: Date,
    default: Date.now
  },
  trigger: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'failed'],
    default: 'active'
  },
  executionCount: {
    type: Number,
    default: 0
  },
  lastExecution: Date,
  nextExecution: Date,
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  gasUsed: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  isPublic: {
    type: Boolean,
    default: false
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
workflowSchema.index({ userAddress: 1, status: 1 });
workflowSchema.index({ action: 1, status: 1 });
workflowSchema.index({ nextExecution: 1, status: 1 });
workflowSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Workflow', workflowSchema);