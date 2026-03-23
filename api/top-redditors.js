const { db, ensureSchema } = require('./_db');

module.exports = async function handler(req, res) {
  await ensureSchema();
  const result = await db.execute(
    'SELECT author, COUNT(*) as count FROM seen_items WHERE author IS NOT NULL GROUP BY author ORDER BY count DESC LIMIT 5'
  );
  res.json({ items: result.rows });
};
