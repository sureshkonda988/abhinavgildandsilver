import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import RateSettings from './models/RateSettings.js';

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

// Routes
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
        const { baseModifications, gold, silver } = req.body;

        const update = {
            baseModifications,
            goldOffset: gold,
            silverOffset: silver
        };

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
