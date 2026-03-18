import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ code: 0, message: 'Logged out' });
  
  // 清除登录 cookie
  response.cookies.delete('user_id');
  
  return response;
}
