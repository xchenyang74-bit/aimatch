import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get('error');
  
  const errorMessages: Record<string, string> = {
    invalid_state: '安全验证失败，请重试',
    no_code: '授权失败，请重试',
    token_exchange: '登录失败，请重试',
    user_info: '获取用户信息失败',
    server: '服务器错误，请稍后重试',
    oauth: 'OAuth 授权失败',
  };
  
  const errorMsg = error ? (errorMessages[error] || '登录失败') : '';
  const errorDisplay = errorMsg ? 'block' : 'hidden';

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Aimatch - AI 驱动的社交匹配平台</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-4">
  <div class="fixed inset-0 overflow-hidden pointer-events-none">
    <div class="absolute top-20 left-10 w-72 h-72 bg-orange-300/20 rounded-full blur-3xl"></div>
    <div class="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl"></div>
  </div>
  
  <div class="relative z-10 w-full max-w-md">
    <div class="bg-white rounded-3xl shadow-2xl p-8">
      <div class="text-center mb-8">
        <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-400 via-pink-400 to-purple-400 flex items-center justify-center shadow-lg">
          <span class="text-4xl">✨</span>
        </div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">Aimatch</h1>
        <p class="text-gray-500">AI 驱动的社交匹配平台</p>
      </div>

      <div id="error-msg" class="${errorDisplay} mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
        <div class="font-medium flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          ${errorMsg}
        </div>
      </div>

      <div class="space-y-4 mb-8">
        <div class="flex items-center gap-4 p-3 rounded-xl bg-orange-50 border border-orange-100">
          <div class="w-12 h-12 rounded-xl bg-orange-400 flex items-center justify-center text-2xl">🤖</div>
          <div>
            <h3 class="font-semibold text-gray-800">AI Agent 智能匹配</h3>
            <p class="text-sm text-gray-500">两个 AI 分身先对话，发现契合点</p>
          </div>
        </div>
        <div class="flex items-center gap-4 p-3 rounded-xl bg-pink-50 border border-pink-100">
          <div class="w-12 h-12 rounded-xl bg-pink-400 flex items-center justify-center text-2xl">💬</div>
          <div>
            <h3 class="font-semibold text-gray-800">Agent 先聊，你再决定</h3>
            <p class="text-sm text-gray-500">基于 AI 对话报告，选择是否匹配</p>
          </div>
        </div>
        <div class="flex items-center gap-4 p-3 rounded-xl bg-purple-50 border border-purple-100">
          <div class="w-12 h-12 rounded-xl bg-purple-400 flex items-center justify-center text-2xl">❤️</div>
          <div>
            <h3 class="font-semibold text-gray-800">每日精选推荐</h3>
            <p class="text-sm text-gray-500">根据兴趣标签，推荐最契合的人</p>
          </div>
        </div>
      </div>

      <button onclick="login()" id="login-btn" class="w-full py-4 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
        <span id="btn-icon">✨</span>
        <span id="btn-text">使用 SecondMe 登录</span>
      </button>

      <p class="mt-6 text-center text-sm text-gray-400">
        登录即表示你同意我们的服务条款和隐私政策
      </p>
    </div>
  </div>

  <script>
    async function login() {
      const btn = document.getElementById('login-btn');
      const btnText = document.getElementById('btn-text');
      const btnIcon = document.getElementById('btn-icon');
      btn.disabled = true;
      btnText.textContent = '跳转中...';
      btnIcon.textContent = '⏳';
      
      try {
        const res = await fetch('/api/auth/login');
        const data = await res.json();
        if (data.code === 0 && data.data.authUrl) {
          window.location.href = data.data.authUrl;
        } else {
          alert('登录初始化失败：' + (data.message || '未知错误'));
          btn.disabled = false;
          btnText.textContent = '使用 SecondMe 登录';
          btnIcon.textContent = '✨';
        }
      } catch (err) {
        alert('网络错误，请重试');
        btn.disabled = false;
        btnText.textContent = '使用 SecondMe 登录';
        btnIcon.textContent = '✨';
      }
    }
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
