const admin = require('firebase-admin');
require('dotenv').config();

// Usually, you would point this to a serviceAccountKey.json
// For this setup, we initialize it if the env var is present or use a placeholder to avoid crashing

try {
  let credential;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    credential = admin.credential.cert(serviceAccount);
  } else {
    // Just a placeholder initialization so the app starts without real credentials
    // Will throw errors only when Firebase admin methods are actually invoked
    console.warn("WARNING: Firebase Admin initialized without credentials.");
    credential = admin.credential.applicationDefault(); 
  }

  admin.initializeApp({
    credential: credential,
  });

  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

module.exports = admin;
