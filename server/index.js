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
import MusicLibrary from './models/MusicLibrary.js';
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

const options = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Abhinav Gold & Silver API Docs",
    customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
};

app.use(['/api/api-docs', '/api-docs'], swaggerUi.serve, swaggerUi.setup(swaggerSpec, options));

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

// Helper to parse XML rates
const parseRatesFromXml = (xmlText) => {
    const items = [...xmlText.matchAll(/<RateDetails>(.*?)<\/RateDetails>/gs)];
    const rates = {};
    items.forEach(match => {
        const itemXml = match[1];
        const id = (itemXml.match(/<SymbolId>(.*?)<\/SymbolId>/) || [])[1];
        const bid = (itemXml.match(/<Bid>(.*?)<\/Bid>/) || [])[1];
        const ask = (itemXml.match(/<Ask>(.*?)<\/Ask>/) || [])[1];
        if (id) {
            rates[id] = {
                bid: parseFloat(bid) || 0,
                ask: parseFloat(ask) || 0
            };
        }
    });
    return rates;
};

// Tracks and calculates modified rates + high/low
const processModifiedRates = (xmlText, settings, existingData) => {
    const rawData = parseRatesFromXml(xmlText);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Check for daily reset
    const lastReset = existingData.lastReset ? new Date(existingData.lastReset).getTime() : 0;
    const shouldReset = today > lastReset;
    const updatedRates = shouldReset ? {} : (existingData.rates || {});
    
    // Modification logic
    const baseMods = settings.baseModifications || { gold999: { value: 0 }, silver999: { value: 0 } };
    
    Object.keys(rawData).forEach(id => {
        const item = rawData[id];
        const isGold = id === '945';
        const isSilver = ['2966', '2987'].includes(id);
        
        let modValue = 0;
        let mode = 'amount';
        if (isGold) {
            modValue = baseMods.gold999?.value || 0;
            mode = baseMods.gold999?.mode || 'amount';
        } else if (isSilver) {
            modValue = baseMods.silver999?.value || 0;
            mode = baseMods.silver999?.mode || 'amount';
        }
        
        let modifiedRate = item.ask;
        if (modValue !== 0) {
            if (mode === 'percent') {
                modifiedRate += modifiedRate * (modValue / 100);
            } else {
                modifiedRate += modValue;
            }
        }
        modifiedRate = Math.floor(modifiedRate);

        const current = updatedRates[id] || { rate: modifiedRate, high: modifiedRate, low: modifiedRate };
        
        updatedRates[id] = {
            rate: modifiedRate,
            high: Math.max(current.high, modifiedRate),
            low: Math.min(current.low, modifiedRate)
        };
    });
    
    return { rates: updatedRates, resetDate: shouldReset ? now : existingData.lastReset };
};

