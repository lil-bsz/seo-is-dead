const { db, ensureSchema } = require('./_db');

module.exports = async function handler(req, res) {
  await ensureSchema();
  const result = await db.execute(
    'SELECT subreddit, COUNT(*) as count FROM seen_items GROUP BY subreddit ORDER BY count DESC LIMIT 5'
  );
  res.json({ items: result.rows });
};
