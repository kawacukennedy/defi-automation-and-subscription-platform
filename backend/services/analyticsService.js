const Analytics = require('../models/Analytics');
const Workflow = require('../models/Workflow');
const User = require('../models/User');

class AnalyticsService {
  async updateDailyMetrics() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get metrics for today
      const [
        totalUsers,
        newUsers,
        activeUsers,
        totalWorkflows,
        newWorkflows,
        activeWorkflows,
        executions,
        successfulExecutions,
        failedExecutions
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
        User.countDocuments({ lastLogin: { $gte: today } }),
        Workflow.countDocuments(),
        Workflow.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
        Workflow.countDocuments({ status: 'active' }),
        Workflow.aggregate([
          { $match: { lastExecution: { $gte: today, $lt: tomorrow } } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ]),
        Workflow.aggregate([
          { $match: { lastExecution: { $gte: today, $lt: tomorrow } } },
          { $group: { _id: null, count: { $sum: '$successCount' } } }
        ]),
        Workflow.aggregate([
          { $match: { lastExecution: { $gte: today, $lt: tomorrow } } },
          { $group: { _id: null, count: { $sum: '$failureCount' } } }
        ])
      ]);

      // Get top actions and tokens
      const topActions = await Workflow.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      const topTokens = await Workflow.aggregate([
        { $group: { _id: '$token', volume: { $sum: { $toDouble: '$amount' } } } },
        { $sort: { volume: -1 } },
        { $limit: 5 }
      ]);

      // Calculate performance metrics
      const totalExecutions = executions[0]?.count || 0;
      const successCount = successfulExecutions[0]?.count || 0;
      const failureCount = failedExecutions[0]?.count || 0;
      const successRate = totalExecutions > 0 ? (successCount / totalExecutions) * 100 : 0;

      // Update or create analytics record
      await Analytics.findOneAndUpdate(
        { date: today, type: 'daily' },
        {
          metrics: {
            totalUsers: totalUsers || 0,
            newUsers: newUsers || 0,
            activeUsers: activeUsers || 0,
            totalWorkflows: totalWorkflows || 0,
            newWorkflows: newWorkflows || 0,
            activeWorkflows: activeWorkflows || 0,
            totalExecutions,
            successfulExecutions: successCount,
            failedExecutions: failureCount,
            totalVolume: '0', // Would need to calculate actual volume
            gasUsed: 0, // Would need to track gas usage
            topActions,
            topTokens
          },
          performance: {
            successRate,
            errorRate: 100 - successRate
          }
        },
        { upsert: true, new: true }
      );

