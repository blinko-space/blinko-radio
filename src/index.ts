import { defineExtension } from "@blinko-cloud/extension-sdk";

defineExtension({
  activate: async () => {
    // Playback and presentation live in the signed custom UI document. The Worker remains the
    // capability-isolated lifecycle entry required by every Blinko App target.
  },
});
