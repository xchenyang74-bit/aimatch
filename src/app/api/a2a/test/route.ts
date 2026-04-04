/**
 * A2A 测试 API
 * 
 * GET /api/a2a/test - 测试 SecondMe Chat API 是否可用
 * POST /api/a2a/test - 手动触发两个用户的 A2A 对话
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// 测试 Chat API 端点
async function testChatAPI(accessToken: string): Promise<{ success: boolean; error?: string; response?: any }> {
  // 尝试多个可能的端点
  const endpoints = [
    `${process.env.SECONDME_API_BASE_URL}/api/chat`,
    `${process.env.SECONDME_API_BASE_URL}/api/secondme/chat`,
    `${process.env.SECONDME_API_BASE_URL}/api/v1/chat`,
    `${process.env.SECONDME_API_BASE_URL}/v1/chat`,
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`[A2A Test] Trying endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: '你好，这是一条测试消息',
          stream: false,
        }),
      });
      
      const status = response.status;
      const text = await response.text();
      let data = null;
      
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
      
      results.push({
        endpoint,
        status,
        data: data?.data || data,
      });
      
      // 如果成功，返回结果
      if (response.ok) {
        return {
          success: true,
          response: {
            endpoint,
            status,
            data,
          },
        };
      }
    } catch (error) {
      results.push({
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  return {
    success: false,
    error: 'All endpoints failed',
    response: results,
  };
}

// GET - 测试 Chat API
export async function GET() {
  try {
    // 获取第一个有 token 的用户
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        nickname: true,
        accessToken: true,
      },
    });
    
    if (!user) {
      return Response.json({
        code: 404,
        error: 'No users found in database',
      });
    }
    
    console.log(`[A2A Test] Testing with user: ${user.nickname} (${user.id})`);
    
    // 测试 Chat API
    const result = await testChatAPI(user.accessToken);
    
    return Response.json({
      code: result.success ? 0 : 500,
      data: {
        user: {
          id: user.id,
          nickname: user.nickname,
        },
        testResult: result,
      },
    });
    
  } catch (error) {
    console.error('[A2A Test] Error:', error);
    return Response.json({
      code: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// POST - 手动触发 A2A 对话
export async function POST(req: NextRequest) {
  try {
    const { userAId, userBId } = await req.json();
    
    if (!userAId || !userBId) {
      return Response.json({
        code: 400,
        error: 'Missing userAId or userBId',
      });
    }
    
    // 获取用户信息
    const [userA, userB] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userAId },
        select: {
          id: true,
          nickname: true,
          accessToken: true,
          bio: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: userBId },
        select: {
          id: true,
          nickname: true,
          accessToken: true,
          bio: true,
        },
      }),
    ]);
    
    if (!userA || !userB) {
      return Response.json({
        code: 404,
        error: 'User not found',
      });
    }
    
    // 首先测试两个用户的 Chat API 是否可用
    const [testA, testB] = await Promise.all([
      testChatAPI(userA.accessToken),
      testChatAPI(userB.accessToken),
    ]);
    
    return Response.json({
      code: 0,
      data: {
        userA: {
          id: userA.id,
          nickname: userA.nickname,
          chatApiAvailable: testA.success,
        },
        userB: {
          id: userB.id,
          nickname: userB.nickname,
          chatApiAvailable: testB.success,
        },
        canStartA2A: testA.success && testB.success,
        testResults: {
          userA: testA,
          userB: testB,
        },
      },
    });
    
  } catch (error) {
    console.error('[A2A Test] Error:', error);
    return Response.json({
      code: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
