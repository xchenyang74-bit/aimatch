#!/bin/sh
set -e

echo "=========================================="
echo "Railway Start Script"
echo "=========================================="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"
echo "Files in directory:"
ls -la

# 检查环境变量
echo ""
echo "Checking environment variables..."
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set"
  exit 1
fi

echo "✅ Database URL is configured"

# 运行数据库迁移
echo ""
echo "Running database migration..."
npx prisma migrate deploy || echo "Migration warning (continuing...)"

# 检查 server.js 位置
echo ""
echo "Checking for server.js..."
if [ -f ".next/standalone/server.js" ]; then
  echo "Found .next/standalone/server.js"
  SERVER_PATH=".next/standalone/server.js"
elif [ -f "server.js" ]; then
  echo "Found server.js in root"
  SERVER_PATH="server.js"
else
  echo "❌ server.js not found"
  exit 1
fi

# 启动应用
echo ""
echo "=========================================="
echo "Starting application with: $SERVER_PATH"
echo "=========================================="
exec node "$SERVER_PATH"
