FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

# 先复制依赖文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm ci
RUN npx prisma generate

# 复制源代码
COPY . .

# 确保没有残留的 public/login.html
RUN rm -f public/login.html

ENV NEXT_TELEMETRY_DISABLED 1

# 清理旧的构建缓存并重新构建
RUN rm -rf .next && npm run build

# 确保 public 文件被复制到 standalone
RUN cp -r public/* .next/standalone/ 2>/dev/null || true
RUN cp -r .next/static .next/standalone/.next/ 2>/dev/null || true

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

COPY railway-start.sh ./
RUN chmod +x railway-start.sh

CMD ["./railway-start.sh"]
