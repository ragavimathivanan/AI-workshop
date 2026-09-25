/**
 * FarmConnect – Firebase Admin SDK Initializer
 * Used server-side for Auth verification and Firestore access.
 *
 * Reads credentials from environment variables so the same code
 * works locally (.env) and on Vercel (environment variables panel).
 */

let admin = null;
try {
  admin = require('firebase-admin');
} catch (e) {
  // Module not installed locally yet
}

let firebaseApp = null;

function getFirebaseAdmin() {
  if (firebaseApp) return firebaseApp;
  if (!admin) {
    console.warn('⚠️  firebase-admin package not loaded. Falling back to in-memory store.');
    return null;
  }

  try {
    let credential;
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && !process.env.FIREBASE_PRIVATE_KEY.includes('REPLACE_WITH')) {
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Vercel serialises newlines as literal \n — unescape them
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      credential = admin.credential.applicationDefault();
    } else {
      console.warn(
        '⚠️  No valid Firebase Admin service account key found in env. ' +
        'Firestore/Auth will fall back to in-memory store.'
      );
      return null;
    }

    firebaseApp = admin.initializeApp({
      credential,
      projectId: process.env.FIREBASE_PROJECT_ID || 'ai-workshop-a4a74'
    });
    console.log('🔥 Firebase Admin SDK initialized successfully.');
    return firebaseApp;
  } catch (err) {
    if (err.code === 'app/duplicate-app') {
      firebaseApp = admin.app();
      return firebaseApp;
    }
    console.warn('⚠️  Firebase Admin SDK initialization failed:', err.message, '— falling back to in-memory store.');
    return null;
  }
}

/**
 * Returns the Firestore instance (or null if not configured).
 */
function getFirestore() {
  const app = getFirebaseAdmin();
  if (!app) return null;
  return admin.firestore();
}

/**
 * Returns the Auth instance (or null if not configured).
 */
function getAuth() {
  const app = getFirebaseAdmin();
  if (!app) return null;
  return admin.auth();
}

module.exports = { getFirebaseAdmin, getFirestore, getAuth };
