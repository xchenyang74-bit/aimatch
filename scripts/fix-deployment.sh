#!/bin/bash
# Railway 部署修复脚本

echo "=========================================="
echo "Railway 部署修复工具"
echo "=========================================="

# 1. 检查 GitHub 最新提交
echo ""
echo "1. 检查最新提交..."
git log -1 --oneline

# 2. 强制空提交触发重新部署
echo ""
echo "2. 触发重新部署..."
git commit --allow-empty -m "Trigger Railway redeploy"
git push origin main

echo ""
echo "✅ 已触发重新部署"
echo "请等待 2-3 分钟后检查: https://aimatch-secondme.up.railway.app/api/health"
