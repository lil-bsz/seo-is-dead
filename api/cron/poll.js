const { db, ensureSchema } = require('../_db');

const USER_AGENT = 'seo-is-dead-counter/1.0 (educational project)';

const SEARCH_QUERIES = [
  '"SEO is dead"',
  '"SEO is dying"',
  '"death of SEO"',
  '"RIP SEO"',
  '"SEO is over"',
  '"SEO is obsolete"',
  '"end of SEO"',
];

const SEO_DEAD_REGEX = /seo.{0,15}(?:is|is basically|has|has been|will be).{0,10}(?:dead|dying|over|obsolete|finished|done|doomed)|death.{0,8}of.{0,8}seo|rip.{0,8}seo|end.{0,8}of.{0,8}seo/i;

async function fetchReddit(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (res.status === 429) {
    // Rate limited - wait and retry once
    await new Promise(r => setTimeout(r, 5000));
    const retry = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!retry.ok) return null;
    return retry.json();
  }
  if (!res.ok) return null;
  return res.json();
}

async function upsertItem(item) {
  const result = await db.execute({
    sql: `INSERT INTO seen_items (reddit_id, body, subreddit, permalink, created_utc, author)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(reddit_id) DO UPDATE SET author = excluded.author
      WHERE seen_items.author IS NULL AND excluded.author IS NOT NULL`,
    args: [item.id, item.text.slice(0, 500), item.subreddit, item.permalink, item.created_utc, item.author || null],
  });
  return result.rowsAffected > 0;
}

// Paginate through Reddit search results (up to maxPages pages)
async function fetchAllPages(baseUrl, maxPages = 3) {
  const items = [];
  let after = null;

  for (let page = 0; page < maxPages; page++) {
    const separator = baseUrl.includes('?') ? '&' : '?';
    const url = after ? `${baseUrl}${separator}after=${after}` : baseUrl;

    const data = await fetchReddit(url);
    if (!data?.data?.children?.length) break;

    items.push(...data.data.children);
    after = data.data.after;

    if (!after) break; // no more pages

    // Polite delay between pages
    await new Promise(r => setTimeout(r, 2000));
  }

  return items;
}

module.exports = async function handler(req, res) {
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await ensureSchema();
  let newCount = 0;

  for (const query of SEARCH_QUERIES) {
    const encoded = encodeURIComponent(query);

    // Search posts - paginate up to 3 pages (300 results max)
    const posts = await fetchAllPages(
      `https://www.reddit.com/search.json?q=${encoded}&sort=new&limit=100`,
      3
    );
    for (const child of posts) {
      const post = child.data;
      const text = `${post.title || ''} ${post.selftext || ''}`;
      if (SEO_DEAD_REGEX.test(text)) {
        const added = await upsertItem({
          id: post.name,
          text,
          subreddit: post.subreddit,
          permalink: post.permalink,
          created_utc: post.created_utc,
          author: post.author,
        });
        if (added) newCount++;
      }
    }

    // Polite delay between query types
    await new Promise(r => setTimeout(r, 2000));

    // Search comments - paginate up to 3 pages
    const comments = await fetchAllPages(
      `https://www.reddit.com/search.json?q=${encoded}&sort=new&limit=100&type=comment`,
      3
    );
    for (const child of comments) {
      const comment = child.data;
      if (SEO_DEAD_REGEX.test(comment.body || '')) {
        const added = await upsertItem({
          id: comment.name,
          text: comment.body || '',
          subreddit: comment.subreddit,
          permalink: comment.permalink,
          created_utc: comment.created_utc,
          author: comment.author,
        });
        if (added) newCount++;
      }
    }

    // Polite delay between different search queries
    await new Promise(r => setTimeout(r, 2000));
  }

  const total = await db.execute('SELECT COUNT(*) as count FROM seen_items');
  res.json({ newCount, total: total.rows[0].count });
};
