const cors = require('cors');
const logger = require('../utils/logger');

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = process.env.ALLOWED_ORIGINS 
            ? process.env.ALLOWED_ORIGINS.split(',') 
            : ['http://localhost:3001', 'http://localhost:3000'];
        
        // Permitir requests sin origin (mobile apps, testing, etc.)
        if (!origin) {
            logger.debug('CORS: Request without origin allowed');
            return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin)) {
            logger.debug(`CORS: Origin ${origin} allowed`);
            callback(null, true);
        } else {
            logger.warn(`CORS: Origin ${origin} blocked`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
};

// Middleware para logging de CORS
const corsWithLogging = (req, res, next) => {
    const corsMiddleware = cors(corsOptions);
    corsMiddleware(req, res, (err) => {
        if (err) {
            logger.warn('CORS rejection', {
                origin: req.headers.origin,
                url: req.url,
                method: req.method
            });
            return res.status(403).json({
                success: false,
                message: 'CORS policy blocked this request'
            });
        }
        next();
    });
};

module.exports = corsWithLogging;