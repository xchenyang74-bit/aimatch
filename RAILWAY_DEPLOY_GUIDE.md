# Aimatch Railway 部署指南

## 准备工作

### 1. 安装 Railway CLI

```bash
npm install -g @railway/cli
```

### 2. 登录 Railway

```bash
cd ~/Projects/secondme-app
railway login
```

这会打开浏览器，点击确认授权。

---

## 部署步骤

### 步骤 1: 初始化项目

```bash
cd ~/Projects/secondme-app
railway init
```

选择：
- `Create a new project`
- 项目名称：`aimatch`

### 步骤 2: 添加 PostgreSQL 数据库

```bash
railway add --database postgres
```

Railway 会自动注入 `DATABASE_URL` 环境变量。

### 步骤 3: 添加 Redis（可选）

```bash
railway add --database redis
```

Railway 会自动注入 `REDIS_URL` 环境变量。

### 步骤 4: 配置环境变量

```bash
railway variables
```

添加以下变量：

```env
# SecondMe OAuth2
SECONDME_CLIENT_ID=54f4205d-7a46-4140-a3b3-4227520473d3
SECONDME_CLIENT_SECRET=cddc1cc84d0d3d1c5fee43e00b523ba3766cf4fe8ebe434b606c71496bfb3c4e
SECONDME_REDIRECT_URI=https://aimatch.up.railway.app/api/auth/callback

# SecondMe API（使用与博弈圆桌相同的端点）
SECONDME_API_BASE_URL=https://app.mindos.com/gate/lab
SECONDME_OAUTH_URL=https://go.second.me/oauth/
SECONDME_TOKEN_ENDPOINT=https://app.mindos.com/gate/lab/api/oauth/token/code
SECONDME_REFRESH_ENDPOINT=https://app.mindos.com/gate/lab/api/oauth/token/refresh

# 应用配置
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://aimatch.up.railway.app

# 数据库（Railway 会自动注入，无需手动设置）
# DATABASE_URL=...
# REDIS_URL=...
```

### 步骤 5: 部署

```bash
railway up
```

### 步骤 6: 生成域名

```bash
railway domain
```

这会输出类似 `https://aimatch.up.railway.app` 的域名。

### 步骤 7: 更新 SecondMe OAuth 回调地址

1. 访问 https://second.me/developer
2. 找到你的应用（Aimatch）
3. 添加回调地址：
   ```
   https://aimatch.up.railway.app/api/auth/callback
   ```

---

## 故障排查

### 查看日志

```bash
railway logs
```

### 重启服务

```bash
railway restart
```

### 查看状态

```bash
railway status
```

### 进入容器调试

```bash
railway connect
```

---

## 验证部署

部署完成后，访问：
- 应用首页：`https://aimatch.up.railway.app`
- 登录页面：`https://aimatch.up.railway.app/login`
- 调试信息：`https://aimatch.up.railway.app/api/debug/config`

---

## 更新 SecondMe 配置

部署成功后，需要到 SecondMe 开发者后台更新回调地址：

1. 登录 https://second.me/developer
2. 找到 Aimatch 应用
3. 编辑 OAuth 设置
4. 添加回调地址：`https://aimatch.up.railway.app/api/auth/callback`
5. 保存

---

## 常见问题

### 1. 数据库迁移失败

```bash
railway run npx prisma migrate deploy
```

### 2. 环境变量未生效

```bash
railway variables --reload
```

### 3. 重新部署

```bash
railway up --detach
```
