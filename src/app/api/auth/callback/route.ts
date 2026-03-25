import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  console.log('=== OAuth Callback Debug ===');
  console.log('Full URL:', request.url);
  console.log('code:', code ? code.substring(0, 20) + '...' : '不存在');
  console.log('state:', state);
  console.log('error:', error);
  console.log('error_description:', errorDescription);
  
  // 如果获取用户信息失败，记录调试信息
  const debugInfo = {
    url: request.url,
    code: code ? code.substring(0, 20) + '...' : null,
    state,
    error,
    errorDescription,
  };

  // 获取存储的 state
  const cookieStore = request.cookies;
  const storedState = cookieStore.get('oauth_state')?.value;
  console.log('storedState:', storedState ? '存在' : '不存在');

  // 处理 SecondMe 返回的错误
  if (error) {
    console.error('SecondMe OAuth error:', error, errorDescription);
    const errorResponse = NextResponse.redirect(
      new URL(`/login?error=oauth&detail=${encodeURIComponent(error)}`, request.url)
    );
    errorResponse.cookies.delete('oauth_state');
    return errorResponse;
  }

  // 验证参数
  if (!code) {
    console.error('No code received');
    const errorResponse = NextResponse.redirect(
      new URL('/login?error=no_code', request.url)
    );
    errorResponse.cookies.delete('oauth_state');
    return errorResponse;
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
    // 注意：SecondMe 需要使用 application/x-www-form-urlencoded 格式
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.SECONDME_CLIENT_ID!,
      client_secret: process.env.SECONDME_CLIENT_SECRET!,
      code: code,
      redirect_uri: process.env.SECONDME_REDIRECT_URI!,
    });
    
    console.log('Token endpoint:', process.env.SECONDME_TOKEN_ENDPOINT);
    console.log('Request params:', {
      grant_type: 'authorization_code',
      client_id: process.env.SECONDME_CLIENT_ID?.slice(0, 10) + '...',
      client_secret: process.env.SECONDME_CLIENT_SECRET ? '已设置' : '未设置',
      code: code.slice(0, 10) + '...',
      redirect_uri: process.env.SECONDME_REDIRECT_URI,
    });
    
    const tokenResponse = await fetch(process.env.SECONDME_TOKEN_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    });
    
    console.log('Token response status:', tokenResponse.status);

    // 检查 HTTP 状态码
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token HTTP error:', tokenResponse.status, errorText);
      const errorResponse = NextResponse.redirect(
        new URL(`/login?error=token_exchange&detail=http_${tokenResponse.status}`, request.url)
      );
      errorResponse.cookies.delete('oauth_state');
      return errorResponse;
    }

    const tokenData = await tokenResponse.json();
    console.log('Token response code:', tokenData.code);
    console.log('Token response has data:', !!tokenData.data);
    console.log('Token response full:', JSON.stringify(tokenData, null, 2));
    
    // 详细记录所有可能的用户ID字段
    const responseData = tokenData.data || tokenData;
    console.log('Possible user ID fields:', {
      secondme_id: responseData.secondme_id,
      user_id: responseData.user_id,
      userId: responseData.userId,
      id: responseData.id,
      sub: responseData.sub,
      'user.id': responseData.user?.id,
      'profile.id': responseData.profile?.id,
    });

    if (tokenData.code !== 0) {
      console.error('Token exchange failed:', JSON.stringify(tokenData, null, 2));
      const errorResponse = NextResponse.redirect(
        new URL(`/login?error=token_exchange&detail=${encodeURIComponent(tokenData.message || tokenData.error || 'unknown')}`, request.url)
      );
      errorResponse.cookies.delete('oauth_state');
      return errorResponse;
    }

    // 兼容不同的字段名
    const tokenResponseData = tokenData.data || tokenData;
    const access_token = tokenResponseData.access_token || tokenResponseData.accessToken;
    const refresh_token = tokenResponseData.refresh_token || tokenResponseData.refreshToken;
    const expires_in = tokenResponseData.expires_in || tokenResponseData.expiresIn || 7200;
    
    // 尝试所有可能的用户ID字段名
    const secondme_id = tokenResponseData.secondme_id 
      || tokenResponseData.user_id 
      || tokenResponseData.userId 
      || tokenResponseData.id
      || tokenResponseData.sub
      || tokenResponseData.user?.id
      || tokenResponseData.profile?.id;
    
    console.log('Got tokens for user:', secondme_id);
    console.log('Full token response data:', JSON.stringify(tokenResponseData, null, 2));
    console.log('Token fields:', {
      has_access_token: !!access_token,
      has_refresh_token: !!refresh_token,
      expires_in,
      secondme_id,
    });
    
    // 检查必需字段
    if (!access_token) {
      console.error('Missing access_token in response:', tokenData);
      const errorResponse = NextResponse.redirect(
        new URL(`/login?error=token_exchange&detail=missing_access_token`, request.url)
      );
      errorResponse.cookies.delete('oauth_state');
      return errorResponse;
    }
    
    // 计算 token 过期时间
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    // 获取用户信息（必需，因为 token 可能没有 user_id）
    console.log('=== Fetching user info ===');
    let nickname = '用户';
    let avatar = null;
    let userIdFromProfile = null;
    
    try {
      const userInfoUrl = `${process.env.SECONDME_API_BASE_URL}/api/secondme/user/info`;
      console.log('User info URL:', userInfoUrl);
      
      const userResponse = await fetch(userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });
      
      console.log('User info response status:', userResponse.status);
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('User info response:', JSON.stringify(userData, null, 2));
        
        const responseData = userData.data || userData;
        nickname = responseData.nickname || responseData.name || responseData.username || '用户';
        avatar = responseData.avatar || responseData.avatarUrl || null;
        
        // 从用户信息中获取用户ID
        userIdFromProfile = responseData.id 
          || responseData.user_id 
          || responseData.userId 
          || responseData.secondme_id;
        console.log('Got userId from profile:', userIdFromProfile);
      } else {
        const errorText = await userResponse.text();
        console.error('User info failed:', userResponse.status, errorText);
      }
    } catch (userInfoError) {
      console.error('User info fetch error:', userInfoError);
    }
    
    // 使用 token 中的 id 或用户信息中的 id
    const finalSecondmeId = secondme_id || userIdFromProfile;
    
    if (!finalSecondmeId) {
      console.error('No user ID found in token or profile');
      const errorResponse = NextResponse.redirect(
        new URL(`/login?error=token_exchange&detail=no_user_id_found`, request.url)
      );
      errorResponse.cookies.delete('oauth_state');
      return errorResponse;
    }
    
    console.log('Final secondme_id:', finalSecondmeId);
    
    console.log('User nickname:', nickname);

    // 数据库操作（带容错）
    let userId = finalSecondmeId;
    
    try {
      // 先查询用户是否存在
      const existingUser = await prisma.user.findUnique({
        where: { secondmeUserId: finalSecondmeId },
      });
      const isNewUser = !existingUser;

      // 保存或更新用户
      const user = await prisma.user.upsert({
        where: { secondmeUserId: finalSecondmeId },
        update: {
          accessToken: access_token,
          refreshToken: refresh_token,
          tokenExpiresAt: tokenExpiresAt,
          nickname: nickname,
          avatar: avatar,
        },
        create: {
          secondmeUserId: finalSecondmeId,
          accessToken: access_token,
          refreshToken: refresh_token,
          tokenExpiresAt: tokenExpiresAt,
          nickname: nickname,
          avatar: avatar,
        },
      });
      
      userId = user.id;

      // 如果是新用户，异步触发 A2A 匹配
      if (isNewUser) {
        console.log('[OAuth] New user detected, triggering A2A match:', user.id);
        
        // 异步触发（不等待）
        fetch(`${request.nextUrl.origin}/api/a2a/match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        }).catch((err: Error) => {
          console.error('[OAuth] Failed to trigger A2A match:', err);
        });
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // 数据库失败时也继续登录，使用 secondme_id 作为 userId
      console.log('[OAuth] Database failed, continuing with secondme_id:', secondme_id);
    }

    // 创建成功响应（必须在设置 cookie 之前创建）
    const successResponse = NextResponse.redirect(new URL('/dashboard', request.url));
    
    // 清除 state cookie
    successResponse.cookies.delete('oauth_state');
    
    // 设置登录 cookie
    successResponse.cookies.set('user_id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 天
    });

    console.log('=== Login successful ===');
    return successResponse;
  } catch (error) {
    console.error('OAuth callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'unknown';
    console.error('Debug info:', debugInfo);
    const errorResponse = NextResponse.redirect(
      new URL(`/login?error=server&detail=${encodeURIComponent(errorMessage)}`, request.url)
    );
    errorResponse.cookies.delete('oauth_state');
    return errorResponse;
  }
}
