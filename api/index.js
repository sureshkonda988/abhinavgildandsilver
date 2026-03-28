import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import RateSettings from './models/RateSettings.js';
import https from 'https';
import http from 'http';

import LiveRate from './models/LiveRate.js';
import Video from './models/Video.js';
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
// Production build trigger - Syncing Video Refactor

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use('/music', express.static(path.join(__dirname, '../public/music')));
const upload = multer({ 
    storage: multer.memoryStorage(), // Switched to memory for simpler handling if needed for other things, but music upload is gone
    limits: { fileSize: 100 * 1024 * 1024 }
});
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
                url: '/api',
                description: 'Relative API path',
            },
        ],
    },
    apis: ['./api/index.js'], // Path to the API docs in production
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

// MongoDB Connection
if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== "") {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log('Connected to MongoDB');
        })
} else {
    console.warn("MONGODB_URI is missing or empty. Skipping database connection.");
}
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
        let settings = await RateSettings.findOne({ key: 'global_settings' }).select('-homeAudio -ratesAudio');
        if (!settings) {
            settings = await RateSettings.create({ key: 'global_settings' });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings', error: error.message });
    }
});

// 1.5 Get ONLY the massive audio base64 strings (to fetch exactly once on load)
app.get('/api/rates/audio', async (req, res) => {
    // Enable caching for audio so browsers definitely don't redownload it aggressively
    res.setHeader('Cache-Control', 'public, max-age=3600');
    try {
        await connectDB();
        let settings = await RateSettings.findOne({ key: 'global_settings' }).select('homeAudio ratesAudio');
        if (!settings) {
            settings = { homeAudio: '', ratesAudio: '' };
        }
        res.json({ homeAudio: settings.homeAudio, ratesAudio: settings.ratesAudio });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching audio', error: error.message });
    }
});

// 2. Update settings
app.post('/api/rates/settings', async (req, res) => {
    try {
        const { baseModifications, gold, silver, stockOverrides, ticker, videos, adminPassword, showModified, ratesPage, homeAudio, ratesAudio, marketStatus } = req.body;

        const update = {};
        if (baseModifications !== undefined) update.baseModifications = baseModifications;
        if (gold !== undefined) update.goldOffset = gold;
        if (silver !== undefined) update.silverOffset = silver;
        if (stockOverrides !== undefined) update.stockOverrides = stockOverrides;
        if (ticker !== undefined) update.ticker = ticker;
        if (videos !== undefined) update.videos = videos;
        if (adminPassword !== undefined) update.adminPassword = adminPassword;
        if (showModified !== undefined) update.showModified = showModified;
        if (ratesPage !== undefined) update.ratesPage = ratesPage;
        if (homeAudio !== undefined) update.homeAudio = homeAudio;
        if (ratesAudio !== undefined) update.ratesAudio = ratesAudio;
        if (marketStatus !== undefined) update.marketStatus = marketStatus;

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


// --- Separate Music Routes ---
app.post('/api/music/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Invalid request. Missing file.' });
        }

        // Always save to background.mp3 regardless of 'type'
        const projectRoot = path.resolve(__dirname, '..');
        const musicDir = path.join(projectRoot, 'public', 'music');
        
        try {
            if (!fs.existsSync(musicDir)) {
                fs.mkdirSync(musicDir, { recursive: true });
            }
            // Simple check if writable by trying to write and delete a tiny temp file
            const testFile = path.join(musicDir, '.write_test');
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
        } catch (e) {
            console.error("Music directory not writable:", e.message);
            return res.status(500).json({ 
                message: 'Server storage is read-only or permission denied', 
                error: e.message,
                path: musicDir
            });
        }

        const filePath = path.join(musicDir, 'background.mp3');
        fs.writeFileSync(filePath, req.file.buffer);

        console.log("File uploaded successfully to:", filePath);
        res.json({ message: "Background music uploaded successfully" });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ 
            message: 'Error uploading music', 
            error: error.message,
            stack: error.stack
        });
    }
});


if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
