'use strict';
const fs = require('node:fs');
const vscode = require('vscode');
const manifest = require('../package.json');

exports.run = async function () {
  fs.rmSync('/tmp/ai-tab-toolbar-home-preview-done', { force: true });
  await vscode.extensions.getExtension(`${manifest.publisher}.${manifest.name}`).activate();
  await vscode.commands.executeCommand('aiTabToolbar.openCodex');
  fs.writeFileSync('/tmp/ai-tab-toolbar-home-preview-ready', 'ready');
  await new Promise(resolve => {
    const interval = setInterval(() => {
      if (fs.existsSync('/tmp/ai-tab-toolbar-home-preview-done')) {
        clearInterval(interval);
        clearTimeout(timeout);
        resolve();
      }
    }, 1000);
    const timeout = setTimeout(() => { clearInterval(interval); resolve(); }, 180000);
  });
};
