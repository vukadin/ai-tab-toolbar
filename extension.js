'use strict';

const vscode = require('vscode');
const { randomUUID } = require('node:crypto');
const { watchProviderAvailability } = require('./availability');

const providers = {
  codex: { extension: 'openai.chatgpt', viewType: 'chatgpt.conversationEditor' },
  claude: { extension: 'anthropic.claude-code', command: 'claude-vscode.editor.open', viewType: 'claudeVSCodePanel' }
};

function isProviderTab(tab, provider) {
  // VS Code prefixes the view type for webview tabs, but not custom editors.
  return typeof tab.input?.viewType === 'string' && tab.input.viewType.endsWith(provider.viewType);
}

function waitFor(check, timeout = 20000) {
  let timer;
  let subscriptions = [];
  let finish;
  let inspect;
  const promise = new Promise(resolve => {
    finish = value => { clearTimeout(timer); subscriptions.forEach(s => s.dispose()); resolve(value); };
    inspect = () => { const value = check(); if (value) finish(value); };
    subscriptions = [
      vscode.window.tabGroups.onDidChangeTabs(inspect),
      vscode.window.tabGroups.onDidChangeTabGroups(inspect)
    ];
    timer = setTimeout(() => finish(undefined), timeout);
    inspect();
  });
  return { promise, check: () => inspect(), cancel: () => finish(undefined) };
}

async function activate(context) {
  let preferredGroup;
  let opening = Promise.resolve();

  async function focusGroup(group) {
    const groups = vscode.window.tabGroups;
    if (!groups.all.includes(group)) throw new Error('The AI editor group was closed. Please try again.');
    // Navigation commands focus empty groups and webviews without reopening a file.
    for (let n = 0; groups.activeTabGroup !== group && n < groups.all.length; n++) {
      await vscode.commands.executeCommand('workbench.action.focusNextGroup');
    }
    if (groups.activeTabGroup !== group) throw new Error('Could not focus the AI editor group.');
  }

  async function getTargetGroup() {
    const groups = vscode.window.tabGroups;
    if (preferredGroup && groups.all.includes(preferredGroup)) return preferredGroup;
    const hasChat = group => group.tabs.some(tab => Object.values(providers).some(p => isProviderTab(tab, p)));
    preferredGroup = hasChat(groups.activeTabGroup) ? groups.activeTabGroup : groups.all.find(hasChat);
    if (!preferredGroup) {
      await vscode.commands.executeCommand('workbench.action.newGroupRight');
      preferredGroup = groups.activeTabGroup;
    }
    return preferredGroup;
  }

  function waitForNewTab(provider) {
    const groups = vscode.window.tabGroups;
    const existing = new Set(groups.all.flatMap(group => group.tabs));
    return waitFor(() => {
      const tab = groups.activeTabGroup.activeTab;
      return tab && !existing.has(tab) && isProviderTab(tab, provider) ? tab : undefined;
    });
  }

  async function open(providerName) {
    let pending;
    try {
      const provider = providers[providerName];
      const extension = vscode.extensions.getExtension(provider.extension);
      if (!extension) throw new Error(`Install or enable ${provider.extension} in this VS Code window first.`);
      await extension.activate();
      const target = await getTargetGroup();
      await focusGroup(target);
      // Explicit moves can enter a locked group; normal file opens cannot.
      await vscode.commands.executeCommand('workbench.action.lockEditorGroup');
      pending = waitForNewTab(provider);
      if (providerName === 'claude') {
        await vscode.commands.executeCommand(provider.command, undefined, undefined, target.viewColumn);
      } else {
        // Open Codex's home screen (recent Chats and composer), using a distinct
        // resource for each click so VS Code creates another editor tab.
        const draft = vscode.Uri.from({
          scheme: 'openai-codex', authority: 'route', path: '/',
          query: `aiTab=${randomUUID()}`
        });
        await vscode.commands.executeCommand('vscode.openWith', draft, provider.viewType, {
          viewColumn: target.viewColumn, preserveFocus: false, preview: false
        });
      }
      const tab = await pending.promise;
      if (!tab) throw new Error('The new chat tab did not become ready within 20 seconds.');
      if (!vscode.window.tabGroups.all.includes(target)) throw new Error('The AI editor group was closed.');
      if (tab.group !== target) {
        // Codex can choose the last text editor's column instead of the active webview's column.
        // Only move the tab just opened, and only while it still has focus.
        if (vscode.window.tabGroups.activeTabGroup.activeTab !== tab) {
          throw new Error('The chat opened in another group. Drag its tab into your AI group.');
        }
        const count = target.tabs.filter(t => isProviderTab(t, provider)).length;
        const moved = waitFor(() => target.tabs.filter(t => isProviderTab(t, provider)).length > count);
        await vscode.commands.executeCommand('moveActiveEditor', { to: 'position', by: 'group', value: target.viewColumn });
        if (!await moved.promise) throw new Error('Could not move the chat into the AI editor group.');
      }
      await focusGroup(target);
      await vscode.commands.executeCommand('workbench.action.lockEditorGroup');
      return true;
    } catch (error) {
      console.error('AI Tab Toolbar:', error);
      void vscode.window.showErrorMessage(`AI Tabs: ${error.message ?? error}`);
      return false;
    } finally {
      pending?.cancel();
    }
  }

  function enqueue(providerName) {
    opening = opening.then(() => open(providerName));
    return opening;
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('aiTabToolbar.openCodex', () => enqueue('codex')),
    vscode.commands.registerCommand('aiTabToolbar.openClaude', () => enqueue('claude')),
    vscode.commands.registerCommand('aiTabToolbar.useGroup', async () => {
      preferredGroup = vscode.window.tabGroups.activeTabGroup;
      await vscode.commands.executeCommand('workbench.action.lockEditorGroup');
      void vscode.window.showInformationMessage('Codex and Claude toolbar buttons will open tabs in this editor group.');
    })
  );
  await watchProviderAvailability(vscode, context, providers);
}

module.exports = { activate };
