import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { buildExtensionProject, createExtensionReleasePackage, validateExtensionProject } from "../../../packages/extension-devtools/src/index";

const root = resolve(import.meta.dirname, "..");

describe("Blinko Radio App", () => {
  it("declares a bounded toolbar custom view and explicit radio authority", async () => {
    const result = await validateExtensionProject(root);
    expect(result.manifest).toMatchObject({
      appId: "cloud.blinko.radio",
      permissions: { required: ["network:http", "network:stream"] },
      network: { domains: ["*.api.radio-browser.info"] },
      ui: { customViews: [expect.objectContaining({ id: "radio.player", entry: "ui/main.tsx" })] },
      contributes: { items: [expect.objectContaining({ surface: "app/toolbar", viewId: "radio.player" })] },
    });
    expect(result.diagnostics).toEqual([]);
  });

  it("packages the player as a signed local document without remote executable code", async () => {
    const result = await buildExtensionProject(root);
    const resource = result.resourceIndex.resources.find((item) => item.id === "ui.radio.player");
    expect(resource).toMatchObject({ kind: "document", mimeType: "text/html" });
    const html = result.resourceFiles[resource!.path]!;
    expect(html).toContain("api.radio-browser.info");
    expect(html).toContain("Blinko Radio");
    expect(html).toContain("api.radio-browser.info");
    expect(html).toContain("blinkoCustomUi");
    expect(html).toContain("artwork-backdrop");
    expect(html).toContain("Intl.DisplayNames");
    const shell = html.replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, "$1</script>");
    expect(shell).not.toMatch(/<script\b[^>]*\bsrc\s*=/i);
    expect(shell).not.toMatch(/<link\b[^>]*\brel=["']?stylesheet/i);
  }, 15_000);

  it("includes the custom UI in the auditable release source and artifact", async () => {
    const release = await createExtensionReleasePackage(root, { allowDirty: true });
    expect(release.manifest.source.revision).toBe(execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim());
    const source = JSON.parse(Buffer.from(release.archives.find((item) => item.kind === "SOURCE")!.bytesBase64, "base64").toString("utf8"));
    expect(source.files["ui/main.tsx"]).toBeTypeOf("string");
    expect(source.files["ui/player.css"]).toBeTypeOf("string");
    expect(source.files["scripts/build.ts"]).toBeUndefined();
    expect(release.artifacts[0]?.resourceIndex).toMatchObject({
      resources: expect.arrayContaining([expect.objectContaining({ id: "ui.radio.player", kind: "document" })]),
    });
  }, 30_000);
});
