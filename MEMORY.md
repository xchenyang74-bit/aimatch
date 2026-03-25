# Aimatch 项目记忆库

> 这个文件用于记录开发过程中的关键决策、待办事项和对话历史。
> 每次会话开始时，请先阅读此文件恢复上下文。

## 🤝 协作约定

- **用户**：会定期告知我更新 MEMORY.md，也会自己直接编辑记录
- **Kimi**：在关键决策、技术选型、问题解决后主动更新此文件
- **下次会话**：我会先读取此文件恢复上下文

---

---

## 📅 时间线

### 2026-03-22
- **重要事件**: 会话上下文丢失，重新建立记忆库
- **状态**: 需要恢复以下信息：
  1. 博弈圆桌开源项目详情（待补充）
  2. Aimatch 登录页面具体问题（待补充）
  3. A2A 模式选择讨论（进行中）

---

## 🎯 项目概述

**Aimatch** - AI 驱动的社交匹配平台
- 核心理念："AI 先聊，你再决定"
- 两个用户的 AI Agent 先对话，生成契合度报告
- 用户基于报告决定是否匹配

### 技术栈
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS
- Prisma + SQLite/PostgreSQL
- SecondMe API (OAuth + AI Agent)
- Redis (缓存)

---

## ✅ 已实现功能

### 1. 认证系统
- [x] SecondMe OAuth2 登录
- [x] Token 刷新机制
- [x] 登录页面（橙粉渐变主题）

### 2. 推荐系统
- [x] 基于标签的匹配算法
- [x] 瀑布流推荐卡片
- [x] 匹配度评分（60-98%）
- [x] 喜欢/跳过交互
- [x] 双向匹配机制

### 3. Agent 对话系统
- [x] 模拟 Agent 对话生成
- [x] 对话分析报告展示
  - [x] 对话时长、消息数
  - [x] 好感度变化曲线
  - [x] 精彩对话片段
  - [x] 优缺点分析
- [x] Redis 缓存
- [ ] **接入真实 SecondMe Agent API** (TODO)

### 4. 聊天功能
- [x] 聊天列表页面
- [x] 单聊页面框架
- [ ] WebSocket 实时消息 (TODO)

### 5. 个人资料
- [x] 资料展示
- [x] 资料编辑
- [x] SecondMe 标签同步

---

## 📝 待解决问题/优化项

### 高优先级
- [ ] **登录页面问题** - 待明确具体问题
- [ ] **接入真实 Agent API** - 当前为模拟数据

### 中优先级
- [ ] WebSocket 实时聊天
- [ ] 生产环境 PostgreSQL
- [ ] 推送通知

### 低优先级
- [ ] 用户举报/屏蔽
- [ ] 匹配算法优化（ML）

---

## 🤖 A2A (Agent-to-Agent) 架构设计 ✅ 已确认

### 核心场景
**Aimatch 的 A2A 对话** —— 两个真实用户的 SecondMe AI 分身进行对话，生成契合度报告用于社交匹配推荐。

### 关键设计决策

#### 1. Agent 身份模式 ✅ **已确认：代理模式**
- ❌ 不是"扮演"对方的 AI 分身
- ✅ 而是"代理"对方的 AI 分身
- 根据对方的 memory、标签、底层语言模型配置来生成响应
- 保持对方 AI 分身的"本真"

#### 2. 通信模式 ✅ **已确认：中继模式**

```
┌─────────────────┐                       ┌─────────────────┐
│   用户A的       │ ←── SecondMe API ──→ │   Aimatch      │
│ SecondMe分身    │   (OAuth Token A)     │   中继服务器    │
└─────────────────┘                       │                │
                                          │  1. 接收A的消息 │
                                          │  2. 转发给B     │
                                          │  3. 接收B的回复 │
                                          │  4. 转发给A     │
                                          │  5. 循环直到结束 │
                                          │  6. 生成报告    │
                                          │                │
┌─────────────────┐                       │                │
│   用户B的       │ ←── SecondMe API ──→ │                │
│ SecondMe分身    │   (OAuth Token B)     │                │
└─────────────────┘                       └─────────────────┘
```

