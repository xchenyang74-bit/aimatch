'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

interface Conversation {
  id: string;
  user: {
    id: string;
    nickname: string;
    avatar: string | null;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function ChatListPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取对话列表
    fetch('/api/chat/conversations')
      .then(res => res.json())
      .then(data => {
        if (data.code === 0) {
          setConversations(data.data);
        }
        setLoading(false);
      })
      .catch((err: any) => {
        console.error('Failed to load conversations:', err);
        setLoading(false);
      });
  }, []);

  const formatTime = (timeString: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部标题 */}
      <header className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800">消息</h1>
        </div>
      </header>

      {/* 搜索框 */}
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索聊天记录"
            className="w-full bg-gray-100 rounded-xl py-3 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
      </div>

      {/* 对话列表 */}
      <main className="max-w-lg mx-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">💬</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">暂无消息</h3>
            <p className="text-gray-500 text-sm">去推荐页看看，开始新的对话吧</p>
          </div>
        ) : (
          <div className="bg-white">
            {conversations.map((conv, index) => (
              <Link
                key={conv.id}
                href={`/chat/${conv.user.id}`}
                className={`flex items-center px-4 py-4 hover:bg-gray-50 transition-colors ${
                  index !== conversations.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                {/* 头像 */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center flex-shrink-0 mr-3">
                  <span className="text-xl">👤</span>
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-medium text-gray-800 truncate">
                      {conv.user.nickname}
                    </h3>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatTime(conv.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 truncate pr-2">
                      {conv.lastMessage}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="flex-shrink-0 bg-orange-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
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
