import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import RateSettings from '../backend/api/models/RateSettings.js';
import LiveRate from '../backend/api/models/LiveRate.js';
import Video from '../backend/api/models/Video.js';
import Music from '../backend/api/models/Music.js';
import MusicLibrary from '../backend/api/models/MusicLibrary.js';
import https from 'https';
import http from 'http';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/abhinav_jewellers';

// In-Memory Fallbacks for when MongoDB is disconnected or not running
let inMemorySettings = {
    key: 'global_settings',
    ticker: 'Welcome to Abhinav Gold & Silver - Quality Purity Guaranteed',
    showModified: false,
    adminPassword: 'admin123',
    gold: { mode: 'amount', value: 0, isPaused: false, pausedBuy: 0, pausedSell: 0, isStopped: false },
    silver: { mode: 'amount', value: 0, isPaused: false, pausedBuy: 0, pausedSell: 0, isStopped: false },
    baseModifications: {
        gold999: { mode: 'amount', value: 0, isPaused: false, pausedBuy: 0, pausedSell: 0, isStopped: false },
        silver999: { mode: 'amount', value: 0, isPaused: false, pausedBuy: 0, pausedSell: 0, isStopped: false }
    },
    stockOverrides: {},
    ratesPage: {
        goldTable24k: { mode: 'amount', value: 0, isPaused: false, pausedBuy: 0, pausedSell: 0, isStopped: false },
        goldTable22k: { mode: 'amount', value: 0, isPaused: false, pausedBuy: 0, pausedSell: 0, isStopped: false },
        goldTable18k: { mode: 'amount', value: 0, isPaused: false, pausedBuy: 0, pausedSell: 0, isStopped: false },
        goldTable14k: { mode: 'amount', value: 0, isPaused: false, pausedBuy: 0, pausedSell: 0, isStopped: false },
        navarsuTable: { mode: 'amount', value: 0, isPaused: false, pausedBuy: 0, pausedSell: 0, isStopped: false },
        silverTable: { mode: 'amount', value: 0, isPaused: false, pausedBuy: 0, pausedSell: 0, isStopped: false },
        showModified: false
    },
    marketStatus: { mode: 'regular', modifiedStatus: 'open', openTime: '10:00', closeTime: '20:00', isStoppedAll: false }
};

let inMemoryVideos = [];
let inMemoryMusic = {
    key: 'music_settings',
    homeMusic: { sourceType: 'local', videoId: '', fileUrl: '', title: '' },
    ratesMusic: { sourceType: 'local', videoId: '', fileUrl: '', title: '' }
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use('/music', express.static(path.join(__dirname, '../public/music')));

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }
});

// MongoDB Connection with 2s timeout
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.warn('Running in standalone serverless mode (MongoDB disconnected):', err.message));

// --- Proxy Helper ---
const RB_GOLD_URL = 'https://bcast.rbgoldspot.com:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/rbgold';

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

// --- Routes ---

// 1. Live Rates (Instant response from cache or direct source)
app.get('/api/rates/live', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, s-maxage=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const now = new Date();

    if (mongoose.connection.readyState === 1) {
        try {
            let rate = await LiveRate.findOne({ key: 'current_rates' }).maxTimeMS(1000);
            if (rate && rate.rawText && (now - new Date(rate.timestamp)) < 2000) {
                return res.json({ text: rate.rawText, timestamp: rate.timestamp });
            }
        } catch (e) {}
    }

    try {
        const text = await fetchRaw(RB_GOLD_URL);
        if (text && text.length > 20) {
            if (mongoose.connection.readyState === 1) {
                LiveRate.findOneAndUpdate(
                    { key: 'current_rates' },
                    { rawText: text, timestamp: now },
                    { upsert: true }
                ).catch(() => {});
            }
            return res.json({ text, timestamp: now });
        }
    } catch (fetchErr) {
        console.error("Live Fetch Error:", fetchErr.message);
    }

    res.status(500).json({ message: 'Error fetching live rates' });
});

// 2. Server-side Rate Proxy
app.get('/api/rates/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('No URL provided');

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, s-maxage=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
        const text = await fetchRaw(targetUrl);
        res.setHeader('Content-Type', 'text/plain');
        res.send(text);
    } catch (error) {
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

// 3. Settings
app.get('/api/rates/settings', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, s-maxage=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (mongoose.connection.readyState === 1) {
        try {
            let settings = await RateSettings.findOne({ key: 'global_settings' }).maxTimeMS(1000);
            if (settings) return res.json(settings);
            settings = await RateSettings.create(inMemorySettings);
            return res.json(settings);
        } catch (error) {}
    }
    res.json(inMemorySettings);
});

