const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB().catch(err => console.error('Initial DB connection error:', err.message));

// Middleware to ensure DB connection is ready before handling API request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (dbErr) {
        console.error(`[DB Middleware Error] ${req.method} ${req.url}:`, dbErr.message);
        return res.status(500).json({
            message: 'Database connection failed',
            error: dbErr.message
        });
    }
});


// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8080',
    'https://shopsmart-prod.vercel.app',
    'https://shopsmart-hazel.vercel.app',
    process.env.CLIENT_URL,
].filter(Boolean).map(o => o.replace(/\/$/, '')); // Remove trailing slashes

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        const normalizedOrigin = origin.replace(/\/$/, '');
        if (
            allowedOrigins.includes(normalizedOrigin) ||
            /\.vercel\.app$/.test(normalizedOrigin)
        ) {
            callback(null, true);
        } else {
            console.error(`[CORS] Rejected: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
            callback(new Error(`CORS blocked for origin: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

app.use(express.json({ limit: '256mb' }));
app.use(express.urlencoded({ extended: false, limit: '256mb' }));
app.use(morgan('dev'));

// Static files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/outlets', require('./routes/outlet.routes'));
app.use('/api/admin/analytics', require('./routes/analytics.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/bulk', require('./routes/bulk.routes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Retail Connect Pro API is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    // Ensure CORS headers are present even on errors
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin.replace(/\/$/, ''))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    console.error(`[Error Handler] ${req.method} ${req.url}:`, err.stack || err);
    
    res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
});

if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
