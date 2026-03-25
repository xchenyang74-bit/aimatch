/**
 * A2A 匹配 API
 * 
 * POST /api/a2a/match - 触发新用户的 A2A 匹配
 * 用于：用户注册后立即触发匹配
 */

import { NextRequest } from 'next/server';
import { matchNewUser } from '@/lib/a2a-matcher';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return Response.json(
        { code: 400, error: 'Missing userId' },
        { status: 400 }
      );
    }
    
    console.log(`[API] A2A match triggered for user: ${userId}`);
    
    // 执行匹配（可能需要较长时间，考虑使用队列）
    const result = await matchNewUser(userId);
    
    return Response.json({
      code: 0,
      data: {
        userId,
        matched: result.matched,
        failed: result.failed,
      },
    });
    
  } catch (error) {
    console.error('[API] A2A match failed:', error);
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
