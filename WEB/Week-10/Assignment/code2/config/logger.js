const winston = require('winston');
const path = require('path');
const fs = require('fs');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const isDev = process.env.NODE_ENV !== 'production';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// ── Development console format (colorised + human-readable) ──────────────────
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

// ── Production JSON format (parseable by log aggregators) ─────────────────────
const prodFormat = combine(
    timestamp(),
    errors({ stack: true }),
    json()
);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
    format: isDev ? devFormat : prodFormat,
    transports: [new winston.transports.Console()],
});

// Write to files only in production
if (!isDev) {
    logger.add(new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 5 * 1024 * 1024, // 5 MB
        maxFiles: 5,
        tailable: true,
    }));
    logger.add(new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        maxsize: 10 * 1024 * 1024, // 10 MB
        maxFiles: 5,
        tailable: true,
    }));
}

// Pipe Morgan output through Winston instead of writing to stdout directly
const morganStream = {
    write: (message) => logger.http(message.trim()),
};

module.exports = { logger, morganStream };