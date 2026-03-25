/**
 * 认证中间件
 * 保护需要登录的路由
 */

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
  
  // 检查是否是 API 路由（除了特定的 auth 路由外，其他 API 也需要保护）
  if (pathname.startsWith('/api/')) {
    // API 路由的认证在各自的路由中处理
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
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // 已登录，继续访问
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
