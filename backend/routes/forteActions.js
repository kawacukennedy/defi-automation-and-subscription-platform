const express = require('express');
const router = express.Router();
const forteActionsService = require('../services/forteActionsService');
const Workflow = require('../models/Workflow');

// Get active triggers
router.get('/triggers', async (req, res) => {
  try {
    const triggers = forteActionsService.getActiveTriggers();
    res.json({
      success: true,
      data: triggers
    });
  } catch (error) {
    console.error('Error fetching triggers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch triggers'
    });
  }
});

// Manually trigger a workflow
router.post('/trigger/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { triggerData } = req.body;

    // Verify workflow ownership (simplified - should check user auth)
    const workflow = await Workflow.findOne({ workflowId });
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    const result = await forteActionsService.triggerWorkflow(workflowId, triggerData);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error triggering workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger workflow'
    });
  }
});

// Update workflow trigger
router.put('/trigger/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { trigger, schedule, frequency, metadata } = req.body;

    // Verify workflow ownership (simplified - should check user auth)
    const workflow = await Workflow.findOne({ workflowId });
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    await forteActionsService.updateWorkflowTrigger(workflowId, {
      trigger,
      schedule,
      frequency,
      metadata
    });

    res.json({
      success: true,
      message: 'Trigger updated successfully'
    });
  } catch (error) {
    console.error('Error updating trigger:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update trigger'
    });
  }
});

// Get Forte Actions statistics
router.get('/stats', async (req, res) => {
  try {
    const activeWorkflows = await Workflow.find({ status: 'active' });
    const triggers = forteActionsService.getActiveTriggers();

    const stats = {
      totalWorkflows: await Workflow.countDocuments(),
      activeWorkflows: activeWorkflows.length,
      activeTriggers: triggers.length,
      triggerTypes: triggers.reduce((acc, trigger) => {
        acc[trigger.type] = (acc[trigger.type] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching Forte Actions stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

// Get available trigger types
router.get('/trigger-types', (req, res) => {
  res.json({
    success: true,
    data: {
      types: [
        {
          id: 'scheduled',
          name: 'Scheduled',
          description: 'Execute at regular intervals (daily, weekly, monthly)',
          config: {
            frequency: ['hourly', 'daily', 'weekly', 'monthly'],
            schedule: 'HH:MM format'
          }
        },
        {
          id: 'time_based',
          name: 'Time-based',
          description: 'Execute at specific times or time windows',
          config: {
            startTime: 'ISO date string',
            endTime: 'ISO date string'
          }
        },
        {
          id: 'event_based',
          name: 'Event-based',
          description: 'Execute when blockchain events occur',
          config: {
            eventType: ['transaction', 'balance_change', 'price_update', 'contract_event']
          }
        },
        {
          id: 'condition_based',
          name: 'Condition-based',
          description: 'Execute when specific conditions are met',
          config: {
            condition: {
              type: ['balance_threshold', 'price_threshold', 'time_window'],
              operator: ['above', 'below', 'equals'],
              threshold: 'numeric value'
            }
          }
        }
      ]
    }
  });
});

module.exports = router;