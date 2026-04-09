import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 将 /login 重定向到 /api/login-page
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/api/login-page', request.url));
  }
  
  // 公开路由
  if (pathname.startsWith('/api/auth') || pathname === '/api/login-page') {
    return NextResponse.next();
  }
  
  // 需要保护的路由
  const protectedRoutes = ['/dashboard', '/chat', '/profile'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtected) {
    const userId = request.cookies.get('user_id')?.value;
    if (!userId) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
