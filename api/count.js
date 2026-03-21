const { db, ensureSchema } = require('./_db');

module.exports = async function handler(req, res) {
  await ensureSchema();
  const result = await db.execute('SELECT COUNT(*) as count FROM seen_items');
  res.json({ count: result.rows[0].count });
};
