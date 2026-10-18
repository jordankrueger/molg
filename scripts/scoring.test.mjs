// Run with: node --test scripts/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyChanges, decodeEntities, interleaveByFeed, normalizeUrl } from './scoring.mjs';

const TODAY = '2026-10-19';

function fixture() {
  return {
    lastUpdated: '2026-10-12',
    biology: {
      title: 'Biology and Physical Health',
      predictions: [
        { title: 'Cancer Treatment', progress: 47, evidence: [{ title: 'Old', url: 'https://example.org/old', date: '2026-01-01' }] },
        { title: "Alzheimer's Prevention", progress: 99, evidence: [] },
      ],
    },
    governance: {
      title: 'Peace and Governance',
      predictions: [{ title: 'Information Environment', progress: 1, evidence: [] }],
    },
  };
}

const ARTICLES = [
  { source: 'STAT News', title: 'Real article one', link: 'https://www.statnews.com/a/?utm_campaign=rss', pubDate: 'Mon, 12 Oct 2026 10:00:00 GMT' },
  { source: 'Nature', title: 'Already used', link: 'https://example.org/old/', pubDate: '' },
  { source: 'UN News', title: 'Real article three', link: 'https://news.un.org/c', pubDate: 'garbage' },
];

test('applies a valid change with title, link and date taken from the feed article', () => {
  const p = fixture();
  const { applied, rejected } = applyChanges(p, [
    { prediction: 'Cancer Treatment', article: 1, new_progress: 49, reason: 'r', evidence: { url: 'https://made-up.example/x' } },
  ], ARTICLES, TODAY);
  assert.equal(rejected.length, 0);
  assert.deepEqual(applied, [{ section: 'biology', prediction: 'Cancer Treatment', old_progress: 47, new_progress: 49, reason: 'r' }]);
  assert.equal(p.biology.predictions[0].progress, 49);
  assert.deepEqual(p.biology.predictions[0].evidence.at(-1), { title: 'Real article one', url: 'https://www.statnews.com/a', date: '2026-10-12' });
});

test('caps the step at 3 points and keeps the score within 0-100', () => {
  const p = fixture();
  const { applied } = applyChanges(p, [
    { prediction: 'Cancer Treatment', article: 1, new_progress: 90 },
    { prediction: "Alzheimer's Prevention", article: 3, new_progress: 150 },
  ], ARTICLES, TODAY);
  assert.equal(p.biology.predictions[0].progress, 50);
  assert.equal(p.biology.predictions[1].progress, 100);
  assert.equal(applied[1].old_progress, 99);
  assert.equal(p.biology.predictions[1].evidence[0].date, TODAY, 'unparseable pubDate falls back to today');
});

test('finds the prediction by title even when the model names the wrong section', () => {
  const p = fixture();
  const { applied } = applyChanges(p, [{ section: 'neuroscience', prediction: "Alzheimer's Prevention", article: 1, new_progress: 97 }], ARTICLES, TODAY);
  assert.equal(applied[0].section, 'biology');
  assert.equal(p.biology.predictions[1].progress, 97);
});

test('rejects unknown predictions, missing or out-of-range articles, reused articles and duplicates', () => {
  const p = fixture();
  const { applied, rejected } = applyChanges(p, [
    { prediction: 'Nope', article: 1, new_progress: 10 },
    { prediction: 'Cancer Treatment', new_progress: 50 },
    { prediction: 'Cancer Treatment', article: 4, new_progress: 50 },
    { prediction: 'Cancer Treatment', article: 0, new_progress: 50 },
    { prediction: 'Cancer Treatment', article: 2, new_progress: 50 },
    { prediction: 'Cancer Treatment', article: 1, new_progress: 48 },
    { prediction: 'Cancer Treatment', article: 3, new_progress: 49 },
    { prediction: 'Information Environment', article: 1, new_progress: 0 },
  ], ARTICLES, TODAY);
  assert.deepEqual(rejected.map(r => r.why), [
    'unknown prediction',
    'no matching article',
    'no matching article',
    'no matching article',
    'article already counted',
    'more than one change for this prediction',
    'article already counted',
  ]);
  assert.equal(applied.length, 1);
  assert.equal(p.biology.predictions[0].progress, 48);
  assert.equal(p.governance.predictions[0].progress, 1, 'reused article cannot move a second prediction');
});

