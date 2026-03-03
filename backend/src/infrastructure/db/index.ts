import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../config/env';
import * as schema from './schema';
import { logger } from '../logger';

const pool = new Pool({
    connectionString: env.DATABASE_URL,
});

pool.on('error', (err) => {
    logger.error(err, 'Unexpected error on idle client');
    process.exit(-1);
});

export const db = drizzle(pool, { schema, logger: env.NODE_ENV === 'development' });
