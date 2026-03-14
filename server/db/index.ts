import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../config.js';
import * as schema from './schema.js';

const isProd = config.NODE_ENV === 'production';

export const sql = postgres(config.DATABASE_URL, {
  max: config.DATABASE_POOL_SIZE,
  ssl: isProd ? 'require' : false,
  connect_timeout: 10,
  idle_timeout: 20,
});

export const db = drizzle(sql, { schema });
export * from './schema.js';
