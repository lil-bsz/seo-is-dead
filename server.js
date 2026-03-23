const express = require('express');
const Database = require('better-sqlite3');
const cron = require('node-cron');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Database setup ---
const db = new Database(path.join(__dirname, 'counter.db'));
db.pragma('journal_mode = WAL');

db.exec(`
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

// Add author column if upgrading from older schema
try { db.exec('ALTER TABLE seen_items ADD COLUMN author TEXT'); } catch (_) { /* already exists */ }

const insertStmt = db.prepare(`
  INSERT INTO seen_items (reddit_id, body, subreddit, permalink, created_utc, author)
  VALUES (?, ?, ?, ?, ?, ?)
  ON CONFLICT(reddit_id) DO UPDATE SET author = excluded.author
  WHERE seen_items.author IS NULL AND excluded.author IS NOT NULL
`);

const updateAuthorStmt = db.prepare(`
  UPDATE seen_items SET author = ? WHERE reddit_id = ? AND author IS NULL
`);

const countStmt = db.prepare('SELECT COUNT(*) as count FROM seen_items');

const recentStmt = db.prepare(`
  SELECT reddit_id, subreddit, permalink, body, created_utc, author,
    CASE WHEN reddit_id LIKE 't1_%' THEN 'comment' ELSE 'post' END as type
  FROM seen_items
  ORDER BY created_utc DESC
  LIMIT ? OFFSET ?
`);

// --- Reddit polling ---
const USER_AGENT = 'seo-is-dead-counter/1.0 (educational project)';

// Broader search queries to catch more mentions
const SEARCH_QUERIES = [
  '"SEO is dead"',
  '"SEO is dying"',
  '"death of SEO"',
  '"RIP SEO"',
  '"SEO is over"',
  '"SEO is obsolete"',
  '"end of SEO"',
];

// Fuzzy regex that matches all variations locally
const SEO_DEAD_REGEX = /seo.{0,15}(?:is|is basically|has|has been|will be).{0,10}(?:dead|dying|over|obsolete|finished|done|doomed)|death.{0,8}of.{0,8}seo|rip.{0,8}seo|end.{0,8}of.{0,8}seo/i;

async function fetchReddit(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT }
  });

  if (res.status === 429) {
    console.warn('[Reddit] Rate limited, will retry next cycle');
    return null;
  }

  if (!res.ok) {
    console.error(`[Reddit] HTTP ${res.status} for ${url}`);
    return null;
  }

  return res.json();
}

async function pollReddit() {
  console.log(`[${new Date().toISOString()}] Polling Reddit...`);
  let newCount = 0;

  for (const query of SEARCH_QUERIES) {
    const encoded = encodeURIComponent(query);

    // Search posts
    const postsData = await fetchReddit(
      `https://www.reddit.com/search.json?q=${encoded}&sort=new&limit=100`
    );

    if (postsData?.data?.children) {
      const prevCount = countStmt.get().count;
      for (const child of postsData.data.children) {
        const post = child.data;
        const text = `${post.title || ''} ${post.selftext || ''}`;
        if (SEO_DEAD_REGEX.test(text)) {
          insertStmt.run(post.name, text.slice(0, 500), post.subreddit, post.permalink, post.created_utc, post.author || null);
        }
      }
      newCount += countStmt.get().count - prevCount;
    }

    // Be polite between requests
    await new Promise(r => setTimeout(r, 2000));

    // Search comments
    const commentsData = await fetchReddit(
      `https://www.reddit.com/search.json?q=${encoded}&sort=new&limit=100&type=comment`
    );

    if (commentsData?.data?.children) {
      const prevCount = countStmt.get().count;
      for (const child of commentsData.data.children) {
        const comment = child.data;
        if (SEO_DEAD_REGEX.test(comment.body || '')) {
          insertStmt.run(comment.name, (comment.body || '').slice(0, 500), comment.subreddit, comment.permalink, comment.created_utc, comment.author || null);
        }
      }
      newCount += countStmt.get().count - prevCount;
    }

    // Wait between different queries
    await new Promise(r => setTimeout(r, 2000));
  }

  const total = countStmt.get().count;
  console.log(`[${new Date().toISOString()}] Found ${newCount} new items. Total: ${total}`);
}

