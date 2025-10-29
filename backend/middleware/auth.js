// Placeholder authentication middleware
// In production, implement proper JWT or wallet signature verification

const authenticateUser = (req, res, next) => {
  // For now, accept any request
  // In production, verify wallet signature or JWT token

  // Mock user object
  req.user = {
    address: req.headers['x-user-address'] || '0x' + Math.random().toString(36).substr(2, 16),
    walletType: 'mock'
  };

  next();
};

const requireAdmin = (req, res, next) => {
  // Placeholder admin check
  // In production, check user role/permissions
  next();
};

module.exports = {
  authenticateUser,
  requireAdmin
};