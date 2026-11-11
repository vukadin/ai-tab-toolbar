'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vscode = require('vscode');
const manifest = require('../package.json');

exports.run = async function () {
  const report = `/tmp/ai-tab-toolbar-integration-${manifest.version}.json`;
  const snapshot = () => vscode.window.tabGroups.all.map(g => ({
    column: g.viewColumn,
    tabs: g.tabs.map(t => ({ label: t.label, type: t.input?.viewType, active: t.isActive }))
  }));
  try {
    await vscode.extensions.getExtension(`${manifest.publisher}.${manifest.name}`).activate();
    const file = vscode.Uri.file('/tmp/ai-tab-toolbar-qa/file.txt');
    fs.mkdirSync('/tmp/ai-tab-toolbar-qa', { recursive: true });
    fs.writeFileSync(file.fsPath, 'AI toolbar integration fixture\n');
    await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(file), { viewColumn: 1 });
    assert.equal(await vscode.commands.executeCommand('aiTabToolbar.openClaude'), true, 'Claude command completed');
    const aiGroup = vscode.window.tabGroups.all.find(g => g.tabs.some(t => t.input?.viewType?.endsWith('claudeVSCodePanel')));
    assert.ok(aiGroup, 'Claude tab was created');
    assert.notEqual(aiGroup.viewColumn, 1, 'A dedicated AI group was created');
    await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(file), { viewColumn: 1 });
    assert.equal(await vscode.commands.executeCommand('aiTabToolbar.openCodex'), true, 'Codex command completed');
    assert.ok(aiGroup.tabs.some(t => t.input?.viewType === 'chatgpt.conversationEditor'), 'Codex joined the locked Claude group');
    assert.equal(await vscode.commands.executeCommand('aiTabToolbar.openCodex'), true, 'Repeated Codex click completed');
    assert.equal(aiGroup.tabs.filter(t => t.input?.viewType === 'chatgpt.conversationEditor').length, 2, 'Each Codex click adds a separate draft in the shared group');
    assert.deepEqual(await Promise.all([
      vscode.commands.executeCommand('aiTabToolbar.openCodex'),
      vscode.commands.executeCommand('aiTabToolbar.openCodex')
    ]), [true, true], 'Rapid Codex clicks are queued');
    const codexTabs = aiGroup.tabs.filter(t => t.input?.viewType === 'chatgpt.conversationEditor');
    assert.equal(codexTabs.length, 4, 'Rapid clicks each add a Codex tab');
    assert.equal(new Set(codexTabs.map(t => t.input.uri.toString())).size, 4, 'All Codex drafts have distinct resources');
    assert.ok(codexTabs.every(t => t.input.uri.path === '/'), 'Every Codex tab starts on the home screen with recent Chats');
    await vscode.commands.executeCommand('aiTabToolbar.openClaude');
    assert.equal(aiGroup.tabs.filter(t => t.input?.viewType?.endsWith('claudeVSCodePanel')).length, 2, 'Subsequent Claude tabs reuse the shared group');
    const file2 = vscode.Uri.file('/tmp/ai-tab-toolbar-qa/another.txt');
    fs.writeFileSync(file2.fsPath, 'Ordinary file must avoid the locked AI group\n');
    await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(file2));
    assert.notEqual(vscode.window.tabGroups.activeTabGroup, aiGroup, 'Ordinary files avoid the locked group');
    fs.writeFileSync(report, JSON.stringify({ ok: true, groups: snapshot() }, null, 2));
  } catch (error) {
    fs.writeFileSync(report, JSON.stringify({ ok: false, error: error.stack, groups: snapshot() }, null, 2));
    throw error;
  }
};
