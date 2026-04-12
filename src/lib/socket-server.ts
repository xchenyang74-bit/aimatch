import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 全局变量存储 Socket.IO 服务器实例
export let io: SocketIOServer | null = null;

// 用户 Socket 映射: userId -> socketId
const userSockets = new Map<string, string>();

export function initSocketServer(server: NetServer) {
  if (io) {
    console.log('Socket.IO already initialized');
    return io;
  }

  io = new SocketIOServer(server, {
    path: '/api/socket/io',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // 用户认证并加入房间
    socket.on('authenticate', (userId: string) => {
      if (userId) {
        userSockets.set(userId, socket.id);
        socket.join(`user:${userId}`);
        console.log(`User ${userId} authenticated, joined room user:${userId}`);
      }
    });

    // 发送消息
    socket.on('send_message', async (data: {
      senderId: string;
      receiverId: string;
      content: string;
    }) => {
      try {
        // 保存消息到数据库
        const message = await prisma.chatMessage.create({
          data: {
            senderId: data.senderId,
            receiverId: data.receiverId,
            content: data.content,
          },
        });

        // 发送给接收者（如果在线）
        io?.to(`user:${data.receiverId}`).emit('receive_message', {
          id: message.id,
          senderId: message.senderId,
          receiverId: message.receiverId,
          content: message.content,
          createdAt: message.createdAt,
        });

        // 确认发送成功
        socket.emit('message_sent', {
          id: message.id,
          createdAt: message.createdAt,
        });

        console.log(`Message sent from ${data.senderId} to ${data.receiverId}`);
      } catch (error) {
        console.error('Failed to save message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // 标记消息已读
    socket.on('mark_read', async (data: {
      userId: string;
      senderId: string;
    }) => {
      // 可以在这里更新未读消息计数
      io?.to(`user:${data.senderId}`).emit('messages_read', {
        by: data.userId,
      });
    });

    // 断开连接
    socket.on('disconnect', () => {
      // 从映射中移除
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  console.log('Socket.IO server initialized');
  return io;
}

// 检查用户是否在线
export function isUserOnline(userId: string): boolean {
  return userSockets.has(userId);
}

// 获取用户 socket ID
export function getUserSocketId(userId: string): string | undefined {
  return userSockets.get(userId);
}
