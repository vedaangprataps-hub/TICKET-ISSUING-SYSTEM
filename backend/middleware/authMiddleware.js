const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_dbms_project_2026';

// Verify JWT token middleware
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Authentication token missing.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Invalid or expired token.' });
  }
};

// Optional Auth (attaches req.user if token valid, but does not block)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Ignore invalid token in optional mode
    }
  }
  next();
};

// Verify ADMIN role middleware
const requireAdmin = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.user && req.user.role === 'ADMIN') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required.' });
    }
  });
};

module.exports = {
  JWT_SECRET,
  requireAuth,
  optionalAuth,
  requireAdmin,
};
