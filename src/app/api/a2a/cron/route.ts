/**
 * A2A 定时任务 API
 * 
 * GET /api/a2a/cron - 执行增量匹配任务
 * 用于：每天上午 12:00 前的定时任务
 * 
 * 注意：生产环境应该使用 Vercel Cron Jobs 或其他定时任务服务
 */

import { runIncrementalMatching } from '@/lib/a2a-matcher';

export async function GET(req: Request) {
  return handleCron(req);
}

export async function POST(req: Request) {
  return handleCron(req);
}

async function handleCron(req: Request) {
  try {
    // 验证请求（可选：添加 secret key 验证）
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    
    // 简单验证，生产环境应该使用更安全的验证方式
    if (secret !== process.env.CRON_SECRET) {
      return Response.json(
        { code: 401, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('[CRON] Starting A2A incremental matching task');
    
    const result = await runIncrementalMatching();
    
    return Response.json({
      code: 0,
      data: {
        matched: result.matched,
        failed: result.failed,
        timestamp: new Date().toISOString(),
      },
    });
    
  } catch (error) {
    console.error('[CRON] A2A incremental matching failed:', error);
    return Response.json(
      { 
        code: 500, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
