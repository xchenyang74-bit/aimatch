/**
 * 调试 API - 测试 SecondMe API 连接
 * GET /api/debug/secondme?code=xxx
 */

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return Response.json({
      code: 400,
      error: 'Missing code parameter',
    });
  }
  
  const results: any = {
    env: {
      SECONDME_CLIENT_ID: process.env.SECONDME_CLIENT_ID ? '✅ 已设置' : '❌ 未设置',
      SECONDME_CLIENT_SECRET: process.env.SECONDME_CLIENT_SECRET ? '✅ 已设置' : '❌ 未设置',
      SECONDME_REDIRECT_URI: process.env.SECONDME_REDIRECT_URI,
      SECONDME_TOKEN_ENDPOINT: process.env.SECONDME_TOKEN_ENDPOINT,
      SECONDME_API_BASE_URL: process.env.SECONDME_API_BASE_URL,
    },
    steps: [],
  };
  
  try {
    // Step 1: Exchange code for token
    results.steps.push({ step: '1. Exchange code for token', status: 'running' });
    
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
    results.steps[0].status = tokenResponse.ok ? 'success' : 'failed';
    results.steps[0].httpStatus = tokenResponse.status;
    results.steps[0].response = tokenData;
    
    if (!tokenResponse.ok || (tokenData.code !== undefined && tokenData.code !== 0)) {
      results.error = 'Token exchange failed';
      return Response.json(results);
    }
    
    const tokenResponseData = tokenData.data || tokenData;
    const access_token = tokenResponseData.access_token || tokenResponseData.accessToken;
    
    if (!access_token) {
      results.error = 'No access_token in response';
      return Response.json(results);
    }
    
    // Step 2: Get user info
    results.steps.push({ step: '2. Get user info', status: 'running' });
    
    const userInfoUrl = `${process.env.SECONDME_API_BASE_URL}/api/secondme/user/info`;
    results.steps[1].url = userInfoUrl;
    
    const userResponse = await fetch(userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });
    
    const userText = await userResponse.text();
    results.steps[1].status = userResponse.ok ? 'success' : 'failed';
    results.steps[1].httpStatus = userResponse.status;
    results.steps[1].rawResponse = userText;
    
    try {
      const userData = JSON.parse(userText);
      results.steps[1].parsedResponse = userData;
    } catch (e) {
      results.steps[1].parseError = 'Failed to parse JSON';
    }
    
    // Step 3: Try alternative endpoint
    results.steps.push({ step: '3. Try alternative user endpoint', status: 'running' });
    
    const altUserUrl = `${process.env.SECONDME_API_BASE_URL}/api/users/me`;
    results.steps[2].url = altUserUrl;
    
    const altResponse = await fetch(altUserUrl, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });
    
    const altText = await altResponse.text();
    results.steps[2].status = altResponse.ok ? 'success' : 'failed';
    results.steps[2].httpStatus = altResponse.status;
    results.steps[2].rawResponse = altText;
    
    try {
      const altData = JSON.parse(altText);
      results.steps[2].parsedResponse = altData;
    } catch (e) {
      results.steps[2].parseError = 'Failed to parse JSON';
    }
    
    return Response.json(results);
    
  } catch (error) {
    results.error = error instanceof Error ? error.message : 'Unknown error';
    return Response.json(results);
  }
}
