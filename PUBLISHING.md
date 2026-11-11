# Publishing AI Tab Toolbar

Prepared identity: **NjegosVukadin.ai-tab-toolbar**, version **1.0.5 Preview**, with MIT-licensed extension code. Nothing in the build or packaging scripts uploads an extension, creates an account, or publishes a listing.

## Verify your publisher

Sign in to the [Visual Studio Marketplace publisher management page](https://marketplace.visualstudio.com/manage) with your Microsoft account. Select the publisher with ID **NjegosVukadin**, or register it if needed. Confirm that this is its actual **ID**, not only its display name.

The selected ID is already set in `package.json`. If the registered ID differs, update it before packaging:

```sh
npm pkg set publisher="YOUR_REGISTERED_PUBLISHER_ID"
```

`npm run release:check` rejects local placeholder IDs. It validates package files, not account ownership: verify that you control the publisher in the Marketplace dashboard.

The public source repository is [vukadin/ai-tab-toolbar](https://github.com/vukadin/ai-tab-toolbar). Its repository, homepage, and issue URLs are configured in `package.json` so the Marketplace listing can link to the source and issue tracker.

## Validate and package

```sh
npm ci
npm run check
npm run check:listing-icon
npm run release:check
npm run package:vsix
```

The final VSIX is written to `dist/NjegosVukadin.ai-tab-toolbar-1.0.5.vsix`. Packaging uses the pinned local `@vscode/vsce`, performs the test suite, excludes development dependencies, and includes only the runtime files listed in the manifest's `files` allowlist. The generated font, listing PNG, code license, privacy note, and third-party license are included.

`npm run package:draft` creates an inspection package with `-draft.vsix` in its filename. Use the final package, without that suffix, for the Marketplace upload.

When changing a logo outline, rebuild and check the font using the pinned Python requirements. When changing the listing SVG, run `npm run build:listing-icon`. The SVG listing source is original artwork; the Marketplace receives its 256×256 PNG export.

## Final acceptance checks

- Install the VSIX in a disposable VS Code profile.
- Check button visibility with neither provider, each provider individually, and both providers enabled.
- Confirm repeated clicks create separate tabs and both providers share the selected locked group.
- Confirm Codex opens the Chats home screen and ordinary files avoid the locked group.
- Inspect the logos in light, dark, and high-contrast themes.
- Check that the package contains no development dependencies, personal paths, credentials, or test fixtures.

## Upload manually

In the Marketplace publisher dashboard, select **New extension → Visual Studio Code** and upload the final VSIX. Review the listing, publisher identity, version, license, and Preview status before completing the publish action. For an existing listing, upload a package with a new version through its update action.

Microsoft's current [publishing guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) also documents CLI publication and trusted publishing. Prefer its current authentication guidance when setting up automation. No publishing credential is stored in this project, and the included GitHub Actions workflow validates/builds only.

## Migrate from the personal build

The personal extension ID is `vukadin-local.ai-tab-toolbar`. The public publisher creates a different extension identity; it does not update the personal build in place. After the published version is installed, uninstall the personal build to avoid duplicate toolbar actions:

```sh
code --uninstall-extension vukadin-local.ai-tab-toolbar
```

This does not uninstall Codex or Claude Code or remove their chats. Existing provider tabs and native Activity Bar layout are managed by VS Code and the provider extensions. Toolbar hiding preferences are local layout customizations; check them after installing the published extension.
