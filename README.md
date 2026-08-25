# Blinko Radio

Blinko Radio is the reference internet-radio App for [Blinko](https://blinko.space). It demonstrates how a third-party App can contribute a toolbar entry, render a sandboxed custom view, stream public media, persist App-scoped preferences, and report playback state to the host.

The station directory is powered by the public [Radio Browser](https://www.radio-browser.info/) project. Audio remains in the browser and playback starts only after a user gesture.

## Blinko App packages

New Blinko Apps use one package namespace consistently:

| Package | Use it for |
| --- | --- |
| `@blinko-cloud/cli` | The `blinko` command: create, validate, develop, build, pack, and publish Apps. |
| `@blinko-cloud/extension-sdk` | Typed Worker APIs and the typed Custom View host bridge. App runtime code imports this package. |
| `@blinko-cloud/extension-ui` | Declarative, host-rendered UI descriptors. Use it for native Blinko surfaces; a React Custom View does not need to import it. |
| `@blinko-cloud/extension-devtools` | Internal implementation bundled into the CLI. App projects must not install or import it. |

Do not use the old `@blinko/extension-sdk` or `@blinko/extension-ui` names. The unscoped `blinko` and `blinko-cli` npm packages belong to the legacy plugin system and are unrelated to this App platform.

Radio installs `@blinko-cloud/extension-sdk` as a runtime dependency and `@blinko-cloud/cli` as a development dependency. It intentionally does not add an unused direct `@blinko-cloud/extension-ui` dependency because this player is a sandboxed React Custom View rather than a declarative host-rendered view.

## Development workflow

### 1. Clone and install

The repository is independently installable with Node.js 20 or newer; it does not require the Blinko monorepo:

```bash
git clone https://github.com/blinko-space/blinko-radio.git
cd blinko-radio
npm install
npm run typecheck
```

`npm install` resolves the public `@blinko-cloud/extension-sdk` and `@blinko-cloud/cli` packages from npm. The SDK supplies editor and `tsc` types; the CLI supplies validation, building, packaging, and local pairing. The internal devtools workspace package is not required.

### 2. Validate and test Radio

```bash
npm run validate
npm run typecheck
npm test
```

Validation checks the manifest, permissions, locale catalogs, Custom View entry, public import boundaries, and forbidden dynamic code before anything is loaded by the host.

### 3. Run the local development loop

Start Blinko locally, then run:

```bash
npm run dev
```

The command watches `src/`, `ui/`, `locales/`, and `blinko.app.json`. It prints a short-lived pairing URL for Blinko's developer page and sends last-valid hot-reload snapshots over a loopback-only connection. Open the pairing URL, connect the App, and test the toolbar icon and floating player in the real host.

### 4. Build and package

```bash
npm run build
npm run pack
```

`build` compiles the Worker plus the React/TypeScript Custom View. React, JavaScript, and CSS are bundled into one signed, self-contained HTML resource; the App does not ship remote scripts or stylesheets. `pack` creates the deterministic release candidate in `apps/radio/dist/release-package.json`.

The repository contains no App-specific build or preview scripts. The `dev`, `build`, and `pack` entries in `package.json` are only convenient aliases for the shared CLI.

### 5. Monorepo maintainers: update the submodule

Radio is a Git submodule. Commit and push inside the App first, then update the pointer in Blinko:

```bash
cd apps/radio
git add -A
git commit -m "✨ feat: describe the Radio change"
git push origin HEAD:main

cd ../..
git add apps/radio
git commit -m "⬆️ chore: update Blinko Radio"
```

## Project map

- `blinko.app.json` declares the toolbar contribution, custom view, locales, capabilities, and allowed network domains.
- `ui/main.tsx` contains the React player and calls the typed Custom View bridge from the public SDK.
- `ui/player.css` contains the player presentation. The CLI bundles it into the signed HTML resource.
- `src/index.ts` is the capability-isolated App lifecycle entry.
- `locales/` contains marketplace and toolbar copy.
- `tests/` validates the packaged document and its declared authority.

The custom view receives a small host bridge at `window.blinkoCustomUi`:

- `state(playing, label)` updates the toolbar activity indicator.
- `minimize()`, `expand()`, and `close()` control the floating view.
- `storage.get/set/remove()` persists App-scoped preferences through the host.
- `data-blinko-theme`, `data-blinko-locale`, and `data-blinko-mode` expose host presentation state.

## Security model

The App requests only `network:http` and `network:stream`. HTTP discovery is restricted to `*.api.radio-browser.info`; media playback accepts public HTTPS streams. It does not read notes, user identity, or host data, and it does not run polling or background jobs.

## License

MIT
