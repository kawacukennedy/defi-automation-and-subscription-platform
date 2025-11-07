const notificationService = require('../services/notificationService');

describe('NotificationService', () => {
  describe('generateWebhookSignature', () => {
    test('should generate consistent signature for same payload', () => {
      const payload = { userAddress: '0x123', event: 'workflow_executed' };
      process.env.WEBHOOK_SECRET = 'test_secret';

      const sig1 = notificationService.generateWebhookSignature(payload);
      const sig2 = notificationService.generateWebhookSignature(payload);

      expect(sig1).toBe(sig2);
      expect(typeof sig1).toBe('string');
      expect(sig1.length).toBe(64); // SHA256 hex length
    });

    test('should generate different signatures for different payloads', () => {
      const payload1 = { userAddress: '0x123', event: 'workflow_executed' };
      const payload2 = { userAddress: '0x456', event: 'workflow_executed' };
      process.env.WEBHOOK_SECRET = 'test_secret';

      const sig1 = notificationService.generateWebhookSignature(payload1);
      const sig2 = notificationService.generateWebhookSignature(payload2);

      expect(sig1).not.toBe(sig2);
    });

    test('should generate different signatures for different secrets', () => {
      const payload = { userAddress: '0x123', event: 'workflow_executed' };

      process.env.WEBHOOK_SECRET = 'secret1';
      const sig1 = notificationService.generateWebhookSignature(payload);

      process.env.WEBHOOK_SECRET = 'secret2';
      const sig2 = notificationService.generateWebhookSignature(payload);

      expect(sig1).not.toBe(sig2);
    });
  });
});