**为什么选择中继模式**:
- ✅ 可以完整记录对话历史
- ✅ 可以控制对话轮次和结束条件
- ✅ 可以生成契合度分析报告
- ✅ 可以缓存结果供推荐系统使用

#### 3. 匹配流程 ✅ **已确认：全量遍历匹配**

**流程设计**:
```
用户池 (N个用户)
    ↓
遍历所有用户组合: C(N,2) = N*(N-1)/2 对
    ↓
对每一对用户 (A, B):
    ├─ 获取A的SecondMe Token
    ├─ 获取B的SecondMe Token
    ├─ 触发A2A对话 (中继模式)
    ├─ 存储对话结果
    └─ 计算契合度分数
    ↓
根据契合度排序生成推荐列表
```

**特点**:
- 系统自动触发，非用户主动
- 需要批量处理大量对话
- 对话结果存储用于后续推荐

**挑战**:
- N个用户就有 N*(N-1)/2 对组合，计算量随用户数平方增长
- 需要优化：缓存、增量计算、异步处理

---

## 📚 参考项目

### 博弈圆桌 (Negotiation Arena) ✅ 已找到

**项目信息**:
- **GitHub**: https://github.com/calderbuild/negotiation-arena
- **在线体验**: https://negotiation-table.vercel.app
- **作者**: calderbuild
- **技术栈**: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + SecondMe API + DeepSeek LLM

**核心功能**:
两个 AI Agent 代表各自立场，围绕议题进行三轮谈判，自动达成共识或明确分歧
- **甲方**: 用户的 SecondMe 分身（通过 OAuth 调用 SecondMe Chat API）
- **乙方**: DeepSeek LLM 驱动的 AI 对手

**技术实现要点**:

#### 1. 架构模式 —— 中继模式（Confirmed）
```
用户A的SecondMe分身 → SecondMe API → 谈判服务器 → DeepSeek API → AI对手
         ↑                                              ↓
         └──────────── SSE 流式返回 ←────────────────────┘
```
- 所有消息通过**服务器中继**
- 服务器控制谈判流程和轮次
- 使用 SSE (Server-Sent Events) 实现流式输出

#### 2. 谈判引擎设计
- **三轮渐进式谈判**: R1阐述立场 → R2渐进让步 → R3最终方案
- **策略框架**: 基于 NeurIPS 2024 LLM-Deliberation 论文
- **System Prompt 设计**: 包含轮次策略，使用 `---BEGIN POSITION---` 包裹立场防止注入

#### 3. SSE 事件协议
| 事件 | 说明 |
|------|------|
| `session_info` | 谈判元信息 |
| `status` | Agent 思考状态 |
| `message` | 完整的一轮发言 |
| `summary` | 结构化共识分析 JSON |
| `done` | 谈判结束 |
| `error` | 错误信息 |

#### 4. Serverless 适配
- Vercel serverless 函数不共享内存
- 使用 `sessionStorage` + POST body 传递配置
- 服务端通过 `restoreSession()` 重建状态

**对 Aimatch 的借鉴价值**:
1. ✅ **中继模式可行**: 通过服务器中转 SSE 流实现 A2A 对话
2. ✅ **SecondMe API 调用方式**: OAuth + Chat API 的正确使用姿势
3. ✅ **流式 UX**: 思考状态可视化提升用户体验
4. ✅ **结构化报告**: 对话结束后生成分析报告

---

## 🔧 技术债务

1. **Agent 对话**: 当前使用 `simulateAgentConversation`，需要替换为真实 API 调用
2. **WebSocket**: 聊天功能目前是模拟的，需要实现真实的 WebSocket 连接
3. **Redis**: 已集成但未在生产环境验证

