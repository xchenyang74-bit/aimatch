'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login');
      const data = await response.json();
      
      if (data.code === 0 && data.data.authUrl) {
        window.location.href = data.data.authUrl;
      } else {
        alert('登录初始化失败');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('登录初始化失败');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md mx-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Aimatch</h1>
        <p className="text-gray-600">AI 驱动的社交匹配平台</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
          <div className="font-medium mb-1">
            {error === 'invalid_state' && '安全验证失败，请重试'}
            {error === 'no_code' && '授权失败，请重试'}
            {error === 'token_exchange' && '登录失败，请重试'}
            {error === 'user_info' && '获取用户信息失败'}
            {error === 'server' && '服务器错误，请稍后重试'}
            {error === 'oauth' && 'OAuth 授权失败'}
          </div>
          {searchParams.get('detail') && (
            <div className="text-xs text-red-400 mt-1 break-all font-mono">
              详情: {decodeURIComponent(searchParams.get('detail') || '')}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4 mb-8">
        <div className="flex items-center space-x-3 text-gray-600">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
            🤖
          </div>
          <span>AI Agent 智能匹配</span>
        </div>
        <div className="flex items-center space-x-3 text-gray-600">
          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">
            💬
          </div>
          <span>Agent 先聊，你再决定</span>
        </div>
        <div className="flex items-center space-x-3 text-gray-600">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
            ✨
          </div>
          <span>每日精选推荐</span>
        </div>
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-xl font-semibold text-lg shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '加载中...' : '使用 SecondMe 登录'}
      </button>

      <p className="mt-6 text-center text-sm text-gray-500">
        登录即表示你同意我们的服务条款
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-pink-50">
      <Suspense fallback={
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md mx-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Aimatch</h1>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
