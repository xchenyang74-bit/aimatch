import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('user_id')?.value;
    
    if (!userId) {
      return NextResponse.json({ code: -1, message: 'Unauthorized' }, { status: 401 });
    }

    // 获取所有 A2A 对话记录，包含用户信息
    const conversations = await prisma.a2AConversation.findMany({
      include: {
        userA: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        userB: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      code: 0,
      data: conversations.map((conv) => ({
        id: conv.id,
        userA: conv.userA,
        userB: conv.userB,
        status: conv.status,
        compatibilityScore: conv.compatibilityScore,
        commonTagCount: conv.commonTagCount,
        summary: conv.summary,
        createdAt: conv.createdAt,
        completedAt: conv.completedAt,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return NextResponse.json(
      { code: -1, message: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
