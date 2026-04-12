import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('user_id')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { code: -1, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 获取所有匹配（互相关注）的用户
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { userId: userId, status: 'ACCEPTED' },
          { matchedUserId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        user: {
          select: { id: true, nickname: true, avatar: true },
        },
        matchedUser: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // 获取最后一条消息和未读数
    const conversations = await Promise.all(
      matches.map(async (match) => {
        const otherUser = match.userId === userId ? match.matchedUser : match.user;
        
        // 获取最后一条消息
        const lastMessage = await prisma.chatMessage.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: otherUser.id },
              { senderId: otherUser.id, receiverId: userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });

        // 获取未读消息数（对方发送的，我还没有读的）
        const unreadCount = await prisma.chatMessage.count({
          where: {
            senderId: otherUser.id,
            receiverId: userId,
            // 这里可以添加已读状态字段，目前简化处理
          },
        });

        return {
          matchId: match.id,
          user: otherUser,
          lastMessage: lastMessage ? {
            id: lastMessage.id,
            content: lastMessage.content,
            createdAt: lastMessage.createdAt.toISOString(),
            isMe: lastMessage.senderId === userId,
          } : null,
          unreadCount,
          matchScore: match.matchScore,
        };
      })
    );

    // 按最后消息时间排序
    conversations.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt || '1970-01-01';
      const timeB = b.lastMessage?.createdAt || '1970-01-01';
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });

    return NextResponse.json({
      code: 0,
      data: conversations,
    });
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return NextResponse.json(
      { code: -1, message: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
