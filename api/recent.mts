import type { VercelRequest, VercelResponse } from '@vercel/node';
import db, { ensureSchema } from './_db.mjs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureSchema();
  const limit = Math.min(parseInt(req.query.limit as string) || 12, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  const recent = await db.execute({
    sql: `SELECT reddit_id, subreddit, permalink, body, created_utc, author,
      CASE WHEN reddit_id LIKE 't1_%' THEN 'comment' ELSE 'post' END as type
      FROM seen_items ORDER BY created_utc DESC LIMIT ? OFFSET ?`,
    args: [limit, offset],
  });

  const countResult = await db.execute('SELECT COUNT(*) as count FROM seen_items');
  const count = countResult.rows[0].count as number;

  res.json({ items: recent.rows, total: count, hasMore: offset + limit < count });
}
