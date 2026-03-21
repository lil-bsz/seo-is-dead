const { db, ensureSchema } = require('./_db');

module.exports = async function handler(req, res) {
  await ensureSchema();
  const limit = Math.min(parseInt(req.query.limit) || 12, 100);
  const offset = parseInt(req.query.offset) || 0;

  const recent = await db.execute({
    sql: `SELECT reddit_id, subreddit, permalink, body, created_utc, author,
      CASE WHEN reddit_id LIKE 't1_%' THEN 'comment' ELSE 'post' END as type
      FROM seen_items ORDER BY created_utc DESC LIMIT ? OFFSET ?`,
    args: [limit, offset],
  });

  const countResult = await db.execute('SELECT COUNT(*) as count FROM seen_items');
  const count = countResult.rows[0].count;

  res.json({ items: recent.rows, total: count, hasMore: offset + limit < count });
};
