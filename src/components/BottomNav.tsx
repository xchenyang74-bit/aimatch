'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NotificationCounts {
  unreadMessages: number;
  newMatches: number;
  total: number;
}

const navItems = [
  { icon: '🏠', label: '推荐', href: '/dashboard', hasBadge: false },
  { icon: '💬', label: '消息', href: '/chat', hasBadge: true },
  { icon: '👤', label: '我的', href: '/profile', hasBadge: false },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<NotificationCounts>({
    unreadMessages: 0,
    newMatches: 0,
    total: 0,
  });

  // 加载通知数量
  useEffect(() => {
    const loadNotifications = () => {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          if (data.code === 0) {
            setNotifications(data.data);
          }
        })
        .catch((err: Error) => {
          console.error('Failed to load notifications:', err);
        });
    };

    // 初始加载
    loadNotifications();

    // 每30秒刷新一次
    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  // 获取消息页面的红点数量
  const getMessageBadge = () => {
    if (notifications.total === 0) return null;
    if (notifications.total > 99) return '99+';
    return notifications.total.toString();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-6xl mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const badge = item.hasBadge ? getMessageBadge() : null;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                isActive ? 'text-orange-500' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="relative">
                <span className="text-xl mb-0.5">{item.icon}</span>
                {/* 红点通知 */}
                {badge && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
                    {badge}
                  </span>
                )}
              </div>
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
