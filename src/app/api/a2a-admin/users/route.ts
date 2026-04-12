import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('user_id')?.value;
    
    if (!userId) {
      return NextResponse.json({ code: -1, message: 'Unauthorized' }, { status: 401 });
    }

    // 获取所有用户（简化版，实际应该分页）
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        avatar: true,
        bio: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // 获取每个用户的标签（从 SecondMe 获取）
    const usersWithTags = await Promise.all(
      users.map(async (user) => {
        let tags: string[] = [];
        try {
          const userInfoRes = await fetch(`${process.env.SECONDME_API_BASE_URL}/api/secondme/user/info`, {
            headers: {
              'Authorization': `Bearer ${await getUserAccessToken(user.id)}`,
            },
          });
          
          if (userInfoRes.ok) {
            const userInfoData = await userInfoRes.json();
            const userInfo = userInfoData.data || userInfoData;
            tags = userInfo.shades || userInfo.tags || userInfo.interests || [];
          }
        } catch (error) {
          console.error(`Failed to fetch tags for user ${user.id}:`, error);
        }
        
        return {
          ...user,
          tags,
        };
      })
    );

    return NextResponse.json({
      code: 0,
      data: usersWithTags,
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { code: -1, message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// 辅助函数：获取用户 access token
async function getUserAccessToken(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { accessToken: true },
  });
  return user?.accessToken || '';
}
