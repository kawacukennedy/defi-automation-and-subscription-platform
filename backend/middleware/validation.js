const validateWorkflowData = (req, res, next) => {
  const { action, token, amount, trigger } = req.body;

  const validActions = ['stake', 'unstake', 'swap', 'lend', 'borrow', 'repay'];
  const validTriggers = ['manual', 'time', 'price', 'balance'];

  if (!action || !validActions.includes(action)) {
    return res.status(400).json({ error: 'Invalid or missing action' });
  }

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing token' });
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid or missing amount' });
  }

  if (!trigger || !validTriggers.includes(trigger)) {
    return res.status(400).json({ error: 'Invalid or missing trigger' });
  }

  next();
};

const sanitizeInput = (req, res, next) => {
  // Sanitize string inputs
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].trim();
    }
  });

  // Sanitize query parameters
  Object.keys(req.query).forEach(key => {
    if (typeof req.query[key] === 'string') {
      req.query[key] = req.query[key].trim();
    }
  });

  next();
};

module.exports = {
  validateWorkflowData,
  sanitizeInput
};