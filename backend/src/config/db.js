const mongoose = require('mongoose');
const autoSeed = require('../utils/autoSeed');

const connectDB = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        await autoSeed();
    } catch (error) {
        console.warn(`⚠️ Remote MongoDB connection failed (${error.message}).`);
        console.log('🚀 Starting in-memory MongoDB server for development/testing...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            process.env.MONGODB_URI = mongoUri;
            const conn = await mongoose.connect(mongoUri);
            console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
            await autoSeed();
        } catch (memErr) {
            console.error(`❌ In-Memory MongoDB startup failed: ${memErr.message}`);
            process.exit(1);
        }
    }
};

module.exports = connectDB;

