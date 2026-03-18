import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { targetUserId, content } = await request.json();
    
    if (!targetUserId || !content) {
      return NextResponse.json(
        { code: -1, message: 'targetUserId and content are required' },
        { status: 400 }
      );
    }

    // 保存笔记到本地数据库
    const note = await prisma.note.create({
      data: {
        userId: user.id,
        targetUserId,
        content,
      },
    });

    // 可选：同步到 SecondMe
    try {
      const response = await fetch(`${process.env.SECONDME_API_BASE_URL}/api/secondme/note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          content,
          metadata: {
            aimatch_note_id: note.id,
            target_user_id: targetUserId,
          },
        }),
      });

      const data = await response.json();
      if (data.code === 0 && data.data?.note_id) {
        // 更新本地记录的 SecondMe Note ID
        await prisma.note.update({
          where: { id: note.id },
          data: { secondmeNoteId: data.data.note_id },
        });
      }
    } catch (error) {
      console.error('Sync to SecondMe failed:', error);
      // 不影响本地保存
    }

    return NextResponse.json({ code: 0, data: note });
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json(
      { code: -1, message: 'Failed to create note' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await requireAuth();
    
    const notes = await prisma.note.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ code: 0, data: notes });
  } catch (error) {
    console.error('Get notes error:', error);
    return NextResponse.json(
      { code: -1, message: 'Failed to get notes' },
      { status: 500 }
    );
  }
}
