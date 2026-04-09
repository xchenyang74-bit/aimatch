import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 公开路由（不需要登录）
  if (pathname.startsWith('/api/auth') || pathname === '/login') {
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
