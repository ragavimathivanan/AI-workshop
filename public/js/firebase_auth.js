/**
 * FarmConnect – Firebase Client-Side Auth Module
 *
 * Handles Email/Password Sign-Up, Sign-In, and Sign-Out using
 * the Firebase JS SDK (v9 modular – loaded via CDN compat builds).
 *
 * The module exposes a clean API that app.js calls; it also
 * stores the ID token in sessionStorage for API calls.
 */

// ─── Firebase Client Config (values injected from meta tags) ──
// We read from <meta> tags so the HTML can be served from env vars
// (Vercel injects them at build time, or you set them directly).
function getFirebaseClientConfig() {
  return {
    apiKey: window.FIREBASE_API_KEY || 'AIzaSyA4f-De627muKzyk1NpOsRzcsJU79qM5fc',
    authDomain: window.FIREBASE_AUTH_DOMAIN || 'ai-workshop-a4a74.firebaseapp.com',
    projectId: window.FIREBASE_PROJECT_ID || 'ai-workshop-a4a74',
    storageBucket: window.FIREBASE_STORAGE_BUCKET || 'ai-workshop-a4a74.firebasestorage.app',
    messagingSenderId: window.FIREBASE_MESSAGING_SENDER_ID || '1025144396269',
    appId: window.FIREBASE_APP_ID || '1:1025144396269:web:1975414f05118b41a5afe4',
    measurementId: window.FIREBASE_MEASUREMENT_ID || 'G-YHZBVT4W4S'
  };
}

// ─── Lazy Firebase initialisation ─────────────────────────────
let _firebaseApp = null;
let _auth = null;

async function ensureFirebase() {
  if (_auth) return _auth;

  // Firebase JS SDK (compat) is loaded via CDN in index.html
  if (typeof firebase === 'undefined') {
    console.warn('Firebase SDK not loaded. Auth will use server-side fallback.');
    return null;
  }

  if (!_firebaseApp) {
    try {
      _firebaseApp = firebase.initializeApp(getFirebaseClientConfig());
    } catch (e) {
      // Already initialised (hot-reload guard)
      if (e.code === 'app/duplicate-app') {
        _firebaseApp = firebase.app();
      } else {
        throw e;
      }
    }
  }
  _auth = firebase.auth(_firebaseApp);
  return _auth;
}

// ─── Sign Up with Email/Password ──────────────────────────────
async function firebaseSignUp(email, password) {
  const auth = await ensureFirebase();
  if (!auth) return null;
  const cred = await auth.createUserWithEmailAndPassword(email, password);
  return cred.user;
}

// ─── Sign In with Email/Password ──────────────────────────────
async function firebaseSignIn(email, password) {
  const auth = await ensureFirebase();
  if (!auth) return null;
  const cred = await auth.signInWithEmailAndPassword(email, password);
  return cred.user;
}

// ─── Sign Out ─────────────────────────────────────────────────
async function firebaseSignOut() {
  const auth = await ensureFirebase();
  if (!auth) return;
  await auth.signOut();
  sessionStorage.removeItem('fc_id_token');
  sessionStorage.removeItem('fc_user');
}

// ─── Get current ID token (refreshes automatically) ───────────
async function getIdToken() {
  const auth = await ensureFirebase();
  if (!auth || !auth.currentUser) return null;
  try {
    const token = await auth.currentUser.getIdToken(/* forceRefresh= */ false);
    sessionStorage.setItem('fc_id_token', token);
    return token;
  } catch {
    return null;
  }
}

// ─── Auth State Listener ──────────────────────────────────────
async function onAuthChange(callback) {
  const auth = await ensureFirebase();
  if (!auth) return () => {};
  return auth.onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
      const token = await firebaseUser.getIdToken();
      sessionStorage.setItem('fc_id_token', token);
    } else {
      sessionStorage.removeItem('fc_id_token');
    }
    callback(firebaseUser);
  });
}

let _storage = null;

async function ensureFirebaseStorage() {
  if (_storage) return _storage;
  if (typeof firebase === 'undefined') {
    console.warn('Firebase SDK not loaded.');
    return null;
  }
  if (!_firebaseApp) {
    try {
      _firebaseApp = firebase.initializeApp(getFirebaseClientConfig());
    } catch (e) {
      if (e.code === 'app/duplicate-app') {
        _firebaseApp = firebase.app();
      } else {
        throw e;
      }
    }
  }
  if (typeof firebase.storage === 'function') {
    _storage = firebase.storage(_firebaseApp);
    return _storage;
  }
  return null;
}

/**
 * Uploads a crop image file to Firebase Storage under `crop_images/`
 * Returns the public download URL. Falls back to base64 Data URL if Storage is offline/failed.
 */
async function uploadCropImage(file) {
  if (!file) return null;

  try {
    const storage = await ensureFirebaseStorage();
    if (storage) {
      const sanitizedName = file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, '_') : 'crop.jpg';
      const storagePath = `crop_images/${Date.now()}_${sanitizedName}`;
      const storageRef = storage.ref().child(storagePath);
      
      const snapshot = await storageRef.put(file);
      const downloadURL = await snapshot.ref.getDownloadURL();
      console.log('🔥 Image uploaded successfully to Firebase Storage:', downloadURL);
      return downloadURL;
    }
  } catch (err) {
    console.warn('⚠️ Firebase Storage upload failed or unconfigured, converting image to data URL fallback:', err);
  }

  // Fallback: Convert file to data URL so crop creation is never blocked
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

// ─── Public API ───────────────────────────────────────────────
window.FirebaseAuth = {
  signUp: firebaseSignUp,
  signIn: firebaseSignIn,
  signOut: firebaseSignOut,
  getIdToken,
  onAuthChange,
  uploadCropImage,
  getCurrentUser: async () => {
    const auth = await ensureFirebase();
    return auth ? auth.currentUser : null;
  }
};
