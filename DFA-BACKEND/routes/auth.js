const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Protected routes
router.get('/profile', authenticateToken, authController.getUserProfile);
router.put('/profile', authenticateToken, authController.updateUserProfile);
router.post('/change-password', authenticateToken, authController.changePassword);
router.post('/request-password-reset', authController.requestPasswordReset);

module.exports = router;
