const winston = require('winston');
const path = require('path');
const fs = require('fs');
const env = require('./env');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;
const isDev = env.NODE_ENV !== 'production';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const devFormat = combine(
    colorize({ all: true }),
    timestamp({ format: 'HH:mm:ss' }),
    errors({ stack: true }),
    printf(({ level, message, timestamp, stack, requestId, ...meta }) => {
        const rid = requestId ? ` [${String(requestId).slice(0, 8)}]` : '';
        const metaStr = Object.keys(meta).length
            ? '\n  ' + JSON.stringify(meta, null, 2).replace(/\n/g, '\n  ')
            : '';
        return `${timestamp} [${level}]${rid}: ${stack || message}${metaStr}`;
    })
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const logger = winston.createLogger({
    level: env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
    format: isDev ? devFormat : prodFormat,
    transports: [new winston.transports.Console()],
});

if (!isDev) {
    logger.add(new winston.transports.File({
        filename: path.join(logsDir, 'error.log'), level: 'error',
        maxsize: 5 * 1024 * 1024, maxFiles: 5, tailable: true,
    }));
    logger.add(new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        maxsize: 10 * 1024 * 1024, maxFiles: 5, tailable: true,
    }));
}

const morganStream = { write: msg => logger.http(msg.trim()) };
module.exports = { logger, morganStream };