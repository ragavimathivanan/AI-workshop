/**
 * FarmConnect – Unified Database Layer
 *
 * Priority order:
 *  1. Cloud Firestore  (when Firebase Admin is properly configured)
 *  2. MongoDB          (when MONGODB_URI is set)
 *  3. In-memory store  (always available – great for demos)
 *
 * All routes use `db.*` methods and never touch Firestore / Mongoose directly,
 * so swapping back-ends requires zero route changes.
 */

const mongoose = require('mongoose');
const { getFirestore } = require('./firebase');

// ─────────────────────────────────────────────────────────────
//  Seed Data  (pre-loaded for in-memory & used to seed Firestore)
// ─────────────────────────────────────────────────────────────
const initialSeedData = {
  users: [
    {
      _id: 'usr_farmer_1',
      name: 'Murugan Palanisamy',
      tamilName: 'முருகன் பழனிசாமி',
      phone: '9842112345',
      email: 'murugan.farmer@farmconnect.org',
      role: 'farmer',
      location: 'Thanjavur, Tamil Nadu',
      district: 'Thanjavur',
      landSizeAcres: 5.5,
      cropsGrown: ['Paddy', 'Banana', 'Black Gram'],
      trustScore: 4.9,
      verified: true
    },
    {
      _id: 'usr_farmer_2',
      name: 'Selvi Ramasamy',
      tamilName: 'செல்வி ராமசாமி',
      phone: '9443298765',
      email: 'selvi.ramasamy@farmconnect.org',
      role: 'farmer',
      location: 'Dindigul, Tamil Nadu',
      district: 'Dindigul',
      landSizeAcres: 3.2,
      cropsGrown: ['Tomato', 'Small Onion', 'Chilli'],
      trustScore: 4.8,
      verified: true
    },
    {
      _id: 'usr_buyer_1',
      name: 'Annamalai Agro Traders',
      tamilName: 'அண்ணாமலை அக்ரோ டிரேடர்ஸ்',
      phone: '9876543210',
      email: 'purchase@annamalaiagro.com',
      role: 'buyer',
      buyerType: 'Wholesaler',
      location: 'Koyambedu Mandi, Chennai',
      district: 'Chennai',
      verified: true
    }
  ],
  crops: [
    {
      _id: 'crp_1',
      farmerId: 'usr_farmer_1',
      farmerName: 'Murugan Palanisamy',
      farmerPhone: '9842112345',
      cropName: 'Paddy (Ponni Rice)',
      cropNameTa: 'நெல் (பொன்னி அரிசி)',
      category: 'Grains',
      quantity: 80,
      unit: 'Quintals',
      qualityGrade: 'Grade A+',
      basePrice: 2450,
      location: 'Kumbakonam, Thanjavur',
      district: 'Thanjavur',
      harvestDate: '2026-09-20',
      expiryDays: 180,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      status: 'active',
      description: 'Naturally cultivated premium Ponni paddy, low moisture (<12%), freshly harvested from Cauvery delta.'
    },
    {
      _id: 'crp_2',
      farmerId: 'usr_farmer_2',
      farmerName: 'Selvi Ramasamy',
      farmerPhone: '9443298765',
      cropName: 'Tomato (Hybrid Red)',
      cropNameTa: 'தக்காளி (ஹைப்ரிட் சிவப்பு)',
      category: 'Vegetables',
      quantity: 45,
      unit: 'Quintals',
      qualityGrade: 'Grade A',
      basePrice: 3200,
      location: 'Oddanchatram, Dindigul',
      district: 'Dindigul',
      harvestDate: '2026-09-23',
      expiryDays: 7,
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      status: 'active',
      description: 'Firm, export quality table tomatoes. Harvested early morning, sorted and packed in 25kg crates.'
    },
    {
      _id: 'crp_3',
      farmerId: 'usr_farmer_2',
      farmerName: 'Selvi Ramasamy',
      farmerPhone: '9443298765',
      cropName: 'Small Onion (Shallots)',
      cropNameTa: 'சின்ன வெங்காயம் (சாம்பார் வெங்காயம்)',
      category: 'Vegetables',
      quantity: 30,
      unit: 'Quintals',
      qualityGrade: 'Grade A',
      basePrice: 4800,
      location: 'Palani, Dindigul',
      district: 'Dindigul',
      harvestDate: '2026-09-18',
      expiryDays: 30,
      image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
      status: 'active',
      description: 'Traditional Dindigul pink shallots, sun-cured, long shelf-life with strong aroma.'
    },
    {
      _id: 'crp_4',
      farmerId: 'usr_farmer_1',
      farmerName: 'Murugan Palanisamy',
      farmerPhone: '9842112345',
      cropName: 'Banana (Nendran)',
      cropNameTa: 'வாழைப்பழம் (நேந்திரன்)',
      category: 'Fruits',
      quantity: 25,
      unit: 'Quintals',
      qualityGrade: 'Grade B',
      basePrice: 2800,
      location: 'Thiruvaiyaru, Thanjavur',
      district: 'Thanjavur',
      harvestDate: '2026-09-22',
      expiryDays: 5,
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
      status: 'active',
      description: 'Mature raw Nendran bananas suitable for chips processing and table consumption.'
    }
  ],
  buyers: [
    {
      _id: 'byr_1',
      name: 'Cauvery Modern Rice Mills',
      tamilName: 'காவிரி நவீன அரிசி ஆலை',
      buyerType: 'Food Processor',
      district: 'Thanjavur',
      distanceKm: 18,
      targetCrops: ['Paddy (Ponni Rice)', 'Paddy'],
      buyingPricePerUnit: 2520,
      demandScore: 92,
      transportCostPerKm: 14,
      rating: 4.8,
      verified: true,
      phone: '9842055667',
      address: 'Industrial Estate, Kumbakonam'
    },
    {
      _id: 'byr_2',
      name: 'Koyambedu Wholesale Agro Hub',
      tamilName: 'கோயம்பேடு மொத்த காய்கறி அங்காடி',
      buyerType: 'Wholesaler',
      district: 'Chennai',
      distanceKm: 310,
      targetCrops: ['Tomato (Hybrid Red)', 'Small Onion (Shallots)', 'Paddy (Ponni Rice)', 'Banana (Nendran)'],
      buyingPricePerUnit: 2700,
      demandScore: 98,
      transportCostPerKm: 9.5,
      rating: 4.9,
      verified: true,
      phone: '9444011223',
      address: 'Periyar Market Gate 4, Koyambedu'
    },
    {
      _id: 'byr_3',
      name: 'Oddanchatram Central Mandi Buyer Syndicate',
      tamilName: 'ஒட்டன்சத்திரம் மத்திய மண்டி சிண்டிகேட்',
      buyerType: 'Local Mandi',
      district: 'Dindigul',
      distanceKm: 24,
      targetCrops: ['Tomato (Hybrid Red)', 'Small Onion (Shallots)', 'Chilli'],
      buyingPricePerUnit: 3350,
      demandScore: 88,
      transportCostPerKm: 16,
      rating: 4.7,
      verified: true,
      phone: '9843233445',
      address: 'Main Mandi Road, Oddanchatram'
    },
    {
      _id: 'byr_4',
      name: 'Nilgiris Fresh Hypermarkets',
      tamilName: 'நீலகிரீஸ் பிரெஷ் சூப்பர் மார்க்கெட்',
      buyerType: 'Retail Chain',
      district: 'Coimbatore',
      distanceKm: 140,
      targetCrops: ['Tomato (Hybrid Red)', 'Banana (Nendran)', 'Small Onion (Shallots)'],
      buyingPricePerUnit: 3480,
      demandScore: 82,
      transportCostPerKm: 12,
      rating: 4.9,
      verified: true,
      phone: '9940188990',
      address: 'Avinashi Road, Coimbatore'
    },
    {
      _id: 'byr_5',
      name: 'Aachi Masala & Agro Processing Ltd',
      tamilName: 'ஆச்சி மசாலா அக்ரோ புரோசசிங்',
      buyerType: 'Food Processor',
      district: 'Madurai',
      distanceKm: 75,
      targetCrops: ['Small Onion (Shallots)', 'Tomato (Hybrid Red)', 'Chilli', 'Turmeric'],
      buyingPricePerUnit: 5100,
      demandScore: 94,
      transportCostPerKm: 11,
      rating: 5.0,
      verified: true,
      phone: '9841022334',
      address: 'SIDCO Industrial Estate, Madurai'
    }
  ],
  priceAlerts: [
    {
      _id: 'alt_1',
      userId: 'usr_farmer_1',
      cropName: 'Paddy (Ponni Rice)',
      cropNameTa: 'நெல் (பொன்னி)',
      mandiName: 'Thanjavur Mandi',
      targetPrice: 2500,
      condition: 'above',
      currentPrice: 2450,
      active: true,
      triggered: false,
      date: '2026-09-24'
    },
    {
      _id: 'alt_2',
      userId: 'usr_farmer_2',
      cropName: 'Tomato (Hybrid Red)',
      cropNameTa: 'தக்காளி',
      mandiName: 'Oddanchatram Mandi',
      targetPrice: 3400,
      condition: 'above',
      currentPrice: 3350,
      active: true,
      triggered: false,
      date: '2026-09-24'
    }
  ],
  salvagePartners: [
    {
      _id: 'salv_1',
      name: 'TastyPulp Tomato & Fruit Processors',
      tamilName: 'டேஸ்டிபல்ப் உணவு பதப்படுத்தும் ஆலை',
      category: 'processing',
      categoryLabel: 'Food Processing / Puree / Canning',
      categoryLabelTa: 'உணவு பதப்படுத்துதல் / சாறு / பேக்கிங்',
      acceptsCrops: ['Tomato (Hybrid Red)', 'Banana (Nendran)', 'Mango'],
      minGrade: 'Grade B',
      payoutRatePercent: 70,
      location: 'Dindigul Food Park',
      district: 'Dindigul',
      phone: '9842100111',
      urgentPickupAvailable: true
    },
    {
      _id: 'salv_2',
      name: 'Aavin Dairy Cattle Feed Cooperative',
      tamilName: 'ஆவின் கால்நடை தீவன கூட்டுறவு',
      category: 'animal_feed',
      categoryLabel: 'Cattle & Poultry Feed',
      categoryLabelTa: 'கால்நடை & கோழி தீவனம்',
      acceptsCrops: ['Paddy (Ponni Rice)', 'Maize', 'Broken Grains', 'Banana (Nendran)', 'Vegetables'],
      minGrade: 'Fair',
      payoutRatePercent: 45,
      location: 'Erode Dairy Complex',
      district: 'Erode',
      phone: '9842200222',
      urgentPickupAvailable: true
    },
    {
      _id: 'salv_3',
      name: 'Annadhanam Community Food Bank & Relief',
      tamilName: 'அன்னதானம் சமூக உணவு வங்கி',
      category: 'donation',
      categoryLabel: 'Charity & Food Bank (Zero Waste)',
      categoryLabelTa: 'அறக்கட்டளை & உணவு வங்கி',
      acceptsCrops: ['All Edible Surplus Crops'],
      minGrade: 'Grade B',
      payoutRatePercent: 0,
      benefits: '100% Tax Exemption Certificate + Free Mandi Pickup Subsidy',
      location: 'Madurai & Trichy Centers',
      district: 'Madurai',
      phone: '9842300333',
      urgentPickupAvailable: true
    },
    {
      _id: 'salv_4',
      name: 'Pasumai Organic Vermicompost Works',
      tamilName: 'பசுமை இயற்கை மண்புழு உரம்',
      category: 'compost',
      categoryLabel: 'Organic Compost & Bio-Fertilizer',
      categoryLabelTa: 'இயற்கை மண்புழு உரம்',
      acceptsCrops: ['Spoiled Vegetables', 'Crop Husk', 'Banana Stems', 'All Bio-waste'],
      minGrade: 'Any / Spoiling',
      payoutRatePercent: 20,
      location: 'Thanjavur Organic Agri Cluster',
      district: 'Thanjavur',
      phone: '9842400444',
      urgentPickupAvailable: true
    },
    {
      _id: 'salv_5',
      name: 'Tamil Nadu Clean Bio-Gas Energy Plant',
      tamilName: 'தமிழ்நாடு தூய உயிரி எரிவாயு நிலையம்',
      category: 'biogas',
      categoryLabel: 'Biogas & Compressed Bio-Methane (CBG)',
      categoryLabelTa: 'உயிரி எரிவாயு (பயோ-கேஸ்)',
      acceptsCrops: ['Wet Bio-waste', 'Rotten Produce', 'High-moisture Waste'],
      minGrade: 'Spoiling',
      payoutRatePercent: 15,
      rateFixed: '₹2.50 per kg',
      location: 'Coimbatore Green Energy Corridor',
      district: 'Coimbatore',
      phone: '9842500555',
      urgentPickupAvailable: true
    }
  ]
};

