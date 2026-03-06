const express = require('express');
const env = require('../config/env');

const router = express.Router();

router.get('/', (req, res) => {
    const databaseConfigured =
        env.databaseUrl &&
        env.databaseUrl.startsWith('http');

    const healthData = {
        status: databaseConfigured ? 'ok' : 'error',

        environment: env.nodeEnv,

        port: env.port,

        database: databaseConfigured
            ? 'connected (url set)'
            : 'not configured',

        auth: env.jwtSecret
            ? 'jwt secret loaded'
            : 'jwt secret missing',

        uptime: Number(process.uptime().toFixed(1)),

        timestamp: new Date().toISOString(),
    };

    if (!databaseConfigured) {
        return res.status(503).json(healthData);
    }

    return res.status(200).json(healthData);
});

module.exports = router;