// Middleware to require a specific user role (e.g., 'admin')
module.exports = function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    // req.user should be populated by auth middleware
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
};
