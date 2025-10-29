// community.js
// Community routes for FlowFi

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Mock data for community features
let templates = [
  { id: 1, name: 'Staking Workflow', creator: 'User1', votes: 45, forks: 12, action: 'stake', token: 'FLOW' },
  { id: 2, name: 'Recurring Payment', creator: 'User2', votes: 32, forks: 8, action: 'payment', token: 'USDC' },
];

let contributors = [
  { name: 'User1', workflows: 15, reputation: 1200 },
  { name: 'User2', workflows: 10, reputation: 950 },
];

// Get trending templates
router.get('/templates/trending', (req, res) => {
  const { action, token } = req.query;
  let filtered = templates;

  if (action) filtered = filtered.filter(t => t.action === action);
  if (token) filtered = filtered.filter(t => t.token === token);

  res.json(filtered.sort((a, b) => b.votes - a.votes));
});

// Get template by ID
router.get('/templates/:id', (req, res) => {
  const template = templates.find(t => t.id == req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  res.json(template);
});

// Fork template
router.post('/templates/:id/fork', auth, (req, res) => {
  const template = templates.find(t => t.id == req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });

  template.forks += 1;
  // Logic to create new workflow from template
  res.json({ message: 'Template forked successfully', template });
});

// Vote on template
router.post('/templates/:id/vote', auth, (req, res) => {
  const template = templates.find(t => t.id == req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });

  template.votes += 1;
  res.json({ message: 'Vote cast successfully', template });
});

// Share template
router.post('/templates/:id/share', auth, (req, res) => {
  const template = templates.find(t => t.id == req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });

  // Logic to share template (e.g., generate link)
  res.json({ message: 'Template shared successfully', shareLink: `https://flowfi.com/templates/${template.id}` });
});

// Get leaderboard
router.get('/leaderboard', (req, res) => {
  res.json(contributors.sort((a, b) => b.reputation - a.reputation));
});

// Add comment to template
router.post('/templates/:id/comments', auth, (req, res) => {
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
router.post('/templates/:id/rate', auth, (req, res) => {
  const { rating } = req.body;
  // Mock rating
  res.json({ message: 'Rating submitted successfully' });
});

module.exports = router;