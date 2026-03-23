import mongoose from 'mongoose';

const rateSettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        default: 'global_settings',
        unique: true
    },
    baseModifications: {
        gold999: {
            mode: { type: String, default: 'amount' },
            value: { type: Number, default: 0 }
        },
        silver999: {
            mode: { type: String, default: 'amount' },
            value: { type: Number, default: 0 }
        }
    },
    stockOverrides: {
        type: Map,
        of: Boolean,
        default: {}
    },
    ticker: {
        type: String,
        default: 'Welcome to Abhinav Gold & Silver - Quality Purity Guaranteed'
    },
    adminPassword: {
        type: String,
        default: 'admin123'
    },
    goldOffset: { mode: String, value: Number },
    silverOffset: { mode: String, value: Number },
    showModified: { type: Boolean, default: false },
    ratesPage: {
        gold: { mode: { type: String, default: 'amount' }, value: { type: Number, default: 0 } },
        silver: { mode: { type: String, default: 'amount' }, value: { type: Number, default: 0 } },
        showModified: { type: Boolean, default: false }
    },
    homeAudio: { type: String, default: '' },
    ratesAudio: { type: String, default: '' }
}, { timestamps: true });

const RateSettings = mongoose.model('RateSettings', rateSettingsSchema);

export default RateSettings;