// ─────────────────────────────────────────────────────────────
//  In-Memory Store  (offline / demo fallback)
// ─────────────────────────────────────────────────────────────
class MemoryStore {
  constructor() {
    this.data = JSON.parse(JSON.stringify(initialSeedData));
  }

  // Users
  async findUser(query) {
    if (query._id) return this.data.users.find(u => u._id === query._id) || null;
    if (query.phone) return this.data.users.find(u => u.phone === query.phone) || null;
    if (query.email) return this.data.users.find(u => u.email === query.email) || null;
    return null;
  }

  async createUser(userData) {
    const newUser = { _id: 'usr_' + Date.now(), trustScore: 4.8, verified: true, ...userData };
    this.data.users.push(newUser);
    return newUser;
  }

  async updateUser(id, updates) {
    const i = this.data.users.findIndex(u => u._id === id);
    if (i !== -1) { this.data.users[i] = { ...this.data.users[i], ...updates }; return this.data.users[i]; }
    return null;
  }

  // Crops
  async getCrops(filter = {}) {
    let r = [...this.data.crops];
    if (filter.farmerId) r = r.filter(c => c.farmerId === filter.farmerId);
    if (filter.category) r = r.filter(c => c.category === filter.category);
    if (filter.status) r = r.filter(c => c.status === filter.status);
    return r;
  }

