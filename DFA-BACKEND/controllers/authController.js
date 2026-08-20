const User = require('../models/User');
const AuthenticationUtils = require('../utils/authentication');

// User Registration
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, organizationName } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await AuthenticationUtils.hashPassword(password);

    // Generate SBVM for user
    const sbvm = AuthenticationUtils.generateSecureBlockVerification(email, Date.now());

    // Create user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      organizationName,
      sbvm,
      role: 'investigator'
    });

    await newUser.save();

    // Generate JWT token
    const token = AuthenticationUtils.generateJWT(newUser._id, newUser.email, newUser.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};

// User Login
const loginUser = async (req, res) => {
  try {
    const { email, password, secretCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user (include password field)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(403).json({
        error: 'Account temporarily locked. Please try again later.'
      });
    }

    // Verify password
    const passwordMatch = await AuthenticationUtils.comparePassword(password, user.password);

    if (!passwordMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }
      await user.save();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify SBVM if secret code provided
    if (secretCode) {
      const sbvmResult = AuthenticationUtils.verifySecureBlockVerification(
        user,
        secretCode,
        Date.now()
      );

      if (!sbvmResult.verified) {
        return res.status(403).json({ error: sbvmResult.message });
      }
    }

    // Reset login attempts
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = AuthenticationUtils.generateJWT(user._id, user.email, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

// Get current user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -sbvm.secretCode -apiKey');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organizationName: user.organizationName,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile', details: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, organizationName } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        firstName,
        lastName,
        organizationName,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Verify current password
    const passwordMatch = await AuthenticationUtils.comparePassword(
      currentPassword,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    user.password = await AuthenticationUtils.hashPassword(newPassword);
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password', details: error.message });
  }
};

// Request password reset (via OTP)
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate OTP
    const otp = AuthenticationUtils.generateOTP(email);
    user.otp = {
      hash: otp.hash,
      expiresAt: otp.expiresAt,
      attempts: 0
    };

    await user.save();

    res.json({
      success: true,
      message: 'OTP sent to registered email',
      otp: otp.otp // Remove in production, send via email
    });
  } catch (error) {
    res.status(500).json({ error: 'Password reset request failed', details: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  requestPasswordReset
};
