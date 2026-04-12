import { NextRequest } from 'next/server';

// SSE 客户端管理 - 模块级别单例
const clients = new Map<string, ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  const userId = request.cookies.get('user_id')?.value;
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      // 存储客户端连接
      clients.set(userId, controller);
      
      // 发送连接成功事件
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({ userId, time: new Date().toISOString() })}\n\n`));
      
      console.log(`SSE client connected: ${userId}, total: ${clients.size}`);

      // 心跳保持连接
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`));
        } catch {
          clearInterval(heartbeat);
          clients.delete(userId);
        }
      }, 30000);

      // 清理断开连接
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        clients.delete(userId);
        console.log(`SSE client disconnected: ${userId}, total: ${clients.size}`);
      });
    },
    cancel() {
      clients.delete(userId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

// 向特定用户发送消息（可以被其他 API 调用）
export function sendToUser(userId: string, data: any) {
  const controller = clients.get(userId);
  if (controller) {
    try {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(`event: message\ndata: ${JSON.stringify(data)}\n\n`));
      return true;
    } catch (error) {
      console.error(`Failed to send to user ${userId}:`, error);
      clients.delete(userId);
      return false;
    }
  }
  return false;
}

// 获取在线用户数量
export function getOnlineCount(): number {
  return clients.size;
}

// 获取在线用户列表
export function getOnlineUsers(): string[] {
  return Array.from(clients.keys());
}
