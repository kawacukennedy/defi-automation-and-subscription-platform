const subscriptionService = require('../services/subscriptionService');

describe('SubscriptionService', () => {
  describe('validateSubscriptionData', () => {
    test('should validate correct subscription data', () => {
      const validData = {
        userAddress: '0x123456789',
        recipient: '0x987654321',
        token: 'FLOW',
        amount: 100.0,
        interval: 86400
      };

      expect(() => subscriptionService.validateSubscriptionData(validData)).not.toThrow();
    });

    test('should throw error for missing required fields', () => {
      const invalidData = {
        userAddress: '0x123456789',
        recipient: '0x987654321'
        // missing token, amount, interval
      };

      expect(() => subscriptionService.validateSubscriptionData(invalidData)).toThrow('Missing required field');
    });

    test('should throw error for negative amount', () => {
      const invalidData = {
        userAddress: '0x123456789',
        recipient: '0x987654321',
        token: 'FLOW',
        amount: -100.0,
        interval: 86400
      };

      expect(() => subscriptionService.validateSubscriptionData(invalidData)).toThrow('Amount must be greater than 0');
    });

    test('should throw error for too short interval', () => {
      const invalidData = {
        userAddress: '0x123456789',
        recipient: '0x987654321',
        token: 'FLOW',
        amount: 100.0,
        interval: 100 // less than 3600
      };

      expect(() => subscriptionService.validateSubscriptionData(invalidData)).toThrow('Interval must be at least 1 hour');
    });
  });

  describe('calculateNextPayment', () => {
    test('should calculate next payment correctly', () => {
      const interval = 86400; // 1 day
      const fromDate = new Date('2024-01-01T10:00:00Z').getTime();
      const result = subscriptionService.calculateNextPayment(interval, fromDate);

      const expected = new Date(fromDate + (interval * 1000));
      expect(result.getTime()).toBe(expected.getTime());
    });

    test('should use current time if no fromDate provided', () => {
      const interval = 3600; // 1 hour
      const before = Date.now();
      const result = subscriptionService.calculateNextPayment(interval);
      const after = Date.now();

      expect(result.getTime()).toBeGreaterThanOrEqual(before + (interval * 1000));
      expect(result.getTime()).toBeLessThanOrEqual(after + (interval * 1000));
    });
  });
});