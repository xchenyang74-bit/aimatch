#!/bin/sh
set -e

echo "=== Railway Start Script ==="
echo "Node version: $(node -v)"
echo "Database URL host: $(echo $DATABASE_URL | sed 's/.*@//; s/:.*//')"

# 运行数据库迁移（带重试）
echo "Running database migration..."
for i in 1 2 3; do
  if npx prisma migrate deploy; then
    echo "Migration successful"
    break
  else
    echo "Migration attempt $i failed, retrying..."
    sleep 3
  fi
done

# 启动应用
echo "Starting application..."
exec npm start
