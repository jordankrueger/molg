#!/usr/bin/env node

/**
 * MOLG Prediction Updater
 *
 * Fetches recent AI/science/health news from RSS feeds, sends them to Claude
 * along with current prediction data, and updates predictions.json if Claude
 * identifies meaningful progress. Appends every run to AUDIT-LOG.md.
 *
 * Runs via GitHub Actions on a weekly schedule. Which suggested changes are allowed
 * to land is decided in scoring.mjs, not by the model.
 * Zero npm dependencies — uses native fetch.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { applyChanges, interleaveByFeed, overallProgress } from './scoring.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PREDICTIONS_PATH = resolve(ROOT, 'data/predictions.json');
const AUDIT_LOG_PATH = resolve(ROOT, 'AUDIT-LOG.md');
const SUMMARY_PATH = resolve(ROOT, 'data/last-run-summary.json');

function writeRunSummary({ rssFeedsOk, articlesEvaluated, predictionsChanged, note }) {
  const payload = {
    generated_at: new Date().toISOString(),
    rss_feeds_ok: rssFeedsOk,
    rss_feeds_total: RSS_FEEDS.length,
    articles_evaluated: articlesEvaluated,
    predictions_changed: predictionsChanged,
  };
  if (note) payload.note = note;
  writeFileSync(SUMMARY_PATH, JSON.stringify(payload, null, 2) + '\n');
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is required');
  process.exit(1);
}

// RSS feeds covering all prediction categories
const RSS_FEEDS = [
  // Biology & Health
  { name: 'Nature', url: 'https://www.nature.com/nature.rss' },
  { name: 'STAT News', url: 'https://www.statnews.com/feed/' },
  { name: 'WHO News', url: 'https://www.who.int/rss-feeds/news-english.xml' },
  // AI & Technology
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/' },
  { name: 'Ars Technica Science', url: 'https://feeds.arstechnica.com/arstechnica/science' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  // Economics & Governance
  { name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/top/science.xml' },
  { name: 'UN News', url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml' },
];

// ─── RSS Parsing ────────────────────────────────────────────────

function parseRSSItems(xml) {
  const items = [];

  // Handle RSS 2.0 (<item>) and Atom (<entry>) formats
  // Attributes allowed: Nature's RSS 1.0 feed uses <item rdf:about="...">
  const itemRegex = /<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[2];

    // Title: handle CDATA and plain text
    const title = (
      block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s) ||
      block.match(/<title[^>]*>(.*?)<\/title>/s)
    )?.[1]?.trim() || '';

    // Link: RSS uses <link>url</link>, Atom uses <link href="url"/>
    const link = (
      block.match(/<link>(.*?)<\/link>/) ||
      block.match(/<link[^>]*href="([^"]*)"/)
    )?.[1]?.trim() || '';

    // Description/summary
    const desc = (
      block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/s) ||
      block.match(/<description[^>]*>(.*?)<\/description>/s) ||
      block.match(/<summary[^>]*>(.*?)<\/summary>/s) ||
      block.match(/<content[^>]*>(.*?)<\/content>/s)
    )?.[1]?.replace(/<[^>]*>/g, '').trim().slice(0, 300) || '';

    // Date
    const pubDate = (
      block.match(/<pubDate>(.*?)<\/pubDate>/) ||
      block.match(/<published>(.*?)<\/published>/) ||
      block.match(/<updated>(.*?)<\/updated>/) ||
      block.match(/<dc:date>(.*?)<\/dc:date>/)
    )?.[1]?.trim() || '';

    if (title) {
      items.push({ title, link, description: desc, pubDate });
    }
  }

  return items;
}

async function fetchFeed(feed) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(feed.url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'MOLG-Prediction-Updater/1.0' },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xml = await response.text();
    const items = parseRSSItems(xml);
    console.log(`  ${feed.name}: ${items.length} items`);
    return items.map(item => ({ ...item, source: feed.name }));
  } catch (err) {
    console.warn(`  [WARN] ${feed.name}: ${err.message}`);
    throw err; // counted as a failed feed in rss_feeds_ok
  }
}

function filterRecentItems(items, daysBack = 7) {
  const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000;
  return items.filter(item => {
    if (!item.pubDate) return true; // include items without dates; reused links are still blocked
    const d = new Date(item.pubDate);
    return !isNaN(d.getTime()) && d.getTime() > cutoff;
  });
}

// ─── Claude API ─────────────────────────────────────────────────

const MODEL = 'claude-opus-5-5';

async function callClaude(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: 'medium' },
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  if (data.stop_reason === 'refusal') throw new Error('Claude declined the request (stop_reason: refusal)');
  // Thinking is always on for this model, so the first block may be a thinking block.
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  if (!text) throw new Error(`No text in Claude response (stop_reason: ${data.stop_reason})`);
  return text;
}

// ─── Main Logic ─────────────────────────────────────────────────

async function main() {
  const today = new Date().toISOString().split('T')[0];
  console.log(`\nMOLG Prediction Update — ${today}\n`);

  // 1. Read current predictions
  const predictions = JSON.parse(readFileSync(PREDICTIONS_PATH, 'utf-8'));
  console.log('Current predictions loaded.');

  // 2. Fetch RSS feeds
  console.log('\nFetching RSS feeds...');
  const allItems = [];
  const feedResults = await Promise.allSettled(
    RSS_FEEDS.map(feed => fetchFeed(feed))
  );
  let rssFeedsOk = 0;
  for (const result of feedResults) {
    if (result.status === 'fulfilled') {
      if (result.value.length > 0) rssFeedsOk += 1; // an empty feed counts as down
      allItems.push(...result.value);
    }
  }

  // 3. Filter to the last week (runs are weekly, so no article is shown twice)
  const recentItems = filterRecentItems(allItems);
  console.log(`\n${recentItems.length} recent articles (last 7 days) from ${allItems.length} total.`);

  if (recentItems.length === 0) {
    console.log('No recent articles found. Writing audit log and exiting.');
    appendAuditLog(today, 0, 0, 'No recent articles found from any RSS feeds. Feeds may be down.', [], [], predictions);
    writeRunSummary({
      rssFeedsOk,
      articlesEvaluated: 0,
      predictionsChanged: 0,
      note: 'No recent articles found from any RSS feeds.',
    });
    process.exit(0);
  }

  // 4. Pick up to 80 articles, one feed at a time, and number them
  const articles = interleaveByFeed(recentItems, 80);
  const articlesEvaluated = articles.length;
  const articleSummary = articles
    .map((item, i) => `${i + 1}. [${item.source}] "${item.title}" — ${item.description}`)
    .join('\n');

  // 5. Build the prediction summary
  const { lastUpdated, ...sections } = predictions;
  const predictionSummary = Object.values(sections)
    .map(s => {
      const preds = s.predictions
        .map(p => `  - ${p.title}: ${p.progress}% — ${p.description}`)
        .join('\n');
      return `### ${s.title}\n${preds}`;
    })
    .join('\n\n');

  // 6. Call Claude
  console.log(`\nAsking Claude (${MODEL}) to evaluate ${articlesEvaluated} articles...`);
  const prompt = `You are scoring progress on predictions from Dario Amodei's "Machines of Loving Grace" essay. The essay predicts what powerful AI could achieve within 5-10 years of being developed. Each score is a 0-100 judgment of how far the world has moved toward that prediction.

## Current scores (as of ${lastUpdated})

${predictionSummary}

## This week's articles (numbered)

${articleSummary}

## Scoring rules

Most weeks nothing should change. Zero or one change is the normal result; never change a score just because an article is on a related topic.

A score goes UP only when BOTH are true:
1. AI or machine learning played a direct, named part in the result (for example an AI-designed drug, an AI model used in a trial or diagnosis, AI-run public services). General science or health news with no AI role does not count, however good it is.
2. The evidence is solid: a peer-reviewed result, a regulatory approval or decision, official data from a government or international body (WHO, UN, World Bank), or a deployment that is live, not announced.

A score goes DOWN when an article gives the same kind of solid evidence that the world moved away from the prediction (an official statistic worsening, a law or policy that reverses progress, a documented failure), whether or not AI was involved.

Never count announcements, press releases, funding rounds, early-stage or animal studies, opinion pieces, or predictions. Each change is at most 3 points. Use one article per change, and change each prediction at most once.

## Response format

Respond with ONLY a JSON object (no code fences, no other text):

{
  "changes": [
    {
      "prediction": "Cancer Treatment (exact title from the list above)",
      "article": 12,
      "new_progress": 48,
      "reason": "One or two sentences: what happened, what AI did, and why the evidence meets the rules"
    }
  ],
  "summary": "One paragraph for a general reader: what you looked at, what came close but did not meet the rules, and what changed, if anything. Name stories by what they are, never by their article number."
}

"article" is the number of the article in the list above. If nothing meets the rules, return { "changes": [], "summary": "..." }`;

  const responseText = await callClaude(prompt);

  let evaluation;
  try {
    const start = responseText.indexOf('{');
    const end = responseText.lastIndexOf('}');
    evaluation = JSON.parse(responseText.slice(start, end + 1));
  } catch (err) {
    console.error('Failed to parse Claude response:', responseText.slice(0, 500));
    appendAuditLog(today, recentItems.length, articlesEvaluated, 'Error: Could not parse Claude API response.', [], [], predictions);
    writeRunSummary({
      rssFeedsOk,
      articlesEvaluated,
      predictionsChanged: 0,
      note: 'Claude API response unparseable.',
    });
    process.exit(1);
  }

  const summary = String(evaluation.summary ?? '');
  console.log(`\nEvaluation: ${(evaluation.changes || []).length} changes suggested.`);
  console.log(`Summary: ${summary}\n`);

  // 7. Apply only the changes that pass the checks in scoring.mjs
  const { applied, rejected } = applyChanges(predictions, evaluation.changes, articles, today);
  for (const c of applied) console.log(`  ${c.section}/${c.prediction}: ${c.old_progress}% → ${c.new_progress}%`);
  for (const r of rejected) console.warn(`  [SKIPPED] ${r.prediction}: ${r.why}`);

  if (applied.length > 0) {
    predictions.lastUpdated = today;
    writeFileSync(PREDICTIONS_PATH, JSON.stringify(predictions, null, 2) + '\n');
    console.log('\npredictions.json updated.');
  } else {
    console.log('No changes to apply.');
  }

  // 8. Write audit log
  appendAuditLog(today, recentItems.length, articlesEvaluated, summary, applied, rejected, predictions);
  console.log('Audit log updated.');

  // 9. Write run summary for Drift watcher
  writeRunSummary({
    rssFeedsOk,
    articlesEvaluated,
    predictionsChanged: applied.length,
  });
  console.log('Run summary written.');
}

function appendAuditLog(date, articlesFound, articlesSent, summary, applied, rejected, predictions) {
  // Build the new entry
  let entry = `\n## ${date}\n\n`;
  entry += `**Articles found:** ${articlesFound} | **Sent to the model:** ${articlesSent} | **Overall progress:** ${overallProgress(predictions)}%\n\n`;

  if (applied.length > 0) {
    entry += `**Changes:**\n`;
    for (const c of applied) {
      entry += `- **${c.prediction}** (${c.section}): ${c.old_progress}% → ${c.new_progress}% — ${c.reason}\n`;
    }
    entry += '\n';
  } else {
    entry += `**No changes this week.**\n\n`;
  }

  if (rejected.length > 0) {
    entry += `**Suggested but not applied:** ${rejected.map(r => `${r.prediction} (${r.why})`).join('; ')}\n\n`;
  }

  entry += `**Summary:** ${summary}\n`;

  // Read existing log or create new
  let log;
  if (existsSync(AUDIT_LOG_PATH)) {
    log = readFileSync(AUDIT_LOG_PATH, 'utf-8');
  } else {
    log = '# MOLG Audit Log\n\nAutomated weekly evaluation of AI progress predictions.\nEach entry shows what was scanned, what changed, and why.\n';
  }

  // Insert new entry after the header (newest first)
  const headerEnd = log.indexOf('\n## ');
  if (headerEnd !== -1) {
    log = log.slice(0, headerEnd) + entry + log.slice(headerEnd);
  } else {
    log = log + entry;
  }

  writeFileSync(AUDIT_LOG_PATH, log);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
