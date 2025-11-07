const monitoringService = require('../services/monitoringService');

describe('MonitoringService', () => {
  describe('stopWorkflowMonitoring', () => {
    test('should stop monitoring for existing workflow', () => {
      const workflowId = 'wf_123';
      const mockInterval = { id: 'interval_123' };

      // Mock the activeMonitors map
      monitoringService.activeMonitors = new Map();
      monitoringService.activeMonitors.set(workflowId, mockInterval);

      // Mock clearInterval
      global.clearInterval = jest.fn();

      monitoringService.stopWorkflowMonitoring(workflowId);

      expect(global.clearInterval).toHaveBeenCalledWith(mockInterval);
      expect(monitoringService.activeMonitors.has(workflowId)).toBe(false);
    });

    test('should do nothing for non-existing workflow', () => {
      const workflowId = 'wf_nonexistent';

      // Mock the activeMonitors map
      monitoringService.activeMonitors = new Map();

      // Mock clearInterval
      global.clearInterval = jest.fn();

      monitoringService.stopWorkflowMonitoring(workflowId);

      expect(global.clearInterval).not.toHaveBeenCalled();
      expect(monitoringService.activeMonitors.has(workflowId)).toBe(false);
    });
  });
});