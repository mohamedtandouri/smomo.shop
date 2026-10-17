#!/bin/sh
set -e

echo "=========================================="
echo "  Smomo Platform Container Initializing  "
echo "=========================================="

echo "⏳ Waiting for Database connection..."

node -e '
const net = require("net");
const dbUrl = process.env.DATABASE_URL || "";
let host = "db";
let port = 5432;
try {
  const match = dbUrl.match(/@([^:/]+)(?::(\d+))?/);
  if (match) {
    host = match[1];
    port = parseInt(match[2] || "5432", 10);
  }
} catch (e) {}

console.log(`Connecting to ${host}:${port}...`);

const check = (retries = 30) => {
  const socket = new net.Socket();
  socket.setTimeout(2500);
  socket.on("connect", () => {
    console.log(`✅ Database port reachable at ${host}:${port}`);
    socket.destroy();
    process.exit(0);
  });
  socket.on("error", (err) => {
    socket.destroy();
    if (retries <= 0) {
      console.error(`❌ Could not connect to database at ${host}:${port}`);
      process.exit(1);
    }
    setTimeout(() => check(retries - 1), 1500);
  });
  socket.on("timeout", () => {
    socket.destroy();
    if (retries <= 0) {
      console.error(`❌ Database connection timed out at ${host}:${port}`);
      process.exit(1);
    }
    setTimeout(() => check(retries - 1), 1500);
  });
  socket.connect(port, host);
};
check();
'

echo "🔄 Synchronizing Prisma schema with database..."
if [ -f "./node_modules/prisma/build/index.js" ]; then
  node ./node_modules/prisma/build/index.js db push --skip-generate || echo "⚠️ Prisma sync returned non-zero code, continuing..."
else
  echo "⚠️ Prisma CLI not found in ./node_modules/prisma, skipping schema auto-push."
fi

echo "🚀 Starting Next.js Production Server..."
exec "$@"
