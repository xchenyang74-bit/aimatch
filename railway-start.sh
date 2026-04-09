#!/bin/sh
set -e

echo "=========================================="
echo "Railway Start Script"
echo "=========================================="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 检查环境变量
echo ""
echo "Checking environment variables..."
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set"
  exit 1
fi
if [ -z "$SECONDME_CLIENT_ID" ]; then
  echo "⚠️  WARNING: SECONDME_CLIENT_ID is not set"
fi
if [ -z "$SECONDME_API_BASE_URL" ]; then
  echo "⚠️  WARNING: SECONDME_API_BASE_URL is not set"
fi

echo "✅ Database URL is configured"
echo "Database host: $(echo $DATABASE_URL | sed 's/.*@//; s/:.*//; s/\/.*//')"

# 复制静态文件到 standalone 目录
echo ""
echo "Copying static files..."
if [ -d ".next/static" ]; then
  mkdir -p .next/standalone/.next/static
  cp -r .next/static/* .next/standalone/.next/static/ 2>/dev/null || true
  echo "✅ Static files copied"
fi

# 复制 public 文件
echo "Copying public files..."
if [ -d "public" ]; then
  cp -r public/* .next/standalone/ 2>/dev/null || true
  echo "✅ Public files copied"
fi

# 运行数据库迁移（带重试）
echo ""
echo "=========================================="
echo "Running database migration..."
echo "=========================================="

for i in 1 2 3; do
  echo "Attempt $i..."
  if npx prisma migrate deploy; then
    echo "✅ Migration successful"
    break
  else
    echo "❌ Migration attempt $i failed"
    if [ $i -eq 3 ]; then
      echo "ERROR: Failed to run migrations after 3 attempts"
      exit 1
    fi
    echo "Retrying in 3 seconds..."
    sleep 3
  fi
done

# 验证数据库连接
echo ""
echo "Verifying database connection..."
if npx prisma db execute --url "$DATABASE_URL" -q "SELECT 1 as connection_test;" 2>/dev/null; then
  echo "✅ Database connection verified"
else
  echo "⚠️  Database connection check skipped"
fi

# 启动应用
echo ""
echo "=========================================="
echo "Starting application..."
echo "=========================================="
exec node .next/standalone/server.js
