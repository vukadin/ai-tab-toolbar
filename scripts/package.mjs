import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { releaseProblems } from './release-validation.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json')));
const draft = process.argv.includes('--draft');
const problems = releaseProblems(manifest, root, { draft });
if (problems.length) throw new Error(problems.join('\n'));
const tests = spawnSync(process.execPath, ['--test', 'test/availability.test.js', 'test/release.test.js'], { cwd: root, stdio: 'inherit' });
if (tests.status !== 0) process.exit(tests.status ?? 1);
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
const target = path.join(root, 'dist', `${manifest.publisher}.${manifest.name}-${manifest.version}${draft ? '-draft' : ''}.vsix`);
const args = [path.join(root, 'node_modules/@vscode/vsce/vsce'), 'package', '--no-dependencies', '--out', target];
// A source repository is optional; no placeholder repository URL is invented.
if (!manifest.repository) args.push('--allow-missing-repository');
const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`Prepared ${target}. Nothing has been uploaded or published.`);