  async getCropById(id) { return this.data.crops.find(c => c._id === id) || null; }

  async createCrop(cropData) {
    const newCrop = { _id: 'crp_' + Date.now(), status: 'active', createdAt: new Date().toISOString(), image: cropData.image || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80', ...cropData };
    this.data.crops.unshift(newCrop);
    return newCrop;
  }

  async updateCrop(id, updates) {
    const i = this.data.crops.findIndex(c => c._id === id);
    if (i !== -1) { this.data.crops[i] = { ...this.data.crops[i], ...updates }; return this.data.crops[i]; }
    return null;
  }

  async deleteCrop(id) {
    const i = this.data.crops.findIndex(c => c._id === id);
    if (i !== -1) { return this.data.crops.splice(i, 1)[0]; }
    return null;
  }

  // Buyers
  async getBuyers(filter = {}) {
    let r = [...this.data.buyers];
    if (filter.district) r = r.filter(b => b.district.toLowerCase() === filter.district.toLowerCase());
    return r;
  }

  // Alerts
  async getAlerts(userId) { return this.data.priceAlerts.filter(a => !userId || a.userId === userId); }

  async createAlert(alertData) {
    const a = { _id: 'alt_' + Date.now(), date: new Date().toISOString().split('T')[0], active: true, triggered: false, ...alertData };
    this.data.priceAlerts.unshift(a);
    return a;
  }

  // Salvage
  async getSalvagePartners() { return this.data.salvagePartners; }
}

// ─────────────────────────────────────────────────────────────
//  Firestore Adapter  (wraps Firestore in the same API)
// ─────────────────────────────────────────────────────────────
class FirestoreStore {
  constructor(db) {
    this.db = db;
    this.mem = new MemoryStore(); // fallback for salvage partners (static data)
  }

