/**
 * A2A 匹配引擎
 * 
 * 核心功能：
 * 1. 为新用户匹配前50个共同标签最多的存量用户
 * 2. 定时任务：增量匹配未匹配过的用户组合
 * 3. 立即执行 A2A 对话
 */

import { prisma } from './prisma';
import { 
  runA2AConversation, 
  calculateCommonTags, 
  calculateCommonTagCount,
  A2A_CONFIG 
} from './a2a-engine';

// 用户标签信息（用于匹配计算）
interface UserWithTags {
  id: string;
  nickname: string;
  accessToken: string;
  tags: string[];
  bio?: string;
  memory?: string;
}

/**
 * 获取用户完整信息（包含 SecondMe 标签）
 */
async function getUserWithTags(userId: string): Promise<UserWithTags | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) return null;
  
  // 从 SecondMe 获取用户的 shades（兴趣标签）
  let tags: string[] = [];
  try {
    const shadesRes = await fetch(`${process.env.SECONDME_API_BASE_URL}/api/users/shades`, {
      headers: {
        'Authorization': `Bearer ${user.accessToken}`,
      },
    });
    
    if (shadesRes.ok) {
      const shadesData = await shadesRes.json();
      tags = shadesData.data?.shades || [];
    }
  } catch (error) {
    console.error(`[A2A] Failed to fetch shades for user ${userId}:`, error);
  }
  
  return {
    id: user.id,
    nickname: user.nickname || '匿名用户',
    accessToken: user.accessToken,
    tags,
    bio: user.bio || undefined,
  };
}

/**
 * 为新用户匹配存量用户
 * 
 * 策略：按共同标签数量排序，取前50个
 */
