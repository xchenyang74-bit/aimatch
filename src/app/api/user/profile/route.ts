import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 开发模式用户 ID
const DEV_USER_ID = 'dev-user-1';

// 获取用户资料
export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      where: { id: DEV_USER_ID },
    });

    if (!user) {
      // 开发模式：返回模拟数据
      return NextResponse.json({
        code: 0,
        data: {
          id: DEV_USER_ID,
          nickname: '开发者',
          bio: '热爱摄影和旅行，喜欢用镜头记录美好瞬间',
          avatar: null,
          tags: ['摄影', '旅行', '美食', '阅读'],
        },
      });
    }

    return NextResponse.json({
      code: 0,
      data: {
        id: user.id,
        nickname: user.nickname,
        bio: user.bio,
        avatar: user.avatar,
        tags: ['摄影', '旅行', '美食', '阅读'], // 简化处理
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { code: -1, message: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

// 更新用户资料
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { nickname, bio, avatar, tags } = body;

    // 验证必填字段
    if (!nickname || nickname.trim() === '') {
      return NextResponse.json(
        { code: -1, message: '昵称不能为空' },
        { status: 400 }
      );
    }

    // 查找或创建用户
    let user = await prisma.user.findFirst({
      where: { id: DEV_USER_ID },
    });

    if (!user) {
      // 开发模式：创建模拟用户
      user = await prisma.user.create({
        data: {
          id: DEV_USER_ID,
          secondmeUserId: 'dev-secondme-id',
          accessToken: 'dev-token',
          refreshToken: 'dev-refresh',
          tokenExpiresAt: new Date(Date.now() + 86400000),
          nickname: nickname.trim(),
          bio: bio?.trim() || null,
          avatar: avatar || null,
        },
      });
    } else {
      // 更新用户资料
      user = await prisma.user.update({
        where: { id: DEV_USER_ID },
        data: {
          nickname: nickname.trim(),
          bio: bio?.trim() || null,
          avatar: avatar || null,
        },
      });
    }

    return NextResponse.json({
      code: 0,
      data: {
        id: user.id,
        nickname: user.nickname,
        bio: user.bio,
        avatar: user.avatar,
        tags: tags || ['摄影', '旅行', '美食', '阅读'],
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { code: -1, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
