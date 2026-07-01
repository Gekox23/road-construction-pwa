import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('[db.client] DATABASE_URL környezeti változó nincs beállítva');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('[db.client] Váratlan adatbázis hiba:', err);
});

export const db = {
  query: <T = unknown>(text: string, params?: unknown[]) =>
    pool.query<T & Record<string, unknown>>(text, params),
  getClient: () => pool.connect(),
};

export default db;
