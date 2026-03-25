#!/bin/bash
echo "=== 最近的错误日志 ==="
grep -A 5 "OAuth callback error" nohup.out 2>/dev/null || grep -A 5 "OAuth callback error" ~/.npm/_logs/*.log 2>/dev/null || echo "请手动查看运行 npm run dev 的终端窗口"
