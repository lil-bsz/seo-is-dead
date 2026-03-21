import Database from 'better-sqlite3';
import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env') });

const localDb = new Database(join(__dirname, '..', 'counter.db'));
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function seed() {
  console.log('Creating schema on Turso...');
  await turso.execute(`
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

  const rows = localDb.prepare('SELECT * FROM seen_items').all();
  console.log(`Found ${rows.length} rows in local DB. Seeding Turso...`);

  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const statements = batch.map(row => ({
      sql: `INSERT OR IGNORE INTO seen_items (reddit_id, body, subreddit, permalink, created_utc, author, seen_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [row.reddit_id, row.body, row.subreddit, row.permalink, row.created_utc, row.author, row.seen_at],
    }));

    await turso.batch(statements, 'write');
    inserted += batch.length;
    process.stdout.write(`\r  Inserted ${inserted}/${rows.length}`);
  }

  console.log('\nVerifying...');
  const count = await turso.execute('SELECT COUNT(*) as count FROM seen_items');
  console.log(`Turso now has ${count.rows[0].count} rows. Done!`);

  localDb.close();
  turso.close();
}

seed().catch(console.error);
