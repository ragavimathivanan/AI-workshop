/**
 * FarmConnect – Crop Routes
 * CRUD for crop listings stored in Firestore / MongoDB / in-memory.
 */

const express = require('express');
const router = express.Router();
const { db, getIsFirestore, getIsMongoConnected, memoryStore } = require('../config/db');
const Crop = require('../models/Crop');

const CROP_IMAGES = {
  paddy:    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  tomato:   'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
  onion:    'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
  banana:   'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
  turmeric: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
  chilli:   'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
  default:  'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80'
};

function pickImage(cropName, provided) {
  if (provided) return provided;
  const lower = (cropName || '').toLowerCase();
  if (lower.includes('paddy') || lower.includes('rice')) return CROP_IMAGES.paddy;
  if (lower.includes('tomato')) return CROP_IMAGES.tomato;
  if (lower.includes('onion')) return CROP_IMAGES.onion;
  if (lower.includes('banana')) return CROP_IMAGES.banana;
  if (lower.includes('turmeric')) return CROP_IMAGES.turmeric;
  if (lower.includes('chilli')) return CROP_IMAGES.chilli;
  return CROP_IMAGES.default;
}

// GET /api/crops
router.get('/', async (req, res) => {
  try {
    const { category, farmerId, status } = req.query;
    let crops = [];

    if (getIsFirestore()) {
      crops = await db.getCrops({ category, farmerId, status });
    } else if (getIsMongoConnected()) {
      const filter = {};
      if (category) filter.category = category;
      if (farmerId) filter.farmerId = farmerId;
      if (status) filter.status = status;
      crops = await Crop.find(filter).sort({ createdAt: -1 });
    } else {
      crops = await memoryStore.getCrops({ category, farmerId, status });
    }

    res.json({ success: true, count: crops.length, crops });
  } catch (err) {
    console.error('Fetch crops error:', err);
    res.status(500).json({ error: 'Failed to fetch crops' });
  }
});

// GET /api/crops/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let crop = null;

    if (getIsFirestore()) {
      crop = await db.getCropById(id);
    } else if (getIsMongoConnected()) {
      crop = await Crop.findById(id);
    } else {
      crop = await memoryStore.getCropById(id);
    }

    if (!crop) return res.status(404).json({ error: 'Crop listing not found' });
    res.json({ success: true, crop });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch crop details' });
  }
});

// POST /api/crops
router.post('/', async (req, res) => {
  try {
    const {
      farmerId, farmerName, farmerPhone,
      cropName, cropNameTa, category,
      quantity, unit, qualityGrade, basePrice,
      location, district, harvestDate, image, description
    } = req.body;

    if (!cropName || !quantity || !location || !harvestDate) {
      return res.status(400).json({ error: 'Crop name, quantity, location, and harvest date are required.' });
    }

    const newCropData = {
      farmerId: farmerId || 'usr_farmer_1',
      farmerName: farmerName || 'Murugan Palanisamy',
      farmerPhone: farmerPhone || '9842112345',
      cropName,
      cropNameTa: cropNameTa || cropName,
      category: category || 'Vegetables',
      quantity: Number(quantity),
      unit: unit || 'Quintals',
      qualityGrade: qualityGrade || 'Grade A',
      basePrice: Number(basePrice) || 2000,
      location,
      district: district || 'Thanjavur',
      harvestDate,
      image: pickImage(cropName, image),
      description: description || 'Fresh farm harvested produce ready for direct buyer purchase.'
    };

    let savedCrop = null;
    if (getIsFirestore()) {
      savedCrop = await db.createCrop(newCropData);
    } else if (getIsMongoConnected()) {
      savedCrop = await Crop.create(newCropData);
    } else {
      savedCrop = await memoryStore.createCrop(newCropData);
    }

    res.status(201).json({ success: true, message: 'Crop listing created successfully!', crop: savedCrop });
  } catch (err) {
    console.error('Create crop error:', err);
    res.status(500).json({ error: 'Failed to create crop listing: ' + err.message });
  }
});

// PUT /api/crops/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    let updated = null;

    if (getIsFirestore()) {
      updated = await db.updateCrop(id, updates);
    } else if (getIsMongoConnected()) {
      updated = await Crop.findByIdAndUpdate(id, updates, { new: true });
    } else {
      updated = await memoryStore.updateCrop(id, updates);
    }

    if (!updated) return res.status(404).json({ error: 'Crop not found' });
    res.json({ success: true, crop: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update crop' });
  }
});

// DELETE /api/crops/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsFirestore()) {
      await db.deleteCrop(id);
    } else if (getIsMongoConnected()) {
      await Crop.findByIdAndDelete(id);
    } else {
      await memoryStore.deleteCrop(id);
    }

    res.json({ success: true, message: 'Crop deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete crop' });
  }
});

module.exports = router;
