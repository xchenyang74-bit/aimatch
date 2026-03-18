import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();
    
    // 调用 SecondMe API 获取用户兴趣标签
    const response = await fetch(`${process.env.SECONDME_API_BASE_URL}/api/secondme/user/shades`, {
      headers: {
        'Authorization': `Bearer ${user.accessToken}`,
      },
    });

    const data = await response.json();
    
    if (data.code !== 0) {
      return NextResponse.json(data, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get user shades error:', error);
    return NextResponse.json(
      { code: -1, message: 'Unauthorized' },
      { status: 401 }
    );
  }
}
