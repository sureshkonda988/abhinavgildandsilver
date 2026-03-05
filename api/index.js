import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import RateSettings from './models/RateSettings.js';
import https from 'https';
import http from 'http';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Proxy Helper ---
const fetchRaw = (targetUrl) => new Promise((resolve, reject) => {
    const lib = targetUrl.startsWith('https') ? https : http;
    const req = lib.get(targetUrl, { timeout: 3000 }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
});

// Routes
// 0. Server-side rate proxy (no CORS, no rate limits)
app.get('/api/rates/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('No URL provided');
    try {
        const text = await fetchRaw(targetUrl);
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.send(text);
    } catch (error) {
        res.status(502).send('Proxy error: ' + error.message);
    }
});

// 1. Get current settings
app.get('/api/rates/settings', async (req, res) => {
    try {
        let settings = await RateSettings.findOne({ key: 'global_settings' });
        if (!settings) {
            // Create default if not exists
            settings = await RateSettings.create({ key: 'global_settings' });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings', error: error.message });
    }
});

// 2. Update settings
app.post('/api/rates/settings', async (req, res) => {
    try {
        const { baseModifications, gold, silver, stockOverrides, ticker, videos, adminPassword } = req.body;

        const update = {};
        if (baseModifications !== undefined) update.baseModifications = baseModifications;
        if (gold !== undefined) update.goldOffset = gold;
        if (silver !== undefined) update.silverOffset = silver;
        if (stockOverrides !== undefined) update.stockOverrides = stockOverrides;
        if (ticker !== undefined) update.ticker = ticker;
        if (videos !== undefined) update.videos = videos;
        if (adminPassword !== undefined) update.adminPassword = adminPassword;

        const settings = await RateSettings.findOneAndUpdate(
            { key: 'global_settings' },
            update,
            { upsert: true, new: true }
        );

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error updating settings', error: error.message });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
