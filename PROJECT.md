# Aimatch - AI 驱动的社交匹配平台

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/Prisma-6.19-2D3748?style=flat-square&logo=prisma" />
</p>

<p align="center">
  <b>让 AI Agent 帮你找到志同道合的朋友</b>
</p>

---

## 📖 项目简介

**Aimatch** 是一个创新的社交平台，核心概念是**"AI 先聊，你再决定"**。系统为每个用户创建 AI Agent，Agent 之间基于用户标签和背景进行匹配对话，通过聊天积累好感度，最终向用户推荐聊得来的潜在好友。

> 💡 **核心洞察**：传统社交 App 让用户盲目滑动匹配，Aimatch 让 AI 先帮你筛选，提供**对话分析报告**和**契合度评分**，让匹配更有依据。

---

## ✨ 核心功能

### 1. AI Agent 智能匹配
- 基于 SecondMe 兴趣标签自动匹配潜在好友
- 算法考虑共同标签、生活方式互补性
- 匹配分数范围 60-98%，带有随机波动增加真实感

### 2. Agent 对话预览
- 查看两个 AI Agent 的聊天过程
- **对话分析报告**包含：
  - 对话时长和消息数量
  - 好感度变化曲线
  - 精彩对话片段
  - 契合度优缺点分析

### 3. 双向匹配机制
- 用户浏览推荐卡片，选择喜欢/跳过
- 只有双方都喜欢后（双向匹配）才能开启私聊
- 匹配成功后实时弹出提示

### 4. 即时聊天
- 匹配成功后可进入一对一聊天
- 消息列表展示历史记录
- 底部导航显示未读消息数

### 5. 个人资料管理
- 编辑昵称、简介、头像
- 同步 SecondMe 兴趣标签（Shades）
- 查看自己的匹配历史

---

## 🏗 技术架构

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 16.1.7 | React 全栈框架，支持 App Router |
| **React** | 19.2.3 | UI 组件库 |
| **TypeScript** | 5.x | 类型安全 |
| **Tailwind CSS** | 4.x | 原子化 CSS 框架 |

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js API Routes** | 16.x | Serverless API 端点 |
| **Prisma** | 6.19.2 | ORM 数据库操作 |
| **SQLite** | - | 开发环境数据库 |
| **PostgreSQL** | - | 生产环境数据库 |

### 第三方服务

| 服务 | 用途 |
|------|------|
| **SecondMe API** | AI Agent 对话、用户认证、笔记同步 |
| **Vercel** | 部署托管、Serverless Functions |

---

## 📁 项目结构

```
secondme-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # 首页（自动跳转）
│   │   ├── layout.tsx          # 根布局
│   │   ├── globals.css         # 全局样式
│   │   │
│   │   ├── login/              # 登录页面
│   │   │   └── page.tsx
│   │   ├── dashboard/          # 推荐页（核心页面）
│   │   │   └── page.tsx
│   │   ├── chat/               # 聊天功能
│   │   │   ├── page.tsx        # 聊天列表
│   │   │   └── [userId]/       # 单聊页面
│   │   │       └── page.tsx
│   │   └── profile/            # 个人资料
│   │       ├── page.tsx        # 资料展示
│   │       └── edit/           # 编辑资料
│   │           └── page.tsx
│   │
│   │   └── api/                # API 路由
│   │       ├── auth/           # 认证相关
│   │       │   ├── login/      # OAuth 登录入口
│   │       │   ├── callback/   # OAuth 回调处理
│   │       │   └── logout/
│   │       ├── recommendations/# 获取推荐列表
│   │       ├── matches/        # 喜欢/匹配操作
│   │       ├── chat/           # 聊天消息
│   │       ├── agent-conversations/  # Agent 对话报告
│   │       ├── user/           # 用户信息
│   │       │   ├── info/
│   │       │   ├── profile/
│   │       │   └── shades/
│   │       ├── note/           # 笔记功能
│   │       ├── act/            # 结构化动作
│   │       └── notifications/  # 通知
│   │
│   ├── components/             # React 组件
│   │   └── BottomNav.tsx       # 底部导航栏
│   │
│   └── lib/                    # 工具库
│       ├── auth.ts             # 认证工具
│       └── prisma.ts           # Prisma 客户端
│
├── prisma/
│   └── schema.prisma           # 数据库模型定义
│
├── public/                     # 静态资源
├── .env                        # 环境变量
├── next.config.ts              # Next.js 配置
├── vercel.json                 # Vercel 部署配置
└── package.json
```

