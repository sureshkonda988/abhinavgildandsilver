import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import RateSettings from './models/RateSettings.js';
import https from 'https';
import http from 'http';

import LiveRate from './models/LiveRate.js';
import Video from './models/Video.js';
import Music from './models/Music.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
// Production build trigger - Syncing Video Refactor

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use('/music', express.static(path.join(__dirname, '../public/music')));

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../public/music');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: (req, file, cb) => {
        console.log("Filtering file (API):", file.originalname, "Type:", file.mimetype);
        const allowedTypes = /mp3|wav|ogg|mpeg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) return cb(null, true);
        cb(new Error('Only audio files (mp3, wav, ogg) are allowed!'));
    }
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        startRatePolling();
    })
    .catch(err => console.error('MongoDB connection error:', err));

// --- Rate Polling Service ---
const RB_GOLD_URL = 'https://bcast.rbgoldspot.com:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/rbgold';

async function startRatePolling() {
    console.log("Starting server-side rate polling loop...");

    const poll = async () => {
        try {
            const text = await fetchRaw(RB_GOLD_URL);
            if (text && text.length > 50) {
                await LiveRate.findOneAndUpdate(
                    { key: 'current_rates' },
                    { rawText: text, timestamp: new Date() },
                    { upsert: true, new: true }
                );
            }
        } catch (e) {
            console.error("Poll Error:", e.message);
        }
        // Poll every 1 second
        setTimeout(poll, 1000);
    };

    poll();
}

// --- Proxy Helper ---
const fetchRaw = (targetUrl) => new Promise((resolve, reject) => {
    try {
        const lib = targetUrl.startsWith('https') ? https : http;
        const req = lib.get(targetUrl, { timeout: 4000 }, (res) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(`Status: ${res.statusCode}`));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', (err) => reject(new Error(`Conn Error: ${err.message}`)));
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    } catch (e) {
        reject(e);
    }
});

// Routes
// New: Get persisted live rates from MongoDB
app.get('/api/rates/live', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, s-maxage=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
        let rate = await LiveRate.findOne({ key: 'current_rates' });
        const now = new Date();
        const isStale = !rate || (now - new Date(rate.timestamp)) > 1500; // Stale if > 1.5s

        if (isStale) {
            // Lazy Fetch: Trigger fetch immediately if data is stale
            try {
                const text = await fetchRaw(RB_GOLD_URL);
                if (text && text.length > 50) {
                    rate = await LiveRate.findOneAndUpdate(
                        { key: 'current_rates' },
                        { rawText: text, timestamp: now },
                        { upsert: true, new: true }
                    );
                }
            } catch (fetchErr) {
                console.error("Lazy Fetch Error:", fetchErr.message);
                // Fallback to whatever we have if fetch fails
            }
        }

        if (!rate) return res.status(404).send('No rates found in database');
        res.json({ text: rate.rawText, timestamp: rate.timestamp });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching live rates', error: error.message });
    }
});

// 0. Server-side rate proxy (no CORS, no rate limits)
app.get('/api/rates/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('No URL provided');

    // Add aggressive caching prevention
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, s-maxage=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
        const text = await fetchRaw(targetUrl);
        res.setHeader('Content-Type', 'text/plain');
        res.send(text);
    } catch (error) {
        // AUTOMATIC FALLBACK: If IP-based fetch fails on the server, try the hostname endpoint
        if (targetUrl.includes('13.201.9.242')) {
            try {
                const fallbackUrl = targetUrl.replace('http://13.201.9.242', 'https://bcast.rbgoldspot.com');
                const text = await fetchRaw(fallbackUrl);
                res.setHeader('Content-Type', 'text/plain');
                return res.send(text);
            } catch (fallbackError) {
                return res.status(502).send('Proxy error: ' + fallbackError.message);
            }
        }
        res.status(502).send('Proxy error: ' + error.message);
    }
});

// 1. Get current settings
app.get('/api/rates/settings', async (req, res) => {
    // Disable API caching to prevent stale responses (User Requirement #4)
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, s-maxage=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
        let settings = await RateSettings.findOne({ key: 'global_settings' });
        if (!settings) {
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
        const { baseModifications, gold, silver, stockOverrides, ticker, videos, adminPassword, showModified } = req.body;

        const update = {};
        if (baseModifications !== undefined) update.baseModifications = baseModifications;
        if (gold !== undefined) update.goldOffset = gold;
        if (silver !== undefined) update.silverOffset = silver;
        if (stockOverrides !== undefined) update.stockOverrides = stockOverrides;
        if (ticker !== undefined) update.ticker = ticker;
        if (videos !== undefined) update.videos = videos;
        if (adminPassword !== undefined) update.adminPassword = adminPassword;
        if (showModified !== undefined) update.showModified = showModified;

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

// --- Separate Video Library Routes ---

// 1. Get all videos
app.get('/api/videos', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, s-maxage=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
        let videoData = await Video.findOne({ key: 'video_library' });
        if (!videoData) {
            videoData = await Video.create({ key: 'video_library', list: [] });
        }
        res.json(videoData.list);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching videos', error: error.message });
    }
});

// 2. Update video library
app.post('/api/videos', async (req, res) => {
    try {
        const { list } = req.body;

        const videoData = await Video.findOneAndUpdate(
            { key: 'video_library' },
            { list },
            { upsert: true, new: true }
        );

        res.json(videoData.list);
    } catch (error) {
        res.status(500).json({ message: 'Error saving videos', error: error.message });
    }
});

// --- Music Library Routes ---

// 1. Get music settings
app.get('/api/music', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, s-maxage=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
        let musicData = await Music.findOne({ key: 'music_settings' });
        if (!musicData) {
            musicData = await Music.create({ key: 'music_settings', homeMusic: { videoId: '', title: '' }, ratesMusic: { videoId: '', title: '' } });
        }
        res.json(musicData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching music', error: error.message });
    }
});

// 2. Update music settings
app.post('/api/music', async (req, res) => {
    try {
        const { homeMusic, ratesMusic } = req.body;

        const musicData = await Music.findOneAndUpdate(
            { key: 'music_settings' },
            { homeMusic, ratesMusic },
            { upsert: true, new: true }
        );

        res.json(musicData);
    } catch (error) {
        res.status(500).json({ message: 'Error saving music', error: error.message });
    }
});

// 3. Upload music file
app.post('/api/music/upload', (req, res, next) => {
    console.log("Upload request received (API)...");
    upload.single('music')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error("Multer Error:", err);
            return res.status(400).json({ message: 'Multer Error: ' + err.message });
        } else if (err) {
            console.error("Unknown Music Upload Error:", err);
            return res.status(500).json({ message: 'Upload Error: ' + err.message });
        }
        
        if (!req.file) {
            console.warn("Upload failed: No file in request");
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log("File uploaded successfully (API):", req.file.filename);
        const fileUrl = `/music/${req.file.filename}`;
        res.json({ fileUrl });
    });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
