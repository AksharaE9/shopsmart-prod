const mongoose = require('mongoose');
const autoSeed = require('../utils/autoSeed');

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    // If connection exists and is connected, return it
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            serverSelectionTimeoutMS: 8000,
            bufferCommands: false,
        };

        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('❌ MONGODB_URI missing in environment variables!');
            throw new Error('MONGODB_URI environment variable is required');
        }

        console.log('🔌 Connecting to MongoDB...');
        cached.promise = mongoose.connect(mongoUri, opts).then(async (m) => {
            console.log(`✅ MongoDB Connected: ${m.connection.host}`);
            try {
                await autoSeed();
            } catch (seedErr) {
                console.error('Auto-seed warning:', seedErr.message);
            }
            return m;
        }).catch((err) => {
            cached.promise = null;
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.error(`⚠️ MongoDB Connection Failed: ${error.message}`);

        // Fallback to in-memory DB ONLY during local development (not on Vercel)
        if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
            console.log('🚀 Starting in-memory MongoDB server for local dev fallback...');
            try {
                const { MongoMemoryServer } = require('mongodb-memory-server');
                const mongoServer = await MongoMemoryServer.create();
                const mongoUri = mongoServer.getUri();
                process.env.MONGODB_URI = mongoUri;
                const conn = await mongoose.connect(mongoUri);
                console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
                await autoSeed();
                cached.conn = conn;
                return conn;
            } catch (memErr) {
                console.error(`❌ In-Memory MongoDB startup failed: ${memErr.message}`);
                throw memErr;
            }
        }
        throw error;
    }

    return cached.conn;
};

module.exports = connectDB;


