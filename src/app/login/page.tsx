'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, MessageCircle, Heart, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams?.get('error') || null;
  const detail = searchParams?.get('detail') || null;

  // 确保客户端挂载后才渲染
  useEffect(() => {
    setMounted(true);
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

  // 服务端渲染时显示加载状态
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 w-full max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Aimatch</h1>
            <p className="text-gray-500">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-4">
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
          <p className="text-gray-500">AI 驱动的社交匹配平台</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
            <div className="font-medium mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error === 'invalid_state' && '安全验证失败，请重试'}
              {error === 'no_code' && '授权失败，请重试'}
              {error === 'token_exchange' && '登录失败，请重试'}
              {error === 'user_info' && '获取用户信息失败'}
              {error === 'server' && '服务器错误，请稍后重试'}
              {error === 'oauth' && 'OAuth 授权失败'}
              {!['invalid_state', 'no_code', 'token_exchange', 'user_info', 'server', 'oauth'].includes(error || '') && '登录失败'}
            </div>
            {detail && (
              <div className="text-xs text-red-400 mt-1 break-all font-mono bg-red-100/50 p-2 rounded">
                {decodeURIComponent(detail)}
              </div>
            )}
          </div>
        )}

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
              跳转中...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              使用 SecondMe 登录
            </>
          )}
        </button>

        {/* 提示文字 */}
        <p className="mt-6 text-center text-sm text-gray-400">
          登录即表示你同意我们的
          <a href="#" className="text-orange-400 hover:underline mx-1">服务条款</a>
          和
          <a href="#" className="text-orange-400 hover:underline mx-1">隐私政策</a>
        </p>
      </div>
    </div>
  );
}
