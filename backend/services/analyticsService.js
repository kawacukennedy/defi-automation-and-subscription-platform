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
        topPerformers: {}
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