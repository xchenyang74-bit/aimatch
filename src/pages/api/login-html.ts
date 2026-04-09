import type { NextApiRequest, NextApiResponse } from 'next';

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Aimatch - AI 驱动的社交匹配平台</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #fff7ed, #fdf2f8);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 16px;
    }
    .card {
      background: white;
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);
      padding: 32px;
      width: 100%;
      max-width: 400px;
      text-align: center;
    }
    .logo {
      width: 80px; height: 80px;
      margin: 0 auto 16px;
      border-radius: 16px;
      background: linear-gradient(135deg, #fb923c, #ec4899);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }
    h1 {
      font-size: 32px; font-weight: bold;
      background: linear-gradient(135deg, #fb923c, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }
    .subtitle { color: #6b7280; margin-bottom: 32px; }
    .feature {
      display: flex; align-items: center; gap: 12px;
      padding: 12px; border-radius: 12px;
      margin-bottom: 12px; text-align: left;
    }
    .f1 { background: #fff7ed; }
    .f2 { background: #fdf2f8; }
    .f3 { background: #faf5ff; }
    .fi { font-size: 24px; }
    .ft { font-weight: 600; color: #1f2937; }
    .fd { font-size: 14px; color: #6b7280; }
    .btn {
      width: 100%; padding: 16px;
      background: linear-gradient(135deg, #fb923c, #ec4899);
      color: white; border: none; border-radius: 12px;
      font-size: 18px; font-weight: 600;
      cursor: pointer; margin-top: 20px;
      display: flex; align-items: center;
      justify-content: center; gap: 8px;
      text-decoration: none;
    }
    .footer { margin-top: 24px; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">✨</div>
    <h1>Aimatch</h1>
    <p class="subtitle">AI 驱动的社交匹配平台</p>
    <div class="feature f1">
      <span class="fi">🤖</span>
      <div><div class="ft">AI Agent 智能匹配</div><div class="fd">两个 AI 分身先对话，发现契合点</div></div>
    </div>
    <div class="feature f2">
      <span class="fi">💬</span>
      <div><div class="ft">Agent 先聊，你再决定</div><div class="fd">基于 AI 对话报告，选择是否匹配</div></div>
    </div>
    <div class="feature f3">
      <span class="fi">❤️</span>
      <div><div class="ft">每日精选推荐</div><div class="fd">根据兴趣标签，推荐最契合的人</div></div>
    </div>
    <a href="/api/auth/login" class="btn"><span>✨</span><span>使用 SecondMe 登录</span></a>
    <p class="footer">登录即表示你同意我们的服务条款和隐私政策</p>
  </div>
</body>
</html>`;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(LOGIN_HTML);
}
// Cache bust: 1775746920
