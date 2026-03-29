# Railway 部署验证清单

## 部署前检查

### 1. 代码推送状态
- [ ] 所有代码已推送到 GitHub main 分支
- [ ] 没有未提交的本地更改
- [ ] package-lock.json 已更新

### 2. 必需文件存在
- [ ] `Dockerfile` - Docker 构建配置
- [ ] `railway.json` - Railway 配置
- [ ] `prisma/schema.prisma` - 数据库模型
- [ ] `.dockerignore` - 忽略不需要的文件

### 3. 环境变量配置（Railway）
- [ ] `SECONDME_CLIENT_ID`
- [ ] `SECONDME_CLIENT_SECRET`
- [ ] `SECONDME_REDIRECT_URI` (匹配 Railway 域名)
- [ ] `SECONDME_API_BASE_URL` = `https://app.mindos.com/gate/lab`
- [ ] `SECONDME_TOKEN_ENDPOINT` = `https://app.mindos.com/gate/lab/api/oauth/token/code`
- [ ] `SECONDME_REFRESH_ENDPOINT` = `https://app.mindos.com/gate/lab/api/oauth/token/refresh`
- [ ] `NODE_ENV` = `production`

### 4. SecondMe 后台配置
- [ ] 已添加 Railway 域名到回调地址
- [ ] 回调格式: `https://your-domain.up.railway.app/api/auth/callback`

---

## 部署后验证步骤

### 步骤 1: 基础访问测试
```bash
# 测试首页
curl https://your-domain.up.railway.app

# 预期: 返回 HTML，状态 200
```

### 步骤 2: API 健康检查
```bash
# 检查环境变量配置
curl https://your-domain.up.railway.app/api/debug/config

# 预期: 返回所有环境变量状态
```

### 步骤 3: 数据库连接测试
```bash
# 检查数据库连接
curl https://your-domain.up.railway.app/api/debug/session

# 预期: 返回 401（未登录）或用户信息
```

### 步骤 4: OAuth 登录流程
1. 访问 `https://your-domain.up.railway.app/login`
2. 点击 "使用 SecondMe 登录"
3. 完成 SecondMe 授权
4. 验证是否跳转到 `/dashboard`
5. 验证是否正确设置 cookie

### 步骤 5: 功能验证
- [ ] 推荐列表加载正常
- [ ] 喜欢/跳过功能正常
- [ ] 匹配成功后能进入聊天

---

## 常见问题排查

### 问题 1: 部署失败
```bash
# 查看 Railway 日志
railway logs
```

### 问题 2: 数据库迁移失败
```bash
# 手动运行迁移
railway run npx prisma migrate deploy
```

### 问题 3: 环境变量未生效
- 在 Railway 控制台重新保存变量
- 触发重新部署

### 问题 4: OAuth 登录失败
- 检查 `SECONDME_REDIRECT_URI` 是否与 Railway 域名一致
- 检查 SecondMe 后台回调地址是否正确
- 检查环境变量是否包含 `SECONDME_CLIENT_SECRET`

---

## 生产环境优化建议

### 1. 添加健康检查端点
创建 `/api/health` 返回服务状态

### 2. 配置日志监控
使用 Railway 的日志功能或集成第三方监控

### 3. 设置自动备份
配置 PostgreSQL 自动备份

### 4. 性能优化
- 启用 Redis 缓存
- 配置 CDN（如需要）

---

## 验证通过标准

- [ ] 首页正常访问
- [ ] 登录流程完整
- [ ] 推荐列表加载
- [ ] 所有 API 返回正常
- [ ] 无控制台错误
