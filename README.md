# Blinko Radio

Blinko Radio is the reference internet-radio App for [Blinko](https://blinko.space). It demonstrates how a third-party App can contribute a toolbar entry, render a sandboxed custom view, stream public media, persist App-scoped preferences, and report playback state to the host.

The station directory is powered by the public [Radio Browser](https://www.radio-browser.info/) project. Audio remains in the browser and playback starts only after a user gesture.

## Develop with the Blinko CLI

The player is written in React and TypeScript. The shared Blinko CLI handles development, validation, building, and packaging; this repository does not carry per-App build scripts:

```bash
git clone https://github.com/blinko-space/blinko-radio.git
cd blinko-radio
blinko extension dev .
blinko extension validate .
blinko extension build .
blinko extension pack .
```

`extension dev` prints a pairing link for Blinko's developer page and hot-reloads the last valid build.

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

## Develop inside Blinko

Blinko consumes this repository as the `apps/radio` Git submodule. The production build and conformance tests use workspace packages from the host repository:

```bash
bun run --cwd apps/radio test
blinko extension build apps/radio
```

Make App changes from inside the submodule, commit and push them here, then commit the updated submodule pointer in the Blinko repository.

## Security model

The App requests only `network:http` and `network:stream`. HTTP discovery is restricted to `*.api.radio-browser.info`; media playback accepts public HTTPS streams. It does not read notes, user identity, or host data, and it does not run polling or background jobs.

## License

MIT
