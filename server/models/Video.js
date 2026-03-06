import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
    key: {
        type: String,
        default: 'video_library',
        unique: true
    },
    list: [{
        videoId: String,
        title: String
    }]
}, { timestamps: true });

const Video = mongoose.model('Video', videoSchema);

export default Video;
