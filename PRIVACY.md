# Privacy

AI Tab Toolbar does not collect analytics, send telemetry, contact a server, or manage API keys or sign-in credentials.

The extension reads VS Code's enabled-extension registry and editor-tab metadata to decide which buttons to show and which editor group to use. It keeps its selected editor group in memory for the current window session. It does not read the contents of your source files, inspect chat messages, or send prompts.

Clicking a button activates the corresponding provider extension and opens its own interface. Codex and Claude Code handle their own authentication, permissions, network connections, chat history, and AI requests under their respective policies. Installing this companion does not install, enable, or sign in to either provider.
