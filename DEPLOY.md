# Aimatch 部署指南

## 快速部署到 Railway

### 1. 准备代码

```bash
# 确保所有更改已提交
git add .
git commit -m "Ready for production"
git push origin main
```

### 2. 创建 Railway 项目

1. 访问 https://railway.app
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的 Aimatch 仓库

### 3. 添加 PostgreSQL 数据库

在项目页面：
1. 点击 "New"
2. 选择 "Database" → "Add PostgreSQL"
3. 等待数据库创建完成

Railway 会自动注入 `DATABASE_URL` 环境变量。

### 4. 添加 Redis 缓存（可选但推荐）

1. 点击 "New"
2. 选择 "Database" → "Add Redis"
3. Railway 会自动注入 `REDIS_URL`

### 5. 配置环境变量

在 Railway 项目 Settings → Variables 中添加：

```
# SecondMe OAuth2
SECONDME_CLIENT_ID=your-client-id
SECONDME_CLIENT_SECRET=your-client-secret
SECONDME_REDIRECT_URI=https://your-app.up.railway.app/api/auth/callback

# SecondMe API
SECONDME_API_BASE_URL=https://api.mindverse.com/gate/lab
SECONDME_OAUTH_URL=https://go.second.me/oauth/
SECONDME_TOKEN_ENDPOINT=https://api.mindverse.com/gate/lab/api/oauth/token/code
SECONDME_REFRESH_ENDPOINT=https://api.mindverse.com/gate/lab/api/oauth/token/refresh

# 应用配置
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app
```

### 6. 部署

Railway 会自动检测 Dockerfile 并构建部署。

等待部署完成后，点击生成的域名即可访问。

---

## 更新 SecondMe OAuth 回调地址

1. 访问 https://second.me/developer
2. 找到你的应用
3. 添加回调地址：
   ```
   https://your-app.up.railway.app/api/auth/callback
   ```

---

## 本地测试 Docker 部署

```bash
# 构建并启动
docker-compose up --build

# 访问 http://localhost:3000
```

---

## 验证部署

部署完成后检查以下功能：

- [ ] 首页正常加载
- [ ] SecondMe 登录跳转正常
- [ ] 登录后跳转到 Dashboard
- [ ] 推荐列表显示正常
- [ ] 点击"喜欢"有动画效果
- [ ] 双向匹配后显示"发消息"按钮
- [ ] 聊天页面加载正常
- [ ] WebSocket 连接正常（浏览器控制台查看）

---

## 监控与日志

Railway 提供：
- 实时日志查看
- 资源使用监控
- 自动 HTTPS
- 自动重启

---

## 生产环境检查清单

- [ ] 环境变量已正确配置
- [ ] SecondMe OAuth 回调地址已更新
- [ ] PostgreSQL 数据库已连接
- [ ] Redis 已配置（可选）
- [ ] 文件上传目录有写权限
- [ ] 日志已开启

---

## 域名绑定（可选）

在 Railway Settings → Domains 中添加自定义域名：
1. 输入你的域名
2. 在 DNS 提供商添加 CNAME 记录
3. 等待 SSL 证书自动签发

---

## 故障排查

### 数据库连接失败
检查 `DATABASE_URL` 是否正确注入

### WebSocket 连接失败
Railway 支持 WebSocket，无需额外配置。检查浏览器控制台网络请求。

### 文件上传失败
检查磁盘空间，Railway 免费版有存储限制。

### 内存不足
在 Railway 设置中增加实例内存（可能需要付费）。
