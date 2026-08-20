const mongoose = require('mongoose');

const blockchainRecordSchema = new mongoose.Schema({
  blockHash: {
    type: String,
    required: true,
    unique: true
  },
  blockNumber: {
    type: Number,
    required: true,
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  previousHash: {
    type: String,
    required: true
  },
  evidenceHash: {
    type: String,
    required: true
  },
  evidenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evidence',
    required: false,
    default: null
  },
  investigatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  transactionHash: {
    type: String,
    description: 'Hash from blockchain transaction'
  },
  action: {
    type: String,
    enum: ['created', 'verified', 'modified', 'accessed'],
    required: true
  },
  encryptionKeyIndex: Number,
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: String
  },
  verification: {
    verified: { type: Boolean, default: false },
    verifiedBy: mongoose.Schema.Types.ObjectId,
    verificationTime: Date,
    verificationSignature: String
  },
  isImmutable: {
    type: Boolean,
    default: true,
    description: 'Once true, record cannot be modified'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for blockchain queries (avoid duplicates with unique constraint)
blockchainRecordSchema.index({ evidenceId: 1, timestamp: -1 });
blockchainRecordSchema.index({ previousHash: 1 });

module.exports = mongoose.model('BlockchainRecord', blockchainRecordSchema);
