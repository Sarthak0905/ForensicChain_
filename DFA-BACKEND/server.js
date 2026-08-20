require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const evidenceRoutes = require('./routes/evidence');
const { errorHandler } = require('./middleware/auth');
const BlockchainUtils = require('./utils/blockchain');
const setupSwagger = require('./config/swagger');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Setup Swagger API Documentation
setupSwagger(app);

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Initialize database
connectDB();

// Initialize blockchain genesis block (if not exists)
const initializeBlockchain = async () => {
  try {
    const BlockchainRecord = require('./models/BlockchainRecord');
    const existingBlocks = await BlockchainRecord.countDocuments();
    if (existingBlocks === 0) {
      await BlockchainUtils.createGenesisBlock();
      console.log('✓ Blockchain initialized with genesis block');
    }
  } catch (error) {
    console.error('Blockchain initialization error:', error);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/evidence', evidenceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Get blockchain stats
app.get('/api/blockchain/stats', async (req, res) => {
  try {
    const stats = await BlockchainUtils.getBlockchainStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blockchain stats' });
  }
});

// Verify blockchain integrity
app.get('/api/blockchain/verify', async (req, res) => {
  try {
    const verification = await BlockchainUtils.verifyBlockchainIntegrity();
    res.json(verification);
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║    Digital Forensic Security Server Started           ║
║                                                        ║
║    DFA-AOKGE Implementation                           ║
║    (Authentication with Optimal Key Generation         ║
║     Encryption)                                       ║
║                                                        ║
║    Port: ${PORT}                                           ║
║    Environment: ${process.env.NODE_ENV || 'development'}                         ║
║                                                        ║
║    Features:                                          ║
║    ✓ Multi-Key Homomorphic Encryption (MKHE)        ║
║    ✓ Enhanced Equilibrium Optimizer (EEO)            ║
║    ✓ Secure Block Verification (SBVM)                ║
║    ✓ Blockchain Evidence Tracking                     ║
║    ✓ JWT Authentication                              ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);

  // Initialize blockchain
  // initializeBlockchain();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n✓ Server shutting down gracefully...');
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

module.exports = app;