---

## 💡 想法记录区

### 待讨论的想法
- [ ] 中继模式 vs 直连模式的最终选择
- [ ] 登录页面具体需要哪些修改？
- [ ] 博弈圆桌项目的参考价值

---

## 🔗 重要链接

- **SecondMe API 文档**: https://api.mindverse.com/gate/lab
- **OAuth 授权**: https://go.second.me/oauth/
- **部署地址**: (待补充)

---

## 📝 对话记录模板

每次会话应在此记录关键讨论：

```
### YYYY-MM-DD HH:MM
**参与者**: 用户, Kimi

**讨论主题**: 

**关键决策**:
- 决策1
- 决策2

**待办事项**:
- [ ] 事项1
- [ ] 事项2

**新发现**:
- 发现1
```

---

*最后更新: 2026-03-22 22:04*


---

## ✅ A2A 实现方案（2026-03-22 确认）

### 1. 对话议题
- **自由对话**：不预设议题
- **Agent 自主**：根据双方 memory、tag 标签等自行展开对话
- **平台角色**：仅提供"聊天环境"（中继），不干预内容

### 2. 对话轮次
- **固定轮次**：3-5 轮（6-10 条消息）
- **每轮**：双方各发言一次

### 3. 计算频率
- **新用户进入**：立即与存量用户匹配（匹配一定数量）
- **存量用户**：定时匹配（如每晚）

---

## 🤔 待确认问题

1. **新用户匹配数量**：新用户注册时，匹配多少个存量用户？
   - 全部？
   - 前 N 个（如前 50 个）？
   - 按某种筛选条件（如活跃度、共同标签数量）？

2. **定时任务频率**：
   - 每天一次？
   - 每周一次？
   - 还是增量更新（只计算未匹配的组合）？

3. **对话触发时机**：
   - 立即执行（用户注册后立即开始对话）？
   - 还是队列异步处理（后台慢慢算）？


---

## ✅ A2A 实现方案（2026-03-22 最终确认）

### 1. 对话议题
- **自由对话**：不预设议题
- **Agent 自主**：根据双方 memory、tag 标签等自行展开对话
- **平台角色**：仅提供"聊天环境"（中继），不干预内容

### 2. 对话轮次
- **固定轮次**：3-5 轮（6-10 条消息）
- **每轮**：双方各发言一次

### 3. 新用户匹配策略 ✅
- **筛选条件**：按共同标签数量降序排序
- **匹配数量**：前 50 个存量用户
- **触发时机**：立即执行（用户注册后触发）

### 4. 定时任务策略 ✅
- **执行时间**：每天上午 12:00 前
- **计算范围**：只计算未匹配过的用户组合
- **优化**：增量计算，避免重复

---

### 匹配算法详细设计

```
新用户注册 (UserN)
    ↓
获取存量用户列表 (User1...UserN-1)
    ↓
计算共同标签数量:
    for each UserI in 存量用户:
        commonTags = intersection(UserN.tags, UserI.tags)
        score = count(commonTags)
    ↓
按共同标签数降序排序
    ↓
取前 50 名
    ↓
依次执行 A2A 对话
```

### 数据库模型

```prisma
model A2AConversation {
  id                  String   @id @default(cuid())
  userAId             String
  userBId             String
  status              String   // pending, running, completed, failed
  
  // 匹配元数据
  commonTags          String[] // 共同标签列表
  commonTagCount      Int      // 共同标签数量
  
  // 对话内容
  messages            Json?    // [{speaker, content, timestamp, round}]
  
  // 契合度报告
  compatibilityScore  Float?   // 0-100
  conversationQuality Json?    // {engagement, depth, harmony}
  highlights          String[] // 精彩对话片段
  analysisPros        String[] // 优势
  analysisCons        String[] // 潜在问题
  
  createdAt           DateTime @default(now())
  completedAt         DateTime?
  
  @@unique([userAId, userBId])
  @@index([userAId])
  @@index([userBId])
  @@index([compatibilityScore])
  @@index([commonTagCount])
}
```


