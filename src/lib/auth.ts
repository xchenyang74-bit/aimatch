import { cookies } from 'next/headers';
import { prisma } from './prisma';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { secondmeUserId: userId },
  });

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  // 检查 token 是否过期，如果过期则刷新
  if (new Date() >= user.tokenExpiresAt) {
    try {
      const response = await fetch(process.env.SECONDME_REFRESH_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.SECONDME_CLIENT_ID,
          client_secret: process.env.SECONDME_CLIENT_SECRET,
          refresh_token: user.refreshToken,
        }),
      });

      const data = await response.json();

      if (data.code === 0) {
        const { access_token, refresh_token, expires_in } = data.data;
        const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            accessToken: access_token,
            refreshToken: refresh_token,
            tokenExpiresAt: tokenExpiresAt,
          },
        });

        return {
          ...user,
          accessToken: access_token,
          refreshToken: refresh_token,
          tokenExpiresAt: tokenExpiresAt,
        };
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  }

  return user;
}
