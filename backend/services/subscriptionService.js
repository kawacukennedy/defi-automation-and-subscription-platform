const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { executeTransaction, createSubscriptionOnChain } = require('./flowService');
const NotificationService = require('./notificationService');
const NFTService = require('./nftService');

class SubscriptionService {
  async createSubscription(subscriptionData) {
    try {
      // Validate subscription data
      this.validateSubscriptionData(subscriptionData);

      // Create subscription in database
      const subscription = new Subscription({
        ...subscriptionData,
        subscriptionId: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nextPayment: this.calculateNextPayment(subscriptionData.interval)
      });

      await subscription.save();

      // Update user stats
      await User.findOneAndUpdate(
        { address: subscriptionData.userAddress },
        {
          $inc: { 'stats.totalSubscriptions': 1, 'stats.activeSubscriptions': 1 },
          $set: { updatedAt: new Date() }
        }
      );

      // Deploy to blockchain
      await this.deploySubscriptionToBlockchain(subscription);

      // Send notification
      await this.sendSubscriptionCreatedNotification(subscription);

      // Check for achievements
      await NFTService.checkAndAwardAchievements(subscriptionData.userAddress);

      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async getSubscriptionsByUser(userAddress, filters = {}) {
    try {
      const query = { userAddress, ...filters };
      return await Subscription.find(query).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  async pauseSubscription(subscriptionId, userAddress) {
    try {
      const subscription = await Subscription.findOneAndUpdate(
        { subscriptionId, userAddress },
        { $set: { status: 'paused', updatedAt: new Date() } },
        { new: true }
      );

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      await this.sendSubscriptionStatusNotification(subscription, 'paused');
      return subscription;
    } catch (error) {
      console.error('Error pausing subscription:', error);
      throw error;
    }
  }

  async resumeSubscription(subscriptionId, userAddress) {
    try {
      const subscription = await Subscription.findOneAndUpdate(
        { subscriptionId, userAddress },
        {
          $set: {
            status: 'active',
            nextPayment: this.calculateNextPayment(Date.now(), subscription.interval),
            updatedAt: new Date()
          }
        },
        { new: true }
      );

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      await this.sendSubscriptionStatusNotification(subscription, 'resumed');
      return subscription;
    } catch (error) {
      console.error('Error resuming subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId, userAddress) {
    try {
      const subscription = await Subscription.findOneAndUpdate(
        { subscriptionId, userAddress },
        { $set: { status: 'cancelled', updatedAt: new Date() } },
        { new: true }
      );

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Update user stats
      await User.findOneAndUpdate(
        { address: userAddress },
        {
          $inc: { 'stats.activeSubscriptions': -1 },
          $set: { updatedAt: new Date() }
        }
      );

      await this.sendSubscriptionStatusNotification(subscription, 'cancelled');
      return subscription;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  async processSubscriptionPayments() {
    try {
      const now = new Date();
      const dueSubscriptions = await Subscription.find({
        status: 'active',
        nextPayment: { $lte: now }
      });

      for (const subscription of dueSubscriptions) {
        await this.processPayment(subscription);
      }

      return { processed: dueSubscriptions.length };
    } catch (error) {
      console.error('Error processing subscription payments:', error);
      throw error;
    }
  }

  async processPayment(subscription) {
    try {
      // Execute payment on blockchain
      const result = await this.executeSubscriptionPayment(subscription);

      const updateData = {
        $inc: {
          'stats.totalPayments': 1,
          'stats.totalVolume': subscription.amount
        },
        $set: {
          lastPayment: new Date(),
          nextPayment: this.calculateNextPayment(subscription.interval),
          updatedAt: new Date()
        }
      };

      if (result.success) {
        updateData.$inc['stats.successfulPayments'] = 1;
        updateData.$set.status = subscription.maxPayments > 0 &&
          subscription.totalPayments + 1 >= subscription.maxPayments ? 'expired' : 'active';
      } else {
        updateData.$inc['stats.failedPayments'] = 1;
        // Implement retry logic here
      }

      await Subscription.findByIdAndUpdate(subscription._id, updateData);

      // Send notification
      await this.sendPaymentNotification(subscription, result);

      return result;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  validateSubscriptionData(data) {
    const required = ['userAddress', 'recipient', 'token', 'amount', 'interval'];
    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (data.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (data.interval < 3600) { // Minimum 1 hour
      throw new Error('Interval must be at least 1 hour');
    }
  }

  calculateNextPayment(interval, fromDate = Date.now()) {
    return new Date(fromDate + (interval * 1000));
  }

  async deploySubscriptionToBlockchain(subscription) {
    try {
      const result = await createSubscriptionOnChain({
        recipient: subscription.recipient,
        token: subscription.token,
        amount: subscription.amount,
        fee: subscription.fee,
        interval: subscription.interval,
        metadata: subscription.metadata,
        composableWorkflows: subscription.composableWorkflows,
        maxRetries: subscription.maxRetries,
        gasLimit: subscription.gasLimit
      });

      console.log('Subscription deployed to blockchain:', subscription.subscriptionId, result.transactionId);
      return result;
    } catch (error) {
      console.error('Failed to deploy subscription to blockchain:', error);
      throw error;
    }
  }

  async executeSubscriptionPayment(subscription) {
    try {
      // This would call the FlowFiSubscriptionManager contract
      // For now, return mock success
      console.log('Processing subscription payment:', subscription.subscriptionId);

      // Mock blockchain transaction
      const success = Math.random() > 0.1; // 90% success rate
      const gasUsed = 75000;

      return { success, gasUsed, transactionId: `tx_${Date.now()}` };
    } catch (error) {
      console.error('Failed to execute subscription payment:', error);
      return { success: false, gasUsed: 0, error: error.message };
    }
  }

  async sendSubscriptionCreatedNotification(subscription) {
    const notification = {
      userAddress: subscription.userAddress,
      type: 'subscription_created',
      title: 'Subscription Created',
      message: `Your ${subscription.token} subscription has been created successfully.`,
      data: { subscriptionId: subscription.subscriptionId },
      channels: ['in_app']
    };
    await NotificationService.createNotification(notification);
  }

  async sendPaymentNotification(subscription, result) {
    const notification = {
      userAddress: subscription.userAddress,
      type: result.success ? 'payment_successful' : 'payment_failed',
      title: result.success ? 'Payment Successful' : 'Payment Failed',
      message: result.success
        ? `Your subscription payment of ${subscription.amount} ${subscription.token} was successful.`
        : `Your subscription payment failed. Please check your balance.`,
      data: { subscriptionId: subscription.subscriptionId, success: result.success },
      channels: ['in_app'],
      priority: result.success ? 'low' : 'high'
    };
    await NotificationService.createNotification(notification);
  }

  async sendSubscriptionStatusNotification(subscription, status) {
    const notification = {
      userAddress: subscription.userAddress,
      type: 'subscription_status_changed',
      title: `Subscription ${status}`,
      message: `Your subscription has been ${status}.`,
      data: { subscriptionId: subscription.subscriptionId },
      channels: ['in_app']
    };
    await NotificationService.createNotification(notification);
  }
}

module.exports = new SubscriptionService();