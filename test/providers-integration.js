'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vscode = require('vscode');
const { watchProviderAvailability } = require('../availability');
const manifest = require('../package.json');

exports.run = async () => {
  const scenario = process.env.AI_TAB_EXPECT;
  const report = `/tmp/ai-tab-toolbar-${manifest.version}-${scenario}.json`;
  const providers = {
    codex: { extension: 'openai.chatgpt' },
    claude: { extension: 'anthropic.claude-code' }
  };
  const subscriptions = [];
  const contexts = {};
  try {
    await vscode.extensions.getExtension(`${manifest.publisher}.${manifest.name}`).activate();
    await watchProviderAvailability({
      extensions: vscode.extensions,
      commands: { executeCommand: async (command, key, value) => {
        contexts[key] = value;
        return vscode.commands.executeCommand(command, key, value);
      } }
    }, { subscriptions }, providers);
    assert.equal(contexts['aiTabToolbar.codexAvailable'], ['codex', 'both'].includes(scenario));
    assert.equal(contexts['aiTabToolbar.claudeAvailable'], ['claude', 'both'].includes(scenario));
    assert.equal(contexts['aiTabToolbar.anyProviderAvailable'], scenario !== 'none');
    if (scenario === 'none') {
      const groups = vscode.window.tabGroups.all.length;
      assert.equal(await vscode.commands.executeCommand('aiTabToolbar.openCodex'), false);
      assert.equal(vscode.window.tabGroups.all.length, groups, 'Unavailable command does not create an editor group');
    }
    fs.writeFileSync(report, JSON.stringify({ ok: true, scenario, contexts }, null, 2));
  } catch (error) {
    fs.writeFileSync(report, JSON.stringify({ ok: false, scenario, contexts, error: error.stack }, null, 2));
    throw error;
  } finally {
    subscriptions.forEach(s => s.dispose());
  }
};
