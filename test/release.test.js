'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const manifest = require('../package.json');
const root = path.join(__dirname, '..');

test('release metadata and assets are complete', async () => {
  const { releaseProblems } = await import('../scripts/release-validation.mjs');
  assert.deepEqual(releaseProblems(manifest, root), []);
  assert.deepEqual(releaseProblems(manifest, root, { draft: true }), []);
});

test('public package allowlist excludes developer files and includes notices', () => {
  const files = new Set(manifest.files);
  for (const required of ['extension.js', 'availability.js', 'LICENSE', 'PRIVACY.md', 'THIRD_PARTY_NOTICES.md',
    'licenses/lobehub-icons-LICENSE', 'resources/ai-tab-toolbar.woff', 'resources/marketplace-icon.png']) {
    assert.ok(files.has(required), `Include ${required}`);
  }
  assert.ok(!manifest.files.some(name => /node_modules|test\/|scripts\/|\.venv|\.env|\.svg/.test(name)));
  assert.equal(manifest.dependencies, undefined, 'No shipped runtime dependencies');
  const ignored = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
  for (const entry of ['node_modules/', '.venv/', 'dist/', '*.vsix', '.env']) assert.ok(ignored.includes(entry), `Ignore ${entry}`);
});

test('logo provenance records pinned MIT sources and the full notice is present', () => {
  const provenance = require('../resources/icon-sources.json');
  assert.equal(provenance.license, 'MIT');
  assert.match(provenance.integrity, /^sha512-/);
  assert.match(provenance.commit, /^[a-f0-9]{40}$/);
  const license = fs.readFileSync(path.join(root, provenance.licenseFile), 'utf8');
  assert.match(license, /Copyright \(c\) 2023 LobeHub/);
  assert.match(license, /Permission is hereby granted/);
});

test('release validation rejects unfinished metadata and an SVG listing icon', async () => {
  const { releaseProblems } = await import('../scripts/release-validation.mjs');
  const bad = { ...manifest, publisher: 'vukadin-local', private: true, license: 'UNLICENSED', icon: 'resources/marketplace-icon.svg' };
  const problems = releaseProblems(bad, root);
  assert.ok(problems.some(p => p.includes('placeholder')));
  assert.ok(problems.some(p => p.includes('private')));
  assert.ok(problems.some(p => p.includes('license')));
  assert.ok(problems.some(p => p.includes('PNG')));
});
