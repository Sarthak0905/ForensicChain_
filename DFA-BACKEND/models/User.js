const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  organizationName: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['investigator', 'evidence_manager', 'admin'],
    default: 'investigator'
  },
  sbvm: {
    origin: { x: Number, y: Number },
    radius: Number,
    secretCode: String,
    timestamp: Date,
    hash: String
  },
  apiKey: {
    apiKeyHash: String,
    createdAt: Date,
    expiresAt: Date
  },
  otp: {
    hash: String,
    expiresAt: Date,
    attempts: { type: Number, default: 0 }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
