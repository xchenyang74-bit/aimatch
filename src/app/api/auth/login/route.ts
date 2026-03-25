import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  const clientId = process.env.SECONDME_CLIENT_ID;
  const redirectUri = process.env.SECONDME_REDIRECT_URI;
  const oauthUrl = process.env.SECONDME_OAUTH_URL;

  if (!clientId || !redirectUri || !oauthUrl) {
    return NextResponse.json(
      { code: -1, message: 'OAuth configuration missing' },
      { status: 500 }
    );
  }

  // 生成 state 防止 CSRF
  const state = crypto.randomBytes(32).toString('hex');
  
  // 构建 OAuth URL
  // 参考博弈圆桌的 scope 设置
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state: state,
    scope: 'user.info user.info.shades chat',
  });

  const authUrl = `${oauthUrl}?${params.toString()}`;

  // 创建响应并设置 state cookie
  const response = NextResponse.json({ code: 0, data: { authUrl } });
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 分钟
  });

  return response;
}
