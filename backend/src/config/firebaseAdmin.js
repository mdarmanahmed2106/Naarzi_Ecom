const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

let app;
let auth;

const hasFirebaseCredentials =
  Boolean(process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_CLIENT_EMAIL);

if (hasFirebaseCredentials) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    app = getApps().length === 0 ? initializeApp({ credential: cert(serviceAccount) }) : getApps()[0];
    auth = getAuth(app);
  } catch (err) {
    console.warn('WARNING: Failed to initialize Firebase Admin SDK:', err.message);
  }
} else {
  console.warn('WARNING: Firebase Admin credentials not configured in .env. Phone OTP authentication is disabled.');
  auth = {
    verifyIdToken: async () => {
      throw new Error('Firebase Admin is not configured. Please set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL in your backend .env file.');
    },
  };
}

module.exports = { app, auth };

