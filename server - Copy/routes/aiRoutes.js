const express = require('express');
const router = express.Router();
const { predictCropPrice, CROP_BASELINES } = require('../ai/xgboost_lstm_predictor');
const { runTOPSIS } = require('../ai/topsis_engine');
const { evaluateSalvageDecisionTree, SALVAGE_ROUTES } = require('../ai/decision_tree_salvage');
const { db, memoryStore, getIsFirestore, getIsMongoConnected } = require('../config/db');
const Buyer = require('../models/Buyer');

/**
 * 1. AI Price Prediction Route (XGBoost + LSTM)
 */
router.post('/predict-price', (req, res) => {
  try {
    const { cropName, currentPrice, daysAhead, externalFactors } = req.body;
    if (!cropName) {
      return res.status(400).json({ error: 'cropName is required for price prediction' });
    }

    const prediction = predictCropPrice(cropName, {
      currentPrice: currentPrice ? Number(currentPrice) : undefined,
      daysAhead: daysAhead ? Number(daysAhead) : 15,
      externalFactors: externalFactors || {}
    });

    res.json(prediction);
  } catch (err) {
    console.error('AI Price Prediction error:', err);
    res.status(500).json({ error: 'AI Price Prediction failed: ' + err.message });
  }
});

/**
 * 2. TOPSIS Multi-Criteria Decision Making Route
 * Finds best market / buyer using: Price, Demand, Distance, and Transport Cost
 */
router.post('/topsis-rank', async (req, res) => {
  try {
    const { cropName, cropQuantity = 50, customWeights } = req.body;

    let buyers = [];
    if (getIsFirestore()) {
      buyers = await db.getBuyers();
    } else if (getIsMongoConnected()) {
      buyers = await Buyer.find({});
    } else {
      buyers = memoryStore.data.buyers;
    }

    // Filter buyers relevant to the crop if specified
    let targetBuyers = buyers;
    if (cropName) {
      const lower = cropName.toLowerCase();
      const filtered = buyers.filter(b => 
        !b.targetCrops || b.targetCrops.length === 0 || 
        b.targetCrops.some(tc => lower.includes(tc.toLowerCase()) || tc.toLowerCase().includes(lower))
      );
      if (filtered.length >= 2) {
        targetBuyers = filtered;
      }
    }

    const topsisResult = runTOPSIS(targetBuyers, customWeights, Number(cropQuantity));
    res.json(topsisResult);
  } catch (err) {
    console.error('TOPSIS ranking error:', err);
    res.status(500).json({ error: 'TOPSIS evaluation failed: ' + err.message });
  }
});

/**
 * 3. Unsold Crop Salvage Matcher Route (Decision Tree & Rule-Based)
 * Matches to: Processing, Animal Feed, Donation, Compost, or Biogas
 */
router.post('/salvage-match', async (req, res) => {
  try {
    const {
      cropName,
      quantity,
      grade,
      daysSinceHarvest,
      damagePercent,
      perishability,
      isCertifiedOrganic
    } = req.body;

    const evaluation = evaluateSalvageDecisionTree({
      cropName: cropName || 'Tomato',
      quantity: quantity ? Number(quantity) : 10,
      grade: grade || 'Grade B',
      daysSinceHarvest: daysSinceHarvest !== undefined ? Number(daysSinceHarvest) : 3,
      damagePercent: damagePercent !== undefined ? Number(damagePercent) : 18,
      perishability: perishability || 'High',
      isCertifiedOrganic: Boolean(isCertifiedOrganic)
    });

    // Attach nearby verified partners in Tamil Nadu corresponding to the primary and secondary route
    const allPartners = await db.getSalvagePartners();
    const partners = allPartners.filter(p =>
      p.category === evaluation.primaryRoute.id || p.category === evaluation.secondaryRoute.id
    );

    res.json({
      ...evaluation,
      matchingPartners: partners
    });
  } catch (err) {
    console.error('Salvage matcher error:', err);
    res.status(500).json({ error: 'Salvage evaluation failed: ' + err.message });
  }
});

/**
 * Baseline crop market data
 */
router.get('/baselines', (req, res) => {
  res.json({
    success: true,
    baselines: CROP_BASELINES,
    salvageRoutes: SALVAGE_ROUTES
  });
});

module.exports = router;
