import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { message, sessionId } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { code: -1, message: 'Message is required' },
        { status: 400 }
      );
    }

    // 调用 SecondMe Chat API
    const response = await fetch(`${process.env.SECONDME_API_BASE_URL}/api/secondme/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
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
    console.error('Chat error:', error);
    return NextResponse.json(
      { code: -1, message: 'Unauthorized' },
      { status: 401 }
    );
  }
}
