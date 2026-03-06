const express = require('express');
const env = require('./config/env');
const healthRoute = require('./routes/health');

const app = express();

app.use(express.json());

app.use('/health', healthRoute);

app.get('/', (req, res) => {
    res.json({
        message: 'Server is running',
        environment: env.nodeEnv,
    });
});

app.listen(env.port, () => {
    console.log(`
🚀 Server started successfully

Environment : ${env.nodeEnv}
Port        : ${env.port}
Rate Limit  : ${env.rateLimit}
Origins     : ${env.allowedOrigins.join(', ')}

Health URL  : http://localhost:${env.port}/health
`);
});