---

## 🎨 核心页面设计

### 1. 推荐页 (Dashboard)

**布局**：瀑布流卡片网格（响应式 1-3 列）

**卡片结构**：
```
┌─────────────────────────────┐
│  [渐变背景]          [89%]  │  ← 匹配度角标
│          👤                 │  ← 用户头像
│   [昨天]                    │  ← 对话时间
├─────────────────────────────┤
│  小明                       │  ← 昵称
│  你们都喜欢摄影、旅行等...   │  ← 推荐理由
│  [摄影] [旅行] [美食]       │  ← 兴趣标签
│                             │
│  Agent: 聊了很多关于...      │  ← 对话摘要
│                             │
│  ▼ 查看对话分析             │  ← 展开按钮
├─────────────────────────────┤
│  [❤️ 喜欢]  [✕ 跳过]       │  ← 操作按钮
└─────────────────────────────┘
```

**展开后的对话分析报告**：
- **统计卡片**：对话时长、消息数量
- **好感度变化**：可视化柱状图展示契合度变化
- **精彩对话**：展示关键聊天记录

### 2. 登录页 (Login)

- 渐变背景（橙粉色调）
- 产品卖点展示（3 个特性卡片）
- SecondMe OAuth 登录按钮

### 3. 聊天页 (Chat)

- **列表页**：展示匹配成功的对话列表
- **单聊页**：与特定用户的聊天窗口

---

## 🔌 API 接口设计

### 认证相关

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/auth/login` | 获取 SecondMe OAuth URL |
| GET | `/api/auth/callback` | OAuth 回调处理 |
| GET | `/api/auth/logout` | 退出登录 |

### 核心功能

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/recommendations` | 获取推荐用户列表 |
| GET | `/api/matches` | 获取当前匹配状态 |
| POST | `/api/matches` | 喜欢/不喜欢操作 |
| GET | `/api/agent-conversations` | 获取 Agent 对话报告 |
| GET | `/api/chat` | 获取聊天消息 |
| POST | `/api/chat` | 发送消息 |

