# AI Tab Toolbar

Open **Codex** and **Claude Code** in editor tabs, together in a dedicated, locked editor group.

AI Tab Toolbar adds small, theme-aware provider buttons beside your editor tabs. Each click opens another tab. Codex starts on its home screen with recent Chats and the composer; Claude opens a new conversation tab.

This is an independent companion extension, not an AI provider. Install and enable at least one supported provider separately:

- [Codex — `openai.chatgpt`](https://marketplace.visualstudio.com/items?itemName=openai.chatgpt)
- [Claude Code — `anthropic.claude-code`](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code)

## Features

- **Optional providers:** only installed and enabled providers get toolbar buttons and Command Palette entries. With neither provider available, the companion stays out of the way.
- **A new tab on every click:** rapid clicks are queued, rather than silently focusing an existing Codex draft.
- **One shared AI group:** reuse an existing Codex or Claude group, or create a group to the right when none exists.
- **Locked groups:** ordinary file opens go to another editor group, keeping your chats together.
- **Theme-aware logos:** monochrome product icons inherit VS Code's toolbar colors, including light, dark, and high-contrast themes.
- **No account or runtime dependencies:** the companion never installs providers, handles their credentials, or sends prompts.

## Get started

1. Install and enable Codex, Claude Code, or both.
2. Open a file or editor tab so its editor toolbar is visible.
3. Click the Codex or Claude toolbar logo. Hover over a logo to confirm the tooltip says **Open Codex in AI Editor Group** or **Open Claude Code in AI Editor Group**.

If installing a shared `.vsix` file, run **Extensions: Install from VSIX...** from the Command Palette and select the file. Reload the window if VS Code requests it. Published releases can be installed and updated through the Marketplace.

Provider buttons do not require the provider to be active or signed in. Authentication, subscriptions, permissions, and AI requests remain the responsibility of the provider extension.

## Choose your group

Focus your preferred editor group, then run **AI Tabs: Use This Editor Group for AI Tabs**. The command is also available in an editor tab's context menu. The selected group becomes locked.

The selection is remembered for the current window session. After a reload, the companion locates restored Codex and Claude tabs again. Closing the final chat may remove an empty group; the next click creates a new group if needed.

## Commands

| Command | Behavior |
| --- | --- |
| AI Tabs: Open Codex in AI Editor Group | Open a separate Codex home tab in the AI group. |
| AI Tabs: Open Claude Code in AI Editor Group | Open a separate Claude conversation tab in the AI group. |
| AI Tabs: Use This Editor Group for AI Tabs | Select and lock the focused editor group for future toolbar clicks. |

Only commands for available providers appear. The group-selection command appears when at least one provider is available.

## Toolbar and sidebar customization

The provider extensions may also add their own editor-toolbar buttons. To keep only the companion buttons, right-click an unwanted toolbar button and choose **Hide**. You can restore hidden buttons through the same menu.

This companion does not modify native provider icons or create Activity Bar entries. To place the native Codex sidebar in the left Activity Bar, use **View: Move View**, choose **Codex**, then **New Side Bar Entry**. That is a separate VS Code layout preference.

## Requirements and compatibility

- VS Code **1.94 or newer**, using the desktop extension host on macOS, Windows, or Linux.
- At least one supported provider installed and enabled in the current window.
- The provider's own system requirements and account access still apply.

The implementation uses Codex's `openai-codex://route/` home-editor route and Claude's `claude-vscode.editor.open` command. These provider integration points are not controlled by this project and can change in upstream releases. This release is marked **Preview** for that reason.

Validated with VS Code **1.145.2**, Codex **26.1106.51428**, and Claude Code **2.1.322** on macOS. Other platforms use the same JavaScript and bundled font but have not been independently verified. Browser-only VS Code is not supported.

## Troubleshooting

- **A button is missing:** check that its provider is enabled in this window, then reload if VS Code requires it. Check hidden toolbar actions as well.
- **No toolbar is visible:** open an editor tab. Buttons are contributed to the editor toolbar, not the empty-editor welcome screen.
- **Chats opened in different groups:** focus the group you want and run the group-selection command.
- **An upstream update breaks opening tabs:** report the VS Code, provider, and companion versions with the error text. Do not include prompts, credentials, or private source code.

## Privacy and licensing

The companion does not collect analytics, send telemetry, contact a server, or read file contents and chat messages. Providers operate under their own policies. See the packaged `PRIVACY.md` for details.

The companion's own code is distributed under the MIT License. Logo outlines come from the MIT-licensed Lobe Icons library, with attribution and the full license included in `THIRD_PARTY_NOTICES.md` and `licenses/lobehub-icons-LICENSE`.

Codex, Claude, OpenAI, Anthropic, Microsoft, and Visual Studio Code names and marks belong to their respective owners. AI Tab Toolbar is not affiliated with or endorsed by those organizations.

## Development and releases

Use Node.js **22 or newer** for development tooling:

```sh
npm ci
npm run check
npm run check:listing-icon
npm run package:vsix
```

The generated WOFF and PNG are committed, so packaging the existing assets requires no Python or native runtime dependency in the installed extension. To rebuild the product-icon font:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r scripts/requirements.txt
npm run build:icons
npm run check:icons
```

On Windows, use `.venv\Scripts\python` for the Python commands. To rebuild the original listing icon, run `npm run build:listing-icon`. See `PUBLISHING.md` in the source distribution for release checks, publisher setup, and manual upload instructions. Packaging never publishes automatically.
