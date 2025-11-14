const DAO = require('../models/DAO');
const User = require('../models/User');
const Workflow = require('../models/Workflow');
const NotificationService = require('./notificationService');
const { executeTransaction } = require('./flowService');

class DAOService {
  /**
   * Create a new DAO
   */
  async createDAO(daoData, creatorAddress) {
    try {
      const dao = new DAO({
        ...daoData,
        daoId: `dao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        members: [{
          address: creatorAddress,
          votingPower: 100, // Creator gets initial voting power
          role: 'admin'
        }]
      });

      await dao.save();

      // Update user stats
      await User.findOneAndUpdate(
        { address: creatorAddress },
        {
          $inc: { 'stats.daosCreated': 1 },
          $set: { updatedAt: new Date() }
        }
      );

      return dao;
    } catch (error) {
      console.error('Error creating DAO:', error);
      throw error;
    }
  }

  /**
   * Get DAO by ID
   */
  async getDAO(daoId) {
    try {
      return await DAO.findOne({ daoId });
    } catch (error) {
      console.error('Error fetching DAO:', error);
      throw error;
    }
  }

  /**
   * Join DAO
   */
  async joinDAO(daoId, userAddress) {
    try {
      const dao = await DAO.findOne({ daoId });
      if (!dao) throw new Error('DAO not found');

      if (dao.isMember(userAddress)) {
        throw new Error('User is already a member');
      }

      if (dao.members.length >= dao.settings.maxMembers) {
        throw new Error('DAO is at maximum capacity');
      }

      dao.members.push({
        address: userAddress,
        votingPower: dao.settings.minVotingPower,
        role: 'member'
      });

      await dao.save();

      // Update user stats
      await User.findOneAndUpdate(
        { address: userAddress },
        {
          $inc: { 'stats.daosJoined': 1 },
          $set: { updatedAt: new Date() }
        }
      );

      return dao;
    } catch (error) {
      console.error('Error joining DAO:', error);
      throw error;
    }
  }

  /**
   * Create a proposal
   */
  async createProposal(daoId, proposalData, proposerAddress) {
    try {
      const dao = await DAO.findOne({ daoId });
      if (!dao) throw new Error('DAO not found');

      if (!dao.isMember(proposerAddress)) {
        throw new Error('Only DAO members can create proposals');
      }

      const votingPower = dao.getVotingPower(proposerAddress);
      if (votingPower < dao.settings.minVotingPower) {
        throw new Error('Insufficient voting power to create proposals');
      }

      const proposal = {
        proposalId: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...proposalData,
        proposer: proposerAddress,
        endTime: new Date(Date.now() + dao.settings.votingPeriod),
        quorum: dao.settings.quorum,
        threshold: dao.settings.threshold
      };

      dao.proposals.push(proposal);
      dao.stats.totalProposals += 1;

      await dao.save();

      // Notify all members
      await this.notifyMembers(dao, `New proposal: ${proposal.title}`, proposal.proposalId);

      return proposal;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  }

  /**
   * Vote on a proposal
   */
  async voteOnProposal(daoId, proposalId, voterAddress, choice) {
    try {
      const dao = await DAO.findOne({ daoId });
      if (!dao) throw new Error('DAO not found');

      if (!dao.isMember(voterAddress)) {
        throw new Error('Only DAO members can vote');
      }

      const proposal = dao.proposals.id(proposalId);
      if (!proposal) throw new Error('Proposal not found');

      if (proposal.status !== 'active') {
        throw new Error('Proposal is not active');
      }

      if (proposal.endTime < new Date()) {
        throw new Error('Voting period has ended');
      }

      // Check if user already voted
      const existingVote = proposal.votes.find(v => v.voter === voterAddress);
      if (existingVote) {
        throw new Error('User has already voted on this proposal');
      }

      const votingPower = dao.getVotingPower(voterAddress);

      const vote = {
        voter: voterAddress,
        choice,
        votingPower,
        timestamp: new Date()
      };

      proposal.votes.push(vote);

      // Update voting power totals
      proposal.votingPower.total += votingPower;
      proposal.votingPower[choice] += votingPower;

      await dao.save();

      // Check if proposal can be resolved
      await this.checkProposalResolution(dao, proposal);

      return proposal;
    } catch (error) {
      console.error('Error voting on proposal:', error);
      throw error;
    }
  }

  /**
   * Check if proposal can be resolved
   */
  async checkProposalResolution(dao, proposal) {
    const totalVotingPower = dao.totalVotingPower;
    const quorumReached = proposal.votingPower.total >= (totalVotingPower * proposal.quorum);
    const thresholdReached = proposal.votingPower.yes >= (proposal.votingPower.total * proposal.threshold);

    if (proposal.endTime < new Date() || quorumReached) {
      if (thresholdReached) {
        proposal.status = 'passed';
        await this.executeProposal(dao, proposal);
      } else {
        proposal.status = 'rejected';
      }

      await dao.save();

      // Notify members of result
      await this.notifyMembers(dao, `Proposal ${proposal.status}: ${proposal.title}`, proposal.proposalId);
    }
  }

  /**
   * Execute a passed proposal
   */
  async executeProposal(dao, proposal) {
    try {
      proposal.executionTime = new Date();

      switch (proposal.type) {
        case 'workflow_template':
          await this.executeWorkflowTemplateProposal(dao, proposal);
          break;
        case 'parameter_change':
          await this.executeParameterChangeProposal(dao, proposal);
          break;
        case 'fund_allocation':
          await this.executeFundAllocationProposal(dao, proposal);
          break;
        case 'feature_request':
          await this.executeFeatureRequestProposal(dao, proposal);
          break;
      }

      proposal.status = 'executed';
      dao.stats.passedProposals += 1;
    } catch (error) {
      console.error('Error executing proposal:', error);
      proposal.status = 'failed';
    }
  }

  /**
   * Execute workflow template proposal
   */
  async executeWorkflowTemplateProposal(dao, proposal) {
    // Mark template as approved in community hub
    // This would integrate with the community service
    console.log(`Executing workflow template proposal: ${proposal.title}`);
  }

  /**
   * Execute parameter change proposal
   */
  async executeParameterChangeProposal(dao, proposal) {
    const { parameter, value } = proposal.data;

    if (dao.settings.hasOwnProperty(parameter)) {
      dao.settings[parameter] = value;
      console.log(`Updated DAO parameter ${parameter} to ${value}`);
    }
  }

  /**
   * Execute fund allocation proposal
   */
  async executeFundAllocationProposal(dao, proposal) {
    const { amount, recipient } = proposal.data;

    // Record allocation in treasury
    dao.treasury.allocations.push({
      proposalId: proposal.proposalId,
      amount,
      recipient,
      executed: false
    });

    // In a real implementation, this would trigger a blockchain transaction
    console.log(`Allocated ${amount} FLOW to ${recipient}`);
  }

  /**
   * Execute feature request proposal
   */
  async executeFeatureRequestProposal(dao, proposal) {
    // Mark feature request as approved
    console.log(`Feature request approved: ${proposal.title}`);
  }

  /**
   * Get DAO proposals
   */
  async getProposals(daoId, filters = {}) {
    try {
      const dao = await DAO.findOne({ daoId });
      if (!dao) throw new Error('DAO not found');

      let proposals = dao.proposals;

      if (filters.status) {
        proposals = proposals.filter(p => p.status === filters.status);
      }

      if (filters.type) {
        proposals = proposals.filter(p => p.type === filters.type);
      }

      return proposals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching proposals:', error);
      throw error;
    }
  }

  /**
   * Get user's DAOs
   */
  async getUserDAOs(userAddress) {
    try {
      return await DAO.find({ 'members.address': userAddress });
    } catch (error) {
      console.error('Error fetching user DAOs:', error);
      throw error;
    }
  }

  /**
   * Notify all DAO members
   */
  async notifyMembers(dao, message, referenceId) {
    const notifications = dao.members.map(member =>
      NotificationService.createNotification({
        userAddress: member.address,
        type: 'dao_notification',
        title: 'DAO Update',
        message,
        data: { daoId: dao.daoId, referenceId },
        channels: ['in_app']
      })
    );

    await Promise.all(notifications);
  }

  /**
   * Get DAO statistics
   */
  async getDAOStats(daoId) {
    try {
      const dao = await DAO.findOne({ daoId });
      if (!dao) throw new Error('DAO not found');

      const activeProposals = dao.proposals.filter(p => p.status === 'active').length;
      const totalVotes = dao.proposals.reduce((sum, p) => sum + p.votes.length, 0);

      return {
        memberCount: dao.members.length,
        totalProposals: dao.stats.totalProposals,
        activeProposals,
        passedProposals: dao.stats.passedProposals,
        totalVotes,
        totalVotingPower: dao.totalVotingPower,
        treasuryBalance: dao.treasury.balance
      };
    } catch (error) {
      console.error('Error fetching DAO stats:', error);
      throw error;
    }
  }
}

module.exports = new DAOService();