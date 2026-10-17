import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runService(name, cwd, port, colorCode) {
  const isWin = process.platform === 'win32';
  const npmCmd = isWin ? 'npm.cmd' : 'npm';

  const child = spawn(npmCmd, ['run', 'dev'], {
    cwd: path.resolve(__dirname, cwd),
    stdio: 'pipe',
    shell: isWin,
    env: { ...process.env, PORT: String(port) },
  });

  const prefix = `\x1b[${colorCode}m[${name} :${port}]\x1b[0m`;

  child.stdout.on('data', (data) => {
    const lines = data.toString().trimEnd().split('\n');
    for (const line of lines) {
      console.log(`${prefix} ${line}`);
    }
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().trimEnd().split('\n');
    for (const line of lines) {
      console.error(`${prefix} ${line}`);
    }
  });

  child.on('close', (code) => {
    console.log(`${prefix} Process exited with code ${code}`);
  });

  return child;
}

console.log('\x1b[32m🚀 Starting Smomo Platform (Dashboard + Storefront)...\x1b[0m');
const admin = runService('Admin-Dashboard', 'admin-backend', 3000, '36');
const store = runService('Storefront', 'storefront', 3001, '35');

function cleanup() {
  console.log('\n\x1b[33m🛑 Stopping services...\x1b[0m');
  try { admin.kill(); } catch {}
  try { store.kill(); } catch {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
