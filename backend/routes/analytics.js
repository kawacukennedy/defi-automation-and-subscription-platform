const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const { authenticateUser } = require('../middleware/auth');

// All analytics routes require authentication
router.use(authenticateUser);

// Get user analytics
router.get('/user', async (req, res) => {
  try {
    const analytics = await analyticsService.getUserAnalytics(req.user.address);
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user analytics'
    });
  }
});

// Get global stats (admin only)
router.get('/global', async (req, res) => {
  try {
    // In production, add admin check here
    const stats = await analyticsService.getGlobalStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching global stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch global stats'
    });
  }
});

// Get analytics data with filters
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, type = 'daily' } = req.query;
    const analytics = await analyticsService.getAnalytics({
      startDate,
      endDate,
      type
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

// Generate report
router.post('/reports', async (req, res) => {
  try {
    const { type, startDate, endDate, format = 'json' } = req.body;

    const report = await analyticsService.generateReport(type, startDate, endDate);

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(report);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics-report.csv"');
      res.send(csvData);
    } else {
      res.json({
        success: true,
        data: report
      });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report'
    });
  }
});

// Update daily metrics (internal/cron job)
router.post('/update-daily', async (req, res) => {
  try {
    await analyticsService.updateDailyMetrics();
    res.json({
      success: true,
      message: 'Daily metrics updated'
    });
  } catch (error) {
    console.error('Error updating daily metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update daily metrics'
    });
  }
});

// Track workflow execution (internal)
router.post('/track-execution', async (req, res) => {
  try {
    const { workflowId, success, gasUsed } = req.body;
    await analyticsService.trackWorkflowExecution(workflowId, success, gasUsed);
    res.json({
      success: true
    });
  } catch (error) {
    console.error('Error tracking execution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track execution'
    });
  }
});

// Get predictive analytics
router.get('/predictive', async (req, res) => {
  try {
    const predictions = await analyticsService.generatePredictiveAnalytics(30);
    res.json({
      success: true,
      data: predictions
    });
  } catch (error) {
    console.error('Error generating predictive analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate predictions'
    });
  }
});

function convertToCSV(data) {
  // Simple CSV conversion - in production, use a proper CSV library
  let csv = 'Date,Users,Workflows,Executions\n';

  data.trends.forEach(trend => {
    csv += `${trend.date.toISOString().split('T')[0]},${trend.users},${trend.workflows},${trend.executions}\n`;
  });

  return csv;
}

module.exports = router;