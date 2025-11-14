// adminService.js
// Admin service for FlowFi

const User = require('../models/User');
const Workflow = require('../models/Workflow');
const NotificationService = require('./notificationService');
const MonitoringService = require('./monitoringService');

class AdminService {
  // Get all workflows for monitoring with filters
  async getAllWorkflows({ limit = 50, status, userAddress } = {}) {
    const query = {};
    if (status) query.status = status;
    if (userAddress) query.userAddress = userAddress;

    return await Workflow.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('workflowId userAddress action status executionCount successCount failureCount lastExecution createdAt');
  }

  // Get workflow by ID
  async getWorkflowById(id) {
    return await Workflow.findById(id).populate('userId', 'username');
  }

  // Retry failed workflow
  async retryWorkflow(workflowId) {
    const workflow = await Workflow.findOne({ workflowId });
    if (!workflow) throw new Error('Workflow not found');

    workflow.status = 'active';
    workflow.retryCount = (workflow.retryCount || 0) + 1;
    await workflow.save();

    // Trigger workflow execution
    const workflowService = require('./workflowService');
    await workflowService.executeWorkflow(workflowId);

    return workflow;
  }

  // Cancel workflow
  async cancelWorkflow(workflowId) {
    const workflow = await Workflow.findOne({ workflowId });
    if (!workflow) throw new Error('Workflow not found');

    workflow.status = 'cancelled';
    await workflow.save();

    return workflow;
  }

  // Pause workflow
  async pauseWorkflow(workflowId) {
    const workflow = await Workflow.findOne({ workflowId });
    if (!workflow) throw new Error('Workflow not found');

    workflow.status = 'paused';
    await workflow.save();

    return workflow;
  }

  // Resume workflow
  async resumeWorkflow(workflowId) {
    const workflow = await Workflow.findOne({ workflowId });
    if (!workflow) throw new Error('Workflow not found');

    workflow.status = 'active';
    await workflow.save();

    return workflow;
  }

  // Get error logs
  async getErrorLogs() {
    const failedWorkflows = await Workflow.find({ status: 'failed' })
      .sort({ updatedAt: -1 })
      .limit(50)
      .select('workflowId userAddress action lastError updatedAt');

    return failedWorkflows.map(wf => ({
      id: wf.workflowId,
      message: wf.lastError || 'Unknown error',
      count: 1, // Simplified - would aggregate in real implementation
      lastOccurrence: wf.updatedAt,
      severity: wf.lastError?.includes('balance') ? 'high' : 'medium'
    }));
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
    const totalExecutions = await Workflow.aggregate([
      { $group: { _id: null, total: { $sum: '$executionCount' } } }
    ]);

    const successfulExecutions = await Workflow.aggregate([
      { $group: { _id: null, total: { $sum: '$successCount' } } }
    ]);

    const successRate = totalExecutions[0]?.total > 0 ?
      (successfulExecutions[0]?.total || 0) / totalExecutions[0].total * 100 : 0;

    const errorRate = 100 - successRate;

    return {
      totalWorkflows,
      activeWorkflows,
      totalUsers,
      totalExecutions: totalExecutions[0]?.total || 0,
      successRate: Math.round(successRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100
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