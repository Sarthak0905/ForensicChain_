const admin = require('firebase-admin');
require('dotenv').config();

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully with credentials.');
  } else {
    // Just a placeholder initialization so the app starts without crashing
    console.warn("WARNING: Firebase Admin initialized without credentials (Auth tokens won't verify!).");
    admin.initializeApp();
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error.message);
}

module.exports = admin;
