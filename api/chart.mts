import type { VercelRequest, VercelResponse } from '@vercel/node';
import db, { ensureSchema } from './_db.mjs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureSchema();
  const range = (req.query.range as string) || '30d';
  const now = Math.floor(Date.now() / 1000);

  let whereClause = '';
  let groupExpr = '';
  let args: number[] = [];

  switch (range) {
    case 'today': {
      const startOfDay = now - (now % 86400);
      whereClause = 'WHERE created_utc >= ?';
      args = [startOfDay];
      groupExpr = "strftime('%Y-%m-%d %H', created_utc, 'unixepoch')";
      break;
    }
    case '7d': {
      whereClause = 'WHERE created_utc >= ?';
      args = [now - 7 * 86400];
      groupExpr = "strftime('%Y-%m-%d', created_utc, 'unixepoch')";
      break;
    }
    case '30d': {
      whereClause = 'WHERE created_utc >= ?';
      args = [now - 30 * 86400];
      groupExpr = "strftime('%Y-%m-%d', created_utc, 'unixepoch')";
      break;
    }
    case 'all':
    default: {
      groupExpr = "strftime('%Y-%m', created_utc, 'unixepoch')";
      break;
    }
  }

  const result = await db.execute({
    sql: `SELECT ${groupExpr} as date, COUNT(*) as count FROM seen_items ${whereClause} GROUP BY date ORDER BY date ASC`,
    args,
  });

  res.json({ data: result.rows });
}
