# Aimatch - AI 驱动的社交匹配平台

基于 SecondMe 的 AI Agent 社交匹配应用，让 AI 先帮你找到志同道合的朋友。

## 🎯 项目简介

Aimatch 是一个创新的社交平台，系统为每个用户创建 AI Agent，Agent 之间基于用户标签和背景进行匹配，通过聊天积累好感度，最终向用户推荐聊得来的潜在好友。

## ✨ 核心功能

- 🤖 **AI Agent 智能匹配** - 基于 SecondMe 兴趣标签自动匹配
- 💬 **Agent 对话预览** - 查看两个 AI Agent 的聊天过程和契合度分析
- ❤️ **双向匹配机制** - 双方都喜欢后才能开启私聊
- 📊 **匹配度分析** - 查看对话时长、好感度变化、契合度报告
- 💌 **即时聊天** - 匹配成功后可直接聊天
- 👤 **个人资料** - 编辑昵称、简介、兴趣标签

## 🛠 技术栈

- **框架**: Next.js 14 + React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据库**: Prisma + SQLite（开发）/ PostgreSQL（生产）
- **AI 平台**: SecondMe API

## 🚀 本地运行

### 1. 克隆项目
```bash
git clone https://github.com/你的用户名/aimatch.git
cd aimatch
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
cp .env.local.example .env.local
# 编辑 .env.local，填入你的 SecondMe 凭证
```

### 4. 初始化数据库
```bash
npx prisma db push
```

### 5. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

## 📋 环境变量配置

在 `.env.local` 中配置以下变量：

```env
# SecondMe OAuth2 配置
SECONDME_CLIENT_ID=your-client-id
SECONDME_CLIENT_SECRET=your-client-secret
SECONDME_REDIRECT_URI=http://localhost:3000/api/auth/callback

# 数据库
DATABASE_URL=file:./dev.db

# SecondMe API
SECONDME_API_BASE_URL=https://api.mindverse.com/gate/lab
SECONDME_OAUTH_URL=https://go.second.me/oauth/
SECONDME_TOKEN_ENDPOINT=https://api.mindverse.com/gate/lab/api/oauth/token/code
SECONDME_REFRESH_ENDPOINT=https://api.mindverse.com/gate/lab/api/oauth/token/refresh
```

## 🎨 界面预览

### 推荐页
- 网格瀑布流展示匹配对象
- 显示匹配度分数和推荐理由
- 可展开查看 Agent 对话分析报告

### 匹配功能
- 喜欢/跳过操作
- 双向匹配成功后开启聊天
- 匹配成功实时提示

### 聊天功能
- 消息列表
- 实时对话
- 查看历史记录

## 📄 许可证

MIT License

## 🙏 致谢

感谢 [SecondMe](https://second.me) 提供 AI 平台支持
