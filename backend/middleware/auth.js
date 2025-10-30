const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authenticateUser = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const userAddress = req.headers['x-user-address'];

    if (!userAddress) {
      return res.status(401).json({ error: 'User address required' });
    }

    // For wallet-based auth, verify signature (placeholder)
    // In production, implement proper wallet signature verification
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
          address: userAddress,
          id: decoded.userId,
          walletType: decoded.walletType || 'flow'
        };
      } catch (jwtError) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    } else {
      // Allow wallet-only auth for basic operations
      req.user = {
        address: userAddress,
        walletType: 'flow'
      };
    }

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const requireAdmin = (req, res, next) => {
  // Check if user has admin role
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = {
  authenticateUser,
  requireAdmin
};