test('a score can go down, and a no-op change is rejected', () => {
  const p = fixture();
  const { applied, rejected } = applyChanges(p, [
    { prediction: 'Information Environment', article: 3, new_progress: -5 },
    { prediction: 'Cancer Treatment', article: 1, new_progress: 47 },
  ], ARTICLES, TODAY);
  assert.equal(p.governance.predictions[0].progress, 0);
  assert.equal(applied[0].new_progress, 0);
  assert.deepEqual(rejected.map(r => r.why), ['no change']);
});

test('tolerates a missing or malformed changes list', () => {
  assert.deepEqual(applyChanges(fixture(), undefined, ARTICLES, TODAY), { applied: [], rejected: [] });
});

test('normalizeUrl strips tracking params, fragment and trailing slash', () => {
  assert.equal(normalizeUrl('https://WWW.Example.com/a/b/?utm_source=x&id=2#top'), 'https://www.example.com/a/b?id=2');
  assert.equal(normalizeUrl('not a url'), null);
});

test('interleaveByFeed takes one article per feed in turn up to the cap', () => {
  const items = [
    { source: 'A', title: 'a1' }, { source: 'A', title: 'a2' }, { source: 'A', title: 'a3' },
    { source: 'B', title: 'b1' },
    { source: 'C', title: 'c1' }, { source: 'C', title: 'c2' },
  ];
  assert.deepEqual(interleaveByFeed(items, 5).map(i => i.title), ['a1', 'b1', 'c1', 'a2', 'c2']);
  assert.equal(interleaveByFeed(items, 100).length, 6);
});

test('rejects non-numeric scores and non-integer article numbers instead of coercing them', () => {
  const p = fixture();
  const { applied, rejected } = applyChanges(p, [
    { prediction: 'Cancer Treatment', article: 1, new_progress: null },
    { prediction: 'Cancer Treatment', article: 1, new_progress: '' },
    { prediction: 'Cancer Treatment', article: 1, new_progress: { toString: null } },
    { prediction: 'Cancer Treatment', article: true, new_progress: 48 },
    { prediction: 'Cancer Treatment', article: [1], new_progress: 48 },
    { prediction: 'Cancer Treatment', article: '1', new_progress: 48 },
    { prediction: 'Cancer Treatment', article: 1.5, new_progress: 48 },
  ], ARTICLES, TODAY);
  assert.equal(applied.length, 0);
  assert.deepEqual(rejected.map(r => r.why), [
    'no new score given', 'no new score given', 'no new score given',
    'no matching article', 'no matching article', 'no matching article', 'no matching article',
  ]);
  assert.equal(p.biology.predictions[0].progress, 47);
});

test('the same link with and without tracking params normalizes to one key', () => {
  assert.equal(
    normalizeUrl('https://example.org/result?name=AI%20trial&utm_source=rss'),
    normalizeUrl('https://example.org/result?name=AI%20trial'),
  );
});

test('decodeEntities unescapes feed links so tracking params can be stripped', () => {
  assert.equal(decodeEntities('https://e.org/a?id=1&amp;utm_source=rss'), 'https://e.org/a?id=1&utm_source=rss');
  assert.equal(normalizeUrl(decodeEntities('https://e.org/a?id=1&amp;utm_source=rss')), 'https://e.org/a?id=1');
  assert.equal(decodeEntities('Tom &amp; Jerry &#8217;s &#x2014; &lt;b&gt;'), 'Tom & Jerry \u2019s \u2014 <b>');
});
