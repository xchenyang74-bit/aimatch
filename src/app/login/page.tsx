// 服务端组件 - 无 React 客户端逻辑，避免 hydration 问题
export default function LoginPage() {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Aimatch - AI 驱动的社交匹配平台 v3</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #fff7ed 0%, #fdf2f8 50%, #faf5ff 100%);
            padding: 16px;
          }
          .card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 24px;
            padding: 32px;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
          }
          .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #fb923c, #f472b6, #a855f7);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            box-shadow: 0 8px 30px rgba(251, 146, 60, 0.3);
          }
          h1 {
            text-align: center;
            font-size: 32px;
            background: linear-gradient(135deg, #fb923c, #f472b6, #a855f7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 8px;
          }
          .subtitle {
            text-align: center;
            color: #6b7280;
            margin-bottom: 32px;
            font-size: 15px;
          }
          .feature {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            margin-bottom: 12px;
            border-radius: 16px;
            background: linear-gradient(90deg, rgba(251,146,60,0.1), transparent);
            border: 1px solid rgba(251,146,60,0.2);
          }
          .feature:nth-child(3) {
            background: linear-gradient(90deg, rgba(244,114,182,0.1), transparent);
            border-color: rgba(244,114,182,0.2);
          }
          .feature:nth-child(4) {
            background: linear-gradient(90deg, rgba(168,85,247,0.1), transparent);
            border-color: rgba(168,85,247,0.2);
          }
          .icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            flex-shrink: 0;
          }
          .feature:nth-child(2) .icon { background: linear-gradient(135deg, #fb923c, #f97316); }
          .feature:nth-child(3) .icon { background: linear-gradient(135deg, #f472b6, #ec4899); }
          .feature:nth-child(4) .icon { background: linear-gradient(135deg, #a855f7, #9333ea); }
          .feature-text h3 {
            font-size: 15px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
          }
          .feature-text p {
            font-size: 13px;
            color: #6b7280;
          }
          .btn {
            width: 100%;
            padding: 16px 24px;
            margin-top: 24px;
            background: linear-gradient(90deg, #fb923c, #f472b6, #a855f7);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 20px rgba(251, 146, 60, 0.3);
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(251, 146, 60, 0.4);
          }
          .btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-right: 8px;
            vertical-align: middle;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #9ca3af;
          }
          .error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 12px 16px;
            border-radius: 12px;
            margin-bottom: 16px;
            font-size: 14px;
            display: none;
          }
        `}</style>
      </head>
      <body>
        <div className="card">
          <div className="logo">✨</div>
          <h1>Aimatch</h1>
          <p className="subtitle">AI 驱动的社交匹配平台</p>
          
          <div id="error" className="error"></div>
          
          <div className="feature">
            <div className="icon">🤖</div>
            <div className="feature-text">
              <h3>AI Agent 智能匹配</h3>
              <p>两个 AI 分身先对话，发现契合点</p>
            </div>
          </div>
          
          <div className="feature">
            <div className="icon">💬</div>
            <div className="feature-text">
              <h3>Agent 先聊，你再决定</h3>
              <p>基于 AI 对话报告，选择是否匹配</p>
            </div>
          </div>
          
          <div className="feature">
            <div className="icon">✨</div>
            <div className="feature-text">
              <h3>每日精选推荐</h3>
              <p>根据兴趣标签，推荐最契合的人</p>
            </div>
          </div>
          
          <button id="loginBtn" className="btn" onClick={handleLogin}>
            使用 SecondMe 登录
          </button>
          
          <p className="footer">登录即表示你同意我们的服务条款</p>
        </div>
        
        <script dangerouslySetInnerHTML={{
          __html: `
            async function handleLogin() {
              const btn = document.getElementById('loginBtn');
              const errorDiv = document.getElementById('error');
              
              btn.disabled = true;
              btn.innerHTML = '<span class="spinner"></span>加载中...';
              errorDiv.style.display = 'none';
              
              try {
                const res = await fetch('/api/auth/login');
                const data = await res.json();
                
                if (data.code === 0 && data.data && data.data.authUrl) {
                  window.location.href = data.data.authUrl;
                } else {
                  throw new Error(data.message || '登录初始化失败');
                }
              } catch (err) {
                btn.disabled = false;
                btn.innerHTML = '使用 SecondMe 登录';
                errorDiv.textContent = '登录失败: ' + err.message;
                errorDiv.style.display = 'block';
              }
            }
            
            // 检查 URL 错误参数
            const params = new URLSearchParams(window.location.search);
            const error = params.get('error');
            if (error) {
              const errorDiv = document.getElementById('error');
              const messages = {
                'invalid_state': '安全验证失败，请重试',
                'no_code': '授权失败，请重试',
                'token_exchange': '登录失败，请重试',
                'user_info': '获取用户信息失败',
                'server': '服务器错误，请稍后重试'
              };
              errorDiv.textContent = messages[error] || '登录失败';
              errorDiv.style.display = 'block';
            }
          `
        }} />
      </body>
    </html>
  );
}
