const { db, ensureSchema } = require('../_db');

const USER_AGENT = 'seo-is-dead-counter/1.0 (educational project)';
const SEARCH_QUERY = encodeURIComponent('"SEO is dead"');

async function fetchReddit(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (res.status === 429 || !res.ok) return null;
  return res.json();
}

module.exports = async function handler(req, res) {
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await ensureSchema();
  let newCount = 0;

  const postsData = await fetchReddit(
    `https://www.reddit.com/search.json?q=${SEARCH_QUERY}&sort=new&limit=100`
  );
  if (postsData?.data?.children) {
    for (const child of postsData.data.children) {
      const post = child.data;
      const text = `${post.title || ''} ${post.selftext || ''}`;
      if (/seo is dead/i.test(text)) {
        const result = await db.execute({
          sql: `INSERT INTO seen_items (reddit_id, body, subreddit, permalink, created_utc, author)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(reddit_id) DO UPDATE SET author = excluded.author
            WHERE seen_items.author IS NULL AND excluded.author IS NOT NULL`,
          args: [post.name, text.slice(0, 500), post.subreddit, post.permalink, post.created_utc, post.author || null],
        });
        if (result.rowsAffected > 0) newCount++;
      }
    }
  }

  await new Promise(r => setTimeout(r, 2000));

  const commentsData = await fetchReddit(
    `https://www.reddit.com/search.json?q=${SEARCH_QUERY}&sort=new&limit=100&type=comment`
  );
  if (commentsData?.data?.children) {
    for (const child of commentsData.data.children) {
      const comment = child.data;
      if (/seo is dead/i.test(comment.body || '')) {
        const result = await db.execute({
          sql: `INSERT INTO seen_items (reddit_id, body, subreddit, permalink, created_utc, author)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(reddit_id) DO UPDATE SET author = excluded.author
            WHERE seen_items.author IS NULL AND excluded.author IS NOT NULL`,
          args: [comment.name, (comment.body || '').slice(0, 500), comment.subreddit, comment.permalink, comment.created_utc, comment.author || null],
        });
        if (result.rowsAffected > 0) newCount++;
      }
    }
  }

  const total = await db.execute('SELECT COUNT(*) as count FROM seen_items');
  res.json({ newCount, total: total.rows[0].count });
};
