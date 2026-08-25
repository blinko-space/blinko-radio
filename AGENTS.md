# Blinko Radio App rules

Use React and TypeScript with only public Blinko App contracts. Custom Views must call the typed `@blinko/extension-sdk/custom-view` bridge and be packaged by the Blinko CLI; never load remote JavaScript or CSS. Network access is limited to Radio Browser discovery and public HTTPS station media. Playback must start only after a user gesture. Do not add polling, timers that fetch in the background, cron jobs, or database state.
