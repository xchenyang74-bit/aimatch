'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

interface ProfileData {
  id: string;
  nickname: string;
  bio: string;
  avatar: string | null;
  tags: string[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data.code === 0) {
          setProfile(data.data);
        }
        setLoading(false);
      })
      .catch((err: any) => {
        console.error('Failed to load profile:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
        <BottomNav />
      </div>
    );
  }

  const user = profile || {
    nickname: '开发者',
    bio: '热爱摄影和旅行',
    avatar: null,
    tags: ['摄影', '旅行'],
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部标题 */}
      <header className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">我的</h1>
          <Link
            href="/profile/edit"
            className="text-orange-500 text-sm font-medium"
          >
            编辑资料
          </Link>
        </div>
      </header>

      {/* 用户信息卡片 */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-300 to-pink-300 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                user.nickname?.[0] || '?'
              )}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-800">{user.nickname}</h2>
              <p className="text-gray-500 text-sm mt-1">点击编辑资料完善信息</p>
            </div>
          </div>

          {/* 简介 */}
          {user.bio && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">个人简介</h3>
              <p className="text-gray-700">{user.bio}</p>
            </div>
          )}

          {/* 标签 */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">兴趣标签</h3>
            <div className="flex flex-wrap gap-2">
              {user.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-orange-50 text-orange-600 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 数据统计 */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-800">12</div>
              <div className="text-sm text-gray-500">推荐</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">5</div>
              <div className="text-sm text-gray-500">匹配</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">3</div>
              <div className="text-sm text-gray-500">聊天</div>
            </div>
          </div>
        </div>

        {/* 菜单项 */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
            <span className="text-gray-700">匹配设置</span>
            <span className="text-gray-400">→</span>
          </div>
          <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
            <span className="text-gray-700">隐私设置</span>
            <span className="text-gray-400">→</span>
          </div>
          <div className="px-4 py-4 flex items-center justify-between">
            <span className="text-gray-700">关于 Aimatch</span>
            <span className="text-gray-400">→</span>
          </div>
        </div>

        {/* 退出登录 */}
        <button className="mt-6 w-full py-3 bg-white rounded-2xl shadow-sm text-red-500 font-medium hover:bg-red-50 transition-colors">
          退出登录
        </button>
      </main>

      {/* 底部导航 */}
      <BottomNav />
    </div>
  );
}