      console.log('Daily analytics updated');
    } catch (error) {
      console.error('Error updating daily metrics:', error);
      throw error;
    }
  }

  async getAnalytics(filters = {}) {
    try {
      const query = {};
      if (filters.startDate && filters.endDate) {
        query.date = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }
      if (filters.type) {
        query.type = filters.type;
      }

      return await Analytics.find(query).sort({ date: -1 });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  async getUserAnalytics(userAddress) {
    try {
      const user = await User.findOne({ address: userAddress });
      if (!user) {
        throw new Error('User not found');
      }

      const workflows = await Workflow.find({ userAddress });
      const totalExecutions = workflows.reduce((sum, wf) => sum + wf.executionCount, 0);
      const successfulExecutions = workflows.reduce((sum, wf) => sum + wf.successCount, 0);
      const failedExecutions = workflows.reduce((sum, wf) => sum + wf.failureCount, 0);

      return {
        user: {
          address: user.address,
          joinedAt: user.createdAt,
          stats: user.stats
        },
        workflows: {
          total: workflows.length,
          active: workflows.filter(wf => wf.status === 'active').length,
          completed: workflows.filter(wf => wf.status === 'completed').length,
          failed: workflows.filter(wf => wf.status === 'failed').length
        },
        executions: {
          total: totalExecutions,
          successful: successfulExecutions,
          failed: failedExecutions,
          successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0
        },
        achievements: user.achievements
      };
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  }

  async getGlobalStats() {
    try {
      const [
        totalUsers,
        totalWorkflows,
        activeWorkflows,
        totalExecutions,
        topActions,
        topTokens
      ] = await Promise.all([
        User.countDocuments(),
        Workflow.countDocuments(),
        Workflow.countDocuments({ status: 'active' }),
        Workflow.aggregate([
          { $group: { _id: null, total: { $sum: '$executionCount' } } }
        ]),
        Workflow.aggregate([
          { $group: { _id: '$action', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),
        Workflow.aggregate([
          { $group: { _id: '$token', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ])
      ]);

      return {
        totalUsers,
        totalWorkflows,
        activeWorkflows,
        totalExecutions: totalExecutions[0]?.total || 0,
        topActions,
        topTokens
      };
    } catch (error) {
      console.error('Error fetching global stats:', error);
      throw error;
    }
  }

  async trackWorkflowExecution(workflowId, success, gasUsed = 0) {
    try {
      // This would be called after each workflow execution
      // Update real-time metrics, could use Redis for caching
      console.log(`Tracking execution for workflow ${workflowId}: success=${success}, gas=${gasUsed}`);
    } catch (error) {
      console.error('Error tracking workflow execution:', error);
    }
  }

  async generatePredictiveAnalytics(days = 30) {
    try {
      // Get historical data for prediction
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90); // 90 days of historical data

      const historicalData = await this.getAnalytics({
        type: 'daily',
        startDate,
        endDate
      });

      if (historicalData.length < 7) {
        return { error: 'Insufficient historical data for prediction' };
      }

      // Simple linear regression for predictions
      const predictions = this.calculatePredictions(historicalData, days);

      return {
        predictions,
        confidence: this.calculateConfidence(historicalData),
        recommendations: this.generateRecommendations(predictions),
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error generating predictive analytics:', error);
      throw error;
    }
  }

  calculatePredictions(historicalData, days) {
    const metrics = ['totalUsers', 'totalWorkflows', 'totalExecutions'];

    return metrics.reduce((acc, metric) => {
      const data = historicalData.map(d => ({
        x: d.date.getTime(),
        y: d.metrics[metric] || 0
      })).filter(d => d.y > 0);

      if (data.length < 2) {
        acc[metric] = { predicted: 0, trend: 'insufficient-data' };
        return acc;
      }

      // Simple linear regression
      const n = data.length;
      const sumX = data.reduce((sum, d) => sum + d.x, 0);
      const sumY = data.reduce((sum, d) => sum + d.y, 0);
      const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);
      const sumXX = data.reduce((sum, d) => sum + d.x * d.x, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // Predict for the specified days ahead
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      const predicted = Math.max(0, Math.round(slope * futureDate.getTime() + intercept));

      // Calculate trend
      const recent = data.slice(-7).reduce((sum, d) => sum + d.y, 0) / 7;
      const older = data.slice(-14, -7).reduce((sum, d) => sum + d.y, 0) / 7;
      const trend = recent > older ? 'increasing' : recent < older ? 'decreasing' : 'stable';

      acc[metric] = {
        current: data[data.length - 1].y,
        predicted,
        change: ((predicted - data[data.length - 1].y) / data[data.length - 1].y * 100),
        trend,
        daysAhead: days
      };

      return acc;
    }, {});
  }

  calculateConfidence(historicalData) {
    // Simple confidence calculation based on data consistency
    const successRates = historicalData
      .map(d => d.performance?.successRate)
      .filter(rate => rate !== undefined);

    if (successRates.length === 0) return 0;

    const mean = successRates.reduce((sum, rate) => sum + rate, 0) / successRates.length;
    const variance = successRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / successRates.length;
    const stdDev = Math.sqrt(variance);

    // Confidence based on coefficient of variation
    const cv = stdDev / mean;
    return Math.max(0, Math.min(100, (1 - cv) * 100));
  }

  generateRecommendations(predictions) {
    const recommendations = [];

    if (predictions.totalUsers?.trend === 'increasing') {
      recommendations.push({
        type: 'growth',
        priority: 'high',
        message: 'User growth is strong. Consider scaling infrastructure.',
        action: 'Scale server resources'
      });
    }

    if (predictions.totalWorkflows?.change > 20) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        message: 'Workflow creation is expected to increase significantly.',
        action: 'Optimize workflow execution performance'
      });
    }

    const avgSuccessRate = predictions.successRate || 95;
    if (avgSuccessRate < 90) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: 'Execution success rate may decline. Review error handling.',
        action: 'Implement additional error recovery mechanisms'
      });
    }

    return recommendations;
  }

  async exportAnalyticsData(format = 'json', filters = {}) {
    try {
      const data = await this.getAnalytics(filters);

      if (format === 'csv') {
        return this.convertToCSV(data);
      }

      return {
        data,
        metadata: {
          exportedAt: new Date(),
          totalRecords: data.length,
          filters,
          version: '1.0'
        }
      };
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw error;
    }
  }

  convertToCSV(data) {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0].toObject ? data[0].toObject() : data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Handle nested objects and arrays
        if (typeof value === 'object') {
          return JSON.stringify(value).replace(/"/g, '""');
        }
        return String(value || '').replace(/"/g, '""');
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  async generateReport(type, startDate, endDate) {
    try {
      const analytics = await this.getAnalytics({
        type,
        startDate,
        endDate
      });

      // Generate comprehensive report
      const report = {
        period: { startDate, endDate, type },
        summary: {
          totalUsers: 0,
          totalWorkflows: 0,
          totalExecutions: 0,
          avgSuccessRate: 0
        },
        trends: [],
        topPerformers: {},
        predictive: await this.generatePredictiveAnalytics(30)
      };

      // Aggregate data
      analytics.forEach(day => {
        report.summary.totalUsers += day.metrics.totalUsers;
        report.summary.totalWorkflows += day.metrics.totalWorkflows;
        report.summary.totalExecutions += day.metrics.totalExecutions;
        report.trends.push({
          date: day.date,
          users: day.metrics.totalUsers,
          workflows: day.metrics.totalWorkflows,
          executions: day.metrics.totalExecutions
        });
      });

      if (analytics.length > 0) {
        report.summary.avgSuccessRate = analytics.reduce((sum, day) =>
          sum + (day.performance?.successRate || 0), 0) / analytics.length;
      }

      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();