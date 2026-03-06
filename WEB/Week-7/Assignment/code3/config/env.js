const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const envSchema = z.object({
    PORT: z.coerce.number().int().positive(),

    DATABASE_URL: z
        .string()
        .url('DATABASE_URL must be a valid URL'),

    JWT_SECRET: z
        .string()
        .min(32, 'JWT_SECRET must be at least 32 characters'),

    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('development'),

    RATE_LIMIT: z.coerce.number().positive(),

    ALLOWED_ORIGINS: z
        .string()
        .transform((value) =>
            value.split(',').map((origin) => origin.trim())
        ),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('\n❌ Environment validation failed:\n');

    parsedEnv.error.issues.forEach((issue) => {
        console.error(`- ${issue.path.join('.')}: ${issue.message}`);
    });

    console.error('\nServer startup aborted.');
    process.exit(1);
}

const env = parsedEnv.data;

module.exports = {
    port: env.PORT,

    databaseUrl: env.DATABASE_URL,

    jwtSecret: env.JWT_SECRET,

    nodeEnv: env.NODE_ENV,

    rateLimit: env.RATE_LIMIT,

    allowedOrigins: env.ALLOWED_ORIGINS,
};