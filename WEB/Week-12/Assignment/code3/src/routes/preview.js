// URL preview route — fetches metadata from a user-supplied URL.
// Contains fix for Vulnerability 5 (SSRF — A10).

const express = require('express');
const axios = require('axios');
const { auth } = require('../middleware/auth');
const { isSafeUrl } = require('../utils/ssrf');

const router = express.Router();

// POST /api/preview
//
// FIX for Vulnerability 5 (SSRF, A10):
//   Original: const response = await axios.get(url)  — no validation at all.
//   Attacker points the URL at http://169.254.169.254/latest/meta-data/iam/...
//   The server fetches it from inside the cloud network and returns IAM credentials.
//
//   Fix:
//   1. isSafeUrl() checks protocol (https: only) and resolves hostname to IP,
//      then blocks all private IP ranges including the metadata endpoint.
//   2. maxRedirects: 0 prevents redirect-based bypass where the attacker points
//      to a legitimate public URL that 301-redirects to a private IP.
//   3. timeout: 5000ms prevents the request from hanging indefinitely.
router.post('/', auth, async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ message: 'url is required' });
    }

    if (!(await isSafeUrl(url))) {
        return res.status(400).json({ error: 'URL not allowed' });
    }

    try {
        const response = await axios.get(url, {
            maxRedirects: 0,   // do not follow redirects
            timeout: 5000,
            headers: { 'User-Agent': 'ShopPreviewBot/1.0' },
        });

        res.json({ title: String(response.data).slice(0, 200) });
    } catch {
        res.status(422).json({ message: 'Could not fetch preview for that URL' });
    }
});

module.exports = router;