const crypto = require('crypto');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const { signToken } = require('../utils/jwt');
const { createNotification } = require('../services/notificationService');
const nodemailer = require('nodemailer');

/**
 * Register new student
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      academicYear,
      monthlyAllowanceBaseline,
      monthlySavingsGoal,
      currency
    } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please login instead.'
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      academicYear: academicYear || '1st Year',
      monthlyAllowanceBaseline: Number(monthlyAllowanceBaseline) || 0,
      monthlySavingsGoal: Number(monthlySavingsGoal) || 0,
      currency: currency || '$',
      role: 'student',
      status: 'active'
    });

    // Create welcome notification
    await createNotification({
      userId: user._id,
      type: 'system_announcement',
      title: 'Welcome to Campus Coin!',
      message: `Welcome, ${user.name}! Your student finance dashboard is ready. Start by logging your daily expenses or setting up your monthly category budgets.`,
      link: '/dashboard'
    });

    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: 'Student account registered successfully.',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user (Student or Admin)
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been disabled by the system administrator. Please contact campus finance support.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = signToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

/**
 * Forgot Password - Generates secure reset token
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Do not reveal whether an email is registered.
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset PIN has been sent.'
      });
    }

    // Keep previously issued, still-unexpired reset PINs usable. This avoids a race
    // where an older email arrives after a newer reset request. Each PIN remains
    // single-use and expires automatically.

    // Six-digit PIN for the normal "Forgot password" flow.
    const resetPin = String(crypto.randomInt(100000, 1000000));
    const tokenHash = crypto.createHash('sha256').update(resetPin).digest('hex');

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });

    const smtpConfigured =
      Boolean(process.env.EMAIL_HOST) &&
      Boolean(process.env.EMAIL_USER) &&
      Boolean(process.env.EMAIL_PASSWORD) &&
      !/^PASTE_YOUR_GOOGLE_APP_PASSWORD_HERE$/i.test(process.env.EMAIL_PASSWORD);

    if (smtpConfigured) {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT || 587),
        secure: Number(process.env.EMAIL_PORT || 587) === 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        // Generous connection timeouts prevent a slow SMTP handshake from
        // making the reset flow fail too quickly.
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== 'false'
        }
      });

      let mailError;
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM || `Campus Coin <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Campus Coin password reset PIN',
            text: `Hello ${user.name},\n\nYour Campus Coin password reset PIN is: ${resetPin}\n\nThis PIN expires in 15 minutes and can only be used once. If you did not request a password reset, you can ignore this email.`,
            html: `<p>Hello ${user.name},</p><p>Your Campus Coin password reset PIN is:</p><p style="font-size:28px;font-weight:700;letter-spacing:8px">${resetPin}</p><p>This PIN expires in <strong>15 minutes</strong> and can only be used once.</p><p>If you did not request a password reset, you can ignore this email.</p>`
          });
          mailError = null;
          console.log(`[Password Reset] PIN email sent to ${user.email}`);
          break;
        } catch (err) {
          mailError = err;
          if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
        }
      }

      if (mailError) {
        // Keep the unexpired PIN valid so a transient SMTP error does not
        // invalidate the reset flow.
        console.error(`[Password Reset Email] ${mailError.code || mailError.name || 'SMTP_ERROR'}: ${mailError.message}`);
        return res.status(503).json({
          success: false,
          message: 'The reset email could not be delivered after several SMTP attempts. Please try again.',
          code: mailError.code || 'SMTP_ERROR'
        });
      }
    }

    const isDev = process.env.NODE_ENV !== 'production';
    res.status(200).json({
      success: true,
      message: smtpConfigured
        ? 'A 6-digit password reset PIN has been sent to your email. It expires in 15 minutes.'
        : 'A password reset PIN has been generated. Configure SMTP to receive it by email.',
      emailSent: Boolean(smtpConfigured),
      resetPin: isDev && !smtpConfigured ? resetPin : undefined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password using token
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, email, pin, password } = req.body;

    if ((!token && (!email || !pin)) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your reset PIN and new password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const resetValue = token || String(pin).trim();
    const tokenHash = crypto.createHash('sha256').update(resetValue).digest('hex');

    const resetQuery = {
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() }
    };
    if (!token) {
      const resetUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (!resetUser) {
        return res.status(400).json({ success: false, message: 'Invalid or expired password reset PIN.' });
      }
      resetQuery.userId = resetUser._id;
    }

    const resetRecord = await PasswordResetToken.findOne(resetQuery);

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid, expired, or already used password reset token.'
      });
    }

    const user = await User.findById(resetRecord.userId);
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found.' });
    }

    user.password = password;
    await user.save();

    resetRecord.used = true;
    await resetRecord.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword
};
