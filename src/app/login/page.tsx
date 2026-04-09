// 强制静态生成，禁用动态渲染
export const dynamic = 'force-static';

export default function LoginPage() {
  return (
    <html>
      <body>
        <div 
          dangerouslySetInnerHTML={{
            __html: `
              <!DOCTYPE html>
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
                  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-300/10 rounded-full blur-3xl"></div>
                </div>
                
                <div class="relative z-10 w-full max-w-md">
                  <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
                    <!-- Logo -->
                    <div class="text-center mb-8">
                      <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-400 via-pink-400 to-purple-400 flex items-center justify-center shadow-lg">
                        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                        </svg>
                      </div>
                      <h1 class="text-4xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">Aimatch</h1>
                      <p class="text-gray-500">AI 驱动的社交匹配平台</p>
                    </div>

                    <!-- 错误提示占位 -->
                    <div id="error-msg" class="hidden mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                      <div class="font-medium flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        <span id="error-text"></span>
                      </div>
                    </div>

                    <!-- 特性介绍 -->
                    <div class="space-y-4 mb-8">
                      <div class="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-transparent border border-orange-100/50">
                        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md">
                          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                          </svg>
                        </div>
                        <div>
                          <h3 class="font-semibold text-gray-800">AI Agent 智能匹配</h3>
                          <p class="text-sm text-gray-500">两个 AI 分身先对话，发现契合点</p>
                        </div>
                      </div>

                      <div class="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-pink-50 to-transparent border border-pink-100/50">
                        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-md">
                          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                          </svg>
                        </div>
                        <div>
                          <h3 class="font-semibold text-gray-800">Agent 先聊，你再决定</h3>
                          <p class="text-sm text-gray-500">基于 AI 对话报告，选择是否匹配</p>
                        </div>
                      </div>

                      <div class="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-transparent border border-purple-100/50">
                        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-md">
                          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                          </svg>
                        </div>
                        <div>
                          <h3 class="font-semibold text-gray-800">每日精选推荐</h3>
                          <p class="text-sm text-gray-500">根据兴趣标签，推荐最契合的人</p>
                        </div>
                      </div>
                    </div>

                    <!-- 登录按钮 -->
                    <button id="login-btn" class="w-full py-4 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                      </svg>
                      <span id="btn-text">使用 SecondMe 登录</span>
                    </button>

                    <p class="mt-6 text-center text-sm text-gray-400">
                      登录即表示你同意我们的服务条款和隐私政策
                    </p>
                  </div>
                </div>

                <script>
                  // 显示错误信息
                  const params = new URLSearchParams(window.location.search);
                  const error = params.get('error');
                  if (error) {
                    const messages = {
                      invalid_state: '安全验证失败，请重试',
                      no_code: '授权失败，请重试',
                      token_exchange: '登录失败，请重试',
                      user_info: '获取用户信息失败',
                      server: '服务器错误，请稍后重试',
                      oauth: 'OAuth 授权失败'
                    };
                    document.getElementById('error-text').textContent = messages[error] || '登录失败';
                    document.getElementById('error-msg').classList.remove('hidden');
                  }

                  // 登录按钮点击
                  document.getElementById('login-btn').addEventListener('click', async function() {
                    const btn = this;
                    const btnText = document.getElementById('btn-text');
                    btn.disabled = true;
                    btnText.textContent = '跳转中...';
                    
                    try {
                      const res = await fetch('/api/auth/login');
                      const data = await res.json();
                      if (data.code === 0 && data.data.authUrl) {
                        window.location.href = data.data.authUrl;
                      } else {
                        alert('登录初始化失败：' + (data.message || '未知错误'));
                        btn.disabled = false;
                        btnText.textContent = '使用 SecondMe 登录';
                      }
                    } catch (err) {
                      alert('网络错误，请重试');
                      btn.disabled = false;
                      btnText.textContent = '使用 SecondMe 登录';
                    }
                  });
                </script>
              </body>
              </html>
            `
          }}
        />
      </body>
    </html>
  );
}
