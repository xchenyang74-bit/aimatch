'use client';

import { useState, useEffect } from 'react';

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setMounted(true);
    // 获取错误信息
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error');
      if (error) {
        const messages: Record<string, string> = {
          invalid_state: '安全验证失败，请重试',
          no_code: '授权失败，请重试',
          token_exchange: '登录失败，请重试',
          user_info: '获取用户信息失败',
          server: '服务器错误，请稍后重试',
          oauth: 'OAuth 授权失败',
        };
        setErrorMsg(messages[error] || '登录失败');
      }
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
        setErrorMsg(data.message || '登录初始化失败');
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg('网络错误，请重试');
      setLoading(false);
    }
  };

  // 未挂载时显示静态内容
  if (!mounted) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fff7ed, #fdf2f8)',
        padding: '16px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
          padding: '32px',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 16px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #fb923c, #ec4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px'
          }}>✨</div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#fb923c', marginBottom: '8px' }}>Aimatch</h1>
          <p style={{ color: '#6b7280' }}>AI 驱动的社交匹配平台</p>
          <div style={{ marginTop: '32px' }}>
            <div style={{ 
              width: '100%', 
              padding: '16px', 
              background: 'linear-gradient(135deg, #fb923c, #ec4899)', 
              color: 'white',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 600
            }}>
              使用 SecondMe 登录
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fff7ed, #fdf2f8, #faf5ff)',
      padding: '16px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
        padding: '32px',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 16px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #fb923c, #ec4899)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px'
        }}>✨</div>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #fb923c, #ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>Aimatch</h1>
        <p style={{ color: '#6b7280', marginBottom: '32px' }}>AI 驱动的社交匹配平台</p>

        {errorMsg && (
          <div style={{ 
            marginBottom: '24px', 
            padding: '12px', 
            background: '#fef2f2', 
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626'
          }}>
            {errorMsg}
          </div>
        )}
        
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#fff7ed', borderRadius: '12px', marginBottom: '12px' }}>
            <div style={{ fontSize: '24px' }}>🤖</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>AI Agent 智能匹配</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>两个 AI 分身先对话</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#fdf2f8', borderRadius: '12px', marginBottom: '12px' }}>
            <div style={{ fontSize: '24px' }}>💬</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>Agent 先聊，你再决定</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>基于对话报告匹配</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#faf5ff', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px' }}>❤️</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>每日精选推荐</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>根据兴趣标签推荐</div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #fb923c, #ec4899)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? '跳转中...' : '✨ 使用 SecondMe 登录'}
        </button>
        
        <p style={{ marginTop: '24px', fontSize: '12px', color: '#9ca3af' }}>
          登录即表示你同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
}
