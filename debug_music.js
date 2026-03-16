import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function debugMusic() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const musicSchema = new mongoose.Schema({
            homeMusic: {
                videoId: String,
                title: String,
                sourceType: { type: String, default: 'youtube' },
                fileUrl: String
            },
            ratesMusic: {
                videoId: String,
                title: String,
                sourceType: { type: String, default: 'youtube' },
                fileUrl: String
            }
        });

        const Music = mongoose.model('Music', musicSchema, 'musics');
        const data = await Music.findOne();
        
        console.log("--- Music Data ---");
        console.log(JSON.stringify(data, null, 2));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugMusic();
