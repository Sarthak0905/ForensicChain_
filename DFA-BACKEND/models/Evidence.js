const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
  evidenceId: {
    type: String,
    required: true,
    unique: true
  },
  caseId: {
    type: String,
    required: [true, 'Case ID is required']
  },
  title: {
    type: String,
    required: [true, 'Evidence title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['image', 'document', 'video', 'audio', 'network_log', 'system_log', 'other'],
    required: true
  },
  fileInfo: {
    originalName: String,
    mimeType: String,
    size: Number,
    hash: String,
    uploadedDate: Date
  },
  encryptionInfo: {
    encryptedDataHash: String,
    encryptionMethod: { type: String, default: 'AES-256-GCM' },
    keyIndex: Number,
    iv: String,
    authTag: String,
    multipleKeys: [String] // For MKHE
  },
  chainOfCustody: [
    {
      action: String, // 'created', 'accessed', 'modified', 'verified'
      performedBy: mongoose.Schema.Types.ObjectId,
      performedByName: String,
      timestamp: Date,
      details: String,
      signature: String
    }
  ],
  blockchainHash: {
    type: String,
    description: 'Hash recorded on blockchain for immutability'
  },
  investigator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'verified', 'compromised'],
    default: 'unverified'
  },
  integrityHash: {
    type: String,
    required: true,
    description: 'SHA-256 hash for integrity verification'
  },
  tags: [String],
  location: {
    name: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  accessControl: {
    restricted: { type: Boolean, default: false },
    allowedUsers: [mongoose.Schema.Types.ObjectId],
    classificationLevel: {
      type: String,
      enum: ['public', 'confidential', 'secret'],
      default: 'confidential'
    }
  },
  storageInfo: {
    cloudProvider: { type: String, default: 'local' },
    storageLocation: String,
    redundancy: { type: Number, default: 1 },
    backupLocation: String
  },
  metadata: {
    acquiredDate: Date,
    sourceDevice: String,
    digitalForensicTools: [String],
    analysisNotes: String
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for faster queries
evidenceSchema.index({ caseId: 1, evidenceId: 1 });
evidenceSchema.index({ investigator: 1, createdAt: -1 });
evidenceSchema.index({ blockchainHash: 1 });

module.exports = mongoose.model('Evidence', evidenceSchema);
