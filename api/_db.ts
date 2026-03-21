import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:counter.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let schemaReady = false;

export async function ensureSchema() {
  if (schemaReady) return;
  await db.execute(`
    CREATE TABLE IF NOT EXISTS seen_items (
      reddit_id TEXT PRIMARY KEY,
      body TEXT,
      subreddit TEXT,
      permalink TEXT,
      created_utc INTEGER,
      author TEXT,
      seen_at INTEGER DEFAULT (unixepoch())
    )
  `);
  schemaReady = true;
}

export default db;
