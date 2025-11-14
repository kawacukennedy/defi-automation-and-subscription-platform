const cron = require('node-cron');
const Workflow = require('../models/Workflow');
const Subscription = require('../models/Subscription');
const workflowService = require('./workflowService');
const subscriptionService = require('./subscriptionService');
const { executeTransaction } = require('./flowService');

class ForteActionsService {
  constructor() {
    this.activeTriggers = new Map();
    this.triggerTypes = {
      TIME_BASED: 'time_based',
      EVENT_BASED: 'event_based',
      CONDITION_BASED: 'condition_based',
      SCHEDULED: 'scheduled'
    };
  }

  /**
   * Initialize Forte Actions service
   */
  async initialize() {
    console.log('Initializing Forte Actions service...');

    // Load existing workflows and register their triggers
    const activeWorkflows = await Workflow.find({ status: 'active' });
    for (const workflow of activeWorkflows) {
      await this.registerWorkflowTrigger(workflow);
    }

    // Load existing subscriptions and register their triggers
    const activeSubscriptions = await Subscription.find({ status: 'active' });
    for (const subscription of activeSubscriptions) {
      await this.registerWorkflowTrigger(subscription);
    }

    console.log(`Forte Actions initialized with ${activeWorkflows.length} active workflows and ${activeSubscriptions.length} active subscriptions`);
  }

  /**
   * Register a workflow or subscription trigger with Forte Actions
   */
  async registerWorkflowTrigger(entity) {
    const isSubscription = entity.subscriptionId && !entity.workflowId;
    const entityId = isSubscription ? entity.subscriptionId : entity.workflowId;
    const triggerId = `trigger_${entityId}`;

    // Remove existing trigger if it exists
    this.unregisterTrigger(triggerId);

    // Skip if entity is not active
    if (entity.status !== 'active') {
      return;
    }

    try {
      switch (entity.trigger) {
        case 'scheduled':
          await this.registerScheduledTrigger(entity, triggerId, isSubscription);
          break;
        case 'time_based':
          await this.registerTimeBasedTrigger(entity, triggerId, isSubscription);
          break;
        case 'event_based':
          await this.registerEventBasedTrigger(entity, triggerId, isSubscription);
          break;
        case 'condition_based':
          await this.registerConditionBasedTrigger(entity, triggerId, isSubscription);
          break;
        default:
          console.log(`Unknown trigger type for ${isSubscription ? 'subscription' : 'workflow'} ${entityId}: ${entity.trigger}`);
      }
    } catch (error) {
      console.error(`Failed to register trigger for ${isSubscription ? 'subscription' : 'workflow'} ${entityId}:`, error);
    }
  }

  /**
   * Register scheduled trigger (cron-based)
   */
  async registerScheduledTrigger(entity, triggerId, isSubscription = false) {
    if (!entity.schedule || !entity.frequency) {
      const entityType = isSubscription ? 'subscription' : 'workflow';
      const entityId = isSubscription ? entity.subscriptionId : entity.workflowId;
      console.warn(`${entityType} ${entityId} missing schedule or frequency for scheduled trigger`);
      return;
    }

    let cronExpression;
    switch (entity.frequency) {
      case 'daily':
        cronExpression = `0 ${entity.schedule.split(':')[1] || 0} ${entity.schedule.split(':')[0] || 0} * * *`;
        break;
      case 'weekly':
        cronExpression = `0 ${entity.schedule.split(':')[1] || 0} ${entity.schedule.split(':')[0] || 0} * * 1`; // Every Monday
        break;
      case 'monthly':
        cronExpression = `0 ${entity.schedule.split(':')[1] || 0} ${entity.schedule.split(':')[0] || 0} 1 * *`; // First day of month
        break;
      case 'hourly':
        cronExpression = `0 ${entity.schedule.split(':')[1] || 0} * * * *`;
        break;
      default:
        const entityType = isSubscription ? 'subscription' : 'workflow';
        const entityId = isSubscription ? entity.subscriptionId : entity.workflowId;
        console.warn(`Unknown frequency for ${entityType} ${entityId}: ${entity.frequency}`);
        return;
    }

    const job = cron.schedule(cronExpression, async () => {
      try {
        const entityType = isSubscription ? 'subscription' : 'workflow';
        const entityId = isSubscription ? entity.subscriptionId : entity.workflowId;
        console.log(`Forte Action triggered: Executing scheduled ${entityType} ${entityId}`);

        if (isSubscription) {
          // For subscriptions, process the payment
          const subscription = await Subscription.findOne({ subscriptionId: entityId });
          if (subscription) {
            await subscriptionService.processPayment(subscription);
          }
        } else {
          // For workflows, execute the workflow
          await workflowService.executeWorkflow(entityId);
        }
      } catch (error) {
        const entityType = isSubscription ? 'subscription' : 'workflow';
        const entityId = isSubscription ? entity.subscriptionId : entity.workflowId;
        console.error(`Failed to execute scheduled ${entityType} ${entityId}:`, error);
      }
    });

    const entityId = isSubscription ? entity.subscriptionId : entity.workflowId;
    this.activeTriggers.set(triggerId, {
      job,
      type: 'scheduled',
      workflowId: entityId,
      isSubscription
    });
    console.log(`Registered scheduled trigger for ${isSubscription ? 'subscription' : 'workflow'} ${entityId} with cron: ${cronExpression}`);
  }

  /**
   * Register time-based trigger
   */
  async registerTimeBasedTrigger(workflow, triggerId) {
    // Time-based triggers execute at specific times
    // For now, treat as scheduled trigger
    await this.registerScheduledTrigger(workflow, triggerId);
  }

