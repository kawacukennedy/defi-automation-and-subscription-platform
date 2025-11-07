const analyticsService = require('../services/analyticsService');

describe('AnalyticsService', () => {
  describe('calculatePredictions', () => {
    test('should calculate predictions with sufficient data', () => {
      const historicalData = [
        {
          date: new Date('2024-01-01'),
          metrics: { totalUsers: 100, totalWorkflows: 50, totalExecutions: 200 }
        },
        {
          date: new Date('2024-01-02'),
          metrics: { totalUsers: 110, totalWorkflows: 55, totalExecutions: 220 }
        },
        {
          date: new Date('2024-01-03'),
          metrics: { totalUsers: 120, totalWorkflows: 60, totalExecutions: 240 }
        }
      ];

      const result = analyticsService.calculatePredictions(historicalData, 7);

      expect(result).toHaveProperty('totalUsers');
      expect(result.totalUsers).toHaveProperty('predicted');
      expect(result.totalUsers).toHaveProperty('trend');
      expect(typeof result.totalUsers.predicted).toBe('number');
    });

    test('should handle insufficient data', () => {
      const historicalData = [
        {
          date: new Date('2024-01-01'),
          metrics: { totalUsers: 100 }
        }
      ];

      const result = analyticsService.calculatePredictions(historicalData, 7);

      expect(result.totalUsers.predicted).toBe(0);
      expect(result.totalUsers.trend).toBe('insufficient-data');
    });
  });

  describe('calculateConfidence', () => {
    test('should calculate confidence with performance data', () => {
      const historicalData = [
        { performance: { successRate: 95 } },
        { performance: { successRate: 98 } },
        { performance: { successRate: 92 } }
      ];

      const result = analyticsService.calculateConfidence(historicalData);

      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
      expect(typeof result).toBe('number');
    });

    test('should return 0 for no performance data', () => {
      const historicalData = [
        { metrics: { totalUsers: 100 } },
        { metrics: { totalUsers: 110 } }
      ];

      const result = analyticsService.calculateConfidence(historicalData);

      expect(result).toBe(0);
    });
  });

  describe('generateRecommendations', () => {
    test('should generate recommendations for increasing users', () => {
      const predictions = {
        totalUsers: { trend: 'increasing' },
        totalWorkflows: { change: 5 }
      };

      const result = analyticsService.generateRecommendations(predictions);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('type', 'growth');
      expect(result[0]).toHaveProperty('priority', 'high');
    });

    test('should generate recommendations for workflow increase', () => {
      const predictions = {
        totalUsers: { trend: 'stable' },
        totalWorkflows: { change: 25 }
      };

      const result = analyticsService.generateRecommendations(predictions);

      expect(Array.isArray(result)).toBe(true);
      const workflowRec = result.find(r => r.message.includes('Workflow creation'));
      expect(workflowRec).toBeDefined();
      expect(workflowRec.type).toBe('optimization');
    });
  });

  describe('convertToCSV', () => {
    test('should convert data to CSV format', () => {
      const data = [
        { name: 'John', age: 30, city: 'NYC' },
        { name: 'Jane', age: 25, city: 'LA' }
      ];

      const result = analyticsService.convertToCSV(data);

      expect(typeof result).toBe('string');
      expect(result).toContain('name,age,city');
      expect(result).toContain('John,30,NYC');
      expect(result).toContain('Jane,25,LA');
    });

    test('should handle empty data', () => {
      const result = analyticsService.convertToCSV([]);

      expect(result).toBe('');
    });

    test('should handle objects with nested data', () => {
      const data = [
        { name: 'John', details: { age: 30, city: 'NYC' } }
      ];

      const result = analyticsService.convertToCSV(data);

      expect(result).toContain('name,details');
      expect(result).toContain('"{""age"":30,""city"":""NYC""}"');
    });
  });
});