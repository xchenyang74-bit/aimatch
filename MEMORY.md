# Aimatch 项目记忆库

> 这个文件用于记录开发过程中的关键决策、待办事项和对话历史。
> 每次会话开始时，请先阅读此文件恢复上下文。

## 🤝 协作约定

- **用户**：会定期告知我更新 MEMORY.md，也会自己直接编辑记录
- **Kimi**：在关键决策、技术选型、问题解决后主动更新此文件
- **下次会话**：我会先读取此文件恢复上下文

---

## 📅 时间线

### 2026-03-22
- **重要事件**: 会话上下文丢失，重新建立记忆库
- **状态**: 需要恢复以下信息：
  1. 博弈圆桌开源项目详情（已补充）
  2. Aimatch 登录页面问题（已修复）
  3. A2A 模式选择讨论（已完成）

### 2026-03-25
- **重要事件**: Railway 部署调试
- **状态**: 多个构建问题已修复

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

### 4. A2A (Agent-to-Agent) 系统 ✅ 新实现
- [x] 中继模式架构
- [x] 两个真实用户 SecondMe 分身对话
- [x] 契合度分析算法
- [x] 新用户自动匹配（Top 50）
- [x] 定时增量匹配

### 5. 聊天功能
- [x] 聊天列表页面
- [x] 单聊页面框架
- [ ] WebSocket 实时消息 (TODO)

### 6. 个人资料
- [x] 资料展示
- [x] 资料编辑
- [x] SecondMe 标签同步

---

## 📝 待解决问题/优化项

### 高优先级
- [ ] **登录页面问题** - 已修复 OAuth 回调
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

#### 4. 实现方案 ✅ **已确认**

| 配置项 | 选择 | 说明 |
|--------|------|------|
| 对话议题 | 自由对话 | 不预设议题，Agent 根据 tags/memory 自主 |
| 对话轮次 | 3-5 轮 | 固定轮次，6-10 条消息 |
| 新用户匹配 | Top 50 | 按共同标签数量排序 |
| 定时任务 | 每天 12:00 | 增量匹配未匹配组合 |
| 触发时机 | 立即执行 | 用户注册后立即触发 |

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

## 💡 问题备忘录 / 知识点

### 问题 1: SecondMe OAuth 登录失败 - `missing_user_id`

**现象**: 登录回调显示 "missing_user_id" 错误

**原因**: 
- SecondMe Token 响应中**没有直接返回用户ID**
- 需要通过 `/api/secondme/user/info` API 获取用户信息

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

**关键教训**: SecondMe OAuth 流程需要**两步获取用户信息**，Token 响应只包含 access_token，不保证包含 user_id。

---

### 问题 2: Prisma SQLite 数组字段不支持

**现象**: `String[]` 类型在 SQLite 中报错

**原因**: SQLite 不支持数组类型

**解决方案**: 使用 JSON 字符串存储
```prisma
// 修改前
highlights          String[]  // SQLite 不支持

// 修改后  
highlights          String    // 存储 JSON.stringify([...])
```

**数据转换**:
```typescript
// 存储时：数组 → JSON 字符串
await prisma.a2AConversation.create({
  data: {
    highlights: JSON.stringify(['item1', 'item2']),
  }
});

// 读取时：JSON 字符串 → 数组
const conv = await prisma.a2AConversation.findFirst();
const highlights = JSON.parse(conv.highlights);
```

---

### 问题 3: Prisma 必填字段缺失

**现象**: 创建记录时报错 `Missing required field`

**原因**: Prisma schema 中定义为非可选字段（没有 `?`）的字段在创建时必须提供

**解决方案**: 
```prisma
// 如果定义为必填
highlights          String    // 没有 ?，表示必填

// 创建时必须提供值
data: {
  highlights: '[]',  // 提供默认值
}
```

**关键教训**: 
- 可选字段: `String?` - 可以不提供
- 必填字段: `String` - 必须提供值，即使是空字符串或 `[]`

---

### 问题 4: SecondMe OAuth Token 请求格式

**现象**: Token 交换返回 400/401 错误

**原因**: 请求格式错误

**正确格式**:
```typescript
// ❌ 错误：使用 JSON
const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({...}),  // 错误！
});

// ✅ 正确：使用 URLSearchParams
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

**关键教训**: SecondMe OAuth 使用 `application/x-www-form-urlencoded` 格式，不是 JSON。

---

### 问题 5: Railway 构建失败 - Prisma Schema 找不到

**现象**: `Error: Can't find schema.prisma`

