#!/bin/sh
set -e

echo "Node version: $(node -v)"

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

echo "Running database migration..."
for i in 1 2 3; do
  if npx prisma migrate deploy; then
    echo "Migration successful"
    break
  else
    echo "Migration attempt $i failed"
    if [ $i -eq 3 ]; then exit 1; fi
    sleep 3
  fi
done

echo "Copying public files..."
if [ -d "public" ]; then
  cp -r public/* .next/standalone/ 2>/dev/null || true
fi
if [ -d ".next/static" ]; then
  cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
fi

echo "Starting application..."
exec node .next/standalone/server.js
