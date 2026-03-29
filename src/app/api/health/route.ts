/**
 * 健康检查 API
 * GET /api/health
 * 
 * 用于 Railway 健康检查和部署验证
 */

import { prisma } from '@/lib/prisma';

export async function GET() {
  const checks: any = {
    timestamp: new Date().toISOString(),
    status: 'ok',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    checks: {},
  };

  try {
    // 1. 检查数据库连接
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.checks.database = {
        status: 'ok',
        type: 'postgresql',
      };
    } catch (error) {
      checks.checks.database = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
      checks.status = 'error';
    }

    // 2. 检查必需环境变量
    const requiredEnvVars = [
      'SECONDME_CLIENT_ID',
      'SECONDME_CLIENT_SECRET',
      'SECONDME_REDIRECT_URI',
      'SECONDME_API_BASE_URL',
    ];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length === 0) {
      checks.checks.environment = {
        status: 'ok',
        variables: requiredEnvVars.length,
      };
    } else {
      checks.checks.environment = {
        status: 'error',
        missing: missingVars,
      };
      checks.status = 'error';
    }

    // 3. 检查 Redis（如果配置了）
    if (process.env.REDIS_URL) {
      try {
        const { redis } = await import('@/lib/redis');
        await redis.ping();
        checks.checks.redis = {
          status: 'ok',
        };
      } catch (error) {
        checks.checks.redis = {
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    } else {
      checks.checks.redis = {
        status: 'skipped',
        reason: 'REDIS_URL not configured',
      };
    }

    // 返回状态
    const statusCode = checks.status === 'ok' ? 200 : 503;
    return Response.json(checks, { status: statusCode });

  } catch (error) {
    return Response.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
