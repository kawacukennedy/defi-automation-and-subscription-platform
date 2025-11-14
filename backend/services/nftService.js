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

      // Mint NFT on chain using FlowFiNFTRewards contract
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

      // Prepare metadata for IPFS/Cadence storage
      const nftMetadata = {
        name: this.getBadgeName(badgeType),
        description: this.getBadgeDescription(badgeType),
        image: this.getBadgeImage(badgeType),
        attributes: [
          {
            trait_type: 'Achievement Type',
            value: badgeType
          },
          {
            trait_type: 'Rarity',
            value: this.getBadgeRarity(badgeType)
          },
          {
            trait_type: 'Earned Date',
            value: new Date().toISOString().split('T')[0]
          },
          ...this.getAdditionalAttributes(achievementType, metadata)
        ],
        ...metadata
      };

      // Call Cadence contract to mint NFT
      const result = await this.mintNFTOnChain(userAddress, badgeType, nftMetadata);

      if (!result.success) {
        throw new Error('Failed to mint NFT on blockchain');
      }

      const nftData = {
        id: result.nftId,
        badgeType,
        metadata: nftMetadata,
        mintedAt: new Date(),
        transactionId: result.transactionId
      };

      // Update user achievements
      user.achievements.push({
        badgeId: `nft_${result.nftId}`,
        badgeType: achievementType,
        earnedAt: new Date(),
        metadata: nftData,
        transactionId: result.transactionId
      });

      await user.save();

      // Send notification
      await NotificationService.createNotification({
        userAddress,
        type: 'achievement_earned',
        title: 'New Achievement Unlocked!',
        message: `Congratulations! You've earned the "${this.getBadgeName(badgeType)}" badge.`,
        data: { badgeId: result.nftId, badgeType, transactionId: result.transactionId },
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

  getBadgeImage(badgeType) {
    // Return IPFS URLs for badge images
    const images = {
      WorkflowMaster: 'ipfs://QmWorkflowMasterBadge',
      StakingPro: 'ipfs://QmStakingProBadge',
      PaymentWarrior: 'ipfs://QmPaymentWarriorBadge',
      CommunityContributor: 'ipfs://QmCommunityContributorBadge',
      EarlyAdopter: 'ipfs://QmEarlyAdopterBadge',
      MonthlyStreak: 'ipfs://QmMonthlyStreakBadge',
      DAOChampion: 'ipfs://QmDAOChampionBadge',
      TemplateForker: 'ipfs://QmTemplateForkerBadge',
      HighValueWorkflow: 'ipfs://QmHighValueWorkflowBadge',
      BetaTester: 'ipfs://QmBetaTesterBadge'
    };
    return images[badgeType] || 'ipfs://QmDefaultBadge';
  }

  getBadgeRarity(badgeType) {
    const rarities = {
      WorkflowMaster: 'Legendary',
      StakingPro: 'Epic',
      PaymentWarrior: 'Epic',
      CommunityContributor: 'Rare',
      EarlyAdopter: 'Common',
      MonthlyStreak: 'Uncommon',
      DAOChampion: 'Legendary',
      TemplateForker: 'Rare',
      HighValueWorkflow: 'Epic',
      BetaTester: 'Common'
    };
    return rarities[badgeType] || 'Common';
  }

  getAdditionalAttributes(achievementType, metadata) {
    const attributes = [];

    // Add achievement-specific attributes
    switch (achievementType) {
      case 'workflow_master':
        attributes.push({
          trait_type: 'Workflows Created',
          value: metadata.totalWorkflows || 100
        });
        break;
      case 'payment_warrior':
        attributes.push({
          trait_type: 'Payments Processed',
          value: metadata.totalPayments || 1000
        });
        break;
      case 'high_value_workflow':
        attributes.push({
          trait_type: 'Volume Processed',
          value: `$${metadata.totalVolume || 10000}`
        });
        break;
      case 'monthly_streak':
        attributes.push({
          trait_type: 'Streak Duration',
          value: `${metadata.streakDays || 30} days`
        });
        break;
    }

    return attributes;
  }

  // Get NFT collection statistics
  async getNFTStats() {
    try {
      const users = await User.find({ 'achievements.0': { $exists: true } });
      const totalNFTs = users.reduce((sum, user) => sum + user.achievements.length, 0);

      const badgeCounts = {};
      users.forEach(user => {
        user.achievements.forEach(achievement => {
          badgeCounts[achievement.badgeType] = (badgeCounts[achievement.badgeType] || 0) + 1;
        });
      });

      return {
        totalNFTs,
        totalUsers: users.length,
        badgeDistribution: badgeCounts,
        mostPopularBadge: Object.entries(badgeCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || null
      };
    } catch (error) {
      console.error('Error fetching NFT stats:', error);
      throw error;
    }
  }

  // Mint NFT on Flow blockchain
  async mintNFTOnChain(userAddress, badgeType, metadata) {
    try {
      const cadence = `
        import FlowFiNFTRewards from 0xFlowFiNFTRewards
        import NonFungibleToken from 0xNonFungibleToken
        import MetadataViews from 0xMetadataViews

        transaction(badgeType: String, metadata: {String: String}) {
          prepare(signer: AuthAccount) {
            // Ensure the signer has a collection
            if signer.borrow<&FlowFiNFTRewards.Collection>(from: FlowFiNFTRewards.CollectionStoragePath) == nil {
              signer.save(<- FlowFiNFTRewards.createEmptyCollection(), to: FlowFiNFTRewards.CollectionStoragePath)
              signer.link<&FlowFiNFTRewards.Collection{NonFungibleToken.CollectionPublic, FlowFiNFTRewards.FlowFiNFTCollectionPublic, MetadataViews.ResolverCollection}>(
                FlowFiNFTRewards.CollectionStoragePath,
                target: FlowFiNFTRewards.CollectionPublicPath
              )
            }

            // Mint the NFT
            let collectionRef = signer.borrow<&FlowFiNFTRewards.Collection>(from: FlowFiNFTRewards.CollectionStoragePath)
              ?? panic("Could not borrow a reference to the owner's collection")

            let nftId = collectionRef.mintNFT(badgeType: badgeType, metadata: metadata)
          }
        }
      `;

      const args = [
        { value: badgeType, type: 'String' },
        { value: metadata, type: 'Dictionary' }
      ];

      const result = await executeTransaction(cadence, args);

      // Extract NFT ID from transaction events (mock for now)
      const nftId = Math.floor(Math.random() * 1000000);

      return {
        success: result.status === 4, // SEALED
        nftId,
        transactionId: result.transactionId
      };
    } catch (error) {
      console.error('Error minting NFT on chain:', error);
      return { success: false, error: error.message };
    }
  }

  // Get NFT metadata from chain
  async getNFTMetadata(nftId) {
    try {
      const cadence = `
        import FlowFiNFTRewards from 0xFlowFiNFTRewards
        import MetadataViews from 0xMetadataViews

        pub fun main(nftId: UInt64): FlowFiNFTRewards.NFTMetadata {
          let collection = getAccount(0xFlowFiNFTRewards).getCapability(FlowFiNFTRewards.CollectionPublicPath)
            .borrow<&FlowFiNFTRewards.Collection{MetadataViews.ResolverCollection}>()
            ?? panic("Could not borrow a reference to the collection")

          let nft = collection.borrowViewResolver(id: nftId)
          let metadata = FlowFiNFTRewards.getNFTMetadata(id: nftId)

          return metadata
        }
      `;

      const result = await executeScript(cadence, [{ value: nftId, type: 'UInt64' }]);
      return result.data;
    } catch (error) {
      console.error('Error fetching NFT metadata:', error);
      throw error;
    }
  }

  // Transfer NFT
  async transferNFT(fromAddress, toAddress, nftId) {
    try {
      const cadence = `
        import FlowFiNFTRewards from 0xFlowFiNFTRewards
        import NonFungibleToken from 0xNonFungibleToken

        transaction(recipient: Address, nftId: UInt64) {
          prepare(signer: AuthAccount) {
            let collectionRef = signer.borrow<&FlowFiNFTRewards.Collection>(from: FlowFiNFTRewards.CollectionStoragePath)
              ?? panic("Could not borrow a reference to the owner's collection")

            let recipientRef = getAccount(recipient).getCapability(FlowFiNFTRewards.CollectionPublicPath)
              .borrow<&{NonFungibleToken.CollectionPublic}>()
              ?? panic("Could not borrow recipient's collection reference")

            let nft <- collectionRef.withdraw(withdrawID: nftId)
            recipientRef.deposit(token: <- nft)
          }
        }
      `;

      const args = [
        { value: toAddress, type: 'Address' },
        { value: nftId, type: 'UInt64' }
      ];

      const result = await executeTransaction(cadence, args);
      return {
        success: result.status === 4,
        transactionId: result.transactionId
      };
    } catch (error) {
      console.error('Error transferring NFT:', error);
      throw error;
    }
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