  // ── helpers ──
  _col(name) { return this.db.collection(name); }

  async _docToObj(docSnap) {
    if (!docSnap.exists) return null;
    return { _id: docSnap.id, ...docSnap.data() };
  }

  async _queryToArr(query) {
    const snap = await query.get();
    return snap.docs.map(d => ({ _id: d.id, ...d.data() }));
  }

  // ── Users ──
  async findUser(query) {
    if (query._id) {
      const d = await this._col('users').doc(query._id).get();
      return this._docToObj(d);
    }
    const field = query.phone ? 'phone' : 'email';
    const val = query.phone || query.email;
    const snap = await this._col('users').where(field, '==', val).limit(1).get();
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { _id: d.id, ...d.data() };
  }

  async createUser(userData) {
    const id = 'usr_' + Date.now();
    const user = { trustScore: 4.8, verified: true, createdAt: new Date().toISOString(), ...userData };
    await this._col('users').doc(id).set(user);
    return { _id: id, ...user };
  }

  async updateUser(id, updates) {
    await this._col('users').doc(id).set(updates, { merge: true });
    const d = await this._col('users').doc(id).get();
    return this._docToObj(d);
  }

  // ── Crops ──
  async getCrops(filter = {}) {
    let q = this._col('crops');
    if (filter.farmerId) q = q.where('farmerId', '==', filter.farmerId);
    if (filter.category) q = q.where('category', '==', filter.category);
    if (filter.status) q = q.where('status', '==', filter.status);
    return this._queryToArr(q.orderBy('createdAt', 'desc'));
  }

