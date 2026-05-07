import { execFileSync, spawn } from "child_process";
import { rmSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = process.env.PORT || "3000";

function killExistingListener() {
  try {
    const output = execFileSync("lsof", ["-ti", `tcp:${port}`, "-sTCP:LISTEN"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const pids = output
      .split(/\s+/)
      .map((pid) => pid.trim())
      .filter(Boolean)
      .filter((pid) => pid !== String(process.pid));

    for (const pid of pids) {
      try {
        process.kill(Number(pid), "SIGTERM");
      } catch {
        // The process may already be gone; continue with cleanup.
      }
    }
  } catch {
    // No listener on the port.
  }
}

function removeNextOutput() {
  rmSync(path.join(root, ".next"), { recursive: true, force: true });
}

killExistingListener();
removeNextOutput();

const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBin, "dev", "--port", port], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

function shutdown(signal) {
  child.kill(signal);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