// Settings Update Handler
const handleSettingsUpdate = async (req, res) => {
    try {
        const {
            gold, silver, baseModifications, stockOverrides, ratesPage, marketStatus,
            ticker, videos, adminPassword, showModified, homeAudio, ratesAudio, isMusicEnabled
        } = req.body;

        const update = {};
        if (gold !== undefined) update.gold = gold;
        if (silver !== undefined) update.silver = silver;
        if (baseModifications !== undefined) update.baseModifications = baseModifications;
        if (stockOverrides !== undefined) update.stockOverrides = stockOverrides;
        if (ratesPage !== undefined) update.ratesPage = ratesPage;
        if (marketStatus !== undefined) update.marketStatus = marketStatus;
        if (ticker !== undefined) update.ticker = ticker;
        if (videos !== undefined) update.videos = videos;
        if (adminPassword !== undefined) update.adminPassword = adminPassword;
        if (showModified !== undefined) update.showModified = showModified;
        if (homeAudio !== undefined) update.homeAudio = homeAudio;
        if (ratesAudio !== undefined) update.ratesAudio = ratesAudio;
        if (isMusicEnabled !== undefined) update.isMusicEnabled = isMusicEnabled;

        inMemorySettings = { ...inMemorySettings, ...update };

        if (mongoose.connection.readyState === 1) {
            const settings = await RateSettings.findOneAndUpdate(
                { key: 'global_settings' },
                { $set: update },
                { upsert: true, new: true }
            );
            return res.json(settings);
        }

        res.json(inMemorySettings);
    } catch (error) {
        res.status(500).json({ message: 'Error updating settings', error: error.message });
    }
};

app.post('/api/rates/settings', handleSettingsUpdate);
app.put('/api/rates/update', handleSettingsUpdate);
app.post('/api/rates/update', handleSettingsUpdate);

// --- Video Library Routes ---
app.get('/api/videos', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, s-maxage=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (mongoose.connection.readyState === 1) {
        try {
            let videoData = await Video.findOne({ key: 'video_library' }).maxTimeMS(1000);
            if (videoData) return res.json(videoData.list);
        } catch (error) {}
    }
    res.json(inMemoryVideos);
});

app.post('/api/videos', async (req, res) => {
    try {
        const { list } = req.body;
        inMemoryVideos = list || [];

        if (mongoose.connection.readyState === 1) {
            const videoData = await Video.findOneAndUpdate(
                { key: 'video_library' },
                { list },
                { upsert: true, new: true }
            );
            return res.json(videoData.list);
        }
        res.json(inMemoryVideos);
    } catch (error) {
        res.status(500).json({ message: 'Error saving videos', error: error.message });
    }
});

// --- Music Routes ---
app.get('/api/music', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, s-maxage=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (mongoose.connection.readyState === 1) {
        try {
            let musicData = await Music.findOne({ key: 'music_settings' }).maxTimeMS(1000);
            if (musicData) return res.json(musicData);
        } catch (error) {}
    }
    res.json(inMemoryMusic);
});

app.post('/api/music', async (req, res) => {
    try {
        const { homeMusic, ratesMusic } = req.body;
        const update = {};
        if (homeMusic !== undefined) update.homeMusic = homeMusic;
        if (ratesMusic !== undefined) update.ratesMusic = ratesMusic;

        inMemoryMusic = { ...inMemoryMusic, ...update };

        if (mongoose.connection.readyState === 1) {
            const musicData = await Music.findOneAndUpdate(
                { key: 'music_settings' },
                { $set: update },
                { upsert: true, new: true }
            );
            return res.json(musicData);
        }
        res.json(inMemoryMusic);
    } catch (error) {
        res.status(500).json({ message: 'Error saving music', error: error.message });
    }
});

// --- Music Library Routes ---
app.get('/api/music/library', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, s-maxage=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (mongoose.connection.readyState === 1) {
        try {
            const library = await MusicLibrary.find().sort({ createdAt: -1 }).maxTimeMS(1000);
            return res.json(library);
        } catch (error) {}
    }
    res.json([]);
});

app.post('/api/music/library/upload', (req, res) => {
    upload.single('file')(req, res, async (err) => {
        if (err) return res.status(400).json({ success: false, message: err.message });
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        try {
            const title = req.body.title || req.file.originalname;
            const fileUrl = `/music/${Date.now()}-${Math.round(Math.random() * 1E9)}.mp3`;

            let newTrack = { _id: Date.now().toString(), title, filename: req.file.originalname, url: fileUrl, size: req.file.size, createdAt: new Date() };

            if (mongoose.connection.readyState === 1) {
                newTrack = await MusicLibrary.create({
                    title,
                    filename: req.file.originalname,
                    url: fileUrl,
                    size: req.file.size,
                    mimeType: req.file.mimetype
                });
            }

            res.json({ success: true, data: newTrack, message: 'Music uploaded successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error saving music: ' + error.message });
        }
    });
});

app.delete('/api/music/library/:id', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            await MusicLibrary.findByIdAndDelete(req.params.id);
        }
        res.json({ success: true, message: 'Track deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting track: ' + error.message });
    }
});

export default app;
