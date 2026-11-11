import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const localPython = path.join(root, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const python = process.env.PYTHON || (fs.existsSync(localPython) ? localPython : process.platform === 'win32' ? 'python' : 'python3');
const result = spawnSync(python, [path.join(root, 'scripts/build-icons.py'), ...process.argv.slice(2)], { cwd: root, stdio: 'inherit' });
if (result.error) console.error('Create the Python virtual environment and install scripts/requirements.txt before rebuilding the font.');
process.exit(result.status ?? 1);
