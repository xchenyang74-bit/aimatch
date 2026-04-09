FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

COPY railway-start.sh ./
RUN chmod +x railway-start.sh

CMD ["./railway-start.sh"]
