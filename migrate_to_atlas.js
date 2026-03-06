import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RateSettings from './api/models/RateSettings.js';
import LiveRate from './api/models/LiveRate.js';

dotenv.config();

const LOCAL_URI = "mongodb://127.0.0.1:27017/abhinav_jewellers";
const ATLAS_URI = process.env.MONGODB_URI;

async function migrate() {
    console.log("🚀 Starting Migration...");

    try {
        // 1. Connect to Local
        console.log("🔗 Connecting to Local MongoDB...");
        const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        console.log("✅ Connected to Local");

        // 2. Connect to Atlas
        console.log("🔗 Connecting to MongoDB Atlas...");
        const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
        console.log("✅ Connected to Atlas");

        // Define Models for specific connections
        const LocalSettings = localConn.model('RateSettings', RateSettings.schema);
        const LocalLiveRate = localConn.model('LiveRate', LiveRate.schema);

        const AtlasSettings = atlasConn.model('RateSettings', RateSettings.schema);
        const AtlasLiveRate = atlasConn.model('LiveRate', LiveRate.schema);

        // 3. Migrate RateSettings
        console.log("📦 Migrating RateSettings...");
        const settings = await LocalSettings.find({});
        console.log(`Found ${settings.length} settings records.`);
        for (const doc of settings) {
            const data = doc.toObject();
            delete data._id; // Let Atlas generate new IDs or use upsert
            await AtlasSettings.findOneAndUpdate({ key: data.key }, data, { upsert: true });
        }
        console.log("✅ RateSettings Migrated");

        // 4. Migrate LiveRate
        console.log("📦 Migrating LiveRate...");
        const rates = await LocalLiveRate.find({});
        console.log(`Found ${rates.length} rate records.`);
        for (const doc of rates) {
            const data = doc.toObject();
            delete data._id;
            await AtlasLiveRate.findOneAndUpdate({ key: data.key }, data, { upsert: true });
        }
        console.log("✅ LiveRates Migrated");

        console.log("🎉 Migration Finished Successfully!");

        await localConn.close();
        await atlasConn.close();
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration Failed:", err);
        process.exit(1);
    }
}

migrate();
