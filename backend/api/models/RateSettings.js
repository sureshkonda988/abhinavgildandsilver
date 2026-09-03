import mongoose from 'mongoose';

const rateSettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        default: 'global_settings',
        unique: true
    },
    gold: {
        type: mongoose.Schema.Types.Mixed,
        default: { mode: 'amount', value: 0, isPaused: false, pausedBuy: 0, pausedSell: 0, isStopped: false }
    },
    silver: {
        type: mongoose.Schema.Types.Mixed,
        default: { mode: 'amount', value: 0, isPaused: false, pausedBuy: 0, pausedSell: 0, isStopped: false }
    },
    baseModifications: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            gold999: { mode: 'amount', value: 0, isPaused: false, pausedBuy: 0, pausedSell: 0, isStopped: false },
            silver999: { mode: 'amount', value: 0, isPaused: false, pausedBuy: 0, pausedSell: 0, isStopped: false }
        }
    },
    stockOverrides: {
        type: Map,
        of: Boolean,
        default: {}
    },
    ratesPage: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    marketStatus: {
        type: mongoose.Schema.Types.Mixed,
        default: { mode: 'regular', modifiedStatus: 'open', openTime: '10:00', closeTime: '20:00', isStoppedAll: false }
    },
    ticker: {
        type: String,
        default: 'Welcome to Abhinav Gold & Silver - Quality Purity Guaranteed'
    },
    adminPassword: {
        type: String,
        default: 'admin123'
    },
    homeAudio: { type: String, default: '' },
    ratesAudio: { type: String, default: '' },
    goldOffset: { type: mongoose.Schema.Types.Mixed },
    silverOffset: { type: mongoose.Schema.Types.Mixed },
    showModified: { type: Boolean, default: false },
    isMusicEnabled: { type: Boolean, default: false }
}, { strict: false, timestamps: true });

const RateSettings = mongoose.model('RateSettings', rateSettingsSchema);

export default RateSettings;
