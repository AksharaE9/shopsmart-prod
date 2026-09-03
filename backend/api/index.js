module.exports = (req, res) => {
    try {
        const app = require('../src/server');
        return app(req, res);
    } catch (err) {
        console.error('Serverless Handler Error:', err);
        return res.status(500).json({
            error: 'Serverless Function Error',
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};