**原因**: Dockerfile 中 `prisma/schema.prisma` 在 `npm ci` 之后才复制，但 `postinstall` 钩子需要它

**解决方案**:
```dockerfile
# ❌ 错误顺序
COPY package*.json ./
RUN npm ci          # postinstall 需要 schema.prisma，但还没复制
COPY prisma ./prisma/

# ✅ 正确顺序
COPY package*.json ./
COPY prisma ./prisma/  # 先复制 prisma
RUN npm ci             # 现在 postinstall 能找到 schema
```

---

### 问题 6: GitHub PR 合并流程

**现象**: Railway 部署的还是旧代码，修复没有生效

**原因**: 代码在 PR 分支，还没有合并到 main

**解决方案**:
```bash
# 方法 1: GitHub 网站上合并
# 打开 PR 页面 → 点击 "Merge pull request"

# 方法 2: 命令行合并
git checkout main
git merge origin/PR分支名
git push origin main
```

**关键教训**: Railway 只部署 main 分支的代码，PR 必须合并后才能生效。

---

### 问题 7: Cookie 设置顺序

**现象**: 登录成功但 cookie 没设置，页面跳转后未登录状态

**原因**: 先创建了 redirect response，后设置 cookie

**解决方案**:
```typescript
// ❌ 错误顺序
const response = NextResponse.redirect('/dashboard');
response.cookies.set('user_id', userId);  // 可能已经晚了

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

### 问题 8: TypeScript 类型不匹配

**现象**: `Type 'string[]' is not assignable to type 'string'`

**原因**: Prisma schema 定义为 `String`，但代码传入数组

**解决方案**:
```typescript
// ❌ 错误
await prisma.table.update({
  data: {
    highlights: ['item1', 'item2'],  // 类型错误！
  }
});

// ✅ 正确
await prisma.table.update({
  data: {
    highlights: JSON.stringify(['item1', 'item2']),
  }
});
```

---

## 🔗 重要链接

- **GitHub 仓库**: https://github.com/xchenyang74-bit/aimatch
- **SecondMe API 文档**: https://api.mindverse.com/gate/lab
- **OAuth 授权**: https://go.second.me/oauth/
- **博弈圆桌参考**: https://github.com/calderbuild/negotiation-arena

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

## 🚀 Railway 部署准备（2026-03-25）

### 部署文件已创建

| 文件 | 说明 |
|------|------|
| `Dockerfile` | Docker 构建配置（已简化） |
| `railway.json` | Railway 配置（legacy） |
| `railway.toml` | Railway 配置（新格式） |
| `.dockerignore` | Docker 忽略文件 |
| `.github/workflows/deploy-railway.yml` | GitHub Actions 自动部署 |
| `RAILWAY_DEPLOY_GUIDE.md` | Railway CLI 部署指南 |
| `DEPLOY.md` | 完整部署文档 |

### 快速部署步骤

#### 方法 1：Railway 网站一键部署（最简单）

1. 推送代码到 GitHub
2. 访问 https://railway.app
3. New Project → Deploy from GitHub
4. 添加 PostgreSQL 数据库
5. 配置环境变量
6. 生成域名
7. 更新 SecondMe 回调地址

#### 方法 2：Railway CLI

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
SECONDME_CLIENT_ID=54f4205d-7a46-4140-a3b3-4227520473d3
SECONDME_CLIENT_SECRET=cddc1cc84d0d3d1c5fee43e00b523ba3766cf4fe8ebe434b606c71496bfb3c4e
SECONDME_REDIRECT_URI=https://your-domain.up.railway.app/api/auth/callback
SECONDME_API_BASE_URL=https://app.mindos.com/gate/lab
SECONDME_OAUTH_URL=https://go.second.me/oauth/
SECONDME_TOKEN_ENDPOINT=https://app.mindos.com/gate/lab/api/oauth/token/code
SECONDME_REFRESH_ENDPOINT=https://app.mindos.com/gate/lab/api/oauth/token/refresh
NODE_ENV=production
```

### 部署后更新 SecondMe

1. 访问 https://second.me/developer
2. 找到 Aimatch 应用
3. 添加回调地址：`https://your-domain.up.railway.app/api/auth/callback`

---

*最后更新: 2026-03-25*