---

## ✅ A2A 实现完成（2026-03-22）

### 实现内容

#### 1. 数据库模型 (`prisma/schema.prisma`)
- 新增 `A2AConversation` 表，存储对话记录和契合度报告
- 字段：messages, compatibilityScore, highlights, analysis 等

#### 2. A2A 对话引擎 (`src/lib/a2a-engine.ts`)
- **中继模式**：通过服务器中转两个用户的 SecondMe API 调用
- **自由对话**：不预设议题，Agent 根据 memory、tags 自主交流
- **固定轮次**：3-5 轮（6-10 条消息）
- **契合度分析**：自动生成评分、优缺点分析、摘要

#### 3. 匹配引擎 (`src/lib/a2a-matcher.ts`)
- **新用户匹配**：按共同标签排序，取前 50 个存量用户
- **定时任务**：每天增量匹配未匹配过的用户组合
- **异步处理**：立即执行但不阻塞用户流程

#### 4. API 路由
- `POST /api/a2a/match` - 触发新用户的 A2A 匹配
- `GET /api/a2a/cron?secret=xxx` - 定时任务（增量匹配）
- `GET /api/recommendations` - 使用 A2A 结果生成推荐

#### 5. OAuth 回调集成
- 新用户注册后自动触发 A2A 匹配
- 异步执行，不阻塞登录流程

### 关键设计决策

| 决策 | 选择 | 说明 |
|------|------|------|
| 通信模式 | 中继模式 | 服务器中转，可记录/控制/生成报告 |
| Agent 身份 | 代理模式 | 不扮演，而是代理对方的真实 AI 分身 |
| 对话议题 | 自由对话 | 不预设议题，Agent 根据 tags/memory 自主 |
| 对话轮次 | 固定 3-5 轮 | 平衡对话质量与 API 成本 |
| 新用户匹配 | Top 50 | 按共同标签数排序 |
| 定时任务 | 每天 12:00 | 增量匹配未匹配组合 |

### 待优化项

- [ ] **队列系统**：当前是同步执行，大量用户时需要消息队列
- [ ] **流式输出**：博弈圆桌使用 SSE 流式，Aimatch 目前是批量返回
- [ ] **错误重试**：SecondMe API 失败时的重试机制
- [ ] **Token 刷新**：Access Token 过期时自动刷新
- [ ] **Vercel Cron**：配置定时任务调度

### 环境变量要求

```env
# 已有
SECONDME_CLIENT_ID=xxx
SECONDME_CLIENT_SECRET=xxx
SECONDME_API_BASE_URL=https://api.mindverse.com/gate/lab

# 新增（可选，用于定时任务验证）
CRON_SECRET=your-cron-secret
```

### 测试方式

1. **新用户注册**：OAuth 登录后自动触发匹配
2. **手动触发**：`POST /api/a2a/match { "userId": "xxx" }`
3. **定时任务**：`GET /api/a2a/cron?secret=xxx`
4. **查看推荐**：`GET /api/recommendations`（优先返回 A2A 结果）


---

## 🔧 登录页面修复（2026-03-22）

### 问题诊断
1. **Cookie 设置问题**：回调中先创建了 redirect response，然后设置 cookie，导致 cookie 可能未正确设置
2. **新用户检测问题**：使用 `user.createdAt.getTime() > Date.now() - 60000` 判断新用户不可靠
3. **缺少认证中间件**：没有统一的登录状态检查
4. **Dashboard 未检查登录**：API 调用失败时没有跳转到登录页

### 修复内容

#### 1. OAuth 回调 (`/api/auth/callback/route.ts`)
- ✅ 修复 cookie 设置顺序：先创建 response，再设置 cookie
- ✅ 修复新用户检测：查询前先检查用户是否存在
- ✅ 统一错误处理：所有错误情况都清除 state cookie
- ✅ 使用 `user.id` 而非 `secondme_id` 作为 cookie 值

