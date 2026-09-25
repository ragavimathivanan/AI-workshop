const mongoose = require('mongoose');

const BuyerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tamilName: { type: String },
  buyerType: { 
    type: String, 
    enum: ['Wholesaler', 'Retail Chain', 'Food Processor', 'Exporter', 'Local Mandi'], 
    default: 'Wholesaler' 
  },
  district: { type: String, required: true },
  distanceKm: { type: Number, required: true },
  targetCrops: [{ type: String }],
  buyingPricePerUnit: { type: Number, required: true }, // in ₹
  demandScore: { type: Number, default: 80 }, // 1 to 100
  transportCostPerKm: { type: Number, default: 12 }, // ₹ / km
  rating: { type: Number, default: 4.8 },
  verified: { type: Boolean, default: true },
  phone: { type: String, required: true },
  address: { type: String }
});

module.exports = mongoose.models.Buyer || mongoose.model('Buyer', BuyerSchema);
