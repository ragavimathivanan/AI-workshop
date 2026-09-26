const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  cropName: { type: String, required: true },
  cropNameTa: { type: String },
  mandiName: { type: String, required: true },
  targetPrice: { type: Number, required: true },
  condition: { type: String, enum: ['above', 'below'], default: 'above' },
  currentPrice: { type: Number, required: true },
  active: { type: Boolean, default: true },
  triggered: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Alert || mongoose.model('Alert', AlertSchema);
