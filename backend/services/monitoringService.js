// monitoringService.js
// Monitoring service for FlowFi

const Workflow = require('../models/Workflow');
const NotificationService = require('./notificationService');

class MonitoringService {
  constructor() {
    this.activeMonitors = new Map();
  }

  // Start monitoring a workflow
  async startWorkflowMonitoring(workflowId) {
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    // Set up monitoring logic
    const monitor = setInterval(async () => {
      try {
        // Check workflow status
        const updatedWorkflow = await Workflow.findById(workflowId);
        if (!updatedWorkflow) {
          this.stopWorkflowMonitoring(workflowId);
          return;
        }

        // Check for failures
        if (updatedWorkflow.status === 'failed') {
          await NotificationService.sendNotification(
            updatedWorkflow.userId,
            'Workflow Failed',
            `Workflow ${workflowId} has failed. Please check and retry.`
          );
        }

        // Check execution schedule
        const now = new Date();
        const nextExecution = new Date(updatedWorkflow.nextExecution);
        if (now >= nextExecution) {
          // Trigger execution (placeholder)
          console.log(`Triggering execution for workflow ${workflowId}`);
        }
      } catch (error) {
        console.error(`Monitoring error for workflow ${workflowId}:`, error);
      }
    }, 60000); // Check every minute

    this.activeMonitors.set(workflowId, monitor);
  }

  // Stop monitoring a workflow
  stopWorkflowMonitoring(workflowId) {
    const monitor = this.activeMonitors.get(workflowId);
    if (monitor) {
      clearInterval(monitor);
      this.activeMonitors.delete(workflowId);
    }
  }

  // Get monitoring stats
  async getMonitoringStats() {
    const totalWorkflows = await Workflow.countDocuments();
    const activeWorkflows = await Workflow.countDocuments({ status: 'active' });
    const failedWorkflows = await Workflow.countDocuments({ status: 'failed' });

    return {
      totalWorkflows,
      activeWorkflows,
      failedWorkflows,
      monitoredWorkflows: this.activeMonitors.size
    };
  }

  // Alert for critical errors
  async alertCriticalError(error, workflowId = null) {
    console.error('Critical error:', error);

    // Send admin notification
    await NotificationService.sendNotification(
      'admin', // Placeholder for admin user
      'Critical System Error',
      `Error: ${error.message}. Workflow: ${workflowId || 'N/A'}`
    );
  }

  // Performance metrics
  async getPerformanceMetrics() {
    // Placeholder for performance data
    return {
      averageExecutionTime: 2.5, // seconds
      successRate: 0.95,
      errorRate: 0.05
    };
  }
}

module.exports = new MonitoringService();