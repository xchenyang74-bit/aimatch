# Aimatch 项目记忆库

> 这个文件用于记录开发过程中的关键决策、待办事项和对话历史。
> 
> **使用建议**:
> - 新会话先查看 **📅 时间线** 了解进展
> - 遇到问题先看 **🔧 问题备忘录** 是否有类似记录
> - 技术决策参考 **🤖 A2A 架构设计** 和 **📚 参考项目**

---

## 📑 快速导航

| 章节 | 内容 |
|------|------|
| [🤝 协作约定](#-协作约定) | 如何更新和使用本文件 |
| [📅 时间线](#-时间线) | 项目重要节点记录 |
| [🎯 项目概述](#-项目概述) | 项目介绍和技术栈 |
| [✅ 已实现功能](#-已实现功能) | 功能清单和状态 |
| [📝 待办事项](#-待解决问题优化项) | 待完成任务 |
| [🤖 A2A 架构](#-a2a-agent-to-agent-架构设计) | 技术架构决策 |
| [🔧 问题备忘录](#-问题备忘录知识点) | 踩坑记录和解决方案 |
| [📚 参考项目](#-参考项目) | 博弈圆桌等参考 |
| [🚀 Railway 部署](#-railway-部署) | 部署配置和指南 |

---

## 🤝 协作约定

- **用户**：会定期告知我更新 MEMORY.md，也会自己直接编辑记录
- **Kimi**：在关键决策、技术选型、问题解决后主动更新此文件
- **下次会话**：我会先读取此文件恢复上下文

**关于频繁更新的说明**:
- ✅ 本文件可以频繁更新，每次重要对话后记录
- ✅ 使用目录导航快速定位内容
- ✅ 问题备忘录采用结构化格式，便于查阅
- ✅ 旧记录不会删除，按时间线归档

---

## 📅 时间线

### 2026-03-22
- **重要事件**: 会话上下文丢失，重新建立记忆库
- **状态**: ✅ 已完成
  - 博弈圆桌开源项目详情（已补充）
  - Aimatch 登录页面问题（已修复）
  - A2A 模式选择讨论（已完成）

### 2026-03-25 - Railway 部署调试
- **重要事件**: Railway 部署调试，修复多个构建问题
- **状态**: ✅ 已修复
  - Dockerfile 构建失败
  - Prisma schema 找不到
  - GitHub PR 合并流程
  - JSON 类型转换问题
  - TypeScript catch 块类型错误

**今日对话摘要**:
- 修复了 `catch (err)` 类型错误（添加 `Error` 类型注解）
- 更新了 MEMORY.md 结构，添加快速导航

### 2026-04-01 - Dashboard 修复完成
- **重要事件**: 修复 Railway 部署和 Dashboard 卡片显示问题
- **状态**: ✅ 已完成
  - PostgreSQL 数据库连接修复
  - OAuth 登录跳转修复（NEXT_PUBLIC_APP_URL）
  - Dashboard 推荐卡片显示正常
  - 清理调试代码

**今日对话摘要**:
- Railway 部署成功后数据库凭证过期，重新配置 DATABASE_URL
- OAuth 回调后重定向到 localhost，添加 NEXT_PUBLIC_APP_URL 环境变量修复
- Dashboard 显示"加载中"但无卡片，修复 visibleCards 状态管理逻辑
- 当前显示 6 个 mock 用户数据，A2A 真实对话待接入

**明日计划**:
1. 验证 SecondMe Chat API 是否可用
2. 手动触发一次真实 A2A 对话
3. 打通登录→匹配→对话→显示的完整流程

### 2026-04-10 - 实时聊天功能完成
- **重要事件**: 实现 WebSocket 实时聊天功能
- **状态**: ✅ 已完成
  - 使用 Server-Sent Events (SSE) 实现实时消息推送
  - 添加消息发送 API (/api/chat/send)
  - 添加历史消息 API (/api/chat/history)
  - 添加会话列表 API (/api/chat/conversations)
  - 更新聊天页面支持实时消息和乐观更新
  - 更新聊天列表页面显示匹配度和最后消息

**技术决策**:
- 选择 SSE 而非 WebSocket：Next.js App Router 更友好，自动重连，单向推送足够
- 乐观更新：消息立即显示，失败时回滚
- 心跳机制：30 秒一次保持连接

**待优化**:
- 添加已读状态功能
- 添加消息撤回功能
- 添加图片/文件发送

---

## 🎯 项目概述

**Aimatch** - AI 驱动的社交匹配平台
- 核心理念："AI 先聊，你再决定"
- 两个用户的 AI Agent 先对话，生成契合度报告
- 用户基于报告决定是否匹配

### 技术栈
| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 + React 19 + TypeScript |
| 样式 | Tailwind CSS |
| 数据库 | Prisma + SQLite(开发) / PostgreSQL(生产) |
| 外部 API | SecondMe API (OAuth + AI Agent) |
| 缓存 | Redis |

---

## ✅ 已实现功能

### 1. 认证系统 ✅
- [x] SecondMe OAuth2 登录
- [x] Token 刷新机制
- [x] 登录页面（橙粉渐变主题）

### 2. 推荐系统 ✅
- [x] 基于标签的匹配算法
- [x] 瀑布流推荐卡片
- [x] 匹配度评分（60-98%）
- [x] 喜欢/跳过交互
- [x] 双向匹配机制

### 3. A2A (Agent-to-Agent) 系统 ✅
- [x] 中继模式架构
- [x] 两个真实用户 SecondMe 分身对话
- [x] 契合度分析算法
- [x] 新用户自动匹配（Top 50）
- [x] 定时增量匹配

### 4. 聊天功能 ✅
- [x] 聊天列表页面
- [x] 单聊页面框架
- [x] SSE 实时消息推送
- [x] 消息发送和接收
- [x] 历史消息加载
- [x] 乐观 UI 更新
- [ ] 已读状态
- [ ] 消息撤回

### 5. 其他 ⚠️
- [x] 个人资料展示/编辑
- [x] SecondMe 标签同步
- [ ] 接入真实 SecondMe Agent API
- [ ] 推送通知

---

## 📝 待解决问题/优化项

### 高优先级
- [ ] 接入真实 SecondMe Agent API（目前是模拟数据）
- [ ] Railway 部署最终验证

### 中优先级
- [x] WebSocket 实时聊天 (SSE 方案)
- [ ] 生产环境 PostgreSQL 优化
- [ ] 推送通知

### 低优先级
- [ ] 用户举报/屏蔽功能
- [ ] 匹配算法 ML 优化

---

## 🤖 A2A (Agent-to-Agent) 架构设计

### 核心场景
两个真实用户的 SecondMe AI 分身进行对话，生成契合度报告用于社交匹配推荐。

### 架构图
```
┌─────────────────┐      SecondMe API      ┌─────────────────┐
│   用户A的       │  ←──────────────────→  │   Aimatch      │
│ SecondMe分身    │     (OAuth Token A)    │   中继服务器    │
└─────────────────┘                        │                │
                                           │ 1. 接收A消息    │
                                           │ 2. 转发给B      │
                                           │ 3. 接收B回复    │
                                           │ 4. 转发给A      │
                                           │ 5. 循环直到结束  │
                                           │ 6. 生成报告     │
┌─────────────────┐      SecondMe API      │                │
│   用户B的       │  ←──────────────────→  │                │
│ SecondMe分身    │     (OAuth Token B)    │                │
└─────────────────┘                        └─────────────────┘
```

### 关键决策

| 决策 | 选择 | 说明 |
|------|------|------|
| Agent 身份 | 代理模式 | 不扮演，代理对方的真实 AI 分身 |
| 通信模式 | 中继模式 | 服务器中转，可记录/控制/生成报告 |
| 对话议题 | 自由对话 | 不预设议题，Agent 自主交流 |
| 对话轮次 | 3-5 轮 | 平衡对话质量与 API 成本 |
| 新用户匹配 | Top 50 | 按共同标签数排序 |
| 定时任务 | 每天 12:00 | 增量匹配未匹配组合 |

---

## 📖 问题目录索引

按类别快速查找问题：

| 类别 | 问题编号 | 简述 |
|------|---------|------|
| **部署问题** | #11-#15 | Railway/Vercel 部署相关问题 |
| **数据库问题** | #1, #21-#23 | Prisma、PostgreSQL、SQLite 问题 |
| **认证问题** | #2, #4, #6 | SecondMe OAuth、Token、Cookie |
| **TypeScript** | #9, #24 | 类型错误、编译问题 |
| **API 问题** | #12-#14, #25 | SecondMe Chat API、A2A 引擎 |
| **网络问题** | #26 | SSL/TLS 连接问题 |

---

## 🔧 问题备忘录 / 知识点

> 按编号记录所有遇到的问题，便于查阅

### 问题 #1: SecondMe OAuth `missing_user_id` ⭐

**现象**: 登录回调显示 "missing_user_id" 错误

**原因**: SecondMe Token 响应中**没有直接返回用户ID**，需要通过用户信息 API 获取

**解决方案**:
```typescript
// 1. 先从 Token 响应尝试获取
const secondme_id = tokenResponseData.secondme_id 
  || tokenResponseData.user_id 
  || tokenResponseData.userId 
  || tokenResponseData.id;

// 2. 如果 Token 中没有，从用户信息 API 获取
const userResponse = await fetch(`${API_BASE}/api/secondme/user/info`, {
  headers: { 'Authorization': `Bearer ${access_token}` },
});
const userData = await userResponse.json();
const finalId = secondme_id || userData.data.id;
```

**教训**: SecondMe OAuth 需要**两步获取用户信息**，Token 响应只包含 access_token。

---

### 问题 #2: Prisma SQLite 不支持数组类型 ⭐

**现象**: `String[]` 类型在 SQLite 中报错

**解决方案**: 使用 JSON 字符串存储
```prisma
// 修改前：SQLite 不支持
highlights    String[]

// 修改后
highlights    String    // 存储 JSON.stringify([...])
```

**数据转换**:
```typescript
// 存储：数组 → JSON 字符串
highlights: JSON.stringify(['item1', 'item2'])

// 读取：JSON 字符串 → 数组
JSON.parse(conv.highlights)
```

---

### 问题 #3: Prisma 必填字段缺失 ⭐

**现象**: 创建记录时报错 `Missing required field`

**原因**: Prisma schema 中定义为非可选字段（没有 `?`）在创建时必须提供

**解决方案**:
```prisma
// 必填字段（没有 ?）
highlights    String

// 创建时必须提供值
data: {
  highlights: '[]',  // 即使是空数组也要提供
}
```

---

### 问题 #4: SecondMe OAuth Token 请求格式 ⭐

**现象**: Token 交换返回 400/401 错误

**正确格式**:
```typescript
// ❌ 错误：application/json
// ✅ 正确：application/x-www-form-urlencoded
const params = new URLSearchParams({
  grant_type: 'authorization_code',
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  code: code,
  redirect_uri: REDIRECT_URI,
});

const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: params,
});
```

---

### 问题 #5: Railway 构建 - Prisma Schema 找不到 ⭐

**现象**: `Error: Can't find schema.prisma`

**原因**: Dockerfile 中 `prisma/schema.prisma` 在 `npm ci` 之后才复制，但 `postinstall` 钩子需要它

**解决方案**:
```dockerfile
# ✅ 正确顺序：先复制 prisma，再 npm ci
COPY package*.json ./
COPY prisma ./prisma/    # 先复制 prisma
RUN npm ci               # 现在 postinstall 能找到 schema
```

---

### 问题 #6: GitHub PR 合并流程 ⭐

**现象**: Railway 部署的还是旧代码，修复没有生效

**原因**: 代码在 PR 分支，还没有合并到 main

**解决方案**:
```bash
# 命令行合并 PR
git checkout main
git merge origin/PR分支名
git push origin main
```

**教训**: Railway 只部署 main 分支，PR 必须合并后才能生效。

---

### 问题 #7: Cookie 设置顺序 ⭐

**现象**: 登录成功但 cookie 没设置，页面跳转后未登录状态

**解决方案**:
```typescript
// ✅ 正确顺序
const response = NextResponse.redirect('/dashboard');
response.cookies.set('user_id', userId, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60,
});
return response;
```

---

### 问题 #8: TypeScript 类型不匹配 - 数组转字符串 ⭐

**现象**: `Type 'string[]' is not assignable to type 'string'`

**解决方案**:
```typescript
// ❌ 错误
await prisma.table.update({
  data: { highlights: ['item1', 'item2'] }
});

// ✅ 正确
await prisma.table.update({
  data: { highlights: JSON.stringify(['item1', 'item2']) }
});
```

---

### 问题 #9: TypeScript `catch` 块 `err` 类型错误 ⭐

**现象**: 
- `Parameter 'err' implicitly has an 'any' type`
- `Catch clause variable type annotation must be 'any' or 'unknown' if specified`

**解决方案**:
```typescript
// ❌ 错误：未指定类型（隐式 any）
.catch(err => { console.error(err); });

// ❌ 错误：不能指定为 Error
catch (err: Error) { console.error(err); }

// ✅ 正确：显式指定为 any
catch (err: any) { console.error(err); }

// ✅ 正确：显式指定为 unknown（更安全）
catch (err: unknown) { 
  if (err instanceof Error) {
    console.error(err.message);
  }
}
```

**关键教训**: TypeScript `catch` 块错误类型**只能是 `any` 或 `unknown`**，不能是其他类型。

**批量修复命令**:
```bash
# 替换所有 .catch(err => {
sed -i 's/\.catch(err => {/.catch((err: Error) => {/g' src/**/*.ts

# 替换所有 } catch (err) {
sed -i 's/} catch (err) {/} catch (err: Error) {/g' src/**/*.ts
```

---

### 问题 #10: GitHub 大文件提交问题

**现象**: `remote: error: File xxx is larger than 100M`

**解决方案**:
```bash
# 查看大文件
git ls-files | xargs -I {} ls -lh {} | awk '{ print $5 ": " $9 }' | sort -n

# 从 Git 历史中移除
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch 大文件路径' \
  --prune-empty --tag-name-filter cat -- --all
```

---

### 问题 #11: Railway 部署 - SSL_ERROR_SYSCALL

**现象**: 
- `curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL`
- 无法通过 CLI 访问 Railway 服务

**原因**:
- 本地网络环境问题（防火墙、DNS、代理）
- 不是 Railway 服务本身的问题

**解决方案**:
1. 使用浏览器直接访问测试
2. 检查网络：ping / nslookup
3. 尝试切换网络（手机热点）
4. 等待 5-10 分钟自动恢复

**验证方式**:
```bash
# 浏览器访问
https://aimatch-secondme.up.railway.app/api/health
```

---

### 问题 #12: Railway 启动脚本 - Prisma db execute 参数错误

**现象**: 
```
Error: Either --url or --schema must be provided
```

**原因**: `npx prisma db execute --stdin` 缺少 `--url` 参数

**解决方案**:
```bash
# 错误
npx prisma db execute --stdin <<EOF
SELECT 1;
EOF

# 正确
npx prisma db execute --url "$DATABASE_URL" -q "SELECT 1;"
```

---

### 问题 #13: Railway 启动命令 - output: standalone 不兼容

**现象**: 
```
⚠ "next start" does not work with "output: standalone" configuration
```

**原因**: `npm start` 与 `output: 'standalone'` 配置不兼容

**解决方案**:
```bash
# 错误
exec npm start

# 正确
exec node .next/standalone/server.js
```

---

### 问题 #14: TypeScript 编译 - 变量重复声明

**现象**: 
```
Type error: Cannot redeclare block-scoped variable 'mockUserA'
```

**原因**: `scripts/` 目录下的测试脚本被包含在 TypeScript 编译中

**解决方案**:
```json
// tsconfig.json
{
  "exclude": ["node_modules", "scripts"]
}
```

---

### 问题 #15: Railway 域名重定向问题

**现象**: 
- 访问 Railway 域名被重定向到 `js96110.com.cn`
- 说明域名/IP 可能被回收或项目被删除

**解决方案**:
1. 登录 Railway Dashboard 检查项目状态
2. 重新部署或创建新项目
3. 考虑迁移到 Vercel/Render 作为备选

---

### 问题 #16: SecondMe Chat API - Token 过期

**现象**: 
```json
{"code":401,"message":"Internal server error"}
```

**原因**: Access Token 已过期（有效期 2 小时）

**解决方案**:
1. 使用 Refresh Token 刷新
2. 或让用户重新登录获取新 Token

---

## 📚 参考项目

### 博弈圆桌 (Negotiation Arena)

**链接**: https://github.com/calderbuild/negotiation-arena

**值得借鉴的技术**:
1. **中继模式**: 通过服务器中转 SSE 流实现 A2A 对话
2. **OAuth 调用**: SecondMe OAuth + Chat API 的正确使用方式
3. **SSE 协议**: `session_info`, `status`, `message`, `summary`, `done`, `error`
4. **Prompt 设计**: 使用 `---BEGIN POSITION---` 防止 prompt 注入

---

## 🚀 Railway 部署

### 已创建的部署文件

| 文件 | 说明 |
|------|------|
| `Dockerfile` | 简化的 Docker 构建配置 |
| `railway.json` / `railway.toml` | Railway 配置 |
| `.dockerignore` | Docker 忽略文件 |
| `.github/workflows/deploy-railway.yml` | GitHub Actions 自动部署 |
| `DEPLOY.md` | 完整部署文档 |

### 必需环境变量

```env
# SecondMe OAuth2
SECONDME_CLIENT_ID=54f4205d-7a46-4140-a3b3-4227520473d3
SECONDME_CLIENT_SECRET=cddc1cc84d0d3d1c5fee43e00b523ba3766cf4fe8ebe434b606c71496bfb3c4e
SECONDME_REDIRECT_URI=https://your-domain.up.railway.app/api/auth/callback

# SecondMe API（使用博弈圆桌相同端点）
SECONDME_API_BASE_URL=https://app.mindos.com/gate/lab
SECONDME_TOKEN_ENDPOINT=https://app.mindos.com/gate/lab/api/oauth/token/code

# 应用
NODE_ENV=production
```

### 部署步骤

1. **GitHub**: 推送代码到 main 分支
2. **Railway**: New Project → Deploy from GitHub
3. **Railway**: Add PostgreSQL database
4. **Railway**: 配置环境变量（见上文）
5. **Railway**: Generate Domain
6. **SecondMe**: 更新回调地址到实际域名

---

## 💡 开发约定

### 代码风格
- 使用 TypeScript 严格模式
- 所有 `catch` 块参数必须加 `: Error` 类型
- Prisma JSON 字段统一使用 `JSON.stringify()` / `JSON.parse()`

### 文件命名
- 页面组件: `page.tsx`
- API 路由: `route.ts`
- 工具函数: `lib/xxx.ts`

---

## 📝 对话记录

### 2026-03-25 晚间对话

**参与者**: 用户, Kimi

**主题**: 
1. Railway 部署调试
2. TypeScript 类型错误修复
3. MEMORY.md 结构优化

**关键决策**:
- 添加目录导航，使 MEMORY.md 更易读
- 问题备忘录采用编号制，便于引用
- 使用表格整理技术栈和决策

**修复内容**:
- ✅ 修复 8 个文件的 `catch (err: Error)` 类型错误
- ✅ 更新 MEMORY.md 结构

**待办事项**:
- [ ] Railway 部署最终验证
- [ ] 测试生产环境登录流程

---

*最后更新: 2026-03-25*