  /**
   * Register event-based trigger
   */
  async registerEventBasedTrigger(workflow, triggerId) {
    // Event-based triggers respond to blockchain events
    // This would integrate with Flow event listeners
    const eventType = workflow.metadata?.eventType || 'default';

    // Mock event listener for demonstration
    const eventListener = {
      type: 'event_based',
      workflowId: workflow.workflowId,
      eventType,
      execute: async (eventData) => {
        console.log(`Forte Action triggered: Event ${eventType} for workflow ${workflow.workflowId}`);
        try {
          await workflowService.executeWorkflow(workflow.workflowId);
        } catch (error) {
          console.error(`Failed to execute event-triggered workflow ${workflow.workflowId}:`, error);
        }
      }
    };

    this.activeTriggers.set(triggerId, eventListener);
    console.log(`Registered event-based trigger for workflow ${workflow.workflowId} listening to ${eventType}`);
  }

  /**
   * Register condition-based trigger
   */
  async registerConditionBasedTrigger(workflow, triggerId) {
    // Condition-based triggers execute when certain conditions are met
    const condition = workflow.metadata?.condition || {};

    const conditionChecker = {
      type: 'condition_based',
      workflowId: workflow.workflowId,
      condition,
      checkInterval: setInterval(async () => {
        try {
          const shouldExecute = await this.evaluateCondition(condition, workflow);
          if (shouldExecute) {
            console.log(`Forte Action triggered: Condition met for workflow ${workflow.workflowId}`);
            await workflowService.executeWorkflow(workflow.workflowId);
          }
        } catch (error) {
          console.error(`Failed to check condition for workflow ${workflow.workflowId}:`, error);
        }
      }, 60000) // Check every minute
    };

    this.activeTriggers.set(triggerId, conditionChecker);
    console.log(`Registered condition-based trigger for workflow ${workflow.workflowId}`);
  }

  /**
   * Evaluate condition for condition-based triggers
   */
  async evaluateCondition(condition, workflow) {
    // This would implement logic to check various conditions
    // For example: token balance, price thresholds, etc.
    switch (condition.type) {
      case 'balance_threshold':
        return await this.checkBalanceThreshold(condition, workflow);
      case 'price_threshold':
        return await this.checkPriceThreshold(condition, workflow);
      case 'time_window':
        return await this.checkTimeWindow(condition, workflow);
      default:
        return false;
    }
  }

  /**
   * Check balance threshold condition
   */
  async checkBalanceThreshold(condition, workflow) {
    // Mock balance check - would integrate with Flow balance queries
    const mockBalance = Math.random() * 1000; // Mock balance
    const threshold = parseFloat(condition.threshold || 0);

    if (condition.operator === 'above' && mockBalance > threshold) return true;
    if (condition.operator === 'below' && mockBalance < threshold) return true;

    return false;
  }

  /**
   * Check price threshold condition
   */
  async checkPriceThreshold(condition, workflow) {
    // Mock price check - would integrate with price oracles
    const mockPrice = 1 + Math.random() * 2; // Mock price between 1-3
    const threshold = parseFloat(condition.threshold || 0);

    if (condition.operator === 'above' && mockPrice > threshold) return true;
    if (condition.operator === 'below' && mockPrice < threshold) return true;

    return false;
  }

  /**
   * Check time window condition
   */
  async checkTimeWindow(condition, workflow) {
    const now = new Date();
    const startTime = new Date(condition.startTime);
    const endTime = new Date(condition.endTime);

    return now >= startTime && now <= endTime;
  }

  /**
   * Unregister a trigger
   */
  unregisterTrigger(triggerId) {
    const trigger = this.activeTriggers.get(triggerId);
    if (trigger) {
      if (trigger.job) {
        trigger.job.destroy();
      }
      if (trigger.checkInterval) {
        clearInterval(trigger.checkInterval);
      }
      this.activeTriggers.delete(triggerId);
      console.log(`Unregistered trigger ${triggerId}`);
    }
  }

  /**
   * Update workflow trigger
   */
  async updateWorkflowTrigger(workflowId, newTriggerData) {
    const workflow = await Workflow.findOne({ workflowId });
    if (!workflow) return;

    // Update workflow trigger data
    workflow.trigger = newTriggerData.trigger;
    workflow.schedule = newTriggerData.schedule;
    workflow.frequency = newTriggerData.frequency;
    workflow.metadata = { ...workflow.metadata, ...newTriggerData.metadata };

    await workflow.save();

    // Re-register trigger
    await this.registerWorkflowTrigger(workflow);
  }

  /**
   * Manually trigger a workflow (for testing or manual execution)
   */
  async triggerWorkflow(workflowId, triggerData = {}) {
    console.log(`Manually triggering workflow ${workflowId} via Forte Actions`);
    try {
      const result = await workflowService.executeWorkflow(workflowId);
      return result;
    } catch (error) {
      console.error(`Failed to manually trigger workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Get active triggers status
   */
  getActiveTriggers() {
    const triggers = [];
    for (const [triggerId, trigger] of this.activeTriggers) {
      triggers.push({
        triggerId,
        workflowId: trigger.workflowId,
        type: trigger.type,
        active: true
      });
    }
    return triggers;
  }

  /**
   * Cleanup all triggers
   */
  cleanup() {
    console.log('Cleaning up Forte Actions triggers...');
    for (const [triggerId, trigger] of this.activeTriggers) {
      this.unregisterTrigger(triggerId);
    }
    this.activeTriggers.clear();
  }
}

module.exports = new ForteActionsService();