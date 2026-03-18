import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 开发模式用户 ID
const DEV_USER_ID = 'dev-user-1';

export async function GET() {
  try {
    // 开发模式：获取模拟用户的所有对话
    const user = await prisma.user.findFirst({
      where: { id: DEV_USER_ID },
    });

    if (!user) {
      // 如果没有用户，创建模拟数据
      return NextResponse.json({
        code: 0,
        data: [
          {
            id: 'conv-1',
            user: { id: 'user-1', nickname: '小明', avatar: null },
            lastMessage: '你好！看到你的资料，感觉我们兴趣很相似 😊',
            lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
            unreadCount: 2,
          },
          {
            id: 'conv-2',
            user: { id: 'user-2', nickname: '小红', avatar: null },
            lastMessage: '哈哈，我也喜欢摄影！',
            lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
            unreadCount: 0,
          },
        ],
      });
    }

    // 获取用户的聊天消息，按对话分组
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // 按对话对方分组
    const conversationsMap = new Map();
    
    for (const msg of messages) {
      const otherUserId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
      
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          lastMessage: msg,
          messages: [msg],
        });
      } else {
        conversationsMap.get(otherUserId).messages.push(msg);
      }
    }

    // 转换为前端需要的格式
    const conversations = Array.from(conversationsMap.entries()).map(([otherUserId, data]) => ({
      id: `conv-${otherUserId}`,
      userId: otherUserId,
      lastMessage: data.lastMessage.content,
      lastMessageTime: data.lastMessage.createdAt.toISOString(),
      unreadCount: 0, // 简化处理
    }));

    return NextResponse.json({ code: 0, data: conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { code: -1, message: 'Failed to get conversations' },
      { status: 500 }
    );
  }
}
