import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL must be provided"),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
    JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters long"),
    FRONTEND_URL: z.string().url().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('❌ Invalid environment variables:', parsedEnv.error.format());
    process.exit(1);
}

export const env = parsedEnv.data;
