export default function LoginPage() {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Aimatch - AI 驱动的社交匹配平台</title>
        <style dangerouslySetInnerHTML={{__html: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #fff7ed, #fdf2f8); font-family: system-ui, sans-serif; padding: 16px; }
          .card { background: white; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); padding: 32px; width: 100%; max-width: 400px; text-align: center; }
          .logo { width: 80px; height: 80px; margin: 0 auto 16px; border-radius: 16px; background: linear-gradient(135deg, #fb923c, #ec4899); display: flex; align-items: center; justify-content: center; font-size: 40px; }
          h1 { font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #fb923c, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
          .subtitle { color: #6b7280; margin-bottom: 32px; }
          .feature { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px; margin-bottom: 12px; text-align: left; }
          .f1 { background: #fff7ed; } .f2 { background: #fdf2f8; } .f3 { background: #faf5ff; }
          .fi { font-size: 24px; } .ft { font-weight: 600; color: #1f2937; } .fd { font-size: 14px; color: #6b7280; }
          .btn { width: 100%; padding: 16px; background: linear-gradient(135deg, #fb923c, #ec4899); color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: 600; cursor: pointer; margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; }
          .footer { margin-top: 24px; font-size: 12px; color: #9ca3af; }
        `}} />
      </head>
      <body>
        <div className="card">
          <div className="logo">✨</div>
          <h1>Aimatch</h1>
          <p className="subtitle">AI 驱动的社交匹配平台</p>
          <div className="feature f1">
            <span className="fi">🤖</span>
            <div><div className="ft">AI Agent 智能匹配</div><div className="fd">两个 AI 分身先对话，发现契合点</div></div>
          </div>
          <div className="feature f2">
            <span className="fi">💬</span>
            <div><div className="ft">Agent 先聊，你再决定</div><div className="fd">基于 AI 对话报告，选择是否匹配</div></div>
          </div>
          <div className="feature f3">
            <span className="fi">❤️</span>
            <div><div className="ft">每日精选推荐</div><div className="fd">根据兴趣标签，推荐最契合的人</div></div>
          </div>
          <a href="/api/auth/login" className="btn"><span>✨</span><span>使用 SecondMe 登录</span></a>
          <p className="footer">登录即表示你同意我们的服务条款和隐私政策</p>
        </div>
      </body>
    </html>
  );
}
