const authService = require('../services/authService');
const helpers = require('../utils/helpers');

const register = async (req, res, next) => {
    try {

        const identification = helpers.sanitizeInput(req.body.identification); 
        const email = helpers.sanitizeInput(req.body.email);
        const firstName = helpers.sanitizeInput(req.body.firstName);
        const lastName = helpers.sanitizeInput(req.body.lastName);
        const password = req.body.password;
        const type = helpers.sanitizeInput(req.body.type);
        const rol = helpers.sanitizeInput(req.body.rol);

        const result = await authService.registerUser({
            identification,
            email,
            password,
            firstName,
            lastName,
            type,
            rol
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email for verification.',
            data: result
        });

    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await authService.loginUser(email, password);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result
        });

    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const user = await authService.getUserProfile(req.user._id);
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

const requestPasswordReset = async (req, res, next) => {
    try {
        const { email } = req.body;
        const sanitizedEmail = helpers.sanitizeInput(email);

        await authService.requestPasswordReset(sanitizedEmail);

        res.status(200).json({
            success: true,
            message: 'If the email exists, a password reset link has been sent'
        });
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        await authService.resetPassword(token, newPassword);

        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        next(error);
    }
};

const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query;

        const result = await authService.verifyEmail(token);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;
        const sanitizedEmail = helpers.sanitizeInput(email);

        await authService.resendVerificationEmail(sanitizedEmail);

        res.status(200).json({
            success: true,
            message: 'Verification email sent if account exists and is not verified'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getProfile,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    resendVerification
};