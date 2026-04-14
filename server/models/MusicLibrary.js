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
    uploadedBy: {
        type: String,
        default: 'Admin'
    }
}, { timestamps: true });

const MusicLibrary = mongoose.model('MusicLibrary', musicLibrarySchema);

export default MusicLibrary;
