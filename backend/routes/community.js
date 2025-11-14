// community.js
// Community routes for FlowFi

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Workflow = require('../models/Workflow');
const User = require('../models/User');
const NFTService = require('../services/nftService');

let contributors = [
  { name: 'User1', workflows: 15, reputation: 1200 },
  { name: 'User2', workflows: 10, reputation: 950 },
];

let templates = [
  { id: 1, name: 'Staking Template', action: 'stake', author: 'User1' },
  { id: 2, name: 'Swap Template', action: 'swap', author: 'User2' },
];

// Get trending templates
router.get('/templates/trending', async (req, res) => {
  try {
    const { action, token, limit = 20 } = req.query;

    const query = { isPublic: true };
    if (action) query.action = action;
    if (token) query.token = token;

    const templates = await Workflow.find(query)
      .populate('userAddress', 'username')
      .sort({ 'stats.forks': -1, 'stats.votes': -1, createdAt: -1 })
      .limit(parseInt(limit))
      .select('name description action token userAddress stats tags createdAt');

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching trending templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending templates'
    });
  }
});

// Get template by ID
router.get('/templates/:id', async (req, res) => {
  try {
    const template = await Workflow.findOne({
      _id: req.params.id,
      isPublic: true
    }).populate('userAddress', 'username');

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch template'
    });
  }
});

// Fork template
router.post('/templates/:id/fork', auth.authenticateUser, async (req, res) => {
  try {
    const template = await Workflow.findOne({
      _id: req.params.id,
      isPublic: true
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Increment fork count
    await Workflow.findByIdAndUpdate(req.params.id, {
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

    res.json({
      success: true,
      message: 'Template forked successfully',
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

// Vote on template
router.post('/templates/:id/vote', auth.authenticateUser, async (req, res) => {
  try {
    const template = await Workflow.findOne({
      _id: req.params.id,
      isPublic: true
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Increment vote count
    await Workflow.findByIdAndUpdate(req.params.id, {
      $inc: { 'stats.votes': 1 }
    });

    res.json({
      success: true,
      message: 'Vote cast successfully'
    });
  } catch (error) {
    console.error('Error voting on template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cast vote'
    });
  }
});

// Share template
router.post('/templates/:id/share', auth.authenticateUser, (req, res) => {
  const template = templates.find(t => t.id == req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });

  // Logic to share template (e.g., generate link)
  res.json({ message: 'Template shared successfully', shareLink: `https://flowfi.com/templates/${template.id}` });
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await User.find({})
      .select('address stats.reputationScore stats.totalWorkflows achievements')
      .sort({ 'stats.reputationScore': -1 })
      .limit(50);

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
});

// Add comment to template
router.post('/templates/:id/comments', auth.authenticateUser, (req, res) => {
  const { comment } = req.body;
  // Mock comment storage
  res.json({ message: 'Comment added successfully' });
});

// Get template comments
router.get('/templates/:id/comments', (req, res) => {
  // Mock comments
  const comments = [
    { user: 'User3', text: 'Great template!', timestamp: new Date() }
  ];
  res.json(comments);
});

// Rate template
router.post('/templates/:id/rate', auth.authenticateUser, async (req, res) => {
  try {
    const { rating } = req.body;
    // In a real implementation, you'd store ratings in a separate collection
    res.json({
      success: true,
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    console.error('Error rating template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit rating'
    });
  }
});

// NFT Achievement routes
router.get('/nfts/user/:address', auth.authenticateUser, async (req, res) => {
  try {
    const nfts = await NFTService.getUserNFTs(req.params.address);
    res.json({
      success: true,
      data: nfts
    });
  } catch (error) {
    console.error('Error fetching user NFTs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch NFTs'
    });
  }
});

router.post('/achievements/check', auth.authenticateUser, async (req, res) => {
  try {
    const achievements = await NFTService.checkAndAwardAchievements(req.user.address);
    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check achievements'
    });
  }
});

router.get('/leaderboard/achievements', async (req, res) => {
  try {
    const leaderboard = await NFTService.getLeaderboardWithAchievements();
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching achievement leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
});

module.exports = router;