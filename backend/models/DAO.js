const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  proposalId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['workflow_template', 'parameter_change', 'fund_allocation', 'feature_request'],
    required: true
  },
  proposer: {
    type: String, // Flow address
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'passed', 'rejected', 'executed', 'cancelled'],
    default: 'active'
  },
  votes: [{
    voter: String, // Flow address
    choice: {
      type: String,
      enum: ['yes', 'no', 'abstain']
    },
    votingPower: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  votingPower: {
    total: { type: Number, default: 0 },
    yes: { type: Number, default: 0 },
    no: { type: Number, default: 0 },
    abstain: { type: Number, default: 0 }
  },
  quorum: {
    type: Number,
    default: 0.5 // 50% quorum
  },
  threshold: {
    type: Number,
    default: 0.5 // 50% approval threshold
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    required: true
  },
  executionTime: Date,
  data: mongoose.Schema.Types.Mixed, // Additional proposal data
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes
proposalSchema.index({ status: 1, endTime: 1 });
proposalSchema.index({ proposer: 1 });
proposalSchema.index({ 'votes.voter': 1 });

const memberSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true
  },
  votingPower: {
    type: Number,
    default: 1
  },
  role: {
    type: String,
    enum: ['member', 'moderator', 'admin'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  reputation: {
    type: Number,
    default: 0
  },
  achievements: [{
    type: String // Achievement IDs
  }]
});

const daoSchema = new mongoose.Schema({
  daoId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  avatar: String,
  members: [memberSchema],
  proposals: [proposalSchema],
  settings: {
    votingPeriod: {
      type: Number,
      default: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    },
    quorum: {
      type: Number,
      default: 0.5
    },
    threshold: {
      type: Number,
      default: 0.5
    },
    minVotingPower: {
      type: Number,
      default: 1
    },
    maxMembers: {
      type: Number,
      default: 1000
    }
  },
  treasury: {
    balance: { type: Number, default: 0 },
    allocations: [{
      proposalId: String,
      amount: Number,
      recipient: String,
      executed: { type: Boolean, default: false }
    }]
  },
  stats: {
    totalProposals: { type: Number, default: 0 },
    passedProposals: { type: Number, default: 0 },
    totalVotes: { type: Number, default: 0 },
    activeMembers: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Virtual for total voting power
daoSchema.virtual('totalVotingPower').get(function() {
  return this.members.reduce((sum, member) => sum + member.votingPower, 0);
});

// Method to check if user is a member
daoSchema.methods.isMember = function(address) {
  return this.members.some(member => member.address === address);
};

// Method to get member's voting power
daoSchema.methods.getVotingPower = function(address) {
  const member = this.members.find(m => m.address === address);
  return member ? member.votingPower : 0;
};

module.exports = mongoose.model('DAO', daoSchema);