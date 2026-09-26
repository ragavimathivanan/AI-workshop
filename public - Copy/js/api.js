/**
 * FarmConnect Client API Layer
 * Automatically attaches the Firebase ID token to every request.
 */

const API_BASE = '/api';

async function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (window.FirebaseAuth) {
    const token = await window.FirebaseAuth.getIdToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

const FarmConnectAPI = {
  // ── Authentication & Profile ──────────────────────────────

  /**
   * Firebase-first sign-up:
   * 1. Creates a Firebase Auth user (client-side)
   * 2. POSTs profile data to /api/auth/register (stores in Firestore)
   */
  async register(userData) {
    // Step 1 – Firebase Auth (if available)
    if (window.FirebaseAuth && userData.email && userData.password) {
      try {
        await window.FirebaseAuth.signUp(userData.email, userData.password);
      } catch (fbErr) {
        if (fbErr.code === 'auth/email-already-in-use') {
          return { error: 'Email already registered. Please sign in.' };
        }
        throw fbErr;
      }
    }

    // Step 2 – persist extended profile
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify(userData)
    });
    return await res.json();
  },

  /**
   * Firebase-first sign-in:
   * 1. Signs in via Firebase Auth (client-side) to get an ID token
   * 2. Sends the ID token to /api/auth/verify-token to get the full profile
   * Falls back to phone/password route if Firebase SDK is unavailable.
   */
  async login(identifier, password) {
    if (window.FirebaseAuth) {
      try {
        // identifier can be email or phone – try email first
        const email = identifier.includes('@') ? identifier : null;
        if (email) {
          await window.FirebaseAuth.signIn(email, password);
          const headers = await authHeaders();
          const res = await fetch(`${API_BASE}/auth/verify-token`, {
            method: 'POST',
            headers
          });
          return await res.json();
        }
      } catch (fbErr) {
        if (fbErr.code && fbErr.code.startsWith('auth/')) {
          return { error: fbErr.message };
        }
        // Non-Firebase error: fall through to phone login
      }
    }

    // Phone / legacy server-side login
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: identifier, password })
    });
    return await res.json();
  },

  async getProfile(userId = 'usr_farmer_1') {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/auth/profile/${userId}`, { headers });
    return await res.json();
  },

  async updateProfile(id, updates) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/auth/profile/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates)
    });
    return await res.json();
  },

  // ── Crops ────────────────────────────────────────────────

  async getCrops(farmerId) {
    const query = farmerId ? `?farmerId=${farmerId}` : '';
    const res = await fetch(`${API_BASE}/crops${query}`);
    return await res.json();
  },

  async createCrop(cropData) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/crops`, {
      method: 'POST',
      headers,
      body: JSON.stringify(cropData)
    });
    return await res.json();
  },

  async updateCrop(id, updates) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/crops/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates)
    });
    return await res.json();
  },

  async deleteCrop(id) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/crops/${id}`, {
      method: 'DELETE',
      headers
    });
    return await res.json();
  },

  // ── Buyers ───────────────────────────────────────────────

  async getBuyers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/buyers?${query}`);
    return await res.json();
  },

  // ── AI & ML ──────────────────────────────────────────────

  async predictPrice(cropName, currentPrice, daysAhead = 15, externalFactors = {}) {
    const res = await fetch(`${API_BASE}/ai/predict-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cropName, currentPrice, daysAhead, externalFactors })
    });
    return await res.json();
  },

  async runTopsis(cropName, cropQuantity = 50, customWeights = {}) {
    const res = await fetch(`${API_BASE}/ai/topsis-rank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cropName, cropQuantity, customWeights })
    });
    return await res.json();
  },

  async matchSalvage(salvageData) {
    const res = await fetch(`${API_BASE}/ai/salvage-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(salvageData)
    });
    return await res.json();
  },

  // ── Price Alerts ─────────────────────────────────────────

  async getAlerts(userId) {
    const query = userId ? `?userId=${userId}` : '';
    const res = await fetch(`${API_BASE}/alerts${query}`);
    return await res.json();
  },

  async createAlert(alertData) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/alerts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(alertData)
    });
    return await res.json();
  }
};

window.FarmConnectAPI = FarmConnectAPI;
