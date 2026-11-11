'use strict';

// The current extension registry contains providers enabled in this window.
// Presence does not depend on whether a provider has already been activated.
async function watchProviderAvailability(vscode, context, providers) {
  const refresh = () => {
    const available = Object.fromEntries(Object.entries(providers).map(([name, provider]) => [
      name, vscode.extensions.getExtension(provider.extension) !== undefined
    ]));
    return Promise.all([
      ...Object.entries(available).map(([name, value]) =>
        vscode.commands.executeCommand('setContext', `aiTabToolbar.${name}Available`, value)),
      vscode.commands.executeCommand('setContext', 'aiTabToolbar.anyProviderAvailable', Object.values(available).some(Boolean))
    ]);
  };

  context.subscriptions.push(vscode.extensions.onDidChange(() => {
    void refresh().catch(error => console.error('AI Tab Toolbar availability:', error));
  }));
  await refresh();
}

module.exports = { watchProviderAvailability };
