import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const ATLAS_URI = process.env.MONGODB_URI;

async function cleanup() {
    console.log("🚀 Starting Database Cleanup...");

    try {
        await mongoose.connect(ATLAS_URI);
        console.log("✅ Connected to Atlas");

        const db = mongoose.connection.db;
        const collection = db.collection('ratesettings');

        // Remove the 'videos' field from all documents in the 'ratesettings' collection
        const result = await collection.updateMany(
            { videos: { $exists: true } },
            { $unset: { videos: "" } }
        );

        console.log(`✅ Cleanup finished. Updated ${result.modifiedCount} documents.`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("❌ Cleanup Failed:", err);
        process.exit(1);
    }
}

cleanup();
