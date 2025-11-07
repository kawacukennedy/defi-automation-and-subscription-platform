const nftService = require('../services/nftService');

describe('NFTService', () => {
  describe('getBadgeName', () => {
    test('should return correct badge name', () => {
      expect(nftService.getBadgeName('WorkflowMaster')).toBe('Workflow Master');
      expect(nftService.getBadgeName('StakingPro')).toBe('Staking Pro');
      expect(nftService.getBadgeName('PaymentWarrior')).toBe('Payment Warrior');
    });

    test('should return default name for unknown badge', () => {
      expect(nftService.getBadgeName('UnknownBadge')).toBe('Achievement');
    });
  });

  describe('getBadgeDescription', () => {
    test('should return correct badge description', () => {
      expect(nftService.getBadgeDescription('WorkflowMaster')).toBe('Created 100+ successful workflows');
      expect(nftService.getBadgeDescription('StakingPro')).toBe('Automated staking for 1+ years');
      expect(nftService.getBadgeDescription('PaymentWarrior')).toBe('Processed 1000+ automated payments');
    });

    test('should return default description for unknown badge', () => {
      expect(nftService.getBadgeDescription('UnknownBadge')).toBe('Earned a special achievement');
    });
  });

  describe('hasAchievement', () => {
    test('should return true if user has achievement', () => {
      const user = {
        achievements: [
          { badgeType: 'workflow_master' },
          { badgeType: 'staking_pro' }
        ]
      };

      expect(nftService.hasAchievement(user, 'workflow_master')).toBe(true);
      expect(nftService.hasAchievement(user, 'staking_pro')).toBe(true);
    });

    test('should return false if user does not have achievement', () => {
      const user = {
        achievements: [
          { badgeType: 'workflow_master' }
        ]
      };

      expect(nftService.hasAchievement(user, 'payment_warrior')).toBe(false);
    });

    test('should return false for user with no achievements', () => {
      const user = {
        achievements: []
      };

      expect(nftService.hasAchievement(user, 'workflow_master')).toBe(false);
    });
  });
});