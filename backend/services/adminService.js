// adminService.js
// Admin service for FlowFi

const User = require('../models/User');
const Workflow = require('../models/Workflow');
const NotificationService = require('./notificationService');
const MonitoringService = require('./monitoringService');

class AdminService {
  // Get all workflows for monitoring
  async getAllWorkflows() {
    return await Workflow.find().populate('userId', 'username');
  }

  // Get workflow by ID
  async getWorkflowById(id) {
    return await Workflow.findById(id).populate('userId', 'username');
  }

  // Retry failed workflow
  async retryWorkflow(workflowId) {
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    workflow.status = 'pending';
    workflow.retryCount = (workflow.retryCount || 0) + 1;
    await workflow.save();

    // Notify user
    await NotificationService.sendNotification(
      workflow.userId,
      'Workflow Retry',
      `Workflow ${workflowId} is being retried.`
    );

    return workflow;
  }

  // Cancel workflow
  async cancelWorkflow(workflowId) {
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    workflow.status = 'cancelled';
    await workflow.save();

    MonitoringService.stopWorkflowMonitoring(workflowId);

    // Notify user
    await NotificationService.sendNotification(
      workflow.userId,
      'Workflow Cancelled',
      `Workflow ${workflowId} has been cancelled.`
    );

    return workflow;
  }

  // Get error statistics
  async getErrorStats() {
    const failedWorkflows = await Workflow.find({ status: 'failed' });
    const errorCounts = {};

    failedWorkflows.forEach(wf => {
      const error = wf.lastError || 'Unknown error';
      errorCounts[error] = (errorCounts[error] || 0) + 1;
    });

    return errorCounts;
  }

  // Resolve user dispute
  async resolveDispute(userId, disputeDetails) {
    // Placeholder for dispute resolution logic
    console.log(`Resolving dispute for user ${userId}: ${disputeDetails}`);

    // Notify user
    await NotificationService.sendNotification(
      userId,
      'Dispute Resolved',
      'Your dispute has been reviewed and resolved.'
    );

    return { status: 'resolved' };
  }

  // Get analytics overview
  async getAnalyticsOverview() {
    const totalWorkflows = await Workflow.countDocuments();
    const activeWorkflows = await Workflow.countDocuments({ status: 'active' });
    const totalUsers = await User.countDocuments();

    const successRate = totalWorkflows > 0 ?
      (await Workflow.countDocuments({ status: 'completed' })) / totalWorkflows : 0;

    return {
      totalWorkflows,
      activeWorkflows,
      totalUsers,
      successRate: Math.round(successRate * 100) / 100
    };
  }

  // Toggle feature
  async toggleFeature(featureName, enabled) {
    // Placeholder for feature toggling
    console.log(`Feature ${featureName} ${enabled ? 'enabled' : 'disabled'}`);
    return { feature: featureName, enabled };
  }

  // Deployment and upgrade controls
  async deployUpdate(updateDetails) {
    // Placeholder for deployment logic
    console.log(`Deploying update: ${updateDetails}`);
    return { status: 'deployed' };
  }
}

module.exports = new AdminService();