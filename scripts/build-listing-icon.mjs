import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const source = fileURLToPath(new URL('../resources/marketplace-icon.svg', import.meta.url));
const target = fileURLToPath(new URL('../resources/marketplace-icon.png', import.meta.url));
const bytes = new Resvg(fs.readFileSync(source), { fitTo: { mode: 'width', value: 256 } }).render().asPng();
if (process.argv.includes('--check')) {
  if (!fs.existsSync(target) || !fs.readFileSync(target).equals(bytes)) {
    throw new Error('Listing icon is missing or out of date. Run npm run build:listing-icon.');
  }
  console.log('Listing icon is reproducible and up to date.');
} else {
  fs.writeFileSync(target, bytes);
  console.log(`Built original 256×256 listing icon (${bytes.length} bytes).`);
}
