import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'avatar';

    if (!file) {
      return NextResponse.json(
        { code: -1, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { code: -1, message: 'Invalid file type' },
        { status: 400 }
      );
    }

    // 验证文件大小
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { code: -1, message: 'File too large' },
        { status: 400 }
      );
    }

    // 读取文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 生成唯一文件名
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const ext = file.type.split('/')[1];
    const filename = `${type}_${timestamp}_${random}.${ext}`;

    // 确保上传目录存在
    const uploadDir = join(process.cwd(), 'public', 'uploads', type);
    await mkdir(uploadDir, { recursive: true });

    // 保存文件
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // 返回可访问的 URL
    const url = `/uploads/${type}/${filename}`;

    return NextResponse.json({
      code: 0,
      data: { url, filename, size: file.size },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { code: -1, message: 'Upload failed' },
      { status: 500 }
    );
  }
}
