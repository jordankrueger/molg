/**
 * Pure helpers for the weekly updater: turning Claude's suggested changes into
 * applied score changes. No I/O, so scripts/scoring.test.mjs can exercise them.
 */

export const MAX_STEP = 3; // most a score can move in one run, either direction

// Same article, same key: drop the fragment and tracking params, lowercase the
// host, trim a trailing slash. Feeds append ?utm_campaign=rss to links.
export function normalizeUrl(raw) {
  try {
    const u = new URL(String(raw).trim());
    u.hash = '';
    for (const key of [...u.searchParams.keys()]) {
      if (key.toLowerCase().startsWith('utm_')) u.searchParams.delete(key);
    }
    u.hostname = u.hostname.toLowerCase();
    if (u.pathname.length > 1) u.pathname = u.pathname.replace(/\/+$/, '');
    return u.toString();
  } catch {
    return null;
  }
}

export function isoDate(pubDate, fallback) {
  const d = new Date(pubDate);
  return isNaN(d.getTime()) ? fallback : d.toISOString().split('T')[0];
}

// Take one article from each feed in turn so the 80-article cap doesn't fill up
// with the first two feeds and starve the economics and governance sources.
export function interleaveByFeed(items, cap) {
  const queues = new Map();
  for (const item of items) {
    if (!queues.has(item.source)) queues.set(item.source, []);
    queues.get(item.source).push(item);
  }
  const out = [];
  const lists = [...queues.values()];
  for (let i = 0; out.length < cap && lists.some(l => i < l.length); i++) {
    for (const l of lists) {
      if (i < l.length && out.length < cap) out.push(l[i]);
    }
  }
  return out;
}

export function overallProgress(predictions) {
  const { lastUpdated, ...sections } = predictions;
  const all = Object.values(sections).flatMap(s => s.predictions);
  return (all.reduce((sum, p) => sum + p.progress, 0) / all.length).toFixed(1);
}

/**
 * Apply Claude's suggested changes to `predictions` in place.
 * A change only lands if it names a real prediction, points at an article we
 * actually sent (by number, so the link and title come from the feed, never from
 * the model), that article hasn't already been used as evidence, and the move is
 * at most MAX_STEP points within 0-100. Returns what landed and what didn't.
 */
export function applyChanges(predictions, changes, articles, today) {
  const { lastUpdated, ...sections } = predictions;
  const byTitle = new Map();
  const usedUrls = new Set();
  for (const [key, section] of Object.entries(sections)) {
    for (const pred of section.predictions) {
      byTitle.set(pred.title, { key, pred });
      for (const e of pred.evidence || []) usedUrls.add(normalizeUrl(e.url));
    }
  }

  const applied = [];
  const rejected = [];
  const touched = new Set();
  const reject = (change, why) => rejected.push({ prediction: String(change?.prediction ?? '?'), why });

  for (const change of Array.isArray(changes) ? changes : []) {
    const found = byTitle.get(change?.prediction);
    if (!found) { reject(change, 'unknown prediction'); continue; }
    if (touched.has(change.prediction)) { reject(change, 'more than one change for this prediction'); continue; }

    const n = Number(change.article);
    const article = Number.isInteger(n) && n >= 1 ? articles[n - 1] : undefined;
    const url = article && normalizeUrl(article.link);
    if (!url) { reject(change, 'no matching article'); continue; }
    if (usedUrls.has(url)) { reject(change, 'article already counted'); continue; }

    const target = Math.round(Number(change.new_progress));
    if (!Number.isFinite(target)) { reject(change, 'no new score given'); continue; }
    const old = found.pred.progress;
    const step = Math.max(-MAX_STEP, Math.min(MAX_STEP, target - old));
    const next = Math.max(0, Math.min(100, old + step));
    if (next === old) { reject(change, 'no change'); continue; }

    found.pred.progress = next;
    if (!found.pred.evidence) found.pred.evidence = [];
    found.pred.evidence.push({ title: article.title, url, date: isoDate(article.pubDate, today) });
    usedUrls.add(url);
    touched.add(change.prediction);
    applied.push({
      section: found.key,
      prediction: change.prediction,
      old_progress: old,
      new_progress: next,
      reason: String(change.reason ?? ''),
    });
  }

  return { applied, rejected };
}
