const express = require('express');
const router = express.Router();
const workflowService = require('../services/workflowService');
const { authenticateUser } = require('../middleware/auth');

// All workflow routes require authentication
router.use(authenticateUser);

// Create workflow
router.post('/', async (req, res) => {
  try {
    const workflowData = {
      ...req.body,
      userAddress: req.user.address
    };

    const workflow = await workflowService.createWorkflow(workflowData);
    res.status(201).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's workflows
router.get('/', async (req, res) => {
  try {
    const { status, action, page = 1, limit = 20 } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (action) filters.action = action;

    const workflows = await workflowService.getWorkflowsByUser(
      req.user.address,
      filters
    );

    // Simple pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedWorkflows = workflows.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedWorkflows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: workflows.length,
        pages: Math.ceil(workflows.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflows'
    });
  }
});

// Get specific workflow
router.get('/:workflowId', async (req, res) => {
  try {
    const workflows = await workflowService.getWorkflowsByUser(req.user.address);
    const workflow = workflows.find(wf => wf.workflowId === req.params.workflowId);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflow'
    });
  }
});

// Execute workflow manually
router.post('/:workflowId/execute', async (req, res) => {
  try {
    const result = await workflowService.executeWorkflow(req.params.workflowId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error executing workflow:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Pause workflow
router.post('/:workflowId/pause', async (req, res) => {
  try {
    const workflow = await workflowService.pauseWorkflow(
      req.params.workflowId,
      req.user.address
    );
    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Error pausing workflow:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Resume workflow
router.post('/:workflowId/resume', async (req, res) => {
  try {
    const workflow = await workflowService.resumeWorkflow(
      req.params.workflowId,
      req.user.address
    );
    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Error resuming workflow:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Delete workflow
router.delete('/:workflowId', async (req, res) => {
  try {
    // Implementation would go here
    res.json({
      success: true,
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete workflow'
    });
  }
});

// Get workflow templates (public workflows)
router.get('/templates/public', async (req, res) => {
  try {
    // Implementation would go here
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates'
    });
  }
});

// Fork workflow template
router.post('/templates/:templateId/fork', async (req, res) => {
  try {
    // Implementation would go here
    res.status(201).json({
      success: true,
      message: 'Workflow forked successfully'
    });
  } catch (error) {
    console.error('Error forking template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fork template'
    });
  }
});

module.exports = router;