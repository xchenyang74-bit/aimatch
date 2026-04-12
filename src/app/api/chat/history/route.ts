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

    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get('userId');
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    if (!otherUserId) {
      return NextResponse.json(
        { code: -1, message: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // 查询双向消息
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
        ...(cursor ? { id: { lt: cursor } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // 获取用户信息
    const [currentUser, otherUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, nickname: true, avatar: true },
      }),
      prisma.user.findUnique({
        where: { id: otherUserId },
        select: { id: true, nickname: true, avatar: true },
      }),
    ]);

    // 反转消息顺序（从早到晚）
    const sortedMessages = messages.reverse();

    return NextResponse.json({
      code: 0,
      data: {
        messages: sortedMessages.map((msg) => ({
          id: msg.id,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          content: msg.content,
          createdAt: msg.createdAt.toISOString(),
          isMe: msg.senderId === userId,
        })),
        users: {
          me: currentUser,
          other: otherUser,
        },
        hasMore: messages.length === limit,
        nextCursor: messages.length > 0 ? messages[messages.length - 1].id : null,
      },
    });
  } catch (error) {
    console.error('Failed to fetch chat history:', error);
    return NextResponse.json(
      { code: -1, message: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}
