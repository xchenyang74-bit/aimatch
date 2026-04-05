/**
 * A2A 直接运行 API
 * 
 * POST /api/a2a/run - 直接执行两个用户的 A2A 对话
 * 用于：手动测试 A2A 对话功能
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runA2AConversation } from '@/lib/a2a-engine';

interface A2AUser {
  id: string;
  nickname: string;
  accessToken: string;
  tags: string[];
  bio?: string;
  memory?: string;
}

// 获取用户完整信息
async function getUserWithTags(userId: string): Promise<A2AUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) return null;
  
  // 从 SecondMe 获取用户的 shades（兴趣标签）
  let tags: string[] = [];
  try {
    // 使用用户信息 API 获取 shades
    const userInfoRes = await fetch(`${process.env.SECONDME_API_BASE_URL}/api/secondme/user/info`, {
      headers: {
        'Authorization': `Bearer ${user.accessToken}`,
      },
    });
    
    if (userInfoRes.ok) {
      const userInfoData = await userInfoRes.json();
      const userInfo = userInfoData.data || userInfoData;
      // shades 可能在不同字段中
      tags = userInfo.shades || userInfo.tags || userInfo.interests || [];
      console.log(`[A2A Run] Got tags for user ${userId}:`, tags);
    } else {
      console.error(`[A2A Run] Failed to get user info: ${userInfoRes.status}`);
    }
  } catch (error) {
    console.error(`[A2A Run] Failed to fetch tags for user ${userId}:`, error);
  }
  
  return {
    id: user.id,
    nickname: user.nickname || '匿名用户',
    accessToken: user.accessToken,
    tags,
    bio: user.bio || undefined,
  };
}

// POST - 直接执行 A2A 对话
export async function POST(req: NextRequest) {
  try {
    const { userAId, userBId } = await req.json();
    
    if (!userAId || !userBId) {
      return Response.json({
        code: 400,
        error: 'Missing userAId or userBId',
      });
    }
    
    console.log(`[A2A Run] Starting A2A conversation between ${userAId} and ${userBId}`);
    
    // 获取用户信息
    const [userA, userB] = await Promise.all([
      getUserWithTags(userAId),
      getUserWithTags(userBId),
    ]);
    
    if (!userA || !userB) {
      return Response.json({
        code: 404,
        error: 'User not found',
        data: {
          userAFound: !!userA,
          userBFound: !!userB,
        },
      });
    }
    
    console.log(`[A2A Run] User A (${userA.nickname}):`, { tags: userA.tags });
    console.log(`[A2A Run] User B (${userB.nickname}):`, { tags: userB.tags });
    
    // 检查是否已存在对话记录
    const existing = await prisma.a2AConversation.findFirst({
      where: {
        OR: [
          { userAId, userBId },
          { userAId: userBId, userBId: userAId },
        ],
      },
    });
    
    let conversationId: string;
    
    if (existing) {
      console.log(`[A2A Run] Found existing conversation: ${existing.id}`);
      conversationId = existing.id;
      // 更新状态为 running
      await prisma.a2AConversation.update({
        where: { id: conversationId },
        data: { status: 'running' },
      });
    } else {
      // 创建新记录
      const commonTags = userA.tags.filter(tag => userB.tags.includes(tag));
      const newConv = await prisma.a2AConversation.create({
        data: {
          userAId,
          userBId,
          status: 'running',
          commonTags,
          commonTagCount: commonTags.length,
          highlights: [],
          analysisPros: [],
          analysisCons: [],
        },
      });
      conversationId = newConv.id;
      console.log(`[A2A Run] Created new conversation: ${conversationId}`);
    }
    
    // 执行 A2A 对话
    console.log(`[A2A Run] Executing conversation...`);
    const startTime = Date.now();
    
    try {
      const result = await runA2AConversation(userA, userB);
      const duration = Date.now() - startTime;
      
      console.log(`[A2A Run] Conversation completed in ${duration}ms`);
      console.log(`[A2A Run] Score: ${result.compatibilityScore}`);
      
      // 更新记录
      await prisma.a2AConversation.update({
        where: { id: conversationId },
        data: {
          status: 'completed',
          messages: result.messages as any,
          compatibilityScore: result.compatibilityScore,
          conversationQuality: result.conversationQuality as any,
          highlights: result.highlights,
          analysisPros: result.analysisPros,
          analysisCons: result.analysisCons,
          summary: result.summary,
          completedAt: new Date(),
        },
      });
      
      return Response.json({
        code: 0,
        data: {
          conversationId,
          duration,
          result: {
            compatibilityScore: result.compatibilityScore,
            conversationQuality: result.conversationQuality,
            highlights: result.highlights,
            analysisPros: result.analysisPros,
            analysisCons: result.analysisCons,
            summary: result.summary,
            messageCount: result.messages.length,
          },
        },
      });
      
    } catch (convError) {
      // 更新失败状态
      await prisma.a2AConversation.update({
        where: { id: conversationId },
        data: {
          status: 'failed',
        },
      });
      
      throw convError;
    }
    
  } catch (error) {
    console.error('[A2A Run] Error:', error);
    return Response.json({
      code: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
