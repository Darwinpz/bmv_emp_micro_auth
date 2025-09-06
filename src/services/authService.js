const User = require('../models/User');
const { generateToken, generateRandomToken } = require('../config/jwt');
const logger = require('../utils/logger');
const EmailService = require('./emailService');

class AuthService {
    constructor() {
        this.emailService = new EmailService();
    }

    async registerUser(userData) {
        try {
            // Verificar si el usuario ya existe
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                throw new Error('User already exists with this email');
            }

            // Crear nuevo usuario con email no verificado
            const user = new User({
                ...userData,
                emailVerified: false,
                verificationToken: generateRandomToken(32),
                verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
                isActive: true // Usuario activo pero email no verificado
            });
            await user.save();

            // Enviar email de verificación (OBLIGATORIO)
            await this.emailService.sendEmailVerification(user, user.verificationToken);
            logger.info(`Verification email sent to ${user.email}`);

            // NO generar token JWT hasta que el email esté verificado
            return {
                user: user.toJSON(),
                message: 'Registration successful. Please check your email to verify your account.'
            };
        } catch (error) {
            // Si falla el envío del email, eliminar el usuario creado
            if (error.message.includes('email')) {
                await User.findOneAndDelete({ email: userData.email });
                throw new Error('Failed to send verification email. Please try again.');
            }
            throw error;
        }
    }

    async loginUser(email, password) {
        try {
            // Buscar usuario incluyendo password
            const user = await User.findOne({ email }).select('+password');
            
            if (!user || !(await user.comparePassword(password))) {
                throw new Error('Invalid credentials');
            }

            if (!user.isActive) {
                throw new Error('Account is deactivated');
            }

            // VERIFICACIÓN OBLIGATORIA DEL EMAIL
            if (!user.emailVerified) {
                // Opcional: reenviar automáticamente el email de verificación
                try {
                    if (user.verificationTokenExpires && user.verificationTokenExpires < Date.now()) {
                        user.verificationToken = generateRandomToken(32);
                        user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
                        await user.save();
                    }
                    await this.emailService.sendEmailVerification(user, user.verificationToken);
                    logger.info(`Verification email re-sent to ${user.email}`);
                } catch (emailError) {
                    logger.error('Failed to resend verification email:', emailError);
                }
                
                throw new Error('Please verify your email before logging in. A new verification email has been sent.');
            }

            // Actualizar último login
            user.lastLogin = new Date();
            await user.save();

            // Generar token solo si el email está verificado
            const token = generateToken({ id: user._id, email: user.email });

            return {
                user: user.toJSON(),
                token
            };
        } catch (error) {
            throw error;
        }
    }

    async getUserProfile(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                logger.warn(`User not found: ${userId}`);
                throw new Error('User not found');
            }
            
            logger.info(`User findById: ${userId}`);
            return user;
        } catch (error) {
            logger.error('Error in getUserProfile:', error);
            throw error;
        }
    }

    async verifyEmail(token) {
        try {
            
            const user = await User.findOne({ 
                verificationToken: token,
                verificationTokenExpires: { $gt: Date.now() }
            });
            
            if (!user) {
                throw new Error('Invalid or expired verification token');
            }

            if (user.emailVerified) {
                throw new Error('Email already verified');
            }

            // Marcar email como verificado y limpiar token
            user.emailVerified = true;
            user.verificationToken = undefined;
            user.verificationTokenExpires = undefined
            await user.save();

            logger.info(`Email verified for user: ${user.email}`);
            
            // Enviar email de bienvenida después de verificación
            try {
                await this.emailService.sendWelcomeEmail(user);
            } catch (emailError) {
                logger.error('Failed to send welcome email:', emailError);
            }

            // Generar token automáticamente después de verificación
            const authToken = generateToken({ id: user._id, email: user.email });

            return { 
                success: true, 
                user: user.toJSON(),
                token: authToken,
                message: 'Email verified successfully. You are now logged in.'
            };
        } catch (error) {
            logger.error('Error verifying email:', error);
            throw error;
        }
    }

    async resendVerificationEmail(email) {
        try {
            const user = await User.findOne({ email });
            
            if (user.emailVerified) {            
                logger.warn(`Verification email resent - Email already verified: ${email}`);
                throw new Error('Email already verified');
            }

            // Generar nuevo token si no existe o ha expirado
            if (!user.verificationToken || user.verificationTokenExpires < Date.now()) {
                user.verificationToken = generateRandomToken(32);
                user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
                await user.save();
            }

            // Reenviar email de verificación
            await this.emailService.sendEmailVerification(user, user.verificationToken);

            logger.info(`Verification email resent to ${email}`);
            return { success: true};
        } catch (error) {
            logger.error('Error resending verification email:', error);
            throw error;
        }
    }

    // Métodos de password reset (con verificación)
    async requestPasswordReset(email) {
        try {
            const user = await User.findOne({ email, emailVerified: true }); // Solo usuarios verificados
            
            if (!user) {
                // Por seguridad, no revelar si el email existe o no está verificado
                logger.info(`Password reset requested for non-existent or unverified email: ${email}`);
                return { success: true };
            }

            // Generar token de reset
            const resetToken = generateRandomToken(32);
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
            await user.save();

            // Enviar email de reset
            await this.emailService.sendPasswordResetEmail(user, resetToken);

            logger.info(`Password reset email sent to ${email}`);
            return { success: true };
        } catch (error) {
            logger.error('Error in password reset request:', error);
            throw error;
        }
    }

    async resetPassword(token, newPassword) {
        try {
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() },
                emailVerified: true // Solo usuarios verificados
            });

            if (!user) {
                throw new Error('Invalid or expired reset token');
            }

            // Actualizar password y limpiar token
            user.password = newPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            logger.info(`Password reset successfully for user: ${user.email}`);
            return { success: true };
        } catch (error) {
            logger.error('Error resetting password:', error);
            throw error;
        }
    }
}

module.exports = new AuthService();