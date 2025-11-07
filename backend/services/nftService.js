// nftService.js
// NFT rewards service for FlowFi

const { executeTransaction, executeScript } = require('./flowService');
const User = require('../models/User');
const NotificationService = require('./notificationService');

class NFTService {
  // Mint achievement NFT
  async mintAchievementNFT(userAddress, achievementType, metadata = {}) {
    try {
      // Check if user already has this achievement
      const user = await User.findOne({ address: userAddress });
      if (!user) throw new Error('User not found');

      const hasAchievement = user.achievements.some(a => a.badgeType === achievementType);
      if (hasAchievement) {
        throw new Error('User already has this achievement');
      }

      // Mint NFT on chain (placeholder - would call FlowFiNFTRewards contract)
      const badgeTypeMap = {
        'workflow_master': 'WorkflowMaster',
        'staking_pro': 'StakingPro',
        'payment_warrior': 'PaymentWarrior',
        'community_contributor': 'CommunityContributor',
        'early_adopter': 'EarlyAdopter',
        'monthly_streak': 'MonthlyStreak',
        'dao_champion': 'DAOChampion',
        'template_forker': 'TemplateForker',
        'high_value_workflow': 'HighValueWorkflow',
        'beta_tester': 'BetaTester'
      };

      const badgeType = badgeTypeMap[achievementType] || 'EarlyAdopter';

      // Mock NFT minting - in real implementation, this would call the Cadence contract
      const nftId = Math.floor(Math.random() * 1000000);
      const nftData = {
        id: nftId,
        badgeType,
        metadata: {
          name: this.getBadgeName(badgeType),
          description: this.getBadgeDescription(badgeType),
          ...metadata
        },
        mintedAt: new Date()
      };

      // Update user achievements
      user.achievements.push({
        badgeId: `nft_${nftId}`,
        badgeType: achievementType,
        earnedAt: new Date(),
        metadata: nftData
      });

      await user.save();

      // Send notification
      await NotificationService.createNotification({
        userAddress,
        type: 'achievement_earned',
        title: 'New Achievement Unlocked!',
        message: `Congratulations! You've earned the "${this.getBadgeName(badgeType)}" badge.`,
        data: { badgeId: nftId, badgeType },
        channels: ['in_app', 'email'],
        priority: 'medium'
      });

      return nftData;
    } catch (error) {
      console.error('Error minting achievement NFT:', error);
      throw error;
    }
  }

  // Check and award achievements
  async checkAndAwardAchievements(userAddress) {
    try {
      const user = await User.findOne({ address: userAddress });
      if (!user) return;

      const achievements = [];

      // Workflow Master (100+ workflows)
      if (user.stats.totalWorkflows >= 100 && !this.hasAchievement(user, 'workflow_master')) {
        await this.mintAchievementNFT(userAddress, 'workflow_master');
        achievements.push('workflow_master');
      }

      // Monthly Streak (active workflows for a month)
      if (user.stats.activeWorkflows > 0 && !this.hasAchievement(user, 'monthly_streak')) {
        // Check if user has been active for 30+ days
        const daysSinceJoin = (Date.now() - user.createdAt) / (1000 * 60 * 60 * 24);
        if (daysSinceJoin >= 30) {
          await this.mintAchievementNFT(userAddress, 'monthly_streak');
          achievements.push('monthly_streak');
        }
      }

      // Community Contributor (shared templates)
      // This would need additional tracking of shared templates

      return achievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  }

  // Get user's NFT collection
  async getUserNFTs(userAddress) {
    try {
      const user = await User.findOne({ address: userAddress });
      if (!user) throw new Error('User not found');

      return user.achievements.map(a => a.metadata);
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      throw error;
    }
  }

  // Helper methods
  hasAchievement(user, achievementType) {
    return user.achievements.some(a => a.badgeType === achievementType);
  }

  getBadgeName(badgeType) {
    const names = {
      WorkflowMaster: 'Workflow Master',
      StakingPro: 'Staking Pro',
      PaymentWarrior: 'Payment Warrior',
      CommunityContributor: 'Community Contributor',
      EarlyAdopter: 'Early Adopter',
      MonthlyStreak: 'Monthly Streak',
      DAOChampion: 'DAO Champion',
      TemplateForker: 'Template Forker',
      HighValueWorkflow: 'High Value Workflow',
      BetaTester: 'Beta Tester'
    };
    return names[badgeType] || 'Achievement';
  }

  getBadgeDescription(badgeType) {
    const descriptions = {
      WorkflowMaster: 'Created 100+ successful workflows',
      StakingPro: 'Automated staking for 1+ years',
      PaymentWarrior: 'Processed 1000+ automated payments',
      CommunityContributor: 'Shared 50+ workflow templates',
      EarlyAdopter: 'Joined FlowFi during beta',
      MonthlyStreak: 'Maintained active workflows for a month',
      DAOChampion: 'Led successful DAO proposals',
      TemplateForker: 'Forked and improved community templates',
      HighValueWorkflow: 'Created workflows processing $10k+ in volume',
      BetaTester: 'Helped test FlowFi during development'
    };
    return descriptions[badgeType] || 'Achievement unlocked';
  }

  // Get leaderboard with NFT achievements
  async getLeaderboardWithAchievements(limit = 50) {
    try {
      const users = await User.find({})
        .select('address stats.reputationScore achievements')
        .sort({ 'stats.reputationScore': -1 })
        .limit(limit);

      return users.map(user => ({
        address: user.address,
        reputationScore: user.stats.reputationScore,
        achievements: user.achievements.length,
        topAchievements: user.achievements.slice(0, 3).map(a => a.badgeType)
      }));
    } catch (error) {
      console.error('Error fetching leaderboard with achievements:', error);
      throw error;
    }
  }
}

module.exports = new NFTService();