// --- Arctic Shift historical backfill ---
const ARCTIC_BASE = 'https://arctic-shift.photon-reddit.com/api';
const BACKFILL_SUBREDDITS = [
  'SEO', 'bigseo', 'TechSEO', 'digital_marketing', 'marketing',
  'Entrepreneur', 'Entrepreneurs', 'smallbusiness', 'startups',
  'webdev', 'webdesign', 'blogging', 'juststart', 'content_marketing',
  'SideProject', 'GrowthHacking', 'ecommerce', 'shopify',
  'PPC', 'socialmedia', 'affiliatemarketing', 'Affiliator',
  'google', 'GoogleSearch', 'technology', 'artificial', 'OpenAI',
  'ChatGPT', 'ArtificialIntelligence', 'AI_Agents',
  'SaaS', 'indiehackers', 'advancedentrepreneur',
  'freelance', 'copywriting', 'ContentCreators',
  'SEMrush', 'Serpzilla', 'SmartSEOGrowthLab', 'GroMach',
];

let backfillRunning = false;
let backfillProgress = { status: 'idle', subreddit: '', postsFound: 0, commentsFound: 0, totalNew: 0, subredditsDone: 0, subredditsTotal: 0 };

async function fetchArctic(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT }
  });
  if (!res.ok) {
    console.error(`[Arctic] HTTP ${res.status} for ${url}`);
    return null;
  }
  return res.json();
}

// Arctic Shift search phrases (broader set for backfill)
const BACKFILL_PHRASES = ['"SEO is dead"', '"SEO is dying"', '"death of SEO"', '"RIP SEO"', '"SEO is over"', '"end of SEO"'];

async function backfillSubreddit(subreddit, type) {
  const endpoint = type === 'posts' ? 'posts' : 'comments';
  const queryParam = type === 'posts' ? 'query' : 'body';
  let totalInserted = 0;

  for (const phrase of BACKFILL_PHRASES) {
    const searchPhrase = encodeURIComponent(phrase);
    let before = null;

    while (true) {
      let url = `${ARCTIC_BASE}/${endpoint}/search?${queryParam}=${searchPhrase}&subreddit=${encodeURIComponent(subreddit)}&limit=100&sort=desc`;
      if (before) url += `&before=${before}`;

      const data = await fetchArctic(url);
      if (!data?.data?.length) break;

      const prevCount = countStmt.get().count;
      for (const item of data.data) {
        const isComment = type === 'comments';
        const redditId = isComment ? `t1_${item.id}` : `t3_${item.id}`;
        const body = isComment ? (item.body || '').slice(0, 500) : `${item.title || ''} ${item.selftext || ''}`.slice(0, 500);
        const permalink = item.permalink || '';
        const author = item.author || null;

        if (SEO_DEAD_REGEX.test(body)) {
          insertStmt.run(redditId, body, item.subreddit || subreddit, permalink, item.created_utc, author);
        }
      }
    totalInserted += countStmt.get().count - prevCount;

    // Paginate: use last item's created_utc as the new "before"
    const lastItem = data.data[data.data.length - 1];
    if (!lastItem?.created_utc || data.data.length < 100) break;
    before = lastItem.created_utc;

    // Rate limit: wait 500ms between requests
    await new Promise(r => setTimeout(r, 500));
    }

    // Small delay between phrases
    await new Promise(r => setTimeout(r, 300));
  }

  return totalInserted;
}

