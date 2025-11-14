const Workflow = require('../models/Workflow');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { executeTransaction, executeScript, createWorkflowOnChain, executeWorkflowOnChain } = require('./flowService');
const NFTService = require('./nftService');
const forteActionsService = require('./forteActionsService');

class WorkflowService {
  async createWorkflow(workflowData) {
    try {
      // Validate workflow data
      this.validateWorkflowData(workflowData);

      // Create workflow in database
      const workflow = new Workflow({
        ...workflowData,
        workflowId: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nextExecution: this.calculateNextExecution(workflowData.schedule, workflowData.frequency)
      });

      await workflow.save();

      // Update user stats
      await User.findOneAndUpdate(
        { address: workflowData.userAddress },
        {
          $inc: { 'stats.totalWorkflows': 1, 'stats.activeWorkflows': 1 },
          $set: { updatedAt: new Date() }
        }
      );

      // Deploy to blockchain
      await this.deployWorkflowToBlockchain(workflow);

      // Register trigger with Forte Actions
      await forteActionsService.registerWorkflowTrigger(workflow);

      // Send notification
      await this.sendWorkflowCreatedNotification(workflow);

      // Check for achievements
      await NFTService.checkAndAwardAchievements(workflowData.userAddress);

      return workflow;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }

  async executeWorkflow(workflowId) {
    try {
      const workflow = await Workflow.findOne({ workflowId });
      if (!workflow || workflow.status !== 'active') {
        throw new Error('Workflow not found or not active');
      }

      // Execute on blockchain
      const result = await this.executeWorkflowOnBlockchain(workflow);

      // Update workflow stats
      const updateData = {
        $inc: {
          executionCount: 1,
          [result.success ? 'successCount' : 'failureCount']: 1
        },
        $set: {
          lastExecution: new Date(),
          nextExecution: this.calculateNextExecution(workflow.schedule, workflow.frequency),
          updatedAt: new Date()
        }
      };

      if (!result.success) {
        updateData.$set.status = 'failed';
      }

      await Workflow.findOneAndUpdate({ workflowId }, updateData);

      // Update user stats
      await User.findOneAndUpdate(
        { address: workflow.userAddress },
        {
          $inc: { 'stats.totalExecutions': 1 },
          $set: { updatedAt: new Date() }
        }
      );

      // Send notification
      await this.sendExecutionNotification(workflow, result);

      // Check for achievements after successful execution
      if (result.success) {
        await NFTService.checkAndAwardAchievements(workflow.userAddress);
      }

      return result;
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  }

  async getWorkflowsByUser(userAddress, filters = {}) {
    try {
      const query = { userAddress, ...filters };
      return await Workflow.find(query).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }
  }

  async pauseWorkflow(workflowId, userAddress) {
    try {
      const workflow = await Workflow.findOneAndUpdate(
        { workflowId, userAddress },
        { $set: { status: 'paused', updatedAt: new Date() } },
        { new: true }
      );

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Unregister trigger with Forte Actions
      const triggerId = `trigger_${workflowId}`;
      forteActionsService.unregisterTrigger(triggerId);

      await this.sendWorkflowStatusNotification(workflow, 'paused');
      return workflow;
    } catch (error) {
      console.error('Error pausing workflow:', error);
      throw error;
    }
  }

  async resumeWorkflow(workflowId, userAddress) {
    try {
      const workflow = await Workflow.findOneAndUpdate(
        { workflowId, userAddress },
        {
          $set: {
            status: 'active',
            nextExecution: this.calculateNextExecution(Date.now(), 'daily'), // Recalculate
            updatedAt: new Date()
          }
        },
        { new: true }
      );

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Re-register trigger with Forte Actions
      await forteActionsService.registerWorkflowTrigger(workflow);

      await this.sendWorkflowStatusNotification(workflow, 'resumed');
      return workflow;
    } catch (error) {
      console.error('Error resuming workflow:', error);
      throw error;
    }
  }

  validateWorkflowData(data) {
    const required = ['userAddress', 'action', 'token', 'amount', 'trigger'];
    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const validActions = ['stake', 'swap', 'send', 'mint_nft', 'dao_vote', 'subscription'];
    if (!validActions.includes(data.action)) {
      throw new Error('Invalid action type');
    }
  }

  calculateNextExecution(schedule, frequency) {
    const now = new Date();
    let nextExecution = new Date(schedule);

    if (nextExecution <= now) {
      switch (frequency) {
        case 'daily':
          nextExecution.setDate(now.getDate() + 1);
          break;
        case 'weekly':
          nextExecution.setDate(now.getDate() + 7);
          break;
        case 'monthly':
          nextExecution.setMonth(now.getMonth() + 1);
          break;
        default:
          nextExecution = now;
      }
    }

    return nextExecution;
  }

  async deployWorkflowToBlockchain(workflow) {
    try {
      const result = await createWorkflowOnChain({
        action: workflow.action,
        token: workflow.token,
        amount: workflow.amount,
        schedule: workflow.frequency,
        trigger: workflow.trigger,
        metadata: workflow.metadata || {},
        composableWorkflows: [], // TODO: Implement composable workflows
        maxRetries: 3,
        gasLimit: 100000
      });

      console.log('Workflow deployed to blockchain:', workflow.workflowId, result.transactionId);
      return result;
    } catch (error) {
      console.error('Failed to deploy workflow to blockchain:', error);
      throw error;
    }
  }

  async executeWorkflowOnBlockchain(workflow) {
    try {
      const result = await executeWorkflowOnChain(workflow.workflowId);
      console.log('Workflow executed on blockchain:', workflow.workflowId, result.transactionId);

      // Check transaction status
      const success = result.status === 4; // 4 = SEALED in Flow
      const gasUsed = 50000; // Mock gas usage - would need to parse from events

      return { success, gasUsed, transactionId: result.transactionId };
    } catch (error) {
      console.error('Failed to execute workflow on blockchain:', error);
      return { success: false, gasUsed: 0, error: error.message };
    }
  }

  async sendWorkflowCreatedNotification(workflow) {
    const notification = new Notification({
      userAddress: workflow.userAddress,
      type: 'workflow_created',
      title: 'Workflow Created',
      message: `Your ${workflow.action} workflow has been created successfully.`,
      data: { workflowId: workflow.workflowId },
      channels: ['in_app']
    });
    await notification.save();
  }

  async sendExecutionNotification(workflow, result) {
    const notification = new Notification({
      userAddress: workflow.userAddress,
      type: result.success ? 'workflow_executed' : 'workflow_failed',
      title: result.success ? 'Workflow Executed' : 'Workflow Failed',
      message: result.success
        ? `Your ${workflow.action} workflow executed successfully.`
        : `Your ${workflow.action} workflow failed to execute.`,
      data: { workflowId: workflow.workflowId, success: result.success },
      channels: ['in_app'],
      priority: result.success ? 'low' : 'high'
    });
    await notification.save();
  }

  async sendWorkflowStatusNotification(workflow, status) {
    const notification = new Notification({
      userAddress: workflow.userAddress,
      type: 'workflow_paused',
      title: `Workflow ${status}`,
      message: `Your workflow has been ${status}.`,
      data: { workflowId: workflow.workflowId },
      channels: ['in_app']
    });
    await notification.save();
  }
}

module.exports = new WorkflowService();