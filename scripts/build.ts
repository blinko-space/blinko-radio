import { runExtensionCommand } from "@blinko-cloud/extension-devtools/cli";

process.exitCode = await runExtensionCommand(["build", new URL("..", import.meta.url).pathname]);
