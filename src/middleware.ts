import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要保护的路由
const PROTECTED_ROUTES = ['/dashboard', '/chat', '/profile'];

// 公开路由
const PUBLIC_ROUTES = ['/login', '/api/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查是否是公开路由
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // 检查是否是 API 路由
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // 检查是否需要保护
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  
  if (!isProtected) {
    return NextResponse.next();
  }
  
  // 检查登录状态
  const userId = request.cookies.get('user_id')?.value;
  
  if (!userId) {
    // 未登录，重定向到登录页
    const loginUrl = new URL('/login.html', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // 已登录，继续访问
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
