const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tamilName: { type: String },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String, default: 'demo123' },
  role: { type: String, enum: ['farmer', 'buyer', 'processor'], default: 'farmer' },
  location: { type: String, required: true },
  district: { type: String, default: 'Thanjavur' },
  landSizeAcres: { type: Number, default: 2.0 },
  cropsGrown: [{ type: String }],
  buyerType: { type: String },
  trustScore: { type: Number, default: 4.8 },
  verified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
