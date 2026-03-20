'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 模拟用户数据
  const otherUser = {
    id: userId,
    nickname: userId === 'user-1' ? '小明' : '小红',
    avatar: null,
  };

  useEffect(() => {
    // 模拟加载消息
    setTimeout(() => {
      setMessages([
        {
          id: '1',
          senderId: 'other',
          content: '你好！看到你的资料，感觉我们兴趣很相似 😊',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          senderId: 'me',
          content: '嗨！谢谢，我也注意到我们都喜欢摄影和旅行～',
          createdAt: new Date(Date.now() - 3500000).toISOString(),
        },
        {
          id: '3',
          senderId: 'other',
          content: '对啊！你最近有去哪里玩吗？',
          createdAt: new Date(Date.now() - 3400000).toISOString(),
        },
      ]);
      setLoading(false);
    }, 500);
  }, [userId]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      content: inputText.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // 模拟对方回复
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        senderId: 'other',
        content: '哈哈，听起来不错！👍',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部标题 */}
      <header className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            ←
          </button>
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center mr-3">
              <span className="text-lg">👤</span>
            </div>
            <h1 className="font-semibold text-gray-800">{otherUser.nickname}</h1>
          </div>
        </div>
      </header>

      {/* 消息列表 */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.senderId !== 'me' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-sm">👤</span>
                  </div>
                )}
                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.senderId === 'me'
                      ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.senderId === 'me' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-pink-300 flex items-center justify-center ml-2 flex-shrink-0 text-white text-xs font-medium">
                    我
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* 输入框 */}
      <div className="bg-white border-t border-gray-100 sticky bottom-0">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              // 阻止中文输入法合成过程中的 Enter 键触发发送
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="输入消息..."
            className="flex-1 bg-gray-100 rounded-full py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
