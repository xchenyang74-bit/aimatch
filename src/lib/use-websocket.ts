'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import io from 'socket.io-client';

type SocketType = ReturnType<typeof io>;

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: string;
  createdAt: string;
  sender: {
    nickname: string;
    avatar?: string;
  };
}

interface UseWebSocketOptions {
  userId: string;
  onMessage?: (message: Message) => void;
  onUserTyping?: (userId: string) => void;
  onUserStopTyping?: (userId: string) => void;
  onMessagesRead?: (by: string) => void;
  onUserStatus?: (data: { userId: string; isOnline: boolean }) => void;
}

export function useWebSocket({
  userId,
  onMessage,
  onUserTyping,
  onUserStopTyping,
  onMessagesRead,
  onUserStatus,
}: UseWebSocketOptions) {
  const socketRef = useRef<SocketType | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    // 确定 WebSocket 服务器地址
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || window.location.origin;
    
    socketRef.current = io(wsUrl, {
      auth: { userId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (err: any) => {
      console.error('WebSocket error:', err);
      setError('Connection failed');
    });

    socket.on('receive_message', (message: Message) => {
      onMessage?.(message);
    });

    socket.on('user_typing', ({ userId }: { userId: string }) => {
      onUserTyping?.(userId);
    });

    socket.on('user_stop_typing', ({ userId }: { userId: string }) => {
      onUserStopTyping?.(userId);
    });

    socket.on('messages_read', ({ by }: { by: string }) => {
      onMessagesRead?.(by);
    });

    socket.on('user_status', (data: { userId: string; isOnline: boolean }) => {
      onUserStatus?.(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, onMessage, onUserTyping, onUserStopTyping, onMessagesRead, onUserStatus]);

  const sendMessage = useCallback((receiverId: string, content: string, type = 'text') => {
    socketRef.current?.emit('send_message', { receiverId, content, type });
  }, []);

  const startTyping = useCallback((receiverId: string) => {
    socketRef.current?.emit('typing', { receiverId });
  }, []);

  const stopTyping = useCallback((receiverId: string) => {
    socketRef.current?.emit('stop_typing', { receiverId });
  }, []);

  const markAsRead = useCallback((senderId: string) => {
    socketRef.current?.emit('mark_read', { senderId });
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
  };
}
