import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 开发模式用户 ID
const DEV_USER_ID = 'dev-user-1';

// 获取当前用户的所有匹配记录
export async function GET() {
  try {
    // 获取当前用户
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { code: 401, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    let sentMatches: any[] = [];
    let receivedMatches: any[] = [];
    
    // 尝试从数据库获取
    try {
      sentMatches = await prisma.match.findMany({
        where: { userId: user.id },
      });
      receivedMatches = await prisma.match.findMany({
        where: { matchedUserId: user.id, status: 'ACCEPTED' },
      });
    } catch (dbError) {
      console.log('Database not available, returning empty matches');
    }

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
    // 降级处理：返回空数组
    return NextResponse.json({
      code: 0,
      data: [],
    });
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

    // 模拟匹配逻辑（无数据库时）
    // user-1, user-4, user-7 会和你双向匹配
    const mutualMatchUsers = ['user-1', 'user-4', 'user-7'];
    const isMutualMatch = mutualMatchUsers.includes(targetUserId);

    if (action === 'like') {
      return NextResponse.json({
        code: 0,
        data: {
          isMatch: isMutualMatch,
          match: { id: 'mock-match-id', status: isMutualMatch ? 'ACCEPTED' : 'PENDING' },
        },
      });
    } else if (action === 'dislike') {
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
