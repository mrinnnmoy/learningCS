// Validates all required environment variables at startup.
// process.exit(1) if any are missing or invalid.

require('dotenv').config();
const { z } = require('zod');

const envSchema = z.object({
    PORT: z.string().transform(Number).default('3003'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    LOG_LEVEL: z.string().default('info'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
    ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
    console.error('\n[ENV ERROR] Invalid environment variables — cannot start server');
    result.error.issues.forEach(i => console.error(`  ✗ ${i.path.join('.')}: ${i.message}`));
    console.error('\nFix the above in your .env and restart.\n');
    process.exit(1);
}

module.exports = result.data;