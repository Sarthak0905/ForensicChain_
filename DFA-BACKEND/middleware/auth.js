const AuthenticationUtils = require('../utils/authentication');
const admin = require('../config/firebase');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // 1. Try verifying with Firebase Admin first (for frontend users via Firebase Auth)
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // In our system, we need to map the Firebase UID to our local MongoDB User
    // We expect the frontend to have registered the user in MongoDB with the same email
    const User = require('../models/User');
    const user = await User.findOne({ email: decodedToken.email });
    
    if (!user) {
      return res.status(403).json({ error: 'User authenticated in Firebase but not found in database' });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };
    return next();
  } catch (firebaseError) {
    // 2. Fallback to our existing local JWT validation (for existing accounts / direct API access)
    const result = AuthenticationUtils.verifyJWT(token);

    if (!result.valid) {
      return res.status(403).json({ error: 'Invalid or expired token (Firebase & Local)' });
    }

    req.user = result.decoded;
    return next();
  }
};

const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  authenticateToken,
  authorizeRole,
  errorHandler
};
