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
    // Future placeholders for buy offsets if needed
    goldOffset: { mode: String, value: Number },
    silverOffset: { mode: String, value: Number }
}, { timestamps: true });

const RateSettings = mongoose.model('RateSettings', rateSettingsSchema);

export default RateSettings;
