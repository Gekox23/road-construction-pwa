// AZ EGYETLEN KÖZÖS PONT MODULOK KÖZÖTT
// Minden modul innen importálja a db klienst.
// Modulok egymást NEM importálhatják – ez az architektúra alapszabálya.
import { Pool, QueryResult, QueryResultRow } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('[db] DATABASE_URL env változó nincs beállítva!');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

pool.on('error', (err) => console.error('[db] Váratlan pool hiba:', err));

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development' && duration > 500) {
    console.warn(`[db] Lassú query (${duration}ms):`, text.slice(0, 120));
  }
  return result;
}

export { pool };
