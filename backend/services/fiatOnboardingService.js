const axios = require('axios');
const crypto = require('crypto');

class FiatOnboardingService {
  constructor() {
    this.moonpayApiKey = process.env.MOONPAY_API_KEY;
    this.moonpaySecret = process.env.MOONPAY_SECRET_KEY;
    this.moonpayBaseUrl = 'https://api.moonpay.com';
    this.moonpayWidgetUrl = 'https://buy.moonpay.com';
  }

  /**
   * Generate Moonpay widget URL for fiat to crypto purchase
   */
  async generateMoonpayUrl(userAddress, params = {}) {
    try {
      const {
        currencyCode = 'FLOW', // Default to FLOW
        baseCurrencyCode = 'usd',
        baseCurrencyAmount = null,
        walletAddress = userAddress,
        redirectUrl = `${process.env.FRONTEND_URL}/dashboard`
      } = params;

      // Build query parameters
      const queryParams = new URLSearchParams({
        apiKey: this.moonpayApiKey,
        currencyCode,
        baseCurrencyCode,
        walletAddress,
        redirectURL: redirectUrl,
        showWalletAddressForm: 'false',
        colorCode: '#00EF8B', // Flow green
        theme: 'dark'
      });

      if (baseCurrencyAmount) {
        queryParams.append('baseCurrencyAmount', baseCurrencyAmount.toString());
      }

      // Generate signature for security
      const signature = this.generateSignature(queryParams.toString());
      queryParams.append('signature', signature);

      const widgetUrl = `${this.moonpayWidgetUrl}?${queryParams.toString()}`;

      return {
        success: true,
        widgetUrl,
        params: {
          currencyCode,
          baseCurrencyCode,
          baseCurrencyAmount,
          walletAddress
        }
      };
    } catch (error) {
      console.error('Error generating Moonpay URL:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get supported currencies from Moonpay
   */
  async getSupportedCurrencies() {
    try {
      const response = await axios.get(`${this.moonpayBaseUrl}/v3/currencies`, {
        headers: {
          'Authorization': `Bearer ${this.moonpayApiKey}`
        }
      });

      // Filter for Flow blockchain currencies
      const flowCurrencies = response.data.filter(currency =>
        currency.metadata?.contractAddress && // Has contract address
        ['FLOW', 'FUSD', 'USDC'].includes(currency.code) // Flow ecosystem tokens
      );

      return {
        success: true,
        currencies: flowCurrencies
      };
    } catch (error) {
      console.error('Error fetching supported currencies:', error);
      return {
        success: false,
        error: error.message,
        currencies: [
          // Fallback currencies
          { code: 'FLOW', name: 'Flow', minAmount: 10, maxAmount: 50000 },
          { code: 'USDC', name: 'USD Coin', minAmount: 10, maxAmount: 50000 },
          { code: 'FUSD', name: 'Flow USD', minAmount: 10, maxAmount: 50000 }
        ]
      };
    }
  }

  /**
   * Get exchange rates
   */
  async getExchangeRates(baseCurrency = 'usd') {
    try {
      const response = await axios.get(`${this.moonpayBaseUrl}/v3/currencies/${baseCurrency}/buy_quote`, {
        params: {
          apiKey: this.moonpayApiKey,
          baseCurrencyAmount: 100 // Sample amount
        }
      });

      return {
        success: true,
        rates: response.data
      };
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      return {
        success: false,
        error: error.message,
        rates: {
          FLOW: 2.50, // Mock rates
          USDC: 1.00,
          FUSD: 1.00
        }
      };
    }
  }

  /**
   * Verify Moonpay webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    if (!this.moonpaySecret) {
      console.warn('Moonpay secret not configured, skipping signature verification');
      return true;
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.moonpaySecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return signature === expectedSignature;
  }

  /**
   * Handle Moonpay webhook
   */
  async handleWebhook(payload, signature) {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(payload, signature)) {
        throw new Error('Invalid webhook signature');
      }

      const { type, data } = payload;

      switch (type) {
        case 'transaction_created':
          await this.handleTransactionCreated(data);
          break;
        case 'transaction_failed':
          await this.handleTransactionFailed(data);
          break;
        case 'transaction_updated':
          await this.handleTransactionUpdated(data);
          break;
        default:
          console.log(`Unhandled webhook type: ${type}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error handling Moonpay webhook:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle transaction created webhook
   */
  async handleTransactionCreated(data) {
    console.log('Moonpay transaction created:', data.id);

    // Store transaction in database for tracking
    // Update user onboarding status
    // Send notification to user
  }

  /**
   * Handle transaction failed webhook
   */
  async handleTransactionFailed(data) {
    console.log('Moonpay transaction failed:', data.id);

    // Update transaction status
    // Notify user of failure
    // Log for analytics
  }

  /**
   * Handle transaction updated webhook
   */
  async handleTransactionUpdated(data) {
    console.log('Moonpay transaction updated:', data.id, data.status);

    // Update transaction status
    // If completed, credit user account
    // Send success notification
  }

  /**
   * Generate HMAC signature for widget URL
   */
  generateSignature(queryString) {
    if (!this.moonpaySecret) {
      return '';
    }

    return crypto
      .createHmac('sha256', this.moonpaySecret)
      .update(queryString)
      .digest('hex');
  }

  /**
   * Get user's onboarding status
   */
  async getOnboardingStatus(userAddress) {
    // Check if user has completed fiat onboarding
    // Return status and available actions
    return {
      hasOnboarded: false, // Would check database
      totalPurchased: 0,
      lastPurchase: null,
      availableCurrencies: ['FLOW', 'USDC', 'FUSD']
    };
  }

  /**
   * Get fiat onboarding statistics
   */
  async getOnboardingStats() {
    // Aggregate onboarding data
    return {
      totalUsers: 0,
      totalVolume: 0,
      averagePurchase: 0,
      popularCurrency: 'FLOW'
    };
  }
}

module.exports = new FiatOnboardingService();