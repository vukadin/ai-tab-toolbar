# AI Tab Toolbar

Open Codex and Claude Code in editor tabs, together in a dedicated, locked editor group. Each toolbar click opens a new tab.

## Installation

Use desktop VS Code **1.94 or newer**.

1. Install and enable one or both supported provider extensions:
   - [Codex](https://marketplace.visualstudio.com/items?itemName=openai.chatgpt)
   - [Claude Code](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code)
2. Open VS Code's Extensions view and search for **AI Tab Toolbar** by **NjegosVukadin**, or open its [Marketplace page](https://marketplace.visualstudio.com/items?itemName=NjegosVukadin.ai-tab-toolbar).
3. Click **Install** and reload the window if VS Code requests it.

To install a `.vsix` package instead, open the Command Palette, run **Extensions: Install from VSIX...**, and select the package.

## Usage

1. Open a file or editor tab to show the editor toolbar.
2. Click the Codex or Claude logo beside the editor tabs. Hover over the button to identify **Open Codex in AI Editor Group** or **Open Claude Code in AI Editor Group**.
3. Click again whenever you want another chat tab. Both providers open in the same AI editor group.

Codex opens its home screen with recent Chats and the composer. Claude Code opens a new conversation. Sign in through the provider extension when needed.

Only installed and enabled providers have buttons. The icons follow your VS Code theme. If a button is missing, check that the provider is enabled in the current window and that its toolbar button has not been hidden.

The AI group is locked so ordinary files open in another group. To choose a different group, focus it and run **AI Tabs: Use This Editor Group for AI Tabs** from the Command Palette, or choose it from an editor tab's context menu.

You can also open chats from the Command Palette:

- **AI Tabs: Open Codex in AI Editor Group**
- **AI Tabs: Open Claude Code in AI Editor Group**

If the provider extensions show additional toolbar buttons, right-click an unwanted button and choose **Hide** to keep the companion buttons visible.
