import type { VercelRequest, VercelResponse } from '@vercel/node';
import db, { ensureSchema } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureSchema();
  const result = await db.execute('SELECT COUNT(*) as count FROM seen_items');
  res.json({ count: result.rows[0].count });
}
