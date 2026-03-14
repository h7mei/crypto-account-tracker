import 'dotenv/config';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required. Set it in .env or your environment.');
  process.exit(1);
}

const sql = postgres(databaseUrl);
const db = drizzle(sql);

await migrate(db, { migrationsFolder: join(__dirname, '../../drizzle') });
await sql.end();
console.log('Migrations complete.');