export async function matchNewUser(newUserId: string): Promise<{ matched: number; failed: number }> {
  console.log(`[A2A] Starting match for new user: ${newUserId}`);
  
  // 1. 获取新用户信息
  const newUser = await getUserWithTags(newUserId);
  if (!newUser) {
    throw new Error(`User not found: ${newUserId}`);
  }
  
  console.log(`[A2A] New user tags: ${newUser.tags.join(', ')}`);
  
  // 2. 获取所有存量用户
  const existingUsers = await prisma.user.findMany({
    where: {
      id: { not: newUserId },
    },
    select: {
      id: true,
      nickname: true,
      accessToken: true,
      bio: true,
    },
  });
  
  console.log(`[A2A] Found ${existingUsers.length} existing users`);
  
  // 3. 计算与每个存量用户的共同标签数量
  const scoredUsers = await Promise.all(
    existingUsers.map(async (user) => {
      const userWithTags = await getUserWithTags(user.id);
      if (!userWithTags) return null;
      
      const commonTags = calculateCommonTags(newUser.tags, userWithTags.tags);
      const commonTagCount = commonTags.length;
      
      return {
        ...userWithTags,
        commonTags,
        commonTagCount,
      };
    })
  );
  
  // 4. 过滤无效用户，按共同标签数量降序排序
  const validUsers = scoredUsers
    .filter((u): u is NonNullable<typeof u> => u !== null)
    .sort((a, b) => b.commonTagCount - a.commonTagCount);
  
  // 5. 取前50个
  const topUsers = validUsers.slice(0, A2A_CONFIG.MATCH_LIMIT);
  
  console.log(`[A2A] Top ${topUsers.length} users selected for matching`);
  
  // 6. 执行 A2A 对话
  let matched = 0;
  let failed = 0;
  
  for (const targetUser of topUsers) {
    try {
      // 检查是否已存在对话记录
      const existing = await prisma.a2AConversation.findUnique({
        where: {
          userAId_userBId: {
            userAId: newUser.id,
            userBId: targetUser.id,
          },
        },
      });
      
      if (existing) {
        console.log(`[A2A] Conversation already exists between ${newUser.id} and ${targetUser.id}`);
        continue;
      }
      
      // 创建待处理记录
      const conversationRecord = await prisma.a2AConversation.create({
        data: {
          userAId: newUser.id,
          userBId: targetUser.id,
          status: 'running',
          commonTags: targetUser.commonTags,
          commonTagCount: targetUser.commonTagCount,
          highlights: '[]',
          analysisPros: '[]',
          analysisCons: '[]',
        },
      });
      
      console.log(`[A2A] Running conversation with ${targetUser.nickname} (${targetUser.commonTagCount} common tags)`);
      
      // 执行对话
      const result = await runA2AConversation(newUser, targetUser);
      
      // 更新记录
      await prisma.a2AConversation.update({
        where: { id: conversationRecord.id },
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
      
      matched++;
      console.log(`[A2A] Conversation completed with ${targetUser.nickname}, score: ${result.compatibilityScore}`);
      
    } catch (error) {
      failed++;
      console.error(`[A2A] Failed to match with ${targetUser.nickname}:`, error);
      
      // 更新失败状态
      await prisma.a2AConversation.updateMany({
        where: {
          userAId: newUser.id,
          userBId: targetUser.id,
          status: 'running',
        },
        data: {
          status: 'failed',
        },
      });
    }
  }
  
  console.log(`[A2A] Match completed: ${matched} success, ${failed} failed`);
  return { matched, failed };
}

/**
 * 定时任务：增量匹配未匹配过的用户组合
 * 
 * 执行时间：每天上午 12:00 前
 * 策略：只计算未匹配过的用户组合
 */
export async function runIncrementalMatching(): Promise<{ matched: number; failed: number }> {
  console.log('[A2A] Starting incremental matching task');
  
  // 1. 获取所有用户
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      nickname: true,
      accessToken: true,
      bio: true,
    },
  });
  
  // 2. 获取已存在的对话记录
  const existingConversations = await prisma.a2AConversation.findMany({
    select: {
      userAId: true,
      userBId: true,
    },
  });
  
  // 构建已匹配集合（双向）
  const matchedSet = new Set<string>();
  for (const conv of existingConversations) {
    const key1 = `${conv.userAId}-${conv.userBId}`;
    const key2 = `${conv.userBId}-${conv.userAId}`;
    matchedSet.add(key1);
    matchedSet.add(key2);
  }
  
  // 3. 找出未匹配的用户组合
  const unmatchedPairs: Array<[string, string]> = [];
  for (let i = 0; i < allUsers.length; i++) {
    for (let j = i + 1; j < allUsers.length; j++) {
      const userA = allUsers[i];
      const userB = allUsers[j];
      const key = `${userA.id}-${userB.id}`;
      
      if (!matchedSet.has(key)) {
        unmatchedPairs.push([userA.id, userB.id]);
      }
    }
  }
  
  console.log(`[A2A] Found ${unmatchedPairs.length} unmatched pairs`);
  
  // 4. 执行匹配
  let matched = 0;
  let failed = 0;
  
  for (const [userAId, userBId] of unmatchedPairs) {
    try {
      const userA = await getUserWithTags(userAId);
      const userB = await getUserWithTags(userBId);
      
      if (!userA || !userB) continue;
      
      const commonTags = calculateCommonTags(userA.tags, userB.tags);
      
      // 创建记录
      const conversationRecord = await prisma.a2AConversation.create({
        data: {
          userAId,
          userBId,
          status: 'running',
          commonTags: commonTags,
          commonTagCount: commonTags.length,
          highlights: '[]',
          analysisPros: '[]',
          analysisCons: '[]',
        },
      });
      
      // 执行对话
      const result = await runA2AConversation(userA, userB);
      
      // 更新记录
      await prisma.a2AConversation.update({
        where: { id: conversationRecord.id },
        data: {
          status: 'completed',
          messages: result.messages as any,
          compatibilityScore: result.compatibilityScore,
          conversationQuality: result.conversationQuality as any,
          highlights: JSON.stringify(result.highlights),
          analysisPros: JSON.stringify(result.analysisPros),
          analysisCons: JSON.stringify(result.analysisCons),
          summary: result.summary,
          completedAt: new Date(),
        },
      });
      
      matched++;
      
    } catch (error) {
      failed++;
      console.error(`[A2A] Failed to match ${userAId} with ${userBId}:`, error);
      
      await prisma.a2AConversation.updateMany({
        where: {
          userAId,
          userBId,
          status: 'running',
        },
        data: {
          status: 'failed',
        },
      });
    }
  }
  
  console.log(`[A2A] Incremental matching completed: ${matched} success, ${failed} failed`);
  return { matched, failed };
}

export { getUserWithTags };
export type { UserWithTags };
