/**
 * 调试 API - 检查当前登录状态
 * GET /api/debug/session
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 获取 cookie 中的 user_id
    const userId = request.cookies.get('user_id')?.value;
    
    if (!userId) {
      return Response.json({
        code: 401,
        message: 'Not logged in',
        cookies: {
          all: request.cookies.getAll().map(c => c.name),
        },
      });
    }
    
    // 查询用户信息
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { secondmeUserId: userId },
        ],
      },
      select: {
        id: true,
        secondmeUserId: true,
        nickname: true,
        avatar: true,
        createdAt: true,
        tokenExpiresAt: true,
      },
    });
    
    if (!user) {
      return Response.json({
        code: 404,
        message: 'User not found in database',
        userId,
      });
    }
    
    return Response.json({
      code: 0,
      data: {
        user,
        isTokenExpired: user.tokenExpiresAt ? new Date() > user.tokenExpiresAt : null,
      },
    });
    
  } catch (error) {
    console.error('Debug session error:', error);
    return Response.json({
      code: 500,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
