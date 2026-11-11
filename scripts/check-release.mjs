import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { releaseProblems } from './release-validation.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url)));
const draft = process.argv.includes('--draft');
const problems = releaseProblems(manifest, root, { draft });
if (problems.length) {
  console.error('Release preparation needs attention:\n' + problems.map(p => `- ${p}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(draft ? 'Draft package checks passed. Publisher ownership still needs verification.' :
    `Release files validated for ${manifest.publisher}.${manifest.name}@${manifest.version}. Verify publisher ownership before upload.`);
}
