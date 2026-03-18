import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 开发模式用户 ID
const DEV_USER_ID = 'dev-user-1';

export async function GET() {
  try {
    // 获取未读消息数量（简化：最近24小时的消息）
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const unreadMessages = await prisma.chatMessage.count({
      where: {
        receiverId: DEV_USER_ID,
        createdAt: {
          gte: oneDayAgo,
        },
      },
    });

    // 获取新的双向匹配（最近24小时）
    const newMatches = await prisma.match.count({
      where: {
        matchedUserId: DEV_USER_ID,
        status: 'ACCEPTED',
        createdAt: {
          gte: oneDayAgo,
        },
      },
    });

    // 开发模式：如果没有数据，返回模拟数据
    const hasData = unreadMessages > 0 || newMatches > 0;
    
    return NextResponse.json({
      code: 0,
      data: {
        unreadMessages: hasData ? unreadMessages : 3, // 模拟3条未读
        newMatches: hasData ? newMatches : 1, // 模拟1个新匹配
        total: hasData ? unreadMessages + newMatches : 4,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    // 开发模式：返回模拟数据
    return NextResponse.json({
      code: 0,
      data: {
        unreadMessages: 3,
        newMatches: 1,
        total: 4,
      },
    });
  }
}
