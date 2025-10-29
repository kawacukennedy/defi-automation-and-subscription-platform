const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userAddress: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['workflow_executed', 'workflow_failed', 'workflow_paused', 'achievement_earned', 'system_update', 'payment_received']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    workflowId: String,
    executionId: String,
    badgeId: String,
    amount: String,
    token: String,
    error: String
  },
  channels: [{
    type: String,
    enum: ['in_app', 'email', 'telegram', 'discord', 'webhook']
  }],
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  sentAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
notificationSchema.index({ userAddress: 1, read: 1, createdAt: -1 });
notificationSchema.index({ status: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);