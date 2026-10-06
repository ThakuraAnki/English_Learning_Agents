import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/database.js';

import orchestratorRoutes from './routes/orchestratorRoutes.js';
import readingRoutes from './routes/readingRoutes.js';
import pronunciationRoutes from './routes/pronunciationRoutes.js';
import listeningRoutes from './routes/listeningRoutes.js';
import writingRoutes from './routes/writingRoutes.js';
import spellingRoutes from './routes/spellingRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

dotenv.config();

// Initialize SQLite Database schema
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-gemini-api-key']
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE');
  res.json({
    status: 'online',
    service: 'LinguaPal AI Multi-Agent Backend',
    gemini_key_configured: hasEnvKey,
    timestamp: new Date().toISOString()
  });
});

// API Routes per agent
app.use('/api/orchestrator', orchestratorRoutes);
app.use('/api/reading', readingRoutes);
app.use('/api/pronunciation', pronunciationRoutes);
app.use('/api/listening', listeningRoutes);
app.use('/api/writing', writingRoutes);
app.use('/api/spelling', spellingRoutes);
app.use('/api/progress', progressRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error occurred',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 LinguaPal Backend running on http://localhost:${PORT}`);
  console.log(`🤖 Gemini API Key loaded from .env: ${Boolean(process.env.GEMINI_API_KEY ? 'Yes' : 'No')}`);
});
