#!/bin/bash
echo "=== 修复 Railway 构建问题 ==="

# 1. 重新生成 package-lock.json
rm -f package-lock.json
npm install

# 2. 确认 prisma schema 存在
if [ ! -f "prisma/schema.prisma" ]; then
  echo "❌ prisma/schema.prisma 不存在"
  exit 1
fi

# 3. 简化 package.json 的 start 脚本
# 修改 package.json 使用 next start 而不是 server.js

# 4. 提交更改
git add package.json package-lock.json Dockerfile .dockerignore railway.json 2>/dev/null
git commit -m "Fix Railway build configuration"
git push origin main

echo "✅ 已推送修复，请在 Railway 重新部署"
