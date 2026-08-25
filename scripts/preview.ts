import { readFileSync } from "node:fs";

const playerPath = new URL("../ui/player.html", import.meta.url);
const bridge = `<script>
window.blinkoCustomUi = {
  storage: {
    get: async key => JSON.parse(localStorage.getItem("preview:" + key) || "null"),
    set: async (key, value) => localStorage.setItem("preview:" + key, JSON.stringify(value)),
    remove: async key => localStorage.removeItem("preview:" + key)
  },
  state: () => {}, minimize: () => {}, expand: () => {}, close: () => {}
};
</script>`;

const server = Bun.serve({
  port: Number(process.env.PORT ?? 4178),
  fetch(request) {
    const url = new URL(request.url);
    const theme = url.searchParams.get("theme") === "dark" ? "dark" : "light";
    const requestedLocale = url.searchParams.get("locale") ?? "en";
    const locale = /^(?:en|zh-CN|zh-TW)$/.test(requestedLocale) ? requestedLocale : "en";

    if (url.pathname === "/player") {
      const html = readFileSync(playerPath, "utf8")
        .replace('<html lang="en">', `<html lang="${locale}" data-blinko-locale="${locale}" data-blinko-theme="${theme}">`)
        .replace("<script>", `${bridge}<script>`);
      return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
    }

    const query = new URLSearchParams({ theme, locale });
    return new Response(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Blinko Radio preview</title>
      <style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:${theme === "dark" ? "#111216" : "#f4f1ed"}}iframe{display:block;width:min(360px,calc(100vw - 24px));height:304px;border:0;border-radius:18px;box-shadow:0 24px 70px #0005}</style>
      <iframe src="/player?${query}" title="Blinko Radio preview"></iframe>`, { headers: { "content-type": "text/html; charset=utf-8" } });
  },
});

console.log(`Blinko Radio preview: http://localhost:${server.port}`);
