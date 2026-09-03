import mongoose from 'mongoose';

const musicLibrarySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    size: {
        type: Number
    },
    mimeType: {
        type: String
    }
}, { timestamps: true });

const MusicLibrary = mongoose.model('MusicLibrary', musicLibrarySchema);

export default MusicLibrary;
