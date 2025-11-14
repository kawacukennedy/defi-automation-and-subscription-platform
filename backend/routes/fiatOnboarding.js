const express = require('express');
const router = express.Router();
const fiatOnboardingService = require('../services/fiatOnboardingService');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth.authenticateUser);

// Generate Moonpay widget URL
router.post('/moonpay-url', async (req, res) => {
  try {
    const { currencyCode, baseCurrencyAmount, redirectUrl } = req.body;
    const userAddress = req.user.address;

    const result = await fiatOnboardingService.generateMoonpayUrl(userAddress, {
      currencyCode,
      baseCurrencyAmount,
      redirectUrl
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error generating Moonpay URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate Moonpay URL'
    });
  }
});

// Get supported currencies
router.get('/currencies', async (req, res) => {
  try {
    const result = await fiatOnboardingService.getSupportedCurrencies();
    res.json(result);
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch currencies'
    });
  }
});

// Get exchange rates
router.get('/rates', async (req, res) => {
  try {
    const { baseCurrency } = req.query;
    const result = await fiatOnboardingService.getExchangeRates(baseCurrency);
    res.json(result);
  } catch (error) {
    console.error('Error fetching rates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exchange rates'
    });
  }
});

// Get user's onboarding status
router.get('/status', async (req, res) => {
  try {
    const userAddress = req.user.address;
    const status = await fiatOnboardingService.getOnboardingStatus(userAddress);
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch onboarding status'
    });
  }
});

// Moonpay webhook endpoint (no auth required for webhooks)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['moonpay-signature'];
    const payload = JSON.parse(req.body);

    const result = await fiatOnboardingService.handleWebhook(payload, signature);

    if (result.success) {
      res.json({ received: true });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to handle webhook'
    });
  }
});

// Get onboarding statistics (admin only)
router.get('/stats', auth.requireAdmin, async (req, res) => {
  try {
    const stats = await fiatOnboardingService.getOnboardingStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching onboarding stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch onboarding stats'
    });
  }
});

module.exports = router;