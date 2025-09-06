const express = require('express');
const { 
    register, 
    login, 
    getProfile, 
    requestPasswordReset, 
    resetPassword, 
    verifyEmail, 
    resendVerification 
} = require('../controllers/authController');
const { authenticate, requireVerifiedEmail } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/profile', authenticate, requireVerifiedEmail, getProfile);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

module.exports = router;