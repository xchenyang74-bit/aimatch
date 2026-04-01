'use client';

import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';

interface Recommendation {
  id: string;
  nickname: string;
  bio: string;
  avatar: string | null;
  tags: string[];
  matchScore: number;
  matchReason: string;
  agentConversation: string;
  conversationTime: string;
}

interface MatchStatus {
  userId: string;
  iLiked: boolean;
  theyLiked: boolean;
  isMatch: boolean;
}

interface AgentConversationReport {
  duration: string;
  messageCount: number;
  compatibilityProgress: number[];
  highlights: { speaker: string; content: string }[];
  analysis: {
    pros: string[];
    cons: string[];
  };
}

type CardAction = 'like' | 'dislike' | null;

export default function DashboardPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [visibleCards, setVisibleCards] = useState<string[]>([]);
  const [cardActions, setCardActions] = useState<Map<string, CardAction>>(new Map());
  const [matchStatuses, setMatchStatuses] = useState<Map<string, MatchStatus>>(new Map());
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [conversationReports, setConversationReports] = useState<Map<string, AgentConversationReport>>(new Map());
  const [loadingReports, setLoadingReports] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matchAlert, setMatchAlert] = useState<{ show: boolean; nickname: string }>({ show: false, nickname: '' });
  const [debugInfo, setDebugInfo] = useState<string>('');

  // 加载推荐数据和匹配状态
  useEffect(() => {
    Promise.all([
      fetch('/api/recommendations'),
      fetch('/api/matches'),
    ])
      .then(async ([recRes, matchRes]) => {
        // 检查是否未登录
        if (recRes.status === 401 || matchRes.status === 401) {
          console.log('Unauthorized, redirecting to login');
          window.location.href = '/login';
          return;
        }
        
        console.log('API responses:', { recStatus: recRes.status, matchStatus: matchRes.status });
        
        const recData = await recRes.json();
        const matchData = await matchRes.json();
        
        console.log('API data:', { recData, matchData });
        const newVisibleCards = recData.data.slice(0, 6).map((r: Recommendation) => r.id);
        setVisibleCards(newVisibleCards);
        setDebugInfo(`推荐: ${recData.data?.length || 0}条, 可见: ${newVisibleCards.length}张`);

        if (recData.code === 0) {
          setRecommendations(recData.data);
          const newVisible = recData.data.slice(0, 6).map((r: Recommendation) => r.id);
          setVisibleCards(newVisible);
          setDebugInfo(`推荐: ${recData.data.length}条, code: ${recData.code}, visible: ${newVisible.length}`);
        } else {
          setDebugInfo(`推荐code: ${recData.code}, message: ${recData.message}`);
        }

        if (matchData.code === 0) {
          const statusMap = new Map();
          matchData.data.forEach((status: MatchStatus) => {
            statusMap.set(status.userId, status);
          });
          setMatchStatuses(statusMap);
        }

        setLoading(false);
        setDebugInfo((prev: string) => prev + ', loading=false');
      })
      .catch((err: any) => {
        console.error('Failed to load data:', err);
        setError('网络错误，请重试');
        setLoading(false);
        setDebugInfo((prev: string) => prev + ', loading=false');
      });
  }, []);

  // 加载 Agent 对话报告
  const loadConversationReport = async (userId: string) => {
    if (conversationReports.has(userId)) {
      setExpandedCard(userId);
      return;
    }

    setLoadingReports(prev => new Set(prev).add(userId));
    
    try {
      const response = await fetch(`/api/agent-conversations?userId=${userId}`);
      const data = await response.json();
      
      if (data.code === 0) {
        setConversationReports(prev => new Map(prev).set(userId, data.data));
        setExpandedCard(userId);
      }
    } catch (err: any) {
      console.error('Failed to load conversation:', err);
    } finally {
      setLoadingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  // 切换展开/折叠
  const toggleExpand = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (expandedCard === userId) {
      setExpandedCard(null);
    } else {
      loadConversationReport(userId);
    }
  };

  // 处理喜欢/不喜欢
  const handleAction = async (targetUserId: string, action: 'like' | 'dislike', nickname: string) => {
    setCardActions(prev => {
      const newMap = new Map(prev);
      newMap.set(targetUserId, action);
      return newMap;
    });

    setTimeout(() => {
      setVisibleCards(prev => {
        const currentIndex = prev.indexOf(targetUserId);
        const newVisible = prev.filter(id => id !== targetUserId);
        
        const allIds = recommendations.map(r => r.id);
        const currentVisibleIndex = allIds.indexOf(targetUserId);
        const nextCardId = allIds[currentVisibleIndex + 6];
        
        if (nextCardId && !newVisible.includes(nextCardId)) {
          newVisible.push(nextCardId);
        }
        
        return newVisible;
      });

      setCardActions(prev => {
        const newMap = new Map(prev);
        newMap.delete(targetUserId);
        return newMap;
      });
      
      if (expandedCard === targetUserId) {
        setExpandedCard(null);
      }
    }, 300);

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, action }),
      });

      const data = await response.json();

      if (data.code === 0) {
        setMatchStatuses(prev => {
          const newMap = new Map(prev);
          if (action === 'like') {
            newMap.set(targetUserId, {
              userId: targetUserId,
              iLiked: true,
              theyLiked: data.data.isMatch,
              isMatch: data.data.isMatch,
            });
            
            if (data.data.isMatch) {
              setMatchAlert({ show: true, nickname });
              setTimeout(() => setMatchAlert({ show: false, nickname: '' }), 3000);
            }
          } else {
            newMap.set(targetUserId, {
              userId: targetUserId,
              iLiked: false,
              theyLiked: false,
              isMatch: false,
            });
          }
          return newMap;
        });
      }
    } catch (err: any) {
      console.error('Action failed:', err);
    }
  };

  // 获取卡片的动画样式
  const getCardAnimationStyle = (userId: string) => {
    const action = cardActions.get(userId);
    if (!action) return {};
    
    return {
      opacity: 0,
      transform: 'scale(0.8)',
      transition: 'all 0.3s ease-out',
    };
  };

  // 格式化时间
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    return `${days}天前`;
  };

  // 获取匹配分数的颜色
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-red-500 bg-red-50';
    if (score >= 80) return 'text-orange-500 bg-orange-50';
    if (score >= 70) return 'text-yellow-500 bg-yellow-50';
    return 'text-green-500 bg-green-50';
  };

  const user = { nickname: '开发者' };
  const visibleRecommendations = recommendations.filter(r => visibleCards.includes(r.id));
  
  // 调试：检查过滤结果
  const debugFilter = `过滤前: ${recommendations.length}, 过滤后: ${visibleRecommendations.length}, visibleCards: [${visibleCards.join(',')}]`;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 匹配成功提示 */}
      {matchAlert.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-3 rounded-full shadow-lg animate-fade-in">
          <span className="font-medium">🎉 和 {matchAlert.nickname} 匹配成功！可以开始聊天了</span>
        </div>
      )}

      {/* 顶部标题 */}
      <header className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
            Aimatch
          </h1>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 欢迎语 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            你好，{user.nickname}！
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            {loading ? '正在为你寻找合适的匹配...' : `还有 ${visibleRecommendations.length} 位待查看`}
          </p>
          {/* 调试信息 */}
          {debugInfo && (
            <p className="text-xs text-blue-500 mt-1">调试: {debugInfo}</p>
          )}
          <p className="text-xs text-green-500 mt-1">{debugFilter}</p>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-400"></div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-gray-500">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm"
            >
              重新加载
            </button>
          </div>
        )}

        {/* 推荐列表 - 大卡片布局（一排2-3个） */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleRecommendations.map((rec) => {
              const status = matchStatuses.get(rec.id);
              const isLiked = status?.iLiked;
              const isMatch = status?.isMatch;
              const isExpanded = expandedCard === rec.id;
              const report = conversationReports.get(rec.id);
              const isLoadingReport = loadingReports.has(rec.id);

              return (
                <div 
                  key={rec.id} 
                  className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${isExpanded ? 'ring-2 ring-orange-200 sm:col-span-2 md:col-span-2' : ''}`}
                  style={getCardAnimationStyle(rec.id)}
                >
                  {/* 头像区域 */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center relative overflow-hidden">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white shadow-md flex items-center justify-center text-4xl sm:text-5xl transition-transform group-hover:scale-110">
                      👤
                    </div>
                    {/* 匹配度角标 */}
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full ${getScoreColor(rec.matchScore)}`}>
                      <span className="text-xs font-bold">{rec.matchScore}%</span>
                    </div>
                    {/* Agent 对话时间 */}
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                      {formatTime(rec.conversationTime)}
                    </div>
                  </div>
                  
                  {/* 信息区域 */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 text-lg truncate">
                        {rec.nickname}
                      </h3>
                      {isMatch && (
                        <span className="text-red-500 text-xs">❤️</span>
                      )}
                    </div>
                    
                    {/* 推荐理由 */}
                    <p className="text-sm text-orange-600 mb-3 line-clamp-1">
                      {rec.matchReason}
                    </p>
                    
                    {/* 标签 */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {rec.tags.slice(0, 3).map((tag) => (
                        <span 
                          key={tag} 
                          className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {rec.tags.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-400 text-sm rounded-full">
                          +{rec.tags.length - 3}
                        </span>
                      )}
                    </div>
                    
                    {/* Agent 对话摘要 */}
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      Agent: {rec.agentConversation}
                    </p>

                    {/* 查看对话分析按钮 */}
                    <button
                      onClick={(e) => toggleExpand(rec.id, e)}
                      className="w-full py-2.5 mb-4 bg-orange-50 text-orange-600 rounded-xl text-sm font-medium hover:bg-orange-100 transition-colors flex items-center justify-center"
                    >
                      {isExpanded ? (
                        <>
                          <span className="mr-1">▲</span> 收起分析
                        </>
                      ) : (
                        <>
                          <span className="mr-1">▼</span> 查看对话分析
                        </>
                      )}
                    </button>

                    {/* 展开的对话报告 */}
                    {isExpanded && (
                      <div className="border-t border-orange-100 pt-4 mb-4">
                        {isLoadingReport ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-400 mx-auto"></div>
                            <p className="text-sm text-gray-400 mt-2">加载中...</p>
                          </div>
                        ) : report ? (
                          <div className="space-y-4">
                            {/* 统计 */}
                            <div className="flex space-x-3 text-sm">
                              <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
                                <div className="text-gray-400 mb-1">时长</div>
                                <div className="font-semibold text-gray-700 text-lg">{report.duration}</div>
                              </div>
                              <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
                                <div className="text-gray-400 mb-1">消息</div>
                                <div className="font-semibold text-gray-700 text-lg">{report.messageCount}</div>
                              </div>
                            </div>

                            {/* 好感度 */}
                            <div>
                              <div className="text-sm text-gray-400 mb-2">好感度变化</div>
                              <div className="flex items-end space-x-2 h-12">
                                {report.compatibilityProgress.map((score, idx) => (
                                  <div key={idx} className="flex-1 flex flex-col items-center">
                                    <div className="text-sm text-orange-500 mb-1">{score}</div>
                                    <div 
                                      className="w-full bg-orange-200 rounded-md"
                                      style={{ height: `${score * 0.4}px` }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* 精彩对话 */}
                            <div className="bg-gray-50 rounded-xl p-3">
                              <div className="text-sm text-gray-500 mb-2">💬 精彩对话</div>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {report.highlights.slice(0, 3).map((msg, idx) => (
                                  <div key={idx} className="text-sm">
                                    <span className="text-orange-600 font-medium">{msg.speaker}:</span>
                                    <span className="text-gray-600 ml-1">{msg.content.slice(0, 40)}...</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-xs text-gray-400 py-2">
                            加载失败
                          </div>
                        )}
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex space-x-3">
                      {isMatch ? (
                        <button
                          onClick={() => window.location.href = `/chat/${rec.id}`}
                          className="flex-1 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-xl text-sm font-medium"
                        >
                          发消息
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAction(rec.id, 'like', rec.nickname)}
                            disabled={isLiked}
                            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                              isLiked 
                                ? 'bg-red-100 text-red-500' 
                                : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                            }`}
                          >
                            {isLiked ? '已喜欢' : '❤️ 喜欢'}
                          </button>
                          <button
                            onClick={() => handleAction(rec.id, 'dislike', rec.nickname)}
                            className="flex-1 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors"
                          >
                            ✕ 跳过
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 没有更多卡片 */}
        {!loading && !error && visibleRecommendations.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">今天的推荐已看完</h3>
            <p className="text-gray-500 text-sm mb-4">明天会有新的匹配推荐给你</p>
          </div>
        )}

        {/* 加载更多 */}
        {!loading && !error && visibleRecommendations.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400 mb-2">
              还有 {recommendations.length - visibleCards.length} 位匹配对象
            </p>
            <button 
              onClick={() => {
                const currentLen = visibleCards.length;
                const newCards = recommendations.slice(currentLen, currentLen + 5).map(r => r.id);
                setVisibleCards(prev => [...prev, ...newCards]);
              }}
              className="px-6 py-2.5 bg-white rounded-full text-gray-600 text-sm shadow-sm hover:shadow-md transition-shadow"
            >
              加载更多
            </button>
          </div>
        )}
      </main>

      {/* 底部导航 */}
      <BottomNav />
    </div>
  );
}