#### 2. 认证中间件 (`/src/middleware.ts`)
- ✅ 创建中间件保护需要登录的路由
- ✅ 未登录用户访问 `/dashboard`、`/chat`、`/profile` 时重定向到登录页

#### 3. Dashboard 页面 (`/app/dashboard/page.tsx`)
- ✅ 添加 401 检查，未登录时自动跳转

#### 4. API 路由
- ✅ `/api/recommendations`：添加 `getCurrentUser()` 认证检查
- ✅ `/api/matches`：添加 `getCurrentUser()` 认证检查
- ✅ `/lib/auth.ts`：修复 `getCurrentUser()` 查询逻辑

#### 5. 调试工具 (`/api/debug/session`)
- ✅ 添加调试 API 用于检查登录状态

### 测试步骤
1. 访问 `/login`
2. 点击 "使用 SecondMe 登录"
3. 在 SecondMe 授权页面确认授权
4. 回调后应该正确设置 cookie 并跳转到 `/dashboard`
5. 检查 `/api/debug/session` 确认登录状态

### 环境变量检查
确保 `.env` 中有：
```env
SECONDME_CLIENT_ID=xxx
SECONDME_CLIENT_SECRET=xxx
SECONDME_REDIRECT_URI=http://localhost:3000/api/auth/callback
SECONDME_API_BASE_URL=https://api.mindverse.com/gate/lab
SECONDME_OAUTH_URL=https://go.second.me/oauth/
SECONDME_TOKEN_ENDPOINT=https://api.mindverse.com/gate/lab/api/oauth/token/code
```


---

## 🚀 Railway 部署准备（2026-03-22）

### 部署文件已创建

| 文件 | 说明 |
|------|------|
| `Dockerfile` | Docker 构建配置 |
| `railway.json` | Railway 配置（legacy） |
| `railway.toml` | Railway 配置（新格式） |
| `.github/workflows/deploy-railway.yml` | GitHub Actions 自动部署 |
| `RAILWAY_DEPLOY_GUIDE.md` | Railway CLI 部署指南 |
| `DEPLOY.md` | 完整部署文档 |

### 部署步骤

#### 方法一：Railway 网站一键部署（最简单）

1. 推送代码到 GitHub
2. 访问 https://railway.app
3. New Project → Deploy from GitHub
4. 添加 PostgreSQL 数据库
5. 配置环境变量
6. 生成域名
7. 更新 SecondMe 回调地址

#### 方法二：Railway CLI

```bash
# 安装 CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
cd ~/Projects/secondme-app
railway init

# 添加数据库
railway add --database postgres

# 配置环境变量
railway variables

# 部署
railway up

# 生成域名
railway domain
```

### 必需的环境变量

```env
# SecondMe OAuth2
SECONDME_CLIENT_ID=54f4205d-7a46-4140-a3b3-4227520473d3
SECONDME_CLIENT_SECRET=cddc1cc84d0d3d1c5fee43e00b523ba3766cf4fe8ebe434b606c71496bfb3c4e
SECONDME_REDIRECT_URI=https://your-domain.up.railway.app/api/auth/callback

# SecondMe API
SECONDME_API_BASE_URL=https://app.mindos.com/gate/lab
SECONDME_OAUTH_URL=https://go.second.me/oauth/
SECONDME_TOKEN_ENDPOINT=https://app.mindos.com/gate/lab/api/oauth/token/code
SECONDME_REFRESH_ENDPOINT=https://app.mindos.com/gate/lab/api/oauth/token/refresh

# 应用配置
NODE_ENV=production
```

### 部署后更新 SecondMe

1. 访问 https://second.me/developer
2. 找到 Aimatch 应用
3. 添加回调地址：`https://your-domain.up.railway.app/api/auth/callback`

---
