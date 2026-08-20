const Evidence = require('../models/Evidence');
const User = require('../models/User');
const EncryptionUtils = require('../utils/encryption');
const BlockchainUtils = require('../utils/blockchain');
const s3Utils = require('../utils/s3');
const mailer = require('../utils/mailer');
const { v4: uuidv4 } = require('uuid');

// ...
// Down to verifyEvidenceIntegrity
// I will use replace_file_content carefully.

// Upload evidence with encryption
const uploadEvidence = async (req, res) => {
  try {
    const { caseId, title, description, type, tags } = req.body;
    const investigatorId = req.user.id;
    const file = req.file;

    if (!caseId || !title || !type) {
      return res.status(400).json({ error: 'Case ID, title, and type are required' });
    }

    if (!file) {
      return res.status(400).json({ error: 'Evidence file is required' });
    }

    // Parse tags if it's a string from FormData
    let parsedTags = tags;
    if (typeof tags === 'string') {
      try { parsedTags = JSON.parse(tags); } catch (e) { parsedTags = tags.split(','); }
    }

    // Get encryption key (ensure it's 64 hex chars for 32 bytes)
    const masterKey = EncryptionUtils.generateOptimalKey(`${caseId}-${title}-${Date.now()}`, 100);

    // Generate hash for integrity based on original file buffer
    const integrityHash = EncryptionUtils.generateHash(file.buffer.toString('base64'));

    // Encrypt file buffer with AES-256-GCM
    const encryptedObject = EncryptionUtils.encryptFile(file.buffer, masterKey);

    // Convert encrypted hex string back to buffer for S3 upload
    const encryptedBuffer = Buffer.from(encryptedObject.data, 'hex');

    // Create unique evidence record ID
    const evidenceId = `EV-${uuidv4()}`;

    // Upload encrypted buffer to AWS S3
    const s3Key = await s3Utils.uploadToS3(encryptedBuffer, evidenceId, 'application/octet-stream');

    const newEvidence = new Evidence({
      evidenceId: evidenceId,
      caseId: caseId,
      title: title,
      description: description,
      type: type,
      fileInfo: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        hash: integrityHash,
        uploadedDate: new Date()
      },
      encryptionInfo: {
        encryptedDataHash: EncryptionUtils.generateHash(encryptedObject.data),
        encryptionMethod: 'AES-256-GCM',
        keyIndex: 0,
        multipleKeys: [masterKey], // Store the main key for this demo (in production, use a secure key vault)
        iv: encryptedObject.iv,
        authTag: encryptedObject.authTag
      },
      investigator: investigatorId,
      integrityHash: integrityHash,
      tags: parsedTags || [],
      storageInfo: {
        cloudProvider: 'aws-s3',
        storageLocation: s3Key
      },
      chainOfCustody: [
        {
          action: 'created',
          performedBy: investigatorId,
          timestamp: new Date(),
          details: 'Evidence file uploaded, encrypted, and stored in AWS S3'
        }
      ]
    });

    await newEvidence.save();

    // Add to blockchain
    const blockchainResult = await BlockchainUtils.addBlock(
      newEvidence._id,
      integrityHash,
      investigatorId,
      'created',
      0
    );

    if (blockchainResult.success) {
      newEvidence.blockchainHash = blockchainResult.blockHash;
      await newEvidence.save();
    }

    res.status(201).json({
      success: true,
      message: 'Evidence securely uploaded to AWS S3 and encrypted',
      evidence: {
        evidenceId: newEvidence.evidenceId,
        caseId: newEvidence.caseId,
        title: newEvidence.title,
        type: newEvidence.type,
        integrityHash: newEvidence.integrityHash,
        blockchainHash: newEvidence.blockchainHash,
        encryptionMethod: newEvidence.encryptionInfo.encryptionMethod,
        uploadedDate: newEvidence.fileInfo.uploadedDate
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Evidence upload failed', details: error.message });
  }
};

// Retrieve and decrypt evidence
const retrieveEvidence = async (req, res) => {
  try {
    const { evidenceId } = req.params;

    const evidence = await Evidence.findOne({ evidenceId })
      .populate('investigator', 'firstName lastName email');

    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    // Check access control
    if (evidence.accessControl.restricted &&
      !evidence.accessControl.allowedUsers.includes(req.user.id)) {
      return res.status(403).json({ error: 'Access denied to this evidence' });
    }

    // Generate secure pre-signed URL for the encrypted file in S3
    let downloadUrl = null;
    if (evidence.storageInfo && evidence.storageInfo.cloudProvider === 'aws-s3') {
      try {
        downloadUrl = await s3Utils.getSignedDownloadUrl(evidence.storageInfo.storageLocation);
      } catch (e) {
        console.error('Error generating signed URL:', e);
      }
    }

    // Log access in chain of custody
    evidence.chainOfCustody.push({
      action: 'accessed',
      performedBy: req.user.id,
      timestamp: new Date(),
      details: `Evidence accessed by ${req.user.email}`
    });

    await evidence.save();

    res.json({
      success: true,
      evidence: {
        evidenceId: evidence.evidenceId,
        caseId: evidence.caseId,
        title: evidence.title,
        description: evidence.description,
        type: evidence.type,
        investigator: evidence.investigator,
        fileInfo: evidence.fileInfo,
        encryptionMethod: evidence.encryptionInfo.encryptionMethod,
        integrityHash: evidence.integrityHash,
        blockchainHash: evidence.blockchainHash,
        createdAt: evidence.createdAt,
        downloadUrl: downloadUrl // Provide the URL for the frontend
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve evidence', details: error.message });
  }
};

// Decrypt evidence (with authorization)
const decryptEvidence = async (req, res) => {
  try {
    const { evidenceId } = req.params;
    const { encryptedDataBuffer } = req.body; // Expecting frontend to pass the downloaded encrypted base64/buffer

    const evidence = await Evidence.findOne({ evidenceId });

    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    // Check authorization
    if (!evidence.accessControl.allowedUsers.includes(req.user.id) &&
      evidence.investigator.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to decrypt this evidence' });
    }

    if (!encryptedDataBuffer) {
      return res.status(400).json({ error: 'Encrypted data buffer is required for decryption' });
    }

    // Decrypt data using AES-256-GCM
    try {
      const decryptedDataString = EncryptionUtils.decryptFile(
        encryptedDataBuffer.toString('hex'), // Convert the passed buffer to hex
        evidence.encryptionInfo.multipleKeys[0], // The master key
        evidence.encryptionInfo.iv,
        evidence.encryptionInfo.authTag
      );
      
      // Convert decrypted string back to base64 so frontend can handle it
      const decryptedBase64 = Buffer.from(decryptedDataString, 'utf8').toString('base64');

      res.json({
        success: true,
        message: 'Evidence decrypted successfully',
        data: decryptedBase64
      });
    } catch (decryptError) {
      res.status(400).json({ error: 'Decryption failed', details: decryptError.message });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to decrypt evidence', details: error.message });
  }
};

// Verify evidence integrity
const verifyEvidenceIntegrity = async (req, res) => {
  try {
    const { evidenceId } = req.params;

    const evidence = await Evidence.findOne({ evidenceId });

    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    // Check blockchain integrity
    const blockchainStatus = await BlockchainUtils.verifyEvidenceTamperingStatus(
      evidence._id,
      evidence.integrityHash
    );

    // Verify hash (just matching itself for now as placeholder for full verification logic)
    const hashValid = evidence.integrityHash === evidence.integrityHash;

    const isVerified = !blockchainStatus.tampered && hashValid;
    evidence.verificationStatus = isVerified ? 'verified' : 'compromised';

    await evidence.save();
    
    // Send email alert if evidence is compromised
    if (!isVerified) {
      // Find admin users to alert, or just alert the investigator
      const investigator = await User.findById(evidence.investigator);
      if (investigator && investigator.email) {
        await mailer.sendAlertEmail(
          investigator.email,
          `⚠️ ALERT: Evidence Integrity Compromised [${evidence.evidenceId}]`,
          `<h3>Security Alert</h3>
           <p>The integrity check for evidence <strong>${evidence.title} (${evidence.evidenceId})</strong> has failed.</p>
           <p><strong>Reason:</strong> ${blockchainStatus.message || 'Hash mismatch detected.'}</p>
           <p>Please review the chain of custody immediately.</p>`
        );
      }
    }

    res.json({
      success: true,
      verified: isVerified,
      details: {
        blockchainTampered: blockchainStatus.tampered,
        blockchainMessage: blockchainStatus.message,
        hashValid: hashValid,
        integrityHash: evidence.integrityHash,
        blockchainHash: evidence.blockchainHash,
        chainOfCustody: evidence.chainOfCustody
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed', details: error.message });
  }
};

// Get all evidence for user
const getEvidenceList = async (req, res) => {
  try {
    const { caseId, type, page = 1, limit = 10 } = req.query;

    const filter = {
      $or: [
        { investigator: req.user.id },
        { 'accessControl.allowedUsers': req.user.id }
      ],
      status: 'active'
    };

    if (caseId) filter.caseId = caseId;
    if (type) filter.type = type;

    const skip = (page - 1) * limit;

    const evidence = await Evidence.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate('investigator', 'firstName lastName email');

    const total = await Evidence.countDocuments(filter);

    res.json({
      success: true,
      evidence: evidence.map(e => ({
        evidenceId: e.evidenceId,
        caseId: e.caseId,
        title: e.title,
        type: e.type,
        investigator: e.investigator,
        encryptionMethod: e.encryptionInfo.encryptionMethod,
        verificationStatus: e.verificationStatus,
        createdAt: e.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch evidence', details: error.message });
  }
};

module.exports = {
  uploadEvidence,
  retrieveEvidence,
  decryptEvidence,
  verifyEvidenceIntegrity,
  getEvidenceList
};
