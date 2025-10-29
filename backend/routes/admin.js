// admin.js
// Admin routes for FlowFi

const express = require('express');
const router = express.Router();
const AdminService = require('../services/adminService');
const auth = require('../middleware/auth');

// All admin routes require authentication
router.use(auth);

// Get all workflows
router.get('/workflows', async (req, res) => {
  try {
    const workflows = await AdminService.getAllWorkflows();
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get workflow by ID
router.get('/workflows/:id', async (req, res) => {
  try {
    const workflow = await AdminService.getWorkflowById(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retry workflow
router.post('/workflows/:id/retry', async (req, res) => {
  try {
    const workflow = await AdminService.retryWorkflow(req.params.id);
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel workflow
router.post('/workflows/:id/cancel', async (req, res) => {
  try {
    const workflow = await AdminService.cancelWorkflow(req.params.id);
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get error stats
router.get('/errors', async (req, res) => {
  try {
    const errorStats = await AdminService.getErrorStats();
    res.json(errorStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve dispute
router.post('/disputes/:userId/resolve', async (req, res) => {
  try {
    const result = await AdminService.resolveDispute(req.params.userId, req.body.details);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get analytics overview
router.get('/analytics', async (req, res) => {
  try {
    const overview = await AdminService.getAnalyticsOverview();
    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle feature
router.post('/features/:featureName/toggle', async (req, res) => {
  try {
    const { enabled } = req.body;
    const result = await AdminService.toggleFeature(req.params.featureName, enabled);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deploy update
router.post('/deploy', async (req, res) => {
  try {
    const result = await AdminService.deployUpdate(req.body.details);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;