'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isMe: boolean;
}

interface UserInfo {
  id: string;
  nickname: string | null;
  avatar: string | null;
}

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<UserInfo | null>(null);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // 加载历史消息
  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/history?userId=${userId}`);
      const data = await res.json();
      
      if (data.code === 0) {
        setMessages(data.data.messages);
        setOtherUser(data.data.users.other);
        setCurrentUser(data.data.users.me);
        setTimeout(scrollToBottom, 100);
      } else if (res.status === 401) {
        router.push('/login');
      } else {
        setError(data.message || '加载失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }, [userId, router, scrollToBottom]);

  // 建立 SSE 连接
  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource('/api/chat/stream');
    
    es.onopen = () => {
      console.log('SSE connected');
      setConnected(true);
    };

    es.addEventListener('connected', (e) => {
      console.log('SSE authenticated:', JSON.parse(e.data));
    });

    es.addEventListener('message', (e) => {
      const data = JSON.parse(e.data);
      console.log('Received message:', data);
      
      // 只处理当前对话的消息
      if (data.senderId === userId || data.receiverId === userId) {
        setMessages(prev => {
          // 检查是否已存在（避免重复）
          if (prev.some(m => m.id === data.id)) return prev;
          
          const newMessage: Message = {
            id: data.id,
            senderId: data.senderId,
            content: data.content,
            createdAt: data.createdAt,
            isMe: data.senderId === currentUser?.id,
          };
          return [...prev, newMessage];
        });
        
        setTimeout(scrollToBottom, 100);
      }
    });

    es.addEventListener('ping', () => {
      // 心跳保持连接
    });

    es.onerror = (err) => {
      console.error('SSE error:', err);
      setConnected(false);
      // 5秒后重连
      setTimeout(() => connectSSE(), 5000);
    };

    eventSourceRef.current = es;
  }, [userId, currentUser?.id, scrollToBottom]);

  // 初始化
  useEffect(() => {
    loadMessages();
    connectSSE();

    return () => {
      eventSourceRef.current?.close();
    };
  }, [loadMessages, connectSSE]);

  // 发送消息
  const handleSend = async () => {
    if (!inputText.trim() || sending) return;

    const content = inputText.trim();
    setInputText('');
    setSending(true);

    // 乐观更新：立即显示消息
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      senderId: currentUser?.id || '',
      content,
      createdAt: new Date().toISOString(),
      isMe: true,
    };
    setMessages(prev => [...prev, optimisticMessage]);
    setTimeout(scrollToBottom, 50);

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: userId, content }),
      });

      const data = await res.json();

      if (data.code === 0) {
        // 替换临时消息为真实消息
        setMessages(prev => 
          prev.map(m => m.id === tempId ? {
            ...m,
            id: data.data.message.id,
            createdAt: data.data.message.createdAt,
          } : m)
        );
      } else {
        // 发送失败，移除乐观消息
        setMessages(prev => prev.filter(m => m.id !== tempId));
        setInputText(content); // 恢复输入
        alert(data.message || '发送失败');
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setInputText(content);
      alert('网络错误，请重试');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // 回车发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16">
      {/* 头部 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center px-4 h-14">
          <button 
            onClick={() => router.push('/chat')}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex-1 ml-3">
            <h1 className="font-semibold text-gray-800">
              {otherUser?.nickname || '未知用户'}
            </h1>
          </div>
          
          {/* 连接状态 */}
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} 
               title={connected ? '在线' : '离线'} />
        </div>
      </header>

      {/* 错误提示 */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>还没有消息</p>
            <p className="text-sm mt-1">打个招呼吧！</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const showTime = index === 0 || 
              new Date(msg.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 300000;
            
            return (
              <div key={msg.id}>
                {showTime && (
                  <div className="text-center text-xs text-gray-400 my-3">
                    {formatTime(msg.createdAt)}
                  </div>
                )}
                
                <div className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                    max-w-[75%] px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed
                    ${msg.isMe 
                      ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-br-md' 
                      : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                    }
                  `}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="sticky bottom-16 bg-white border-t border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            disabled={sending}
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            className="p-2.5 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
