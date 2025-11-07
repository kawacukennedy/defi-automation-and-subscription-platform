const express = require('express');
const router = express.Router();
const subscriptionService = require('../services/subscriptionService');
const { authenticateUser } = require('../middleware/auth');
const { validateWorkflowData, sanitizeInput } = require('../middleware/validation');

// All subscription routes require authentication and input sanitization
router.use(authenticateUser);
router.use(sanitizeInput);

// Create subscription
router.post('/', async (req, res) => {
  try {
    const subscriptionData = {
      ...req.body,
      userAddress: req.user.address
    };

    const subscription = await subscriptionService.createSubscription(subscriptionData);
    res.status(201).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's subscriptions
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filters = {};

    if (status) filters.status = status;

    const subscriptions = await subscriptionService.getSubscriptionsByUser(
      req.user.address,
      filters
    );

    // Simple pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedSubscriptions = subscriptions.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedSubscriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: subscriptions.length,
        pages: Math.ceil(subscriptions.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscriptions'
    });
  }
});

// Get specific subscription
router.get('/:subscriptionId', async (req, res) => {
  try {
    const subscriptions = await subscriptionService.getSubscriptionsByUser(req.user.address);
    const subscription = subscriptions.find(sub => sub.subscriptionId === req.params.subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription'
    });
  }
});

// Pause subscription
router.post('/:subscriptionId/pause', async (req, res) => {
  try {
    const subscription = await subscriptionService.pauseSubscription(
      req.params.subscriptionId,
      req.user.address
    );
    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error pausing subscription:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Resume subscription
router.post('/:subscriptionId/resume', async (req, res) => {
  try {
    const subscription = await subscriptionService.resumeSubscription(
      req.params.subscriptionId,
      req.user.address
    );
    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error resuming subscription:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Cancel subscription
router.post('/:subscriptionId/cancel', async (req, res) => {
  try {
    const subscription = await subscriptionService.cancelSubscription(
      req.params.subscriptionId,
      req.user.address
    );
    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Process due payments (admin/internal)
router.post('/process-payments', async (req, res) => {
  try {
    // In production, add admin check here
    const result = await subscriptionService.processSubscriptionPayments();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error processing payments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payments'
    });
  }
});

module.exports = router;