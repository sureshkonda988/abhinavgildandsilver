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
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use('/music', express.static(path.join(__dirname, '../public/music')));

// Swagger Configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Abhinav Gold & Silver API',
            version: '1.0.0',
            description: 'API documentation for the Abhinav Gold & Silver website backend',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Local development server',
            },
        ],
    },
    apis: ['./server/index.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use(['/api/api-docs', '/api-docs'], swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: (req, file, cb) => {
        console.log("Filtering file:", file.originalname, "Type:", file.mimetype);
        const allowedTypes = /mp3|wav|ogg|mpeg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) return cb(null, true);
        cb(new Error('Only audio files (mp3, wav, ogg) are allowed!'));
    }
});

// MongoDB Connection
if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== "") {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log('Connected to MongoDB');
            startRatePolling();
        })
        .catch(err => console.error('MongoDB connection error:', err));
} else {
    console.warn("MONGODB_URI is missing or empty. Skipping database connection. Some features may not work, but music upload (local) should still function.");
}

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
    const lib = targetUrl.startsWith('https') ? https : http;
    const req = lib.get(targetUrl, { timeout: 5000 }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
});

/**
 * @openapi
 * /api/rates/live:
 *   get:
 *     summary: Get live rates from MongoDB (persisted polling)
 *     responses:
 *       200:
 *         description: Live rates text and timestamp
 *       404:
 *         description: No rates found
 */
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

/**
 * @openapi
 * /api/rates/proxy:
 *   get:
 *     summary: Proxy a request to an external rate URL
 *     parameters:
 *       - in: query
 *         name: url
 *         schema:
 *           type: string
 *         required: true
 *         description: The target URL to fetch
 *     responses:
 *       200:
 *         description: The raw response text
 *       400:
 *         description: No URL provided
 *       502:
 *         description: Proxy error
 */
app.get('/api/rates/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('No URL provided');
    try {
        const text = await fetchRaw(targetUrl);
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Cache-Control', 'no-cache');
        res.send(text);
    } catch (error) {
        res.status(502).send('Proxy error: ' + error.message);
    }
});

/**
 * @openapi
 * /api/rates/settings:
 *   get:
 *     summary: Get global rate settings
 *     responses:
 *       200:
 *         description: The global settings object
 */
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

/**
 * @openapi
 * /api/rates/settings:
 *   post:
 *     summary: Update global rate settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: The updated settings object
 */
app.post('/api/rates/settings', async (req, res) => {
    try {
        const { baseModifications, gold, silver, stockOverrides, ticker, videos, adminPassword, showModified, homeAudio, ratesAudio, isMusicEnabled } = req.body;

        const update = {};
        if (baseModifications !== undefined) update.baseModifications = baseModifications;
        if (gold !== undefined) update.goldOffset = gold;
        if (silver !== undefined) update.silverOffset = silver;
        if (stockOverrides !== undefined) update.stockOverrides = stockOverrides;
        if (ticker !== undefined) update.ticker = ticker;
        if (videos !== undefined) update.videos = videos;
        if (adminPassword !== undefined) update.adminPassword = adminPassword;
        if (showModified !== undefined) update.showModified = showModified;
        if (isMusicEnabled !== undefined) update.isMusicEnabled = isMusicEnabled;
        if (homeAudio !== undefined) update.homeAudio = homeAudio;
        if (ratesAudio !== undefined) update.ratesAudio = ratesAudio;

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

/**
 * @openapi
 * /api/videos:
 *   get:
 *     summary: Get all videos from the video library
 *     responses:
 *       200:
 *         description: Array of video objects
 */
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

/**
 * @openapi
 * /api/videos:
 *   post:
 *     summary: Update the video library
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               list:
 *                 type: array
 *     responses:
 *       200:
 *         description: The updated video list
 */
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

/**
 * @openapi
 * /api/music:
 *   get:
 *     summary: Get music settings
 *     responses:
 *       200:
 *         description: The music settings object
 */
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

/**
 * @openapi
 * /api/music:
 *   post:
 *     summary: Update music settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: The updated music settings object
 */
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

/**
 * @openapi
 * /api/music/upload:
 *   post:
 *     summary: Upload a new background music file
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload success message
 */
app.post('/api/music/upload', (req, res, next) => {
    console.log("Upload request received...");
    upload.single('file')(req, res, (err) => {
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

        // Always save to background.mp3
        const projectRoot = path.resolve(__dirname, '..');
        const musicDir = path.join(projectRoot, 'public', 'music');
        
        if (!fs.existsSync(musicDir)) {
            fs.mkdirSync(musicDir, { recursive: true });
        }

        const filePath = path.join(musicDir, 'background.mp3');
        fs.writeFileSync(filePath, req.file.buffer);

        console.log("File uploaded successfully to:", filePath);
        res.json({ message: "Background music uploaded successfully" });
    });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
