const { verifyToken } = require('../config/jwt');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
    
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id).select('-password');

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        req.user = user;
        next();
        
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

const requireVerifiedEmail = (req, res, next) => {
    if (!req.user.emailVerified) {
        return res.status(403).json({
            success: false,
            message: 'Email verification required to access this resource'
        });
    }
    next();
};

module.exports = { authenticate, requireVerifiedEmail };