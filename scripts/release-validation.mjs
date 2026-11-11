import fs from 'node:fs';
import path from 'node:path';

export function releaseProblems(manifest, root, { draft = false } = {}) {
  const problems = [];
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(manifest.publisher ?? '')) problems.push('Set a valid Marketplace publisher ID.');
  if (!draft && ['vukadin-local', 'your-publisher', 'change-me'].includes(manifest.publisher)) {
    problems.push('Replace the local placeholder publisher ID with the registered Marketplace publisher ID.');
  }
  if (manifest.private) problems.push('Remove the private flag from the public manifest.');
  if (!manifest.license || manifest.license === 'UNLICENSED') problems.push('Choose a distribution license and include its LICENSE file.');
  if (!manifest.icon?.endsWith('.png')) problems.push('Marketplace listing icon must be a PNG.');
  for (const name of ['README.md', 'CHANGELOG.md', 'LICENSE', 'PRIVACY.md', 'THIRD_PARTY_NOTICES.md',
    'licenses/lobehub-icons-LICENSE', 'resources/ai-tab-toolbar.woff', manifest.icon].filter(Boolean)) {
    if (!fs.existsSync(path.join(root, name))) problems.push(`Missing release file: ${name}`);
  }
  if (manifest.icon && fs.existsSync(path.join(root, manifest.icon))) {
    const png = fs.readFileSync(path.join(root, manifest.icon));
    if (png.length < 24 || png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' ||
        png.readUInt32BE(16) < 128 || png.readUInt32BE(20) < 128) problems.push('Listing icon must be a valid PNG at least 128×128.');
  }
  for (const name of ['README.md', 'CHANGELOG.md', 'PRIVACY.md']) {
    const file = path.join(root, name);
    if (fs.existsSync(file) && /\/Users\/|\/private\/tmp\/|\/tmp\/|file:\/\//.test(fs.readFileSync(file, 'utf8'))) {
      problems.push(`Remove machine-specific paths from ${name}.`);
    }
  }
  if (!Array.isArray(manifest.files) || !manifest.files.length) problems.push('Use an explicit runtime package allowlist.');
  return problems;
}
