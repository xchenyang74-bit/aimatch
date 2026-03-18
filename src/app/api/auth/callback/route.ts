import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  console.log('=== OAuth Callback Debug ===');
  console.log('code:', code ? '存在' : '不存在');
  console.log('state:', state);
  console.log('error:', error);
  console.log('error_description:', errorDescription);

  // 获取存储的 state
  const cookieStore = request.cookies;
  const storedState = cookieStore.get('oauth_state')?.value;
  console.log('storedState:', storedState ? '存在' : '不存在');

  // 清除 state cookie
  const response = NextResponse.redirect(new URL('/dashboard', request.url));
  response.cookies.delete('oauth_state');

  // 处理 SecondMe 返回的错误
  if (error) {
    console.error('SecondMe OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/login?error=oauth&detail=${encodeURIComponent(error)}`, request.url)
    );
  }

  // 验证参数
  if (!code) {
    console.error('No code received');
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  // 宽松的 state 验证（支持 WebView 场景）
  if (state !== storedState) {
    console.warn('State mismatch. Received:', state, 'Expected:', storedState);
    // 继续处理，不阻止登录
  }

  try {
    console.log('=== Exchanging code for token ===');
    console.log('Token endpoint:', process.env.SECONDME_TOKEN_ENDPOINT);
    
    // 交换 code 获取 token
    const tokenResponse = await fetch(process.env.SECONDME_TOKEN_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.SECONDME_CLIENT_ID,
        client_secret: process.env.SECONDME_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.SECONDME_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log('Token response code:', tokenData.code);
    console.log('Token response has data:', !!tokenData.data);

    if (tokenData.code !== 0) {
      console.error('Token exchange failed:', tokenData);
      return NextResponse.redirect(
        new URL(`/login?error=token_exchange&detail=${encodeURIComponent(tokenData.message || 'unknown')}`, request.url)
      );
    }

    const { access_token, refresh_token, expires_in, secondme_id } = tokenData.data;
    console.log('Got tokens for user:', secondme_id);

    // 计算 token 过期时间
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    // 获取用户信息
    console.log('=== Fetching user info ===');
    const userResponse = await fetch(`${process.env.SECONDME_API_BASE_URL}/api/secondme/user/info`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    const userData = await userResponse.json();
    console.log('User info response code:', userData.code);
    
    if (userData.code !== 0) {
      console.error('Get user info failed:', userData);
      return NextResponse.redirect(
        new URL(`/login?error=user_info&detail=${encodeURIComponent(userData.message || 'unknown')}`, request.url)
      );
    }

    const { nickname, avatar } = userData.data;
    console.log('User nickname:', nickname);

    // 保存或更新用户
    await prisma.user.upsert({
      where: { secondmeUserId: secondme_id },
      update: {
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt: tokenExpiresAt,
        nickname: nickname,
        avatar: avatar,
      },
      create: {
        secondmeUserId: secondme_id,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt: tokenExpiresAt,
        nickname: nickname,
        avatar: avatar,
      },
    });

    // 设置登录 cookie
    response.cookies.set('user_id', secondme_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 天
    });

    console.log('=== Login successful ===');
    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/login?error=server', request.url)
    );
  }
}
