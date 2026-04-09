'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// 动态导入客户端组件，禁用 SSR
const LoginContent = dynamic(() => import('./LoginContent'), { 
  ssr: false,
  loading: () => <LoginSkeleton />
});

// 骨架屏
function LoginSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-4">
      <div className="w-full max-w-md bg-white/90 rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-200 to-pink-200 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-32 mx-auto mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse" />
        </div>
        <div className="space-y-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-14 bg-gradient-to-r from-orange-200 to-pink-200 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}
