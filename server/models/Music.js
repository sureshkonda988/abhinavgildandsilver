import mongoose from 'mongoose';

const musicSchema = new mongoose.Schema({
    key: {
        type: String,
        default: 'music_settings',
        unique: true
    },
    homeMusic: {
        sourceType: { type: String, enum: ['youtube', 'local'], default: 'youtube' },
        videoId: String,
        fileUrl: String,
        title: String
    },
    ratesMusic: {
        sourceType: { type: String, enum: ['youtube', 'local'], default: 'youtube' },
        videoId: String,
        fileUrl: String,
        title: String
    }
}, { timestamps: true });

const Music = mongoose.model('Music', musicSchema);

export default Music;
