/**
 * 调试版 OAuth 回调 - 显示完整的 SecondMe 响应
 * GET /api/auth/callback-debug?code=xxx
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }
  
  const result: any = {
    timestamp: new Date().toISOString(),
    env: {
      SECONDME_TOKEN_ENDPOINT: process.env.SECONDME_TOKEN_ENDPOINT,
      SECONDME_API_BASE_URL: process.env.SECONDME_API_BASE_URL,
    },
    steps: [],
  };
  
  try {
    // Step 1: Exchange code for token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.SECONDME_CLIENT_ID!,
      client_secret: process.env.SECONDME_CLIENT_SECRET!,
      code: code,
      redirect_uri: process.env.SECONDME_REDIRECT_URI!,
    });
    
    const tokenResponse = await fetch(process.env.SECONDME_TOKEN_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    });
    
    const tokenData = await tokenResponse.json();
    
    result.steps.push({
      step: 'Token Exchange',
      status: tokenResponse.ok ? 'success' : 'failed',
      httpStatus: tokenResponse.status,
      fullResponse: tokenData,
    });
    
    if (!tokenResponse.ok) {
      return NextResponse.json(result);
    }
    
    // 分析用户ID字段
    const responseData = tokenData.data || tokenData;
    result.userIdAnalysis = {
      secondme_id: responseData.secondme_id,
      user_id: responseData.user_id,
      userId: responseData.userId,
      id: responseData.id,
      sub: responseData.sub,
      'user.id': responseData.user?.id,
      'user?.userId': responseData.user?.userId,
      'profile?.id': responseData.profile?.id,
      'profile?.userId': responseData.profile?.userId,
      allKeys: Object.keys(responseData),
    };
    
    // 如果有 access_token，尝试获取用户信息
    const access_token = responseData.access_token || responseData.accessToken;
    if (access_token) {
      const userResponse = await fetch(`${process.env.SECONDME_API_BASE_URL}/api/secondme/user/info`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });
      
      const userText = await userResponse.text();
      
      result.steps.push({
        step: 'User Info',
        status: userResponse.ok ? 'success' : 'failed',
        httpStatus: userResponse.status,
        rawResponse: userText,
        parsedResponse: userResponse.ok ? JSON.parse(userText) : null,
      });
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(result, { status: 500 });
  }
}