  async getCropById(id) {
    const d = await this._col('crops').doc(id).get();
    return this._docToObj(d);
  }

  async createCrop(cropData) {
    const id = 'crp_' + Date.now();
    const crop = {
      status: 'active',
      createdAt: new Date().toISOString(),
      image: cropData.image || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80',
      ...cropData
    };
    await this._col('crops').doc(id).set(crop);
    return { _id: id, ...crop };
  }

  async updateCrop(id, updates) {
    await this._col('crops').doc(id).set(updates, { merge: true });
    const d = await this._col('crops').doc(id).get();
    return this._docToObj(d);
  }

  async deleteCrop(id) {
    const d = await this._col('crops').doc(id).get();
    const obj = await this._docToObj(d);
    if (obj) await this._col('crops').doc(id).delete();
    return obj;
  }

  // ── Buyers ──
  async getBuyers(filter = {}) {
    let q = this._col('buyers');
    if (filter.district) q = q.where('district', '==', filter.district);
    return this._queryToArr(q);
  }

  // ── Alerts ──
  async getAlerts(userId) {
    let q = this._col('alerts');
    if (userId) q = q.where('userId', '==', userId);
    return this._queryToArr(q.orderBy('date', 'desc'));
  }

  async createAlert(alertData) {
    const id = 'alt_' + Date.now();
    const alert = { date: new Date().toISOString().split('T')[0], active: true, triggered: false, ...alertData };
    await this._col('alerts').doc(id).set(alert);
    return { _id: id, ...alert };
  }

  // ── Salvage (static – served from memory) ──
  async getSalvagePartners() { return this.mem.getSalvagePartners(); }
}

// ─────────────────────────────────────────────────────────────
//  Seed Firestore with initial data if collections are empty
// ─────────────────────────────────────────────────────────────
async function seedFirestore(db) {
  const collections = ['users', 'crops', 'buyers', 'alerts', 'salvagePartners'];
  for (const col of collections) {
    const snap = await db.collection(col).limit(1).get();
    if (!snap.empty) continue; // already seeded

    const records = initialSeedData[col === 'alerts' ? 'priceAlerts' : col] || [];
    const batch = db.batch();
    records.forEach(record => {
      const { _id, ...data } = record;
      batch.set(db.collection(col).doc(_id), data);
    });
    await batch.commit();
    console.log(`🌱 Firestore: seeded ${records.length} records into '${col}'`);
  }
}

// ─────────────────────────────────────────────────────────────
//  Exported Singleton
// ─────────────────────────────────────────────────────────────
const memoryStore = new MemoryStore();
let activeStore = memoryStore;
let _isFirestore = false;
let _isMongo = false;

const connectDB = async () => {
  // 1. Try Firestore first
  const firestoreDb = getFirestore();
  if (firestoreDb) {
    try {
      await seedFirestore(firestoreDb);
      activeStore = new FirestoreStore(firestoreDb);
      _isFirestore = true;
      console.log('🔥 FarmConnect is using Cloud Firestore as its database.');
      return { isFirestore: true, isMongo: false, store: activeStore };
    } catch (err) {
      console.warn('⚠️  Firestore ready but seed failed:', err.message, '— falling through.');
    }
  }

  // 2. Try MongoDB
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      _isMongo = true;
      // Note: Mongoose models are still used by routes when isMongo is true
      return { isFirestore: false, isMongo: true, store: memoryStore };
    } catch (err) {
      console.warn(`⚠️  MongoDB failed (${err.message}). Falling back to in-memory store.`);
    }
  }

  // 3. In-memory fallback
  console.log('🌱 FarmConnect running with in-memory store & pre-seeded farm data.');
  return { isFirestore: false, isMongo: false, store: memoryStore };
};

module.exports = {
  connectDB,
  memoryStore,
  get db() { return activeStore; },
  getIsFirestore: () => _isFirestore,
  getIsMongoConnected: () => _isMongo,
  initialSeedData
};
