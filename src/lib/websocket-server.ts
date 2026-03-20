import { createServer } from 'http';
import { Server } from 'socket.io';
import { prisma } from './prisma';
import { redis } from './redis';

// 在线用户 Map: userId -> socketId
const onlineUsers = new Map<string, string>();

export function createWebSocketServer(server: ReturnType<typeof createServer>) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling'],
  });

  // 中间件：验证用户身份
  io.use(async (socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      return next(new Error('Authentication required'));
    }
    socket.data.userId = userId;
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`User ${userId} connected`);
    
    // 记录用户在线状态
    onlineUsers.set(userId, socket.id);
    redis.set(`online:${userId}`, socket.id, 'EX', 3600);

    // 加入用户专属房间
    socket.join(`user:${userId}`);

    // 通知该用户的好友上线
    broadcastUserStatus(io, userId, true);

    // 监听发送消息
    socket.on('send_message', async (data) => {
      const { receiverId, content, type = 'text' } = data;
      
      try {
        // 保存消息到数据库
        const message = await prisma.chatMessage.create({
          data: {
            senderId: userId,
            receiverId,
            content,
          },
        });

        // 获取发送者信息
        const sender = await prisma.user.findUnique({
          where: { secondmeUserId: userId },
          select: { nickname: true, avatar: true },
        });

        const messageData = {
          id: message.id,
          senderId: userId,
          receiverId,
          content,
          type,
          createdAt: message.createdAt,
          sender: {
            nickname: sender?.nickname || 'Unknown',
            avatar: sender?.avatar,
          },
        };

        // 发送给接收者
        io.to(`user:${receiverId}`).emit('receive_message', messageData);
        
        // 确认发送成功
        socket.emit('message_sent', { success: true, message: messageData });

        // 如果接收者不在线，推送通知
        const isOnline = await redis.get(`online:${receiverId}`);
        if (!isOnline) {
          // 记录离线消息，推送通知（后续接入推送服务）
          await redis.lpush(`offline_messages:${receiverId}`, JSON.stringify(messageData));
        }
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // 监听正在输入
    socket.on('typing', (data) => {
      const { receiverId } = data;
      socket.to(`user:${receiverId}`).emit('user_typing', { userId });
    });

    // 监听停止输入
    socket.on('stop_typing', (data) => {
      const { receiverId } = data;
      socket.to(`user:${receiverId}`).emit('user_stop_typing', { userId });
    });

    // 监听已读回执
    socket.on('mark_read', async (data) => {
      const { senderId } = data;
      // 广播给发送者
      socket.to(`user:${senderId}`).emit('messages_read', { by: userId });
    });

    // 断开连接
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
      onlineUsers.delete(userId);
      redis.del(`online:${userId}`);
      broadcastUserStatus(io, userId, false);
    });
  });

  return io;
}

// 广播用户在线状态
async function broadcastUserStatus(io: Server, userId: string, isOnline: boolean) {
  try {
    // 获取该用户的所有匹配
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { userId: userId, status: 'ACCEPTED' },
          { matchedUserId: userId, status: 'ACCEPTED' },
        ],
      },
    });

    const matchedUserIds = matches.map(m => 
      m.userId === userId ? m.matchedUserId : m.userId
    );

    // 通知所有匹配用户
    matchedUserIds.forEach(id => {
      io.to(`user:${id}`).emit('user_status', { userId, isOnline });
    });
  } catch (error) {
    console.error('Broadcast status error:', error);
  }
}

// 检查用户是否在线
export async function isUserOnline(userId: string): Promise<boolean> {
  const socketId = await redis.get(`online:${userId}`);
  return !!socketId;
}