### 用户信息

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/user/info` | 获取当前用户信息 |
| GET | `/api/user/shades` | 获取 SecondMe 兴趣标签 |
| GET | `/api/user/profile` | 获取详细资料 |
| POST | `/api/user/profile` | 更新资料 |

---

## 🗄 数据库模型

```prisma
// 用户表
model User {
  id              String    @id @default(cuid())
  secondmeUserId  String    @unique      // SecondMe 用户 ID
  accessToken     String                  // OAuth Access Token
  refreshToken    String                  // OAuth Refresh Token
  tokenExpiresAt  DateTime                // Token 过期时间
  
  // 用户资料
  nickname        String?
  avatar          String?
  bio             String?
  
  // 关系
  sentMatches     Match[]   @relation("SentMatches")
  receivedMatches Match[]   @relation("ReceivedMatches")
  chatMessages    ChatMessage[]
  notes           Note[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// 匹配记录表
model Match {
  id                String      @id @default(cuid())
  userId            String
  matchedUserId     String
  matchScore        Float                   // 匹配分数 0-100
  matchReason       String?                 // 匹配原因
  status            MatchStatus @default(PENDING)  // PENDING, ACCEPTED, REJECTED
  
  user              User        @relation("SentMatches", fields: [userId], references: [id])
  matchedUser       User        @relation("ReceivedMatches", fields: [matchedUserId], references: [id])
  
  @@unique([userId, matchedUserId])
}

// 聊天消息表
model ChatMessage {
  id          String   @id @default(cuid())
  senderId    String
  receiverId  String
  content     String
  createdAt   DateTime @default(now())
  
  sender      User     @relation(fields: [senderId], references: [id])
}

// Agent 对话记录表
model AgentConversation {
  id                  String   @id @default(cuid())
  user1Id             String
  user2Id             String
  messages            String   // JSON: [{role, content, timestamp}]
  compatibilityScore  Float?   // 契合度分数
  summary             String?  // 对话摘要
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

// 笔记表
model Note {
  id              String   @id @default(cuid())
  userId          String
  targetUserId    String   // 记录关于谁
  content         String   // 笔记内容
  secondmeNoteId  String?  // SecondMe 笔记 ID
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(fields: [userId], references: [id])
}
```

---

## 🔐 认证流程

### OAuth2 授权码流程

```
┌─────────┐                                    ┌──────────┐
│  用户   │ ──① 点击登录 ──→                   │ Aimatch  │
│         │                                    │  前端    │
│         │ ←─② 返回 SecondMe OAuth URL ────── │          │
│         │                                    └────┬─────┘
│         │                                         │
│         │ ──③ 跳转授权页面 ─────────────────────→ │
│         │                                    ┌────┴─────┐
│         │                                    │ SecondMe │
│         │ ←─④ 用户授权后跳转 callback ─────── │  OAuth   │
│         │                                    └────┬─────┘
│         │                                         │
│         │ ──⑤ 携带 code 访问 callback ──────→    │
│         │                                    ┌────┴─────┐
│         │ ──⑥ 服务端用 code 换 token ───────→ │ SecondMe │
│         │ ←─⑦ 返回 access_token & user info ─ │   API    │
│         │                                    └────┬─────┘
│         │                                         │
│         │ ←─⑧ 创建用户 session，跳转 dashboard ─  │
│         │                                    └────┴─────┘
└─────────┘
```

### 权限范围 (Scopes)

- `user.info` - 用户基础信息
- `user.info.shades` - 用户兴趣标签
- `chat` - 聊天功能
- `note.add` - 添加笔记

---

## 🚀 部署配置

### 环境变量

```env
# SecondMe OAuth2 配置
SECONDME_CLIENT_ID=your-client-id
SECONDME_CLIENT_SECRET=your-client-secret
SECONDME_REDIRECT_URI=https://your-domain.com/api/auth/callback

# SecondMe API
SECONDME_API_BASE_URL=https://api.mindverse.com/gate/lab
SECONDME_OAUTH_URL=https://go.second.me/oauth/
SECONDME_TOKEN_ENDPOINT=https://api.mindverse.com/gate/lab/api/oauth/token/code
SECONDME_REFRESH_ENDPOINT=https://api.mindverse.com/gate/lab/api/oauth/token/refresh

# 数据库
DATABASE_URL=postgresql://...  # 生产环境
# DATABASE_URL=file:./dev.db   # 开发环境
```

### Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

---

## 📊 项目状态

### ✅ 已完成

- [x] SecondMe OAuth2 登录集成
- [x] 推荐算法（基于标签匹配）
- [x] 瀑布流推荐页面
- [x] Agent 对话分析报告展示
- [x] 喜欢/跳过交互
- [x] 双向匹配机制
- [x] 聊天功能（UI 框架）
- [x] 个人资料管理
- [x] 响应式设计
- [x] Vercel 部署

### 🚧 待优化

- [ ] 接入真实 AI Agent 对话（目前为模拟数据）
- [ ] 生产环境 PostgreSQL 数据库
- [ ] WebSocket 实时聊天
- [ ] 推送通知
- [ ] 用户举报/屏蔽功能
- [ ] 匹配算法优化（机器学习）

---

## 🤝 技术亮点

1. **Serverless 架构** - 完全基于 Vercel Edge Functions，无需维护服务器
2. **类型安全** - 全栈 TypeScript，API 和数据库都有类型定义
3. **渐进增强** - 支持无数据库模式运行（降级到模拟数据）
4. **移动端优先** - 底部导航、卡片布局都针对移动端优化
5. **OAuth2 安全** - 完整的 state 验证和 CSRF 防护

---

## 📄 许可证

MIT License

---

## 🙏 致谢

- [SecondMe](https://second.me) - 提供 AI Agent 平台支持
- [Vercel](https://vercel.com) - 提供部署托管服务

---

<p align="center">
  用 ❤️ 和 🤖 构建
</p>
