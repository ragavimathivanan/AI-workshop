/**
 * FarmConnect – Auth Routes
 * Uses Firebase Auth (Email/Password) for sign-up, sign-in, and token verification.
 * User profile data is stored in Firestore (or falls back to MongoDB / in-memory).
 */

const express = require('express');
const router = express.Router();
const { db, getIsFirestore, getIsMongoConnected, memoryStore } = require('../config/db');
const { getAuth } = require('../config/firebase');
const User = require('../models/User');

// ─── Middleware: Verify Firebase ID Token ──────────────────────
async function verifyToken(req, res, next) {
  const auth = getAuth();
  if (!auth) return next(); // Firebase not configured – skip in dev/demo

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(); // unauthenticated – routes decide what to do

  try {
    req.firebaseUser = await auth.verifyIdToken(token);
  } catch (err) {
    // Invalid token – treat as unauthenticated (don't block non-auth routes)
    req.firebaseUser = null;
  }
  next();
}

// ─── POST /api/auth/register ──────────────────────────────────
// Creates a Firebase Auth user (Email/Password) then stores
// the extended profile in Firestore / MongoDB / memory.
router.post('/register', async (req, res) => {
  try {
    const {
      name, phone, email, password, role,
      location, district, landSizeAcres, cropsGrown, buyerType
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    // 1. Create Firebase Auth account
    const auth = getAuth();
    let firebaseUid = null;
    if (auth) {
      try {
        const record = await auth.createUser({
          email,
          password,
          displayName: name,
          disabled: false
        });
        firebaseUid = record.uid;
      } catch (fbErr) {
        if (fbErr.code === 'auth/email-already-exists') {
          return res.status(400).json({ error: 'Email already registered. Please sign in.' });
        }
        throw fbErr;
      }
    }

    // 2. Store extended profile
    const profileData = {
      name,
      phone: phone || '',
      email,
      role: role || 'farmer',
      location: location || 'Tamil Nadu',
      district: district || 'Thanjavur',
      landSizeAcres: parseFloat(landSizeAcres) || 2.0,
      cropsGrown: cropsGrown || ['Paddy'],
      buyerType: buyerType || null,
      firebaseUid,
      trustScore: 4.8,
      verified: true
    };

    let user;
    if (getIsFirestore()) {
      // Check duplicate phone
      if (phone) {
        const existing = await db.findUser({ phone });
        if (existing) return res.status(400).json({ error: 'Phone number already registered.' });
      }
      user = await db.createUser(profileData);
    } else if (getIsMongoConnected()) {
      const existing = phone ? await User.findOne({ phone }) : null;
      if (existing) return res.status(400).json({ error: 'Phone number already registered. Please login.' });
      user = await User.create({ ...profileData, password: password || 'demo123' });
    } else {
      if (phone) {
        const existing = await memoryStore.findUser({ phone });
        if (existing) return res.status(400).json({ error: 'Phone number already registered.' });
      }
      user = await memoryStore.createUser(profileData);
    }

    return res.status(201).json({ success: true, user });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register: ' + err.message });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────
// Server-side fallback login (phone/email + password).
// NOTE: The preferred flow is client-side Firebase signInWithEmailAndPassword
// followed by sending the ID token to this endpoint for profile fetch.
router.post('/login', async (req, res) => {
  try {
    const { phone, email, password } = req.body;

    let user = null;

    if (getIsFirestore()) {
      user = phone ? await db.findUser({ phone }) : await db.findUser({ email });
    } else if (getIsMongoConnected()) {
      user = phone ? await User.findOne({ phone }) : await User.findOne({ email });
    } else {
      user = phone
        ? await memoryStore.findUser({ phone })
        : await memoryStore.findUser({ email });
    }

    // Friendly fallback: auto-create a guest profile for demos
    if (!user) {
      const guestData = {
        name: 'Farmer User',
        phone: phone || '',
        email: email || '',
        role: 'farmer',
        location: 'Thanjavur, Tamil Nadu',
        district: 'Thanjavur'
      };
      if (getIsFirestore()) user = await db.createUser(guestData);
      else if (getIsMongoConnected()) user = await User.create(guestData);
      else user = await memoryStore.createUser(guestData);
    }

    return res.json({ success: true, message: 'Login successful', user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// ─── POST /api/auth/verify-token ─────────────────────────────
// Verifies a Firebase ID token and returns the stored user profile.
// Call this from the client after signInWithEmailAndPassword.
router.post('/verify-token', verifyToken, async (req, res) => {
  try {
    if (!req.firebaseUser) {
      return res.status(401).json({ error: 'Invalid or missing token.' });
    }

    const { uid, email } = req.firebaseUser;
    let user = null;

    if (getIsFirestore()) {
      user = await db.findUser({ email });
    } else if (getIsMongoConnected()) {
      user = await User.findOne({ email });
    } else {
      user = await memoryStore.findUser({ email });
    }

    // Auto-create profile if missing (first Firebase login)
    if (!user) {
      const newUser = {
        name: req.firebaseUser.name || email.split('@')[0],
        email,
        firebaseUid: uid,
        role: 'farmer',
        location: 'Tamil Nadu',
        district: 'Thanjavur',
        trustScore: 4.8,
        verified: true
      };
      if (getIsFirestore()) user = await db.createUser(newUser);
      else if (getIsMongoConnected()) user = await User.create(newUser);
      else user = await memoryStore.createUser(newUser);
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error('Token verify error:', err);
    res.status(500).json({ error: 'Token verification failed: ' + err.message });
  }
});

// ─── GET /api/auth/profile/:id ────────────────────────────────
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let user = null;

    if (getIsFirestore()) {
      user = await db.findUser({ _id: id });
    } else if (getIsMongoConnected()) {
      user = await User.findById(id);
    } else {
      user = await memoryStore.findUser({ _id: id });
    }

    if (!user) user = memoryStore.data.users[0]; // demo fallback
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ─── PUT /api/auth/profile/:id ────────────────────────────────
router.put('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    let updated = null;

    if (getIsFirestore()) {
      updated = await db.updateUser(id, updates);
    } else if (getIsMongoConnected()) {
      updated = await User.findByIdAndUpdate(id, updates, { new: true });
    } else {
      updated = await memoryStore.updateUser(id, updates);
    }

    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
module.exports.verifyToken = verifyToken;
