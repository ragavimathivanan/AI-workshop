const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets from public/
app.use(express.static(path.join(__dirname, '../public')));

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/crops', require('./routes/cropRoutes'));
app.use('/api/buyers', require('./routes/buyerRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'FarmConnect',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: process.env.FIREBASE_CLIENT_EMAIL ? 'Cloud Firestore' : (process.env.MONGODB_URI ? 'MongoDB' : 'In-Memory'),
    aiEngines: {
      pricePredictor: 'XGBoost + Bidirectional LSTM Ensemble',
      mcdmOptimizer: 'TOPSIS (Price, Demand, Distance, Transport Cost)',
      salvageMatcher: 'Decision Tree & Rule-Based Salvage Classifier'
    }
  });
});

// Fallback to index.html for Single Page Application routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start Server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚜 FarmConnect Server is running on http://localhost:${PORT}`);
    console.log(`🌾 Empowering farmers with AI-driven direct buyer trade`);
    console.log(`🔥 Auth: Firebase Email/Password → Firestore storage`);
    console.log(`🧠 AI Models: XGBoost + LSTM, TOPSIS MCDM, Decision Tree`);
    console.log(`🌐 Multi-language: English & Tamil (தமிழ்)`);
    console.log(`=======================================================`);
  });
};

startServer();
