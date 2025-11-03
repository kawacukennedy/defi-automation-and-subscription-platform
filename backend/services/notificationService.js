const Notification = require('../models/Notification');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const TelegramBot = require('node-telegram-bot-api');
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

class NotificationService {
  constructor() {
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Initialize Telegram bot
    if (process.env.TELEGRAM_BOT_TOKEN) {
      this.telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
    }

    // Initialize Discord client
    if (process.env.DISCORD_BOT_TOKEN) {
      this.discordClient = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
      });
      this.discordClient.login(process.env.DISCORD_BOT_TOKEN);
    }
  }

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
    if (!user.email || !this.emailTransporter) return;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@flowfi.com',
      to: user.email,
      subject: notification.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00EF8B;">${notification.title}</h2>
          <p>${notification.message}</p>
          ${notification.data ? `<pre>${JSON.stringify(notification.data, null, 2)}</pre>` : ''}
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            You're receiving this email because you have notifications enabled for FlowFi.<br>
            <a href="${process.env.FRONTEND_URL}/settings">Manage your notification preferences</a>
          </p>
        </div>
      `
    };

    await this.emailTransporter.sendMail(mailOptions);
  }

  async sendTelegram(notification, user) {
    if (!user.telegramId || !this.telegramBot) return;

    const message = `
🔔 *${notification.title}*

${notification.message}

${notification.data ? `\`\`\`\n${JSON.stringify(notification.data, null, 2)}\n\`\`\`` : ''}

[View in FlowFi](${process.env.FRONTEND_URL}/dashboard)
    `.trim();

    await this.telegramBot.sendMessage(user.telegramId, message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  }

  async sendDiscord(notification, user) {
    if (!user.discordWebhook || !user.discordId) return;

    const embed = {
      title: notification.title,
      description: notification.message,
      color: notification.priority === 'high' ? 0xFF6B35 : notification.priority === 'medium' ? 0x00A3FF : 0x00EF8B,
      fields: notification.data ? Object.entries(notification.data).map(([key, value]) => ({
        name: key,
        value: String(value),
        inline: true
      })) : [],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'FlowFi Notification',
        icon_url: 'https://flowfi.com/favicon.ico'
      }
    };

    await axios.post(user.discordWebhook, {
      embeds: [embed],
      content: user.discordId ? `<@${user.discordId}>` : undefined
    });
  }

  async sendWebhook(notification, user) {
    if (!user.webhookUrl) return;

    const payload = {
      event: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      userAddress: user.address,
      timestamp: new Date().toISOString(),
      priority: notification.priority
    };

    await axios.post(user.webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FlowFi-Webhook/1.0',
        'X-FlowFi-Signature': this.generateWebhookSignature(payload)
      },
      timeout: 10000 // 10 second timeout
    });
  }

  generateWebhookSignature(payload) {
    // Simple signature generation - in production, use proper HMAC
    const crypto = require('crypto');
    return crypto.createHash('sha256')
      .update(JSON.stringify(payload) + process.env.WEBHOOK_SECRET)
      .digest('hex');
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