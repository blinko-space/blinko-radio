import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseExtensionManifest } from "@blinko-cloud/cli/sdk";

const root = resolve(import.meta.dirname, "..");
const blinko = resolve(root, "node_modules/.bin/blinko");

function runCli(command: "validate" | "build") {
  return execFileSync(blinko, ["extension", command, "."], { cwd: root, encoding: "utf8" });
}

describe("Blinko Radio App", () => {
  it("declares a bounded toolbar custom view and explicit radio authority", () => {
    const manifest = parseExtensionManifest(JSON.parse(readFileSync(resolve(root, "blinko.app.json"), "utf8")));
    expect(manifest).toMatchObject({
      appId: "cloud.blinko.radio",
      permissions: { required: ["network:http", "network:stream"] },
      network: { domains: ["*.api.radio-browser.info"] },
      ui: { customViews: [expect.objectContaining({
        id: "radio.player", entry: "ui/main.tsx", presentation: "floating-window",
        resizable: true, maxWidth: 720, maxHeight: 560,
      })] },
      contributes: { items: [expect.objectContaining({ surface: "app/toolbar", viewId: "radio.player" })] },
    });
    expect(runCli("validate")).toContain("Valid cloud.blinko.radio");
  });

  it("packages the player as a signed local document without remote executable code", () => {
    runCli("build");
    const resourceIndex = JSON.parse(readFileSync(resolve(root, "dist/resource-index.json"), "utf8"));
    const resource = resourceIndex.resources.find((item: { id: string }) => item.id === "ui.radio.player");
    expect(resource).toMatchObject({ kind: "document", mimeType: "text/html" });
    const html = readFileSync(resolve(root, "dist", resource.path), "utf8");
    expect(html).toContain("api.radio-browser.info");
    expect(html).toContain("Blinko Radio");
    expect(html).toContain("api.radio-browser.info");
    expect(html).toContain("blinkoCustomUi");
    expect(html).toContain("artwork-backdrop");
    expect(html).toContain("Intl.DisplayNames");
    expect(html).not.toContain("data-blinko-drag-handle");
    expect(html).not.toContain("host.minimize");
    expect(html).not.toContain("host.close");
    const shell = html.replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, "$1</script>");
    expect(shell).not.toMatch(/<script\b[^>]*\bsrc\s*=/i);
    expect(shell).not.toMatch(/<link\b[^>]*\brel=["']?stylesheet/i);
  }, 15_000);

  it("keeps the custom UI auditable in source and in the CLI build artifact", () => {
    expect(readFileSync(resolve(root, "ui/main.tsx"), "utf8")).toContain("getCustomViewHost");
    expect(readFileSync(resolve(root, "ui/player.css"), "utf8")).toContain(".player");
    runCli("build");
    const resourceIndex = JSON.parse(readFileSync(resolve(root, "dist/resource-index.json"), "utf8"));
    expect(resourceIndex).toMatchObject({
      resources: expect.arrayContaining([expect.objectContaining({ id: "ui.radio.player", kind: "document" })]),
    });
  }, 30_000);

  it("keeps favorite rows at their natural height so an overflowing list can scroll", () => {
    const css = readFileSync(resolve(root, "ui/player.css"), "utf8");
    const listRule = css.match(/\.favorites-list\s*\{([^}]*)\}/)?.[1] ?? "";
    const rowRule = css.match(/\.favorite-row\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(listRule).toMatch(/overflow-y\s*:\s*auto/);
    expect(rowRule).toMatch(/flex\s*:\s*0\s+0\s+auto|flex-shrink\s*:\s*0/);
  });
});