async function startRatePolling() {
    console.log("Starting server-side rate polling loop...");

    const poll = async () => {
        try {
            const text = await fetchRaw(RB_GOLD_URL);
            if (text && text.length > 50) {
                const rateDoc = await LiveRate.findOne({ key: 'current_rates' });
                const settings = await RateSettings.findOne({ key: 'global_settings' }) || { baseModifications: { gold999: { value: 0 }, silver999: { value: 0 } } };
                
                const existingData = rateDoc ? { rates: Object.fromEntries(rateDoc.rates || new Map()), lastReset: rateDoc.lastReset } : { rates: {}, lastReset: new Date() };
                const { rates: calculatedRates, resetDate } = processModifiedRates(text, settings, existingData);

                await LiveRate.findOneAndUpdate(
                    { key: 'current_rates' },
                    { 
                        rawText: text, 
                        timestamp: new Date(),
                        rates: calculatedRates,
                        lastReset: resetDate
                    },
                    { upsert: true, new: true }
                );
            }
        } catch (e) {
            console.error("Poll Error:", e.message);
        }
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
 *     summary: Get live rates from MongoDB (persisted polling) + Modified High/Low
 *     responses:
 *       200:
 *         description: Live rates text, structured rates, and timestamp
 *       404:
 *         description: No rates found
 */
app.get('/api/rates/live', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, s-maxage=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
        let rateDoc = await LiveRate.findOne({ key: 'current_rates' });
        let settings = await RateSettings.findOne({ key: 'global_settings' }) || { baseModifications: { gold999: { value: 0 }, silver999: { value: 0 } } };
        
        const now = new Date();
        const isStale = !rateDoc || (now - new Date(rateDoc.timestamp)) > 1500; 

        if (isStale) {
            try {
                const text = await fetchRaw(RB_GOLD_URL);
                if (text && text.length > 50) {
                    const existingData = rateDoc ? { rates: Object.fromEntries(rateDoc.rates || new Map()), lastReset: rateDoc.lastReset } : { rates: {}, lastReset: now };
                    const { rates: calculatedRates, resetDate } = processModifiedRates(text, settings, existingData);
                    
                    rateDoc = await LiveRate.findOneAndUpdate(
                        { key: 'current_rates' },
                        { 
                            rawText: text, 
                            timestamp: now,
                            rates: calculatedRates,
                            lastReset: resetDate
                        },
                        { upsert: true, new: true }
                    );
                }
            } catch (fetchErr) {
                console.error("Lazy Fetch Error:", fetchErr.message);
            }
        }

        if (!rateDoc) return res.status(404).send('No rates found in database');

        const symbolId = req.query.id;
        if (symbolId) {
            const mappedRates = Object.fromEntries(rateDoc.rates || new Map());
            const data = mappedRates[symbolId];
            if (data) {
                return res.json({
                    rate: data.rate,
                    high: data.high,
                    low: data.low
                });
            }
            return res.status(404).json({ message: 'Symbol not found' });
        }

        res.json({ 
            text: rateDoc.rawText, 
            timestamp: rateDoc.timestamp,
            rates: Object.fromEntries(rateDoc.rates || new Map())
        });
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

        const update = {};
        if (homeMusic !== undefined) update.homeMusic = homeMusic;
        if (ratesMusic !== undefined) update.ratesMusic = ratesMusic;

        const musicData = await Music.findOneAndUpdate(
            { key: 'music_settings' },
            update,
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

/**
 * @openapi
 * /api/music/library/upload:
 *   post:
 *     summary: Upload music to library
 */
app.post('/api/music/library/upload', (req, res) => {
    upload.single('file')(req, res, async (err) => {
        if (err) return res.status(400).json({ success: false, message: err.message });
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        try {
            const musicDir = path.join(path.resolve(__dirname, '..'), 'public', 'music');
            if (!fs.existsSync(musicDir)) fs.mkdirSync(musicDir, { recursive: true });

            const filename = Date.now() + path.extname(req.file.originalname);
            const filePath = path.join(musicDir, filename);
            
            fs.writeFileSync(filePath, req.file.buffer);

            const newMusic = await MusicLibrary.create({
                title: req.body.title || req.file.originalname,
                filename: filename,
                url: `/music/${filename}`,
                uploadedBy: 'Admin'
            });

            res.json({ success: true, message: 'Music uploaded successfully', data: newMusic });
        } catch (error) {
            console.error("Library Upload Error:", error);
            res.status(500).json({ success: false, message: 'Upload failed: ' + error.message });
        }
    });
});

/**
 * @openapi
 * /api/music/library:
 *   get:
 *     summary: Get all music from library
 */
app.get('/api/music/library', async (req, res) => {
    try {
        const music = await MusicLibrary.find().sort({ createdAt: -1 });
        res.json(music);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @openapi
 * /api/music/library/{id}:
 *   delete:
 *     summary: Delete music from library
 */
app.delete('/api/music/library/:id', async (req, res) => {
    try {
        const music = await MusicLibrary.findById(req.params.id);
        if (!music) return res.status(404).json({ success: false, message: 'Music not found' });

        const filePath = path.join(path.resolve(__dirname, '..'), 'public', 'music', music.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await MusicLibrary.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Music deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
