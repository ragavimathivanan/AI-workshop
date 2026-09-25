/**
 * FarmConnect – Buyer Routes
 * Reads buyer/mandi data from Firestore / MongoDB / in-memory.
 */

const express = require('express');
const router = express.Router();
const { db, getIsFirestore, getIsMongoConnected, memoryStore } = require('../config/db');
const Buyer = require('../models/Buyer');

// GET /api/buyers
router.get('/', async (req, res) => {
  try {
    const { district, crop, maxDistance } = req.query;
    let buyers = [];

    if (getIsFirestore()) {
      buyers = await db.getBuyers(district ? { district } : {});
    } else if (getIsMongoConnected()) {
      const filter = {};
      if (district) filter.district = new RegExp(district, 'i');
      buyers = await Buyer.find(filter);
    } else {
      buyers = await memoryStore.getBuyers(district ? { district } : {});
    }

    // Additional in-memory filters (work on any back-end result)
    if (crop) {
      const lowerCrop = crop.toLowerCase();
      buyers = buyers.filter(b =>
        b.targetCrops && b.targetCrops.some(tc => tc.toLowerCase().includes(lowerCrop))
      );
    }
    if (maxDistance) {
      buyers = buyers.filter(b => b.distanceKm <= Number(maxDistance));
    }

    res.json({ success: true, count: buyers.length, buyers });
  } catch (err) {
    console.error('Fetch buyers error:', err);
    res.status(500).json({ error: 'Failed to fetch buyers' });
  }
});

// POST /api/buyers  (add a new buyer)
router.post('/', async (req, res) => {
  try {
    const buyerData = req.body;
    let buyer = null;

    if (getIsFirestore()) {
      const id = 'byr_' + Date.now();
      const { getFirestore } = require('../config/firebase');
      await getFirestore().collection('buyers').doc(id).set(buyerData);
      buyer = { _id: id, ...buyerData };
    } else if (getIsMongoConnected()) {
      buyer = await Buyer.create(buyerData);
    } else {
      buyer = { _id: 'byr_' + Date.now(), ...buyerData };
      memoryStore.data.buyers.push(buyer);
    }

    res.status(201).json({ success: true, buyer });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add buyer' });
  }
});

module.exports = router;
