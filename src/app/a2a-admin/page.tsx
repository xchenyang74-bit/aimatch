'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, RefreshCw, MessageCircle, Users, Sparkles } from 'lucide-react';

interface User {
  id: string;
  nickname: string | null;
  avatar: string | null;
  bio: string | null;
  tags: string[];
}

interface A2AConversation {
  id: string;
  userA: User;
  userB: User;
  status: 'pending' | 'running' | 'completed' | 'failed';
  compatibilityScore: number | null;
  commonTagCount: number;
  summary: string | null;
  createdAt: string;
  completedAt: string | null;
}

export default function A2AAdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<A2AConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [selectedUserA, setSelectedUserA] = useState<string>('');
  const [selectedUserB, setSelectedUserB] = useState<string>('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  // 加载用户和对话数据
  const loadData = async () => {
    try {
      const [usersRes, convRes] = await Promise.all([
        fetch('/api/a2a-admin/users'),
        fetch('/api/a2a-admin/conversations'),
      ]);

      if (usersRes.status === 401 || convRes.status === 401) {
        router.push('/login');
        return;
      }

      const usersData = await usersRes.json();
      const convData = await convRes.json();

      if (usersData.code === 0) {
        setUsers(usersData.data);
      }
      if (convData.code === 0) {
        setConversations(convData.data);
      }
    } catch (err) {
      setError('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 运行 A2A 对话
  const runA2A = async () => {
    if (!selectedUserA || !selectedUserB) {
      setError('请选择两个用户');
      return;
    }
    if (selectedUserA === selectedUserB) {
      setError('不能选择同一个用户');
      return;
    }

    setRunning(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/a2a/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAId: selectedUserA,
          userBId: selectedUserB,
        }),
      });

      const data = await res.json();

      if (data.code === 0) {
        setResult(data.data);
        loadData(); // 刷新列表
      } else {
        setError(data.error || '运行失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setRunning(false);
    }
  };

  // 运行所有未完成的匹配
  const runAllPending = async () => {
    setRunning(true);
    setError('');
    
    try {
      const res = await fetch('/api/a2a/cron', { method: 'POST' });
      const data = await res.json();
      
      if (data.code === 0) {
        setResult(data.data);
        loadData();
      } else {
        setError(data.error || '批量运行失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'running': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'running': return '进行中';
      case 'failed': return '失败';
      default: return '待处理';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 头部 */}
      <header className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">A2A 对话管理</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-800">{users.length}</div>
            <div className="text-sm text-gray-500">总用户数</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-orange-500">{conversations.length}</div>
            <div className="text-sm text-gray-500">对话记录</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-500">
              {conversations.filter(c => c.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-500">已完成</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-yellow-500">
              {conversations.filter(c => c.status === 'running').length}
            </div>
            <div className="text-sm text-gray-500">进行中</div>
          </div>
        </div>

        {/* 手动运行 A2A */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-orange-500" />
            手动运行 A2A 对话
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">选择用户 A</label>
              <select
                value={selectedUserA}
                onChange={(e) => setSelectedUserA(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              >
                <option value="">请选择...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.nickname || '匿名'} ({user.tags.length} 个标签)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">选择用户 B</label>
              <select
                value={selectedUserB}
                onChange={(e) => setSelectedUserB(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              >
                <option value="">请选择...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.nickname || '匿名'} ({user.tags.length} 个标签)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          {result && (
            <div className="mb-4 p-4 bg-green-50 rounded-lg">
              <div className="text-green-800 font-medium mb-2">✅ A2A 对话完成</div>
              <div className="text-sm text-green-700">
                <div>契合度: {result.result?.compatibilityScore}%</div>
                <div>对话轮数: {result.result?.messageCount}</div>
                <div>耗时: {result.duration}ms</div>
                <div className="mt-2 text-gray-600">{result.result?.summary}</div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={runA2A}
              disabled={running || !selectedUserA || !selectedUserB}
              className="flex-1 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {running ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              {running ? '运行中...' : '开始对话'}
            </button>
            <button
              onClick={runAllPending}
              disabled={running}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium disabled:opacity-50 hover:bg-gray-200"
            >
              批量运行
            </button>
          </div>
        </div>

        {/* 对话列表 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-orange-500" />
              对话记录
            </h2>
            <button onClick={loadData} className="p-2 hover:bg-gray-100 rounded-full">
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {conversations.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无对话记录</p>
              <p className="text-sm mt-1">选择两个用户开始第一次 A2A 对话</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conv) => (
                <div key={conv.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center text-lg">
                          {conv.userA.avatar ? (
                            <img src={conv.userA.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            '👤'
                          )}
                        </div>
                        <span className="font-medium text-gray-800">{conv.userA.nickname || '匿名'}</span>
                      </div>
                      <span className="text-gray-400">💬</span>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-lg">
                          {conv.userB.avatar ? (
                            <img src={conv.userB.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            '👤'
                          )}
                        </div>
                        <span className="font-medium text-gray-800">{conv.userB.nickname || '匿名'}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(conv.status)}`}>
                      {getStatusText(conv.status)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      {conv.commonTagCount} 个共同标签
                    </span>
                    {conv.compatibilityScore && (
                      <span className="flex items-center gap-1 text-orange-500">
                        <Sparkles className="w-4 h-4" />
                        {Math.round(conv.compatibilityScore)}% 契合度
                      </span>
                    )}
                    <span className="text-gray-400">
                      {new Date(conv.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>

                  {conv.summary && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{conv.summary}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
