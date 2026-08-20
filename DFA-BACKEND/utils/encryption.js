const CryptoJS = require('crypto-js');
const crypto = require('crypto');
const nacl = require('tweetnacl');

class EncryptionUtils {
  // EEO-based Key Generation (Simplified implementation of Enhanced Equilibrium Optimizer)
  static generateOptimalKey(inputString, iterations = 100) {
    let key = CryptoJS.SHA256(inputString).toString();

    for (let i = 0; i < iterations; i++) {
      key = CryptoJS.SHA256(key + Math.random()).toString();
    }

    return key; // 256-bit key in hex (64 characters)
  }

  // Multi-Key Homomorphic Encryption (MKHE) Simplified
  static encryptWithMultipleKeys(plaintext, keys = []) {
    if (keys.length === 0) {
      throw new Error('At least one key is required');
    }

    let encrypted = plaintext;

    // Apply sequential encryption with multiple keys
    for (let key of keys) {
      encrypted = CryptoJS.AES.encrypt(encrypted, key).toString();
    }

    return encrypted;
  }

  // Decrypt with multiple keys
  static decryptWithMultipleKeys(ciphertext, keys = []) {
    if (keys.length === 0) {
      throw new Error('At least one key is required');
    }

    let decrypted = ciphertext;

    // Decrypt in reverse order
    for (let i = keys.length - 1; i >= 0; i--) {
      try {
        decrypted = CryptoJS.AES.decrypt(decrypted, keys[i]).toString(CryptoJS.enc.Utf8);
      } catch (error) {
        throw new Error('Decryption failed: Invalid key or corrupted data');
      }
    }

    return decrypted;
  }

  // Standard AES Encryption
  static encryptAES(plaintext, key) {
    return CryptoJS.AES.encrypt(plaintext, key).toString();
  }

  // Standard AES Decryption
  static decryptAES(ciphertext, key) {
    try {
      const decrypted = CryptoJS.AES.decrypt(ciphertext, key).toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      throw new Error('AES Decryption failed');
    }
  }

  // Generate cryptographic hash (for verification)
  static generateHash(data) {
    return CryptoJS.SHA256(data).toString();
  }

  // Verify hash (for integrity checking)
  static verifyHash(data, hash) {
    return this.generateHash(data) === hash;
  }

  // Generate random key using crypto module
  static generateRandomKey(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Encrypt file with AES
  static encryptFile(fileBuffer, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex').slice(0, 32), iv);

    let encrypted = cipher.update(fileBuffer, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      data: encrypted,
      authTag: authTag.toString('hex')
    };
  }

  // Decrypt file with AES
  static decryptFile(encryptedData, key, iv, authTag) {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(key, 'hex').slice(0, 32),
      Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

module.exports = EncryptionUtils;
