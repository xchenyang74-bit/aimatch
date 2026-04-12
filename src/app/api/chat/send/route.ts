import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendToUser } from '../stream/route';

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('user_id')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { code: -1, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { receiverId, content } = body;

    if (!receiverId || !content || content.trim().length === 0) {
      return NextResponse.json(
        { code: -1, message: 'Missing receiverId or content' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { code: -1, message: 'Message too long (max 1000 chars)' },
        { status: 400 }
      );
    }

    // 验证用户是否存在
    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, nickname: true, avatar: true } }),
      prisma.user.findUnique({ where: { id: receiverId }, select: { id: true, nickname: true, avatar: true } }),
    ]);

    if (!sender || !receiver) {
      return NextResponse.json(
        { code: -1, message: 'User not found' },
        { status: 404 }
      );
    }

    // 保存消息到数据库
    const message = await prisma.chatMessage.create({
      data: {
        senderId: userId,
        receiverId: receiverId,
        content: content.trim(),
      },
    });

    // 构造消息数据
    const messageData = {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      sender: {
        id: sender.id,
        nickname: sender.nickname,
        avatar: sender.avatar,
      },
    };

    // 通过 SSE 推送给接收者（如果在线）
    const delivered = sendToUser(receiverId, messageData);

    console.log(`Message sent: ${userId} -> ${receiverId}, delivered: ${delivered}`);

    return NextResponse.json({
      code: 0,
      data: {
        message: messageData,
        delivered,
      },
    });
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json(
      { code: -1, message: 'Failed to send message' },
      { status: 500 }
    );
  }
}
