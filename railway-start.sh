#!/bin/sh
set -e

echo "=========================================="
echo "Railway Start Script"
echo "=========================================="

# 运行数据库迁移
echo "Running database migration..."
npx prisma migrate deploy || echo "Migration warning (continuing...)"

# 启动应用
echo "Starting application..."
exec node .next/standalone/server.js
