const assert = require('assert');
const fs = require('fs');
const path = require('path');
const workflowService = require('../services/workflowService');
const subscriptionService = require('../services/subscriptionService');
const nftService = require('../services/nftService');

describe('FlowFi Backend Integration Tests', () => {
  describe('File Structure', () => {
    it('should have all required directories', () => {
      const requiredDirs = ['routes', 'services', 'models', 'middleware'];
      requiredDirs.forEach(dir => {
        assert(fs.existsSync(path.join(__dirname, '..', dir)), `Directory ${dir} should exist`);
      });
    });

    it('should have all required route files', () => {
      const requiredRoutes = ['workflows.js', 'subscriptions.js', 'analytics.js', 'notifications.js', 'community.js'];
      requiredRoutes.forEach(route => {
        assert(fs.existsSync(path.join(__dirname, '..', 'routes', route)), `Route file ${route} should exist`);
      });
    });

    it('should have all required service files', () => {
      const requiredServices = ['workflowService.js', 'subscriptionService.js', 'analyticsService.js', 'notificationService.js', 'nftService.js', 'flowService.js'];
      requiredServices.forEach(service => {
        assert(fs.existsSync(path.join(__dirname, '..', 'services', service)), `Service file ${service} should exist`);
      });
    });

    it('should have all required model files', () => {
      const requiredModels = ['User.js', 'Workflow.js', 'Subscription.js', 'Analytics.js', 'Notification.js'];
      requiredModels.forEach(model => {
        assert(fs.existsSync(path.join(__dirname, '..', 'models', model)), `Model file ${model} should exist`);
      });
    });
  });

  describe('Configuration', () => {
    it('should have package.json with required fields', () => {
      const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
      assert(packageJson.name, 'Package should have name');
      assert(packageJson.version, 'Package should have version');
      assert(packageJson.scripts, 'Package should have scripts');
      assert(packageJson.scripts.start, 'Package should have start script');
      assert(packageJson.dependencies, 'Package should have dependencies');
    });

    it('should have main index.js file', () => {
      assert(fs.existsSync(path.join(__dirname, '..', 'index.js')), 'Main index.js should exist');
    });
  });

  describe('Utility Functions', () => {
    it('should validate email format', () => {
      // Simple email validation test
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      assert(emailRegex.test('test@example.com'), 'Should validate correct email');
      assert(!emailRegex.test('invalid-email'), 'Should reject invalid email');
    });

    it('should validate Flow addresses', () => {
      // Simple Flow address validation (starts with 0x and has length)
      const isValidFlowAddress = (address) => {
        return address && address.startsWith('0x') && address.length === 18;
      };

      assert(isValidFlowAddress('0x1234567890123456'), 'Should validate correct Flow address');
      assert(!isValidFlowAddress('invalid'), 'Should reject invalid Flow address');
      assert(!isValidFlowAddress('0x123'), 'Should reject too short Flow address');
    });

    it('should calculate time intervals correctly', () => {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const tomorrow = now + oneDay;

      assert(tomorrow > now, 'Tomorrow should be after now');
      assert(tomorrow - now === oneDay, 'Should calculate one day correctly');
    });
  });

  describe('Workflow Service', () => {
    it('should reject invalid workflow data', () => {
      const invalidData = {
        userAddress: '0x123456789',
        action: 'invalid_action',
        token: 'FLOW',
        amount: '100.0',
        trigger: 'manual'
      };

      assert.throws(() => workflowService.validateWorkflowData(invalidData));
    });

    it('should calculate next execution correctly', () => {
      const now = new Date('2024-01-01T10:00:00Z');
      const schedule = new Date('2024-01-01T09:00:00Z'); // past
      const result = workflowService.calculateNextExecution(schedule, 'daily');

      assert(result.getDate() === now.getDate() + 1);
    });
  });

  describe('Subscription Service', () => {
    it('should validate subscription data correctly', () => {
      const validData = {
        userAddress: '0x123456789',
        recipient: '0x987654321',
        token: 'FLOW',
        amount: 100.0,
        interval: 86400
      };

      assert.doesNotThrow(() => subscriptionService.validateSubscriptionData(validData));
    });

    it('should reject invalid subscription data', () => {
      const invalidData = {
        userAddress: '0x123456789',
        recipient: '0x987654321',
        token: 'FLOW',
        amount: -100.0, // negative amount
        interval: 86400
      };

      assert.throws(() => subscriptionService.validateSubscriptionData(invalidData));
    });

    it('should calculate next payment correctly', () => {
      const interval = 86400; // 1 day
      const fromDate = new Date('2024-01-01T10:00:00Z');
      const result = subscriptionService.calculateNextPayment(interval, fromDate.getTime());

      const expected = new Date(fromDate.getTime() + (interval * 1000));
      assert(result.getTime() === expected.getTime());
    });
  });

  describe('NFT Service', () => {
    it('should return correct badge name', () => {
      const name = nftService.getBadgeName('WorkflowMaster');
      assert(name === 'Workflow Master');
    });

    it('should return correct badge description', () => {
      const desc = nftService.getBadgeDescription('WorkflowMaster');
      assert(desc === 'Created 100+ successful workflows');
    });

    it('should check achievement status correctly', () => {
      const user = {
        achievements: [
          { badgeType: 'workflow_master' },
          { badgeType: 'staking_pro' }
        ]
      };

      assert(nftService.hasAchievement(user, 'workflow_master') === true);
      assert(nftService.hasAchievement(user, 'payment_warrior') === false);
    });
  });

  describe('API Routes', () => {
    it('should have all route files with basic structure', () => {
      // Just check that files exist and have basic exports
      const routes = ['workflows', 'subscriptions', 'analytics', 'notifications', 'community'];
      routes.forEach(route => {
        const filePath = path.join(__dirname, '..', 'routes', `${route}.js`);
        assert(fs.existsSync(filePath), `Route file ${route}.js should exist`);
        const content = fs.readFileSync(filePath, 'utf8');
        assert(content.includes('module.exports'), `Route file ${route}.js should export a module`);
      });
    });
  });

  describe('Models', () => {
    it('should export all required models', () => {
      assert.doesNotThrow(() => require('../models/User'));
      assert.doesNotThrow(() => require('../models/Workflow'));
      assert.doesNotThrow(() => require('../models/Subscription'));
      assert.doesNotThrow(() => require('../models/Analytics'));
      assert.doesNotThrow(() => require('../models/Notification'));
    });
  });
});