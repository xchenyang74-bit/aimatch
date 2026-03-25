'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface ProfileData {
  nickname: string;
  bio: string;
  avatar: string | null;
  tags: string[];
}

const PRESET_TAGS = ['摄影', '旅行', '美食', '阅读', '音乐', '电影', '运动', '游戏', '绘画', '编程'];

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(null);
  const [profile, setProfile] = useState<ProfileData>({
    nickname: '',
    bio: '',
    avatar: null,
    tags: [],
  });
  const [newTag, setNewTag] = useState('');
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  // 检查是否有未保存的更改
  const hasUnsavedChanges = useCallback(() => {
    if (!originalProfile) return false;
    return (
      profile.nickname !== originalProfile.nickname ||
      profile.bio !== originalProfile.bio ||
      profile.avatar !== originalProfile.avatar ||
      JSON.stringify(profile.tags) !== JSON.stringify(originalProfile.tags)
    );
  }, [profile, originalProfile]);

  // 加载用户资料
  useEffect(() => {
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data.code === 0) {
          setProfile(data.data);
          setOriginalProfile(data.data);
        }
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error('Failed to load profile:', err);
        setLoading(false);
      });
  }, []);

  // 监听页面关闭/刷新事件
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // 处理返回按钮
  const handleBack = () => {
    if (hasUnsavedChanges()) {
      setShowUnsavedDialog(true);
    } else {
      router.back();
    }
  };

  // 确认放弃保存
  const confirmDiscard = () => {
    setShowUnsavedDialog(false);
    router.back();
  };

  // 取消放弃，继续编辑
  const cancelDiscard = () => {
    setShowUnsavedDialog(false);
  };

  // 保存资料
  const handleSave = async () => {
    if (!profile.nickname.trim()) {
      alert('昵称不能为空');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const data = await response.json();
      if (data.code === 0) {
        setOriginalProfile(profile);
        alert('保存成功！');
        router.push('/profile');
      } else {
        alert(data.message || '保存失败');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 添加标签
  const addTag = (tag: string) => {
    if (profile.tags.includes(tag)) return;
    if (profile.tags.length >= 8) {
      alert('最多添加8个标签');
      return;
    }
    setProfile(prev => ({ ...prev, tags: [...prev.tags, tag] }));
  };

  // 移除标签
  const removeTag = (tag: string) => {
    setProfile(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  // 添加自定义标签
  const handleAddCustomTag = () => {
    if (!newTag.trim()) return;
    addTag(newTag.trim());
    setNewTag('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* 未保存提示弹窗 */}
      {showUnsavedDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">确认退出？</h3>
            <p className="text-gray-600 mb-6">你有未保存的更改，确定要放弃保存并退出吗？</p>
            <div className="flex space-x-3">
              <button
                onClick={cancelDiscard}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium"
              >
                继续编辑
              </button>
              <button
                onClick={confirmDiscard}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium"
              >
                放弃保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 顶部导航 */}
      <header className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 返回
          </button>
          <h1 className="text-lg font-semibold text-gray-800">编辑资料</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-orange-500 font-medium disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </header>

      {/* 编辑表单 */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 头像 */}
        <div className="bg-white rounded-2xl p-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            头像
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-300 to-pink-300 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {profile.avatar ? (
                <img src={profile.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                profile.nickname?.[0] || '?'
              )}
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={profile.avatar || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, avatar: e.target.value }))}
                placeholder="输入头像图片URL"
                className="w-full bg-gray-100 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <p className="text-xs text-gray-400 mt-1">支持图片链接，留空使用默认头像</p>
            </div>
          </div>
        </div>

        {/* 昵称 */}
        <div className="bg-white rounded-2xl p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            昵称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={profile.nickname}
            onChange={(e) => {
              if (e.target.value.length <= 10) {
                setProfile(prev => ({ ...prev, nickname: e.target.value }));
              }
            }}
            placeholder="请输入昵称"
            maxLength={10}
            className="w-full bg-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{profile.nickname.length}/10</p>
        </div>

        {/* 个人简介 */}
        <div className="bg-white rounded-2xl p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            个人简介
          </label>
          <textarea
            value={profile.bio || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="介绍一下自己，让更多人了解你..."
            maxLength={200}
            rows={4}
            className="w-full bg-gray-100 rounded-xl py-3 px-4 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{(profile.bio || '').length}/200</p>
        </div>

        {/* 兴趣标签 */}
        <div className="bg-white rounded-2xl p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            兴趣标签 <span className="text-gray-400 font-normal">({profile.tags.length}/8)</span>
          </label>
          
          {/* 已选标签 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-orange-500 hover:text-orange-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* 添加自定义标签 */}
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
              placeholder="添加自定义标签"
              className="flex-1 bg-gray-100 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              onClick={handleAddCustomTag}
              disabled={!newTag.trim()}
              className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm disabled:opacity-50"
            >
              添加
            </button>
          </div>

          {/* 预设标签 */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 mb-2">推荐标签：</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.filter(t => !profile.tags.includes(t)).map((tag) => (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
