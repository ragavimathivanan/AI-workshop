const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  farmerId: { type: String, required: true },
  farmerName: { type: String, required: true },
  farmerPhone: { type: String, required: true },
  cropName: { type: String, required: true },
  cropNameTa: { type: String },
  category: { type: String, default: 'Vegetables' },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'Quintals' },
  qualityGrade: { 
    type: String, 
    enum: ['Grade A+', 'Grade A', 'Grade B', 'Grade C', 'Fair', 'Processing'], 
    default: 'Grade A' 
  },
  basePrice: { type: Number, required: true }, // in ₹
  location: { type: String, required: true },
  district: { type: String, default: 'Thanjavur' },
  harvestDate: { type: String, required: true },
  expiryDays: { type: Number, default: 14 },
  image: { type: String },
  status: { type: String, enum: ['active', 'sold', 'unsold_salvage', 'cancelled'], default: 'active' },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Crop || mongoose.model('Crop', CropSchema);
