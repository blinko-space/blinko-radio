# Blinko Radio App rules

Use only public Blinko App contracts. Keep all executable UI code packaged in `ui/player.html`; never load remote JavaScript or CSS. Network access is limited to Radio Browser discovery and public HTTPS station media. Playback must start only after a user gesture. Do not add polling, timers that fetch in the background, cron jobs, or database state.
