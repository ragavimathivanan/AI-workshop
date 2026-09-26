/**
 * FarmConnect – Price Alert Routes
 * Stored in Firestore / MongoDB / in-memory.
 */

const express = require('express');
const router = express.Router();
const { db, getIsFirestore, getIsMongoConnected, memoryStore } = require('../config/db');
const Alert = require('../models/Alert');

// GET /api/alerts
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    let alerts = [];

    if (getIsFirestore()) {
      alerts = await db.getAlerts(userId);
    } else if (getIsMongoConnected()) {
      const filter = {};
      if (userId) filter.userId = userId;
      alerts = await Alert.find(filter).sort({ createdAt: -1 });
    } else {
      alerts = await memoryStore.getAlerts(userId);
    }

    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// POST /api/alerts
router.post('/', async (req, res) => {
  try {
    const { userId, cropName, cropNameTa, mandiName, targetPrice, condition, currentPrice } = req.body;

    if (!cropName || !targetPrice) {
      return res.status(400).json({ error: 'Crop name and target price are required.' });
    }

    const alertData = {
      userId: userId || 'usr_farmer_1',
      cropName,
      cropNameTa: cropNameTa || cropName,
      mandiName: mandiName || 'Local Mandi Hub',
      targetPrice: Number(targetPrice),
      condition: condition || 'above',
      currentPrice: Number(currentPrice) || Number(targetPrice) - 100,
      active: true,
      triggered: false
    };

    let newAlert = null;
    if (getIsFirestore()) {
      newAlert = await db.createAlert(alertData);
    } else if (getIsMongoConnected()) {
      newAlert = await Alert.create(alertData);
    } else {
      newAlert = await memoryStore.createAlert(alertData);
    }

    res.status(201).json({ success: true, message: 'Price alert created!', alert: newAlert });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create price alert' });
  }
});

module.exports = router;