async function runBackfill() {
  if (backfillRunning) return;
  backfillRunning = true;

  // Combine hardcoded list with subreddits already in DB
  const dbSubs = db.prepare('SELECT DISTINCT subreddit FROM seen_items').all().map(r => r.subreddit);
  const allSubs = [...new Set([...BACKFILL_SUBREDDITS, ...dbSubs])];

  backfillProgress = { status: 'running', subreddit: '', postsFound: 0, commentsFound: 0, totalNew: 0, subredditsDone: 0, subredditsTotal: allSubs.length };
  console.log(`[Arctic] Starting backfill across ${allSubs.length} subreddits...`);

  const startCount = countStmt.get().count;

  for (const sub of allSubs) {
    backfillProgress.subreddit = sub;
    console.log(`[Arctic] Searching r/${sub}...`);

    const posts = await backfillSubreddit(sub, 'posts');
    backfillProgress.postsFound += posts;
    await new Promise(r => setTimeout(r, 300));

    const comments = await backfillSubreddit(sub, 'comments');
    backfillProgress.commentsFound += comments;

    backfillProgress.subredditsDone++;
    backfillProgress.totalNew = countStmt.get().count - startCount;
    console.log(`[Arctic] r/${sub}: +${posts} posts, +${comments} comments (total new: ${backfillProgress.totalNew})`);

    await new Promise(r => setTimeout(r, 300));
  }

  const finalCount = countStmt.get().count;
  backfillProgress.status = 'done';
  backfillProgress.totalNew = finalCount - startCount;
  console.log(`[Arctic] Backfill complete. Added ${finalCount - startCount} items. New total: ${finalCount}`);
  backfillRunning = false;
}

// --- API routes ---
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api/count', (req, res) => {
  const { count } = countStmt.get();
  res.json({ count });
});

app.get('/api/recent', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 12, 100);
  const offset = parseInt(req.query.offset) || 0;
  const recent = recentStmt.all(limit, offset);
  const { count } = countStmt.get();
  res.json({ items: recent, total: count, hasMore: offset + limit < count });
});

app.post('/api/backfill', (req, res) => {
  if (backfillRunning) {
    return res.json({ status: 'already_running', progress: backfillProgress });
  }
  runBackfill().catch(err => console.error('[Arctic] Backfill error:', err));
  res.json({ status: 'started', progress: backfillProgress });
});

app.get('/api/backfill', (req, res) => {
  res.json({ progress: backfillProgress });
});

app.get('/api/top-subreddits', (req, res) => {
  const data = db.prepare('SELECT subreddit, COUNT(*) as count FROM seen_items GROUP BY subreddit ORDER BY count DESC LIMIT 5').all();
  res.json({ items: data });
});

app.get('/api/top-redditors', (req, res) => {
  const data = db.prepare('SELECT author, COUNT(*) as count FROM seen_items WHERE author IS NOT NULL GROUP BY author ORDER BY count DESC LIMIT 5').all();
  res.json({ items: data });
});

app.get('/api/chart', (req, res) => {
  const range = req.query.range || '30d';
  const now = Math.floor(Date.now() / 1000);

  let whereClause = '';
  let groupExpr = '';
  let params = [];

  switch (range) {
    case 'today': {
      const startOfDay = now - (now % 86400);
      whereClause = 'WHERE created_utc >= ?';
      params = [startOfDay];
      groupExpr = "strftime('%Y-%m-%d %H', created_utc, 'unixepoch')";
      break;
    }
    case '7d': {
      whereClause = 'WHERE created_utc >= ?';
      params = [now - 7 * 86400];
      groupExpr = "strftime('%Y-%m-%d', created_utc, 'unixepoch')";
      break;
    }
    case '30d': {
      whereClause = 'WHERE created_utc >= ?';
      params = [now - 30 * 86400];
      groupExpr = "strftime('%Y-%m-%d', created_utc, 'unixepoch')";
      break;
    }
    case 'all':
    default: {
      groupExpr = "strftime('%Y-%m', created_utc, 'unixepoch')";
      break;
    }
  }

  const sql = `
    SELECT ${groupExpr} as date, COUNT(*) as count
    FROM seen_items
    ${whereClause}
    GROUP BY date
    ORDER BY date ASC
  `;

  const data = db.prepare(sql).all(...params);
  res.json({ data });
});

// --- Start ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);

  // Poll immediately on startup
  pollReddit().catch(err => console.error('[Reddit] Poll error:', err));

  // Then poll every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    pollReddit().catch(err => console.error('[Reddit] Poll error:', err));
  });
});
