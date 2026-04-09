'use client';

import { useEffect, useState } from 'react';
import { Sparkles, MessageCircle, Heart, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);

  // 只在客户端执行，避免 hydration 不匹配
  useEffect(() => {
    setIsClient(true);
    // 从 URL 获取错误信息（客户端安全）
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setError(params.get('error'));
      setDetail(params.get('detail'));
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login');
      const data = await response.json();
      
      if (data.code === 0 && data.data.authUrl) {
        window.location.href = data.data.authUrl;
      } else {
        alert('登录初始化失败：' + (data.message || '未知错误'));
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('登录初始化失败，请检查网络连接');
      setLoading(false);
    }
  };

  // 错误提示组件
  const ErrorMessage = () => {
    if (!error) return null;
    
    const errorMessages: Record<string, string> = {
      'invalid_state': '安全验证失败，请重试',
      'no_code': '授权失败，请重试',
      'token_exchange': '登录失败，请重试',
      'user_info': '获取用户信息失败',
      'server': '服务器错误，请稍后重试',
      'oauth': 'OAuth 授权失败',
    };
    
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
        <div className="font-medium mb-1">
          {errorMessages[error] || '登录失败'}
        </div>
        {detail && (
          <div className="text-xs text-red-400 mt-1 break-all font-mono bg-red-100/50 p-2 rounded">
            {decodeURIComponent(detail)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-4"
      suppressHydrationWarning
    >
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/50">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-400 via-pink-400 to-purple-400 flex items-center justify-center shadow-lg shadow-orange-200">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Aimatch
          </h1>
          <p className="text-gray-500">AI 驱动的社交匹配平台 (v2)</p>
        </div>

        {/* 错误提示 - 只在客户端显示 */}
        {isClient && <ErrorMessage />}

        {/* 特性介绍 */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-transparent border border-orange-100/50">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">AI Agent 智能匹配</h3>
              <p className="text-sm text-gray-500">两个 AI 分身先对话，发现契合点</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-pink-50 to-transparent border border-pink-100/50">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-md">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Agent 先聊，你再决定</h3>
              <p className="text-sm text-gray-500">基于 AI 对话报告，选择是否匹配</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-transparent border border-purple-100/50">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-md">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">每日精选推荐</h3>
              <p className="text-sm text-gray-500">根据兴趣标签，推荐最契合的人</p>
            </div>
          </div>
        </div>

        {/* 登录按钮 */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 text-white rounded-xl font-semibold text-lg shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              加载中...
            </>
          ) : (
            '使用 SecondMe 登录'
          )}
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          登录即表示你同意我们的服务条款
        </p>
      </div>
    </div>
  );
}
