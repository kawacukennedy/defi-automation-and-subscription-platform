const workflowService = require('../services/workflowService');

describe('WorkflowService', () => {
  describe('validateWorkflowData', () => {
    test('should validate correct workflow data', () => {
      const validData = {
        userAddress: '0x123456789',
        action: 'stake',
        token: 'FLOW',
        amount: '100.0',
        trigger: 'manual'
      };

      expect(() => workflowService.validateWorkflowData(validData)).not.toThrow();
    });

    test('should throw error for missing required fields', () => {
      const invalidData = {
        userAddress: '0x123456789',
        action: 'stake'
        // missing token, amount, trigger
      };

      expect(() => workflowService.validateWorkflowData(invalidData)).toThrow('Missing required field');
    });

    test('should throw error for invalid action', () => {
      const invalidData = {
        userAddress: '0x123456789',
        action: 'invalid_action',
        token: 'FLOW',
        amount: '100.0',
        trigger: 'manual'
      };

      expect(() => workflowService.validateWorkflowData(invalidData)).toThrow('Invalid action type');
    });
  });

  describe('calculateNextExecution', () => {
    test('should calculate next daily execution', () => {
      const now = new Date('2024-01-01T10:00:00Z');
      const schedule = new Date('2024-01-01T09:00:00Z'); // past
      const result = workflowService.calculateNextExecution(schedule, 'daily');

      expect(result.getDate()).toBe(now.getDate() + 1);
    });

    test('should calculate next weekly execution', () => {
      const now = new Date('2024-01-01T10:00:00Z');
      const schedule = new Date('2024-01-01T09:00:00Z'); // past
      const result = workflowService.calculateNextExecution(schedule, 'weekly');

      expect(result.getDate()).toBe(now.getDate() + 7);
    });
  });
});