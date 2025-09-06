const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
    
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, // true para 465, false para otros puertos
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Verificar conexión SMTP
    async verifyConnection() {
        try {
            await this.transporter.verify();
            logger.info('SMTP connection verified successfully');
            return true;
        } catch (error) {
            logger.error('SMTP connection failed:', error);
            return false;
        }
    }

    async sendWelcomeEmail(user) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: user.email,
                subject: 'Welcome to Our Service - BMV!',
                html: `
                    <h1>Welcome, ${user.firstName}!</h1>
                    <p>Thank you for registering with our service.</p>
                    <p>We're excited to have you on board!</p>
                    <br>
                    <p>Best regards,<br>The BMV Team</p>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Welcome email sent to ${user.email} - Message ID: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            logger.error('Error sending welcome email:', error);
            return { success: false, error: error.message };
        }
    }

    async sendPasswordResetEmail(user, resetToken) {
        try {
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
            
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: user.email,
                subject: 'Password Reset Request - BMV',
                html: `
                    <h1>Password Reset</h1>
                    <p>Hello ${user.firstName},</p>
                    <p>You requested a password reset. Click the link below to reset your password:</p>
                    <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this reset, please ignore this email.</p>
                    <br>
                    <p>Best regards,<br>The BMV Team</p>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Password reset email sent to ${user.email} - Message ID: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            logger.error('Error sending password reset email:', error);
            throw error;
        }
    }

    async sendEmailVerification(user, verificationToken) {
        try {
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
            
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: user.email,
                subject: 'Verify Your Email - BMV',
                html: `
                    <h1>Email Verification</h1>
                    <p>Hello ${user.firstName},</p>
                    <p>Please verify your email address by clicking the link below:</p>
                    <a href="${verificationUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
                    <p>This link will expire in 24 hours.</p>
                    <br>
                    <p>Best regards,<br>The BMV Team</p>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Verification email sent to ${user.email} - Message ID: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            logger.error('Error sending verification email:', error);
            throw error;
        }
    }

    // Método genérico para enviar emails
    async sendEmail(to, subject, html, from = process.env.EMAIL_FROM) {
        try {
            const mailOptions = {
                from,
                to,
                subject,
                html
            };

            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Email sent to ${to} - Message ID: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            logger.error('Error sending email:', error);
            throw error;
        }
    }
}

module.exports = EmailService;