# Aimatch 部署指南

## 方法一：Railway 一键部署（推荐）

### 步骤 1: 准备代码

确保代码已提交到 GitHub：

```bash
cd ~/Projects/secondme-app
git init
git add .
git commit -m "Ready for Railway deployment"
```

### 步骤 2: 在 Railway 上创建项目

1. 访问 https://railway.app
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的仓库

### 步骤 3: 添加数据库

在项目页面：
1. 点击 "New" → "Database" → "Add PostgreSQL"
2. （可选）点击 "New" → "Database" → "Add Redis"

### 步骤 4: 配置环境变量

在项目页面：
1. 点击 "Variables" 标签
2. 添加以下变量：

```env
# SecondMe OAuth2
SECONDME_CLIENT_ID=54f4205d-7a46-4140-a3b3-4227520473d3
SECONDME_CLIENT_SECRET=cddc1cc84d0d3d1c5fee43e00b523ba3766cf4fe8ebe434b606c71496bfb3c4e

# 部署后会更新这个域名
SECONDME_REDIRECT_URI=https://your-app.up.railway.app/api/auth/callback

# SecondMe API
SECONDME_API_BASE_URL=https://app.mindos.com/gate/lab
SECONDME_OAUTH_URL=https://go.second.me/oauth/
SECONDME_TOKEN_ENDPOINT=https://app.mindos.com/gate/lab/api/oauth/token/code
SECONDME_REFRESH_ENDPOINT=https://app.mindos.com/gate/lab/api/oauth/token/refresh

# 应用配置
NODE_ENV=production
```

### 步骤 5: 生成域名

1. 点击你的服务（service）
2. 点击 "Settings" 标签
3. 点击 "Generate Domain"
4. 复制生成的域名（如 `https://aimatch.up.railway.app`）

### 步骤 6: 更新回调地址

1. 更新 Railway 环境变量：
   ```
   SECONDME_REDIRECT_URI=https://aimatch.up.railway.app/api/auth/callback
   ```

2. 更新 SecondMe 开发者后台：
   - 访问 https://second.me/developer
   - 找到 Aimatch 应用
   - 添加回调地址：`https://aimatch.up.railway.app/api/auth/callback`

### 步骤 7: 重新部署

在 Railway 页面点击 "Redeploy" 或推送新代码触发自动部署。

---

## 方法二：Railway CLI 部署

### 1. 安装 Railway CLI

```bash
npm install -g @railway/cli
```

### 2. 登录 Railway

```bash
railway login
```

### 3. 初始化项目

```bash
cd ~/Projects/secondme-app
railway init
```

选择 "Create a new project"

### 4. 添加数据库

```bash
railway add --database postgres
```

### 5. 配置环境变量

```bash
railway variables
```

添加所有必需的环境变量（见上文）。

### 6. 部署

```bash
railway up
```

### 7. 生成域名

```bash
railway domain
```

### 8. 更新配置

更新环境变量和 SecondMe 回调地址（见上文步骤 6）。

---

## 方法三：Vercel 部署（备选）

如果 Railway 部署有问题，也可以使用 Vercel：

```bash
npm install -g vercel
vercel login
vercel
```

注意：Vercel 需要额外的配置来支持 WebSocket 和自定义服务器。

---

## 部署后验证

### 检查应用状态

访问以下地址验证部署：
- 首页：`https://your-domain.up.railway.app`
- 登录页：`https://your-domain.up.railway.app/login`
- 调试：`https://your-domain.up.railway.app/api/debug/config`

### 查看日志

```bash
railway logs
```

### 数据库迁移

如果需要手动运行迁移：

```bash
railway run npx prisma migrate deploy
```

---

## 故障排查

### 1. 部署失败

检查 Dockerfile 是否正确构建：
```bash
docker build -t aimatch:test .
```

### 2. 数据库连接失败

确保 `DATABASE_URL` 环境变量已正确设置（Railway 会自动设置）。

### 3. 登录失败

检查：
- `SECONDME_REDIRECT_URI` 是否与 Railway 域名一致
- SecondMe 开发者后台的回调地址是否正确

### 4. 环境变量未生效

重新部署：
```bash
railway up
```

---

## 自动部署（GitHub Actions）

已配置 `.github/workflows/deploy-railway.yml`，只需：

1. 在 GitHub 仓库设置中添加 `RAILWAY_TOKEN` secret
2. 获取 Token：`railway token`
3. 推送到 main 分支即可自动部署
