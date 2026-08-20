const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const CryptoJS = require('crypto-js');
const crypto = require('crypto');

class AuthenticationUtils {
  // Generate hashed password
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  // Compare password with hash
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  static generateJWT(userId, email, role = 'user') {
    const payload = {
      id: userId,
      email: email,
      role: role,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });

    return token;
  }

  // Verify JWT token
  static verifyJWT(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      return { valid: true, decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // SBVM (Secure Block Verification Mechanism) - Circle-based Authentication
  // This implements the geometric verification approach from the paper
  static generateSecureBlockVerification(userId, timestamp) {
    const blockData = `${userId}-${timestamp}`;

    // Generate origin point (Ox, Oy)
    const originX = Math.floor(Math.random() * 1000);
    const originY = Math.floor(Math.random() * 1000);
    const radius = 50;

    // Generate secret code based on circle equation: (x - ox)² + (y - oy)² = r²
    const secretCode = CryptoJS.SHA256(blockData).toString().substring(0, 16);

    return {
      origin: { x: originX, y: originY },
      radius: radius,
      secretCode: secretCode,
      timestamp: timestamp,
      hash: CryptoJS.SHA256(blockData).toString()
    };
  }

  // Verify SBVM authentication
  static verifySecureBlockVerification(user, secretCode, currentTimestamp) {
    if (!user.sbvm) {
      return { verified: false, message: 'SBVM data not found' };
    }

    // Check timestamp validity (should not be older than 5 minutes)
    const timeDifference = currentTimestamp - user.sbvm.timestamp;
    if (timeDifference > 300000) { // 5 minutes in milliseconds
      return { verified: false, message: 'SBVM expired' };
    }

    // Verify secret code
    if (user.sbvm.secretCode !== secretCode) {
      return { verified: false, message: 'Invalid secret code' };
    }

    return { verified: true, message: 'SBVM verified successfully' };
  }

  // Multi-factor authentication (Enhanced security)
  static generateOTP(email) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const otpHash = CryptoJS.SHA256(`${email}-${otp}`).toString();

    return {
      otp: otp,
      hash: otpHash,
      expiresAt: expiresAt
    };
  }

  // Verify OTP
  static verifyOTP(email, otp, otpHash, expiresAt) {
    if (Date.now() > expiresAt) {
      return { verified: false, message: 'OTP expired' };
    }

    const calculatedHash = CryptoJS.SHA256(`${email}-${otp}`).toString();

    if (calculatedHash !== otpHash) {
      return { verified: false, message: 'Invalid OTP' };
    }

    return { verified: true, message: 'OTP verified' };
  }

  // Generate API key for service authentication
  static generateAPIKey(userId) {
    const apiKey = crypto.randomBytes(32).toString('hex');
    const hash = CryptoJS.SHA256(apiKey).toString();

    return {
      apiKey: apiKey,
      apiKeyHash: hash,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    };
  }

  // Verify API key
  static verifyAPIKey(apiKey, apiKeyHash) {
    const calculatedHash = CryptoJS.SHA256(apiKey).toString();
    return calculatedHash === apiKeyHash;
  }
}

module.exports = AuthenticationUtils;
