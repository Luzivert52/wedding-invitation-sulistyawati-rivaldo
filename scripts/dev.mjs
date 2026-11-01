import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const flags = process.argv.slice(2);
const production = flags.includes("--production");
const frontendOnly = flags.includes("--frontend-only");
const next = resolve(root, "frontend/node_modules/next/dist/bin/next");
if (!existsSync(next)) { console.error("Jalankan npm run setup terlebih dahulu."); process.exit(1); }
const forwarded = [];
for (let i=0;i<flags.length;i++) {
  const flag=flags[i];
  if (flag==="--port" || flag==="-p") forwarded.push("--port", flags[++i]);
  if (flag==="--hostname" || flag==="--host" || flag==="-H") forwarded.push("--hostname",flags[++i]);
}
const children=[];
let stopping=false;
function stop(code=0) {
  if (stopping) return; stopping=true;
  for (const child of children) {
    if (child.exitCode!==null || !child.pid) continue;
    if (process.platform==="win32") spawn("taskkill",["/pid",String(child.pid),"/t","/f"],{stdio:"ignore"});
    else { try { process.kill(-child.pid,"SIGTERM"); } catch { child.kill("SIGTERM"); } }
  }
  process.exitCode=code;
}
function launch(command,args,cwd) {
  const child=spawn(command,args,{cwd,stdio:"inherit",env:process.env,detached:process.platform!=="win32"});
  children.push(child);
  child.on("error",error=>{ console.error(`Tidak dapat menjalankan ${command}: ${error.message}. Pastikan Node.js dan Go sudah terpasang.`); stop(1); });
  child.on("exit",code=>{if(!stopping)stop(code||0);});
}
if (!frontendOnly) launch(process.env.GO_BIN||"go",["run","-buildvcs=false","."],resolve(root,"backend"));
launch(process.execPath,[next,production?"start":"dev",...forwarded],resolve(root,"frontend"));
process.on("SIGINT",()=>stop()); process.on("SIGTERM",()=>stop());
