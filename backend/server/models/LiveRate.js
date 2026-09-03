import mongoose from 'mongoose';

const liveRateSchema = new mongoose.Schema({
    key: {
        type: String,
        default: 'current_rates',
        unique: true
    },
    rawText: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const LiveRate = mongoose.model('LiveRate', liveRateSchema);

export default LiveRate;
