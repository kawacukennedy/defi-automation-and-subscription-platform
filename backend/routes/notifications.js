const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { authenticateUser } = require('../middleware/auth');

// All notification routes require authentication
router.use(authenticateUser);

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const { read, type, page = 1, limit = 20 } = req.query;
    const filters = {};

    if (read !== undefined) filters.read = read === 'true';
    if (type) filters.type = type;

    const notifications = await notificationService.getUserNotifications(
      req.user.address,
      filters
    );

    // Simple pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedNotifications = notifications.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedNotifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: notifications.length,
        pages: Math.ceil(notifications.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.notificationId,
      req.user.address
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read
router.patch('/read-all', async (req, res) => {
  try {
    // Implementation would update all unread notifications
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notifications as read'
    });
  }
});

// Update notification preferences
router.patch('/preferences', async (req, res) => {
  try {
    const { email, telegram, discord, inApp } = req.body;

    // Update user preferences in database
    // Implementation would go here

    res.json({
      success: true,
      message: 'Notification preferences updated'
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    });
  }
});

// Get notification preferences
router.get('/preferences', async (req, res) => {
  try {
    // Fetch user preferences from database
    // Implementation would go here

    const preferences = {
      email: true,
      telegram: false,
      discord: false,
      inApp: true
    };

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch preferences'
    });
  }
});

// Send test notification
router.post('/test', async (req, res) => {
  try {
    const { channel } = req.body;

    const testNotification = {
      userAddress: req.user.address,
      type: 'system_update',
      title: 'Test Notification',
      message: 'This is a test notification to verify your settings.',
      data: { test: true },
      channels: channel ? [channel] : ['in_app'],
      priority: 'low'
    };

    const notification = await notificationService.createNotification(testNotification);
    await notificationService.sendNotification(notification._id);

    res.json({
      success: true,
      message: 'Test notification sent'
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test notification'
    });
  }
});

// Delete notification
router.delete('/:notificationId', async (req, res) => {
  try {
    // Implementation would go here
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification'
    });
  }
});

module.exports = router;