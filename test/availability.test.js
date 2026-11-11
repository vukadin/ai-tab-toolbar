'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { watchProviderAvailability } = require('../availability');
const manifest = require('../package.json');
const providers = {
  codex: { extension: 'openai.chatgpt' },
  claude: { extension: 'anthropic.claude-code' }
};

function harness(ids = []) {
  const enabled = new Set(ids);
  const contexts = new Map();
  const listeners = new Set();
  const context = { subscriptions: [] };
  const vscode = {
    extensions: {
      getExtension: id => enabled.has(id) ? { isActive: false } : undefined,
      onDidChange: listener => {
        listeners.add(listener);
        return { dispose: () => listeners.delete(listener) };
      }
    },
    commands: { executeCommand: async (command, key, value) => {
      assert.equal(command, 'setContext', 'Availability never installs or activates providers');
      contexts.set(key, value);
    } }
  };
  return { vscode, context, contexts, enabled, listeners, change: async () => {
    for (const listener of listeners) listener();
    await new Promise(setImmediate);
  } };
}

for (const [name, ids, codex, claude] of [
  ['neither provider', [], false, false],
  ['Codex only', ['openai.chatgpt'], true, false],
  ['Claude only', ['anthropic.claude-code'], false, true],
  ['both providers', ['openai.chatgpt', 'anthropic.claude-code'], true, true]
]) {
  test(`startup availability: ${name}`, async () => {
    const h = harness(ids);
    await watchProviderAvailability(h.vscode, h.context, providers);
    assert.equal(h.contexts.get('aiTabToolbar.codexAvailable'), codex);
    assert.equal(h.contexts.get('aiTabToolbar.claudeAvailable'), claude);
    assert.equal(h.contexts.get('aiTabToolbar.anyProviderAvailable'), codex || claude);
  });
}

test('installed/enabled changes refresh contexts and the listener is disposable', async () => {
  const h = harness();
  await watchProviderAvailability(h.vscode, h.context, providers);
  h.enabled.add('openai.chatgpt');
  await h.change();
  assert.equal(h.contexts.get('aiTabToolbar.codexAvailable'), true);
  h.enabled.add('anthropic.claude-code');
  await h.change();
  assert.equal(h.contexts.get('aiTabToolbar.claudeAvailable'), true);
  // Disabled and removed providers both leave the current-window registry.
  h.enabled.delete('openai.chatgpt');
  await h.change();
  assert.equal(h.contexts.get('aiTabToolbar.codexAvailable'), false);
  assert.equal(h.contexts.get('aiTabToolbar.anyProviderAvailable'), true);
  h.enabled.delete('anthropic.claude-code');
  await h.change();
  assert.equal(h.contexts.get('aiTabToolbar.claudeAvailable'), false);
  assert.equal(h.contexts.get('aiTabToolbar.anyProviderAvailable'), false);
  h.context.subscriptions.forEach(s => s.dispose());
  assert.equal(h.listeners.size, 0);
});

test('all user entry points use the matching availability condition', () => {
  const conditions = new Map([
    ['aiTabToolbar.openCodex', 'aiTabToolbar.codexAvailable'],
    ['aiTabToolbar.openClaude', 'aiTabToolbar.claudeAvailable'],
    ['aiTabToolbar.useGroup', 'aiTabToolbar.anyProviderAvailable']
  ]);
  assert.ok(manifest.activationEvents.includes('onStartupFinished'), 'Hidden commands must bootstrap without a click');
  for (const command of manifest.contributes.commands) {
    assert.equal(command.enablement, conditions.get(command.command));
    const menu = manifest.contributes.menus.commandPalette.find(item => item.command === command.command);
    assert.equal(menu.when, conditions.get(command.command));
  }
  for (const menu of ['editor/title', 'editor/title/context']) {
    for (const item of manifest.contributes.menus[menu]) assert.equal(item.when, conditions.get(item.command));
  }
  assert.equal(manifest.extensionDependencies, undefined, 'Providers remain optional');
});

test('command icons reference packaged product glyphs instead of fixed-color images', () => {
  for (const name of ['codex', 'claude']) {
    const id = `ai-tab-toolbar-${name}`;
    const command = manifest.contributes.commands.find(c => c.command === `aiTabToolbar.open${name === 'codex' ? 'Codex' : 'Claude'}`);
    assert.equal(command.icon, `$(${id})`);
    const glyph = manifest.contributes.icons[id].default;
    const bytes = fs.readFileSync(path.join(__dirname, '..', glyph.fontPath));
    assert.equal(bytes.subarray(0, 4).toString(), 'wOFF');
    assert.match(glyph.fontCharacter, /^\\E00[12]$/);
  }
});
