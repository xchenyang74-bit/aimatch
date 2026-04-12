'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { MessageCircle } from 'lucide-react';

interface Conversation {
  matchId: string;
  user: {
    id: string;
    nickname: string | null;
    avatar: string | null;
  };
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    isMe: boolean;
  } | null;
  unreadCount: number;
  matchScore: number;
}

export default function ChatListPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/chat/conversations');
      const data = await res.json();
      
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      
      if (data.code === 0) {
        setConversations(data.data);
      } else {
        setError(data.message || '加载失败');
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    
    const date = new Date(timeString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // 小于1小时显示几分钟前
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return minutes < 1 ? '刚刚' : `${minutes}分钟前`;
    }
    // 小于24小时显示几小时前
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    }
    // 显示日期
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  // 截断消息预览
  const truncateMessage = (content: string | null, isMe: boolean | null) => {
    if (!content) return '暂无消息';
    const prefix = isMe ? '我: ' : '';
    const text = prefix + content;
    return text.length > 30 ? text.slice(0, 30) + '...' : text;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部标题 */}
      <header className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">消息</h1>
            <span className="text-sm text-gray-500">
              {conversations.length} 个匹配
            </span>
          </div>
        </div>
      </header>

      {/* 错误提示 */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* 对话列表 */}
      <main className="max-w-lg mx-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">暂无消息</h3>
            <p className="text-gray-500 text-sm mb-6">去推荐页看看，开始新的对话吧</p>
            <Link 
              href="/dashboard"
              className="inline-block px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-full font-medium hover:shadow-lg transition-shadow"
            >
              查看推荐
            </Link>
          </div>
        ) : (
          <div className="bg-white mt-2">
            {conversations.map((conv, index) => (
              <Link
                key={conv.matchId}
                href={`/chat/${conv.user.id}`}
                className={`flex items-center px-4 py-4 hover:bg-gray-50 transition-colors ${
                  index !== conversations.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                {/* 头像 */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center flex-shrink-0 mr-3">
                    {conv.user.avatar ? (
                      <img 
                        src={conv.user.avatar} 
                        alt={conv.user.nickname || ''}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                  </div>
                  {/* 在线状态指示器 */}
                  <div className="absolute bottom-0 right-2 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-800 truncate">
                        {conv.user.nickname || '匿名用户'}
                      </h3>
                      {/* 匹配度标签 */}
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">
                        {Math.round(conv.matchScore)}% 契合
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatTime(conv.lastMessage?.createdAt || null)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate pr-2 ${conv.unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {truncateMessage(conv.lastMessage?.content || null, conv.lastMessage?.isMe || null)}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="flex-shrink-0 bg-gradient-to-r from-orange-400 to-pink-400 text-white text-xs rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5">
                        {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* 底部导航 */}
      <BottomNav />
    </div>
  );
}
