import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 开发模式用户 ID
const DEV_USER_ID = 'dev-user-1';

// 获取当前用户的所有匹配记录
export async function GET() {
  try {
    // 获取我发送的喜欢
    const sentMatches = await prisma.match.findMany({
      where: { userId: DEV_USER_ID },
    });

    // 获取我收到的喜欢
    const receivedMatches = await prisma.match.findMany({
      where: { matchedUserId: DEV_USER_ID, status: 'ACCEPTED' },
    });

    // 转换为前端需要的格式
    const matchesMap = new Map();

    sentMatches.forEach(match => {
      matchesMap.set(match.matchedUserId, {
        userId: match.matchedUserId,
        iLiked: true,
        theyLiked: false,
        isMatch: match.status === 'ACCEPTED',
      });
    });

    receivedMatches.forEach(match => {
      const existing = matchesMap.get(match.userId);
      if (existing) {
        existing.theyLiked = true;
        existing.isMatch = true;
      } else {
        matchesMap.set(match.userId, {
          userId: match.userId,
          iLiked: false,
          theyLiked: true,
          isMatch: true,
        });
      }
    });

    return NextResponse.json({
      code: 0,
      data: Array.from(matchesMap.values()),
    });
  } catch (error) {
    console.error('Get matches error:', error);
    return NextResponse.json(
      { code: -1, message: 'Failed to get matches' },
      { status: 500 }
    );
  }
}

// 记录喜欢/不喜欢
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetUserId, action } = body;

    if (!targetUserId || !action) {
      return NextResponse.json(
        { code: -1, message: 'Missing parameters' },
        { status: 400 }
      );
    }

    if (action === 'like') {
      // 检查对方是否也喜欢我
      const theirLike = await prisma.match.findFirst({
        where: {
          userId: targetUserId,
          matchedUserId: DEV_USER_ID,
        },
      });

      // 创建或更新匹配记录
      const match = await prisma.match.upsert({
        where: {
          userId_matchedUserId: {
            userId: DEV_USER_ID,
            matchedUserId: targetUserId,
          },
        },
        update: {
          status: theirLike ? 'ACCEPTED' : 'PENDING',
        },
        create: {
          userId: DEV_USER_ID,
          matchedUserId: targetUserId,
          status: theirLike ? 'ACCEPTED' : 'PENDING',
          matchScore: 85, // 简化处理
        },
      });

      // 如果对方也喜欢我，更新对方的状态为 ACCEPTED
      if (theirLike) {
        await prisma.match.update({
          where: { id: theirLike.id },
          data: { status: 'ACCEPTED' },
        });
      }

      return NextResponse.json({
        code: 0,
        data: {
          isMatch: !!theirLike,
          match: match,
        },
      });
    } else if (action === 'dislike') {
      // 记录不喜欢（可以后续用于不推荐相似的人）
      // 简化处理：删除之前的喜欢记录（如果有）
      await prisma.match.deleteMany({
        where: {
          userId: DEV_USER_ID,
          matchedUserId: targetUserId,
        },
      });

      return NextResponse.json({
        code: 0,
        data: { action: 'disliked' },
      });
    }

    return NextResponse.json(
      { code: -1, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Create match error:', error);
    return NextResponse.json(
      { code: -1, message: 'Failed to create match' },
      { status: 500 }
    );
  }
}
