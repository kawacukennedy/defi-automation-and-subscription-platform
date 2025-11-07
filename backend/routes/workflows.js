const express = require('express');
const router = express.Router();
const Workflow = require('../models/Workflow');
const User = require('../models/User');
const workflowService = require('../services/workflowService');
const { authenticateUser } = require('../middleware/auth');
const { validateWorkflowData, sanitizeInput } = require('../middleware/validation');

// All workflow routes require authentication and input sanitization
router.use(authenticateUser);
router.use(sanitizeInput);

// Create workflow
router.post('/', validateWorkflowData, async (req, res) => {
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
     const workflow = await Workflow.findOneAndDelete({
       workflowId: req.params.workflowId,
       userAddress: req.user.address
     });

     if (!workflow) {
       return res.status(404).json({
         success: false,
         error: 'Workflow not found'
       });
     }

     // Update user stats
     await User.findOneAndUpdate(
       { address: req.user.address },
       {
         $inc: { 'stats.totalWorkflows': -1 },
         $set: { updatedAt: new Date() }
       }
     );

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
     const { action, token, limit = 20, page = 1 } = req.query;
     const filters = { isPublic: true };

     if (action) filters.action = action;
     if (token) filters.token = token;

     const templates = await Workflow.find(filters)
       .populate('userAddress', 'username')
       .sort({ 'stats.forks': -1, 'stats.votes': -1, createdAt: -1 })
       .limit(parseInt(limit))
       .skip((parseInt(page) - 1) * parseInt(limit))
       .select('name description action token userAddress stats tags createdAt');

     const total = await Workflow.countDocuments(filters);

     res.json({
       success: true,
       data: templates,
       pagination: {
         page: parseInt(page),
         limit: parseInt(limit),
         total,
         pages: Math.ceil(total / parseInt(limit))
       }
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
     const template = await Workflow.findOne({
       _id: req.params.templateId,
       isPublic: true
     });

     if (!template) {
       return res.status(404).json({
         success: false,
         error: 'Template not found'
       });
     }

     // Increment fork count
     await Workflow.findByIdAndUpdate(req.params.templateId, {
       $inc: { 'stats.forks': 1 }
     });

     // Create new workflow from template
     const newWorkflow = new Workflow({
       ...template.toObject(),
       _id: undefined,
       userAddress: req.user.address,
       name: `${template.name} (Fork)`,
       isPublic: false,
       stats: {
         forks: 0,
         votes: 0,
         views: 0
       },
       workflowId: `wf_fork_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
     });

     await newWorkflow.save();

     // Update user stats
     await User.findOneAndUpdate(
       { address: req.user.address },
       {
         $inc: { 'stats.totalWorkflows': 1, 'stats.activeWorkflows': 1 },
         $set: { updatedAt: new Date() }
       }
     );

     res.status(201).json({
       success: true,
       message: 'Workflow forked successfully',
       data: newWorkflow
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