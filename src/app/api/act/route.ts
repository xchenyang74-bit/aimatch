import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { message, actionControl } = await request.json();
    
    if (!message || !actionControl) {
      return NextResponse.json(
        { code: -1, message: 'Message and actionControl are required' },
        { status: 400 }
      );
    }

    // 调用 SecondMe Act API（结构化动作判断）
    const response = await fetch(`${process.env.SECONDME_API_BASE_URL}/api/secondme/act`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify({
        message,
        actionControl,
      }),
    });

    // 流式响应直接透传
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Act error:', error);
    return NextResponse.json(
      { code: -1, message: 'Unauthorized' },
      { status: 401 }
    );
  }
}
