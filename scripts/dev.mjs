import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const flags = process.argv.slice(2);
const production = flags.includes("--production");
const next = resolve(root, "frontend/node_modules/next/dist/bin/next");
if (!existsSync(next)) { console.error("Jalankan npm run setup terlebih dahulu."); process.exit(1); }
const forwarded = [];
for (let i=0;i<flags.length;i++) {
  const flag=flags[i];
  if (flag==="--port" || flag==="-p") forwarded.push("--port", flags[++i]);
  if (flag==="--hostname" || flag==="--host" || flag==="-H") forwarded.push("--hostname",flags[++i]);
}
const child = spawn(
  process.execPath,
  [next, production ? "start" : "dev", ...forwarded],
  { cwd: resolve(root, "frontend"), stdio: "inherit", env: process.env },
);
child.on("error", error => {
  console.error(`Tidak dapat menjalankan Next.js: ${error.message}`);
  process.exitCode = 1;
});
child.on("exit", code => {
  process.exitCode = code || 0;
});
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
