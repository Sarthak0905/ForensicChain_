const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-forensic';

    await mongoose.connect(mongoURI);

    console.log('✓ MongoDB Connected Successfully');
    return true;
  } catch (error) {
    console.error('✗ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
