const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async sendNotification(notificationId) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }

      const user = await User.findOne({ address: notification.userAddress });
      if (!user) {
        throw new Error('User not found');
      }

      // Send through different channels
      for (const channel of notification.channels) {
        await this.sendThroughChannel(notification, user, channel);
      }

      // Update notification status
      await Notification.findByIdAndUpdate(notificationId, {
        $set: { status: 'sent', sentAt: new Date() }
      });

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      await Notification.findByIdAndUpdate(notificationId, {
        $set: { status: 'failed' }
      });
      throw error;
    }
  }

  async getUserNotifications(userAddress, filters = {}) {
    try {
      const query = { userAddress, ...filters };
      return await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(50);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId, userAddress) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userAddress },
        { $set: { read: true, readAt: new Date() } },
        { new: true }
      );
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async sendBulkNotifications(notifications) {
    try {
      const createdNotifications = await Notification.insertMany(notifications);
      // Process each notification asynchronously
      createdNotifications.forEach(notification => {
        this.sendNotification(notification._id).catch(console.error);
      });
      return createdNotifications;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      throw error;
    }
  }

  async sendThroughChannel(notification, user, channel) {
    try {
      switch (channel) {
        case 'email':
          await this.sendEmail(notification, user);
          break;
        case 'telegram':
          await this.sendTelegram(notification, user);
          break;
        case 'discord':
          await this.sendDiscord(notification, user);
          break;
        case 'webhook':
          await this.sendWebhook(notification, user);
          break;
        case 'in_app':
          // Already stored in database
          break;
        default:
          console.warn(`Unknown notification channel: ${channel}`);
      }
    } catch (error) {
      console.error(`Error sending ${channel} notification:`, error);
      throw error;
    }
  }

  async sendEmail(notification, user) {
    // Placeholder for email service integration
    console.log(`Sending email to ${user.email}: ${notification.title}`);
    // Integration with services like SendGrid, Mailgun, etc.
  }

  async sendTelegram(notification, user) {
    // Placeholder for Telegram bot integration
    if (user.telegramId) {
      console.log(`Sending Telegram message to ${user.telegramId}: ${notification.title}`);
      // Integration with Telegram Bot API
    }
  }

  async sendDiscord(notification, user) {
    // Placeholder for Discord integration
    if (user.discordId) {
      console.log(`Sending Discord message to ${user.discordId}: ${notification.title}`);
      // Integration with Discord webhooks or bot
    }
  }

  async sendWebhook(notification, user) {
    // Placeholder for webhook integration
    console.log(`Sending webhook for user ${user.address}: ${notification.title}`);
    // Send HTTP request to user's webhook URL
  }

  // System notification helpers
  async notifyWorkflowExecution(userAddress, workflowData, success) {
    const notification = {
      userAddress,
      type: success ? 'workflow_executed' : 'workflow_failed',
      title: success ? 'Workflow Executed Successfully' : 'Workflow Execution Failed',
      message: success
        ? `Your ${workflowData.action} workflow has executed successfully.`
        : `Your ${workflowData.action} workflow failed to execute. Please check your settings.`,
      data: {
        workflowId: workflowData.workflowId,
        success
      },
      channels: ['in_app'],
      priority: success ? 'low' : 'high'
    };

    return await this.createNotification(notification);
  }

  async notifyAchievement(userAddress, achievement) {
    const notification = {
      userAddress,
      type: 'achievement_earned',
      title: 'New Achievement Unlocked!',
      message: `Congratulations! You've earned the "${achievement.name}" badge.`,
      data: {
        badgeId: achievement.id,
        badgeType: achievement.type
      },
      channels: ['in_app', 'email'],
      priority: 'medium'
    };

    return await this.createNotification(notification);
  }

  async notifySystemUpdate(userAddress, update) {
    const notification = {
      userAddress,
      type: 'system_update',
      title: 'System Update',
      message: update.message,
      data: update.data,
      channels: ['in_app'],
      priority: 'low'
    };

    return await this.createNotification(notification);
  }
}

module.exports = new NotificationService();