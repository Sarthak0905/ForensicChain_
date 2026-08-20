const express = require('express');
const router = express.Router();
const multer = require('multer');
const evidenceController = require('../controllers/evidenceController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// All evidence routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/evidence/upload:
 *   post:
 *     summary: Upload and encrypt new evidence
 *     tags: [Evidence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               caseId:
 *                 type: string
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Evidence securely uploaded and encrypted
 */
// Upload evidence with file
router.post('/upload', upload.single('file'), evidenceController.uploadEvidence);

// Get evidence list
router.get('/list', evidenceController.getEvidenceList);

// Retrieve specific evidence
router.get('/:evidenceId', evidenceController.retrieveEvidence);

// Decrypt evidence (requires specific permissions)
router.post('/:evidenceId/decrypt', evidenceController.decryptEvidence);

// Verify evidence integrity
router.post('/:evidenceId/verify', evidenceController.verifyEvidenceIntegrity);

module.exports = router;
