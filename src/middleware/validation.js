const validator = require('validator');
const helpers = require('../utils/helpers');

const validateRegister = (req, res, next) => {
    
    const { email, password, firstName, lastName } = req.body;

    if (!email || !validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address'
        });
    }

    if (!password || password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long'
        });
    }

    if (!firstName || firstName.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: 'First name must be at least 2 characters long'
        });
    }

    if (!lastName || lastName.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Last name must be at least 2 characters long'
        });
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }

    next();
};

const validateObjectId = (req, res, next) => {
    const { id } = req.params;
    
    if (!helpers.isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid user ID format'
        });
    }
    
    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateObjectId
};