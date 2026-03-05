import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
// Load .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Configuration
const CERT_FOLDER = 'Certificates';
const VIDEO_FOLDER = 'Videos';

const ALLOWED_EXTENSIONS_IMG = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);
const ALLOWED_EXTENSIONS_PDF = new Set(['.pdf']);
const ALLOWED_EXTENSIONS_VIDEO = new Set(['.mp4', '.webm', '.ogg', '.mov']);
const MEDIA_EXTENSIONS = new Set([...ALLOWED_EXTENSIONS_IMG, ...ALLOWED_EXTENSIONS_PDF, ...ALLOWED_EXTENSIONS_VIDEO]);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.static(path.join(__dirname, '../dist')));
app.use(`/${CERT_FOLDER}`, express.static(CERT_FOLDER));
app.use(`/${VIDEO_FOLDER}`, express.static(VIDEO_FOLDER));

// Caching middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/proxy')) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  } else if (MEDIA_EXTENSIONS.has(path.extname(req.path).toLowerCase())) {
    res.set('Cache-Control', 'max-age=3600');
  } else {
    res.set('Cache-Control', 'no-cache');
  }
  next();
});

// Ensure folders exist
[CERT_FOLDER, VIDEO_FOLDER].forEach(folder => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
});

// API: Config
app.get('/api/config', (req, res) => {
  res.json({
    VITE_GRAFANA_URL: process.env.VITE_GRAFANA_URL || "",
    VITE_EXCEL_URL: process.env.VITE_EXCEL_URL || ""
  });
});

// API: Certificates
app.get('/api/certificates', (req, res) => {
  try {
    const files = fs.readdirSync(CERT_FOLDER)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ALLOWED_EXTENSIONS_IMG.has(ext) || ALLOWED_EXTENSIONS_PDF.has(ext);
      })
      .sort();
    res.json(files);
  } catch (error) {
    console.error("Error in /api/certificates:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API: Videos (includes images for media gallery)
app.get('/api/videos', (req, res) => {
  try {
    const files = fs.readdirSync(VIDEO_FOLDER)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ALLOWED_EXTENSIONS_VIDEO.has(ext) || ALLOWED_EXTENSIONS_IMG.has(ext);
      })
      .sort();
    res.json(files);
  } catch (error) {
    console.error("Error in /api/videos:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Serve index.html for SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log('🚀 Dashboard Server Running (Node.js/Express)');
  console.log(`   http://localhost:${PORT}`);
  console.log(`   API: /api/certificates`);
  console.log(`   API: /api/videos`);
  console.log('='.repeat(60));
});
