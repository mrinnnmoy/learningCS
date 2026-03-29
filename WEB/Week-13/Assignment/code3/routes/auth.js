const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { PasswordResetToken } = require('../models');

// POST /api/auth/forgot-password
// Generate a 6-digit OTP, store it with a TTL, return it (in production: email it)
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Delete any existing token for this email before creating a new one
    // (prevents a user accumulating multiple valid tokens)
    await PasswordResetToken.deleteMany({ email });

    // Generate a cryptographically random 6-digit OTP
    // Math.random() is NOT suitable for security-sensitive values
    const otp = crypto.randomInt(100000, 999999).toString();

    await PasswordResetToken.create({ email, token: otp });

    // In production, you would send otp via email (nodemailer, SendGrid, etc.)
    // Here we return it directly so you can test via Postman.
    res.json({
      message: 'OTP sent (returned directly for testing)',
      otp,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/verify-otp
// Verify the OTP. If the TTL index has expired the document, findOne returns null.
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // If the document does not exist, it was either:
    //   a) never created (wrong email), or
    //   b) automatically deleted by MongoDB's TTL index after 10 minutes
    // We return the same error message for both — no information leakage
    const record = await PasswordResetToken.findOne({ email, token: otp });

    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is valid — delete it so it cannot be reused
    await PasswordResetToken.deleteOne({ _id: record._id });

    res.json({ message: 'OTP verified. You may now reset your password.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
