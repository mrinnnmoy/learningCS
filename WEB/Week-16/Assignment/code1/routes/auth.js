const express = require('express');
const router = express.Router();
const redis = require('../lib/redis');

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'email is required' });

        // Overwriting any existing OTP for this email (user can request again)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await redis.set(`otp:${email}`, otp, 'EX', 600); // 10 minutes

        res.json({ message: 'OTP sent', otp }); // return OTP for testing only
    } catch (err) { next(err); }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'email and otp are required' });

        const stored = await redis.get(`otp:${email}`);

        if (!stored) {
            return res.status(400).json({ message: 'OTP expired or not found' });
        }
        if (stored !== otp.toString()) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Single use — delete immediately after successful verification
        await redis.del(`otp:${email}`);

        res.json({ message: 'OTP verified successfully' });
    } catch (err) { next(err); }
});

module.exports = router;