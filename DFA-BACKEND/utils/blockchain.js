const CryptoJS = require('crypto-js');
const BlockchainRecord = require('../models/BlockchainRecord');

class BlockchainUtils {
  // Create genesis block
  static async createGenesisBlock() {
    const genesisData = {
      blockNumber: 0,
      timestamp: new Date(),
      previousHash: '0',
      evidenceHash: 'GENESIS',
      action: 'created',
      metadata: { type: 'genesis_block' }
    };

    const blockHash = CryptoJS.SHA256(JSON.stringify(genesisData)).toString();

    const genesisBlock = new BlockchainRecord({
      blockHash: blockHash,
      blockNumber: 0,
      timestamp: genesisData.timestamp,
      previousHash: '0',
      evidenceHash: 'GENESIS',
      investigatorId: null,
      action: 'created',
      isImmutable: true
    });

    await genesisBlock.save();
    return genesisBlock;
  }

  // Add new block to blockchain
  static async addBlock(evidenceId, evidenceHash, investigatorId, action, encryptionKeyIndex = null) {
    try {
      // Get previous block
      const previousBlock = await BlockchainRecord.findOne()
        .sort({ blockNumber: -1 });

      if (!previousBlock) {
        throw new Error('Genesis block not found. Initialize blockchain first.');
      }

      const blockNumber = previousBlock.blockNumber + 1;
      const previousHash = previousBlock.blockHash;

      const blockData = {
        blockNumber: blockNumber,
        timestamp: new Date(),
        previousHash: previousHash,
        evidenceHash: evidenceHash,
        action: action,
        encryptionKeyIndex: encryptionKeyIndex,
        metadata: {
          ipAddress: '127.0.0.1',
          timestamp: new Date().toISOString()
        }
      };

      // Calculate block hash
      const blockHash = CryptoJS.SHA256(JSON.stringify(blockData)).toString();

      // Create blockchain record
      const newBlock = new BlockchainRecord({
        blockHash: blockHash,
        blockNumber: blockNumber,
        timestamp: blockData.timestamp,
        previousHash: previousHash,
        evidenceHash: evidenceHash,
        evidenceId: evidenceId,
        investigatorId: investigatorId,
        action: action,
        encryptionKeyIndex: encryptionKeyIndex,
        metadata: blockData.metadata,
        isImmutable: true
      });

      await newBlock.save();
      return { success: true, block: newBlock, blockHash: blockHash };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Verify blockchain integrity
  static async verifyBlockchainIntegrity() {
    try {
      const allBlocks = await BlockchainRecord.find()
        .sort({ blockNumber: 1 });

      if (allBlocks.length === 0) {
        return { valid: false, message: 'No blocks found in blockchain' };
      }

      // Verify genesis block
      if (allBlocks[0].previousHash !== '0') {
        return { valid: false, message: 'Genesis block invalid' };
      }

      // Verify chain continuity
      for (let i = 1; i < allBlocks.length; i++) {
        if (allBlocks[i].previousHash !== allBlocks[i - 1].blockHash) {
          return {
            valid: false,
            message: `Chain broken at block ${i}`,
            failedBlock: allBlocks[i].blockNumber
          };
        }

        // Recalculate block hash
        const blockData = {
          blockNumber: allBlocks[i].blockNumber,
          timestamp: allBlocks[i].timestamp,
          previousHash: allBlocks[i].previousHash,
          evidenceHash: allBlocks[i].evidenceHash,
          action: allBlocks[i].action,
          encryptionKeyIndex: allBlocks[i].encryptionKeyIndex,
          metadata: allBlocks[i].metadata
        };

        const calculatedHash = CryptoJS.SHA256(JSON.stringify(blockData)).toString();

        if (calculatedHash !== allBlocks[i].blockHash) {
          return {
            valid: false,
            message: `Block hash mismatch at block ${i}`,
            failedBlock: allBlocks[i].blockNumber
          };
        }
      }

      return {
        valid: true,
        message: 'Blockchain integrity verified',
        totalBlocks: allBlocks.length,
        lastBlockHash: allBlocks[allBlocks.length - 1].blockHash
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // Get block by hash
  static async getBlockByHash(blockHash) {
    return await BlockchainRecord.findOne({ blockHash });
  }

  // Get block by evidence ID
  static async getBlocksByEvidenceId(evidenceId) {
    return await BlockchainRecord.find({ evidenceId })
      .sort({ blockNumber: 1 });
  }

  // Get blockchain history for evidence
  static async getEvidenceBlockchain(evidenceId) {
    try {
      const blocks = await BlockchainRecord.find({ evidenceId })
        .sort({ blockNumber: 1 })
        .populate('investigatorId', 'email firstName lastName');

      const chain = blocks.map(block => ({
        blockNumber: block.blockNumber,
        blockHash: block.blockHash,
        timestamp: block.timestamp,
        action: block.action,
        investigator: block.investigatorId?.email || 'Unknown',
        verified: block.verification?.verified || false
      }));

      return { success: true, chain };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Verify evidence hasn't been tampered with
  static async verifyEvidenceTamperingStatus(evidenceId, originalHash) {
    try {
      const blocks = await BlockchainRecord.find({ evidenceId })
        .sort({ blockNumber: 1 });

      if (blocks.length === 0) {
        return { tampered: true, message: 'No blockchain records found' };
      }

      // First block should have the original hash
      if (blocks[0].evidenceHash !== originalHash) {
        return { tampered: true, message: 'Evidence hash mismatch detected' };
      }

      // Check integrity of chain
      for (let i = 1; i < blocks.length; i++) {
        if (blocks[i].previousHash !== blocks[i - 1].blockHash) {
          return { tampered: true, message: 'Chain continuity broken' };
        }
      }

      return { tampered: false, message: 'Evidence integrity verified', blockCount: blocks.length };
    } catch (error) {
      return { tampered: null, error: error.message };
    }
  }

  // Get blockchain statistics
  static async getBlockchainStats() {
    try {
      const totalBlocks = await BlockchainRecord.countDocuments();
      const totalEvidenceRecords = await BlockchainRecord.distinct('evidenceId');
      const latestBlock = await BlockchainRecord.findOne()
        .sort({ blockNumber: -1 });

      return {
        totalBlocks,
        totalEvidenceTracked: totalEvidenceRecords.length,
        lastBlockNumber: latestBlock?.blockNumber || -1,
        lastBlockTime: latestBlock?.timestamp || null
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

module.exports = BlockchainUtils;
