import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected');
});

// 缓存工具函数
export const cache = {
  async get(key: string) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  async set(key: string, value: any, ttlSeconds = 3600) {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (err: any) {
      console.error('Cache set error:', err);
    }
  },

  async delete(key: string) {
    try {
      await redis.del(key);
    } catch (err: any) {
      console.error('Cache delete error:', err);
    }
  },
};
