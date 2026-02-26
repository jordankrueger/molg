#!/usr/bin/env node

/**
 * MOLG Prediction Updater
 *
 * Fetches recent AI/science/health news from RSS feeds, sends them to Claude
 * along with current prediction data, and updates predictions.json if Claude
 * identifies meaningful progress. Appends every run to AUDIT-LOG.md.
 *
 * Runs via GitHub Actions on a weekly schedule. Uses Claude Haiku for cost efficiency.
 * Zero npm dependencies — uses Node 20 native fetch.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PREDICTIONS_PATH = resolve(ROOT, 'data/predictions.json');
const AUDIT_LOG_PATH = resolve(ROOT, 'AUDIT-LOG.md');

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
  const itemRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

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
      block.match(/<updated>(.*?)<\/updated>/)
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
      console.warn(`  [WARN] ${feed.name}: HTTP ${response.status}`);
      return [];
    }

    const xml = await response.text();
    const items = parseRSSItems(xml);
    console.log(`  ${feed.name}: ${items.length} items`);
    return items.map(item => ({ ...item, source: feed.name }));
  } catch (err) {
    console.warn(`  [WARN] ${feed.name}: ${err.message}`);
    return [];
  }
}

function filterRecentItems(items, daysBack = 14) {
  const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000;
  return items.filter(item => {
    if (!item.pubDate) return true; // include items without dates
    const d = new Date(item.pubDate);
    return !isNaN(d.getTime()) && d.getTime() > cutoff;
  });
}

// ─── Claude API ─────────────────────────────────────────────────

async function callClaude(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.content[0].text;
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
  for (const result of feedResults) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    }
  }

  // 3. Filter to recent items
  const recentItems = filterRecentItems(allItems);
  console.log(`\n${recentItems.length} recent articles (last 14 days) from ${allItems.length} total.`);

  if (recentItems.length === 0) {
    console.log('No recent articles found. Writing audit log and exiting.');
    appendAuditLog(today, 0, 'No recent articles found from any RSS feeds. Feeds may be down.', [], predictions);
    process.exit(0);
  }

  // 4. Build article summary for Claude (truncate to keep token usage reasonable)
  const articleSummary = recentItems
    .slice(0, 80) // cap at 80 articles
    .map((item, i) => `${i + 1}. [${item.source}] "${item.title}" — ${item.description}${item.link ? ` (${item.link})` : ''}`)
    .join('\n');

  // 5. Build the prediction summary
  const { lastUpdated, ...sections } = predictions;
  const predictionSummary = Object.entries(sections)
    .map(([key, section]) => {
      const s = section;
      const preds = s.predictions
        .map(p => `  - ${p.title}: ${p.progress}% — ${p.description}`)
        .join('\n');
      return `### ${s.title} (section key: "${key}")\n${preds}`;
    })
    .join('\n\n');

  // 6. Call Claude
  console.log('\nAsking Claude to evaluate...');
  const prompt = `You are evaluating progress on predictions from Dario Amodei's "Machines of Loving Grace" essay. These predictions describe what AI could achieve in 5-10 years after powerful AI is developed.

## Current Prediction Progress (as of ${lastUpdated})

${predictionSummary}

## Recent News Articles (last 14 days)

${articleSummary}

## Your Task

Evaluate whether any of the recent articles represent meaningful progress toward any of the predictions. Be CONSERVATIVE:

- Only recommend a progress change if there's clear, concrete evidence (not just speculation or announcements)
- Progress changes should be small: typically 1-3 percentage points
- A single news article rarely justifies more than a 1-2 point change
- If nothing significant happened, say so — no changes is a perfectly valid outcome
- Progress can also go DOWN if evidence suggests setbacks

Respond with ONLY a JSON object in this exact format (no markdown code fences, no other text):

{
  "changes": [
    {
      "section": "biology (use the exact section key shown above)",
      "prediction": "Cancer Treatment (use the exact prediction title shown above)",
      "old_progress": 20,
      "new_progress": 22,
      "reason": "Brief explanation of why",
      "evidence": {
        "title": "Article title",
        "url": "https://...",
        "date": "YYYY-MM-DD"
      }
    }
  ],
  "summary": "One paragraph summary of this week's evaluation. What did you look at, what was notable even if it didn't warrant a change, and what changed if anything."
}

If no changes are warranted, return: { "changes": [], "summary": "..." }`;

  const responseText = await callClaude(prompt);

  let evaluation;
  try {
    // Handle case where Claude wraps in code fences despite instructions
    const jsonStr = responseText.replace(/^```json?\n?/m, '').replace(/\n?```$/m, '').trim();
    evaluation = JSON.parse(jsonStr);
  } catch (err) {
    console.error('Failed to parse Claude response:', responseText.slice(0, 500));
    appendAuditLog(today, recentItems.length, 'Error: Could not parse Claude API response.', [], predictions);
    process.exit(1);
  }

  console.log(`\nEvaluation: ${evaluation.changes.length} changes recommended.`);
  console.log(`Summary: ${evaluation.summary}\n`);

  // 7. Apply changes if any
  // Build flexible lookups — Claude returns inconsistent key formats
  const sectionLookup = {}; // normalized string → section key
  for (const [key, section] of Object.entries(sections)) {
    const norm = str => str.toLowerCase().replace(/[^a-z]/g, '');
    sectionLookup[norm(key)] = key;
    sectionLookup[norm(section.title)] = key;
  }

  function resolveSection(input) {
    const norm = input.toLowerCase().replace(/[^a-z]/g, '');
    return sectionLookup[norm] || null;
  }

  if (evaluation.changes.length > 0) {
    for (const change of evaluation.changes) {
      const sectionKey = resolveSection(change.section);
      const section = sectionKey ? predictions[sectionKey] : null;
      if (!section) {
        console.warn(`  [WARN] Unknown section: ${change.section}`);
        continue;
      }
      const pred = section.predictions.find(p => p.title === change.prediction);
      if (!pred) {
        console.warn(`  [WARN] Unknown prediction: ${change.prediction} in ${change.section}`);
        continue;
      }
      const oldVal = pred.progress;
      pred.progress = change.new_progress;

      // Add evidence if provided
      if (change.evidence && change.evidence.title && change.evidence.url) {
        if (!pred.evidence) pred.evidence = [];
        // Avoid duplicate URLs
        if (!pred.evidence.some(e => e.url === change.evidence.url)) {
          pred.evidence.push(change.evidence);
        }
      }

      console.log(`  ${change.section}/${change.prediction}: ${oldVal}% → ${change.new_progress}%`);
    }

    predictions.lastUpdated = today;
    writeFileSync(PREDICTIONS_PATH, JSON.stringify(predictions, null, 2) + '\n');
    console.log('\npredictions.json updated.');
  } else {
    console.log('No changes to apply.');
  }

  // 8. Write audit log
  appendAuditLog(today, recentItems.length, evaluation.summary, evaluation.changes, predictions);
  console.log('Audit log updated.');
}

function appendAuditLog(date, articlesScanned, summary, changes, predictions) {
  // Calculate overall progress
  const { lastUpdated, ...sections } = predictions;
  let totalProgress = 0;
  let totalPredictions = 0;
  for (const section of Object.values(sections)) {
    for (const pred of section.predictions) {
      totalProgress += pred.progress;
      totalPredictions++;
    }
  }
  const avgProgress = (totalProgress / totalPredictions).toFixed(1);

  // Build the new entry
  let entry = `\n## ${date}\n\n`;
  entry += `**Articles scanned:** ${articlesScanned} | **Overall progress:** ${avgProgress}%\n\n`;

  if (changes.length > 0) {
    entry += `**Changes:**\n`;
    for (const c of changes) {
      entry += `- **${c.prediction}** (${c.section}): ${c.old_progress}% → ${c.new_progress}% — ${c.reason}\n`;
    }
    entry += '\n';
  } else {
    entry += `**No changes this week.**\n\n`;
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
