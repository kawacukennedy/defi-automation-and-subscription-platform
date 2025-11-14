const express = require('express');
const router = express.Router();
const daoService = require('../services/daoService');
const auth = require('../middleware/auth');

// All DAO routes require authentication
router.use(auth.authenticateUser);

// Create DAO
router.post('/', async (req, res) => {
  try {
    const { name, description, settings } = req.body;
    const creatorAddress = req.user.address;

    const dao = await daoService.createDAO({
      name,
      description,
      settings
    }, creatorAddress);

    res.json({
      success: true,
      data: dao
    });
  } catch (error) {
    console.error('Error creating DAO:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get DAO by ID
router.get('/:daoId', async (req, res) => {
  try {
    const { daoId } = req.params;
    const dao = await daoService.getDAO(daoId);

    if (!dao) {
      return res.status(404).json({
        success: false,
        error: 'DAO not found'
      });
    }

    res.json({
      success: true,
      data: dao
    });
  } catch (error) {
    console.error('Error fetching DAO:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Join DAO
router.post('/:daoId/join', async (req, res) => {
  try {
    const { daoId } = req.params;
    const userAddress = req.user.address;

    const dao = await daoService.joinDAO(daoId, userAddress);

    res.json({
      success: true,
      data: dao
    });
  } catch (error) {
    console.error('Error joining DAO:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's DAOs
router.get('/user/daos', async (req, res) => {
  try {
    const userAddress = req.user.address;
    const daos = await daoService.getUserDAOs(userAddress);

    res.json({
      success: true,
      data: daos
    });
  } catch (error) {
    console.error('Error fetching user DAOs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create proposal
router.post('/:daoId/proposals', async (req, res) => {
  try {
    const { daoId } = req.params;
    const { title, description, type, data } = req.body;
    const proposerAddress = req.user.address;

    const proposal = await daoService.createProposal(daoId, {
      title,
      description,
      type,
      data
    }, proposerAddress);

    res.json({
      success: true,
      data: proposal
    });
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get DAO proposals
router.get('/:daoId/proposals', async (req, res) => {
  try {
    const { daoId } = req.params;
    const { status, type } = req.query;

    const proposals = await daoService.getProposals(daoId, { status, type });

    res.json({
      success: true,
      data: proposals
    });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Vote on proposal
router.post('/:daoId/proposals/:proposalId/vote', async (req, res) => {
  try {
    const { daoId, proposalId } = req.params;
    const { choice } = req.body;
    const voterAddress = req.user.address;

    const proposal = await daoService.voteOnProposal(daoId, proposalId, voterAddress, choice);

    res.json({
      success: true,
      data: proposal
    });
  } catch (error) {
    console.error('Error voting on proposal:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get DAO statistics
router.get('/:daoId/stats', async (req, res) => {
  try {
    const { daoId } = req.params;
    const stats = await daoService.getDAOStats(daoId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching DAO stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get proposal by ID
router.get('/:daoId/proposals/:proposalId', async (req, res) => {
  try {
    const { daoId, proposalId } = req.params;
    const dao = await daoService.getDAO(daoId);

    if (!dao) {
      return res.status(404).json({
        success: false,
        error: 'DAO not found'
      });
    }

    const proposal = dao.proposals.id(proposalId);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }

    res.json({
      success: true,
      data: proposal
    });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;