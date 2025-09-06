const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Función para generar JWT tokens
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Función para generar tokens aleatorios (para verificación email, reset password, etc.)
const generateRandomToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

module.exports = {
    generateToken,
    generateRandomToken,
    verifyToken
};