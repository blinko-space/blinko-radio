# Blinko Radio

Blinko Radio is the reference internet-radio App for [Blinko](https://blinko.space). It demonstrates how a third-party App can contribute a toolbar entry, render a sandboxed custom view, stream public media, persist App-scoped preferences, and report playback state to the host.

The station directory is powered by the public [Radio Browser](https://www.radio-browser.info/) project. Audio remains in the browser and playback starts only after a user gesture.

## Preview the player

The player is a self-contained HTML document, so its visual layer can be previewed without the Blinko host or installing dependencies:

```bash
git clone https://github.com/blinko-space/blinko-radio.git
cd blinko-radio
bun scripts/preview.ts
```

Open `http://localhost:4178`. Use query parameters to test host states:

```text
http://localhost:4178/?theme=dark&locale=zh-CN
http://localhost:4178/?theme=light&locale=en
```

## Project map

- `blinko.app.json` declares the toolbar contribution, custom view, locales, capabilities, and allowed network domains.
- `ui/player.html` contains the complete player implementation. Published Apps cannot load remote JavaScript or CSS.
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
bun run --cwd apps/radio build
```

Make App changes from inside the submodule, commit and push them here, then commit the updated submodule pointer in the Blinko repository.

## Security model

The App requests only `network:http` and `network:stream`. HTTP discovery is restricted to `*.api.radio-browser.info`; media playback accepts public HTTPS streams. It does not read notes, user identity, or host data, and it does not run polling or background jobs.

## License

MIT
