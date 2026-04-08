'use client';

import { useEffect, useState, useCallback } from 'react';
import BottomNav from '@/components/BottomNav';
import { RefreshCw, Sparkles, MessageCircle, Heart, X, ChevronDown, ChevronUp, Bot, Users } from 'lucide-react';

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
  source?: 'a2a' | 'mock';
  highlights?: string[];
  analysisPros?: string[];
  analysisCons?: string[];
  conversationQuality?: {
    engagement: number;
    depth: number;
    harmony: number;
  };
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [dataSource, setDataSource] = useState<'a2a' | 'mock' | null>(null);
  const [matchAlert, setMatchAlert] = useState<{ show: boolean; nickname: string }>({ show: false, nickname: '' });

  // 加载推荐数据
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    try {
      const [recRes, matchRes] = await Promise.all([
        fetch('/api/recommendations'),
        fetch('/api/matches'),
      ]);

      if (recRes.status === 401 || matchRes.status === 401) {
        window.location.href = '/login';
        return;
      }

      const recData = await recRes.json();
      const matchData = await matchRes.json();

      if (recData.code === 0) {
        setRecommendations(recData.data);
        setDataSource(recData.source || 'mock');
        
        // 初始化可见卡片（前6个）
        if (!isRefresh) {
          setVisibleCards(recData.data.slice(0, 6).map((r: Recommendation) => r.id));
        }
      }

      if (matchData.code === 0) {
        const statusMap = new Map();
        matchData.data.forEach((status: MatchStatus) => {
          statusMap.set(status.userId, status);
        });
        setMatchStatuses(statusMap);
      }

      setError('');
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 刷新数据
  const handleRefresh = () => {
    loadData(true);
  };

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
        const newVisible = prev.filter(id => id !== targetUserId);
        const allIds = recommendations.map(r => r.id);
        const currentIndex = allIds.indexOf(targetUserId);
        const nextCardId = allIds[currentIndex + 6];
        
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
      transform: action === 'like' ? 'translateX(100px) rotate(10deg)' : 'translateX(-100px) rotate(-10deg)',
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

  // 获取匹配分数的颜色和标签
  const getScoreInfo = (score: number) => {
    if (score >= 90) return { color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: '绝配' };
    if (score >= 80) return { color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', label: '很配' };
    if (score >= 70) return { color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', label: '较配' };
    return { color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200', label: '一般' };
  };

  // 渲染对话质量条形图
  const renderQualityBar = (value: number, label: string, color: string) => (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-12 text-gray-400">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${color}`} 
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-right font-medium">{value}</span>
    </div>
  );

  const user = { nickname: '开发者' };
  const visibleRecommendations = recommendations.filter(r => visibleCards.includes(r.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white pb-20">
      {/* 匹配成功提示 */}
      {matchAlert.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-3 rounded-full shadow-lg animate-fade-in">
          <span className="font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            和 {matchAlert.nickname} 匹配成功！可以开始聊天了
          </span>
        </div>
      )}

      {/* 顶部标题 */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
              Aimatch
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">AI 先聊，你再决定</p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-full hover:bg-orange-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 欢迎语和数据来源标识 */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              你好，{user.nickname}！
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              {loading ? '正在为你寻找合适的匹配...' : `还有 ${visibleRecommendations.length} 位待查看`}
            </p>
          </div>
          {dataSource && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              dataSource === 'a2a' 
                ? 'bg-purple-50 text-purple-600 border border-purple-200' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              <Bot className="w-3.5 h-3.5" />
              {dataSource === 'a2a' ? 'AI 匹配' : '演示数据'}
            </div>
          )}
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-400"></div>
            <p className="text-gray-400 mt-4 text-sm">正在加载推荐...</p>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <div className="text-5xl mb-3">⚠️</div>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={handleRefresh}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-shadow"
            >
              重新加载
            </button>
          </div>
        )}

        {/* 推荐列表 */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visibleRecommendations.map((rec) => {
              const status = matchStatuses.get(rec.id);
              const isLiked = status?.iLiked;
              const isMatch = status?.isMatch;
              const isExpanded = expandedCard === rec.id;
              const report = conversationReports.get(rec.id);
              const isLoadingReport = loadingReports.has(rec.id);
              const scoreInfo = getScoreInfo(rec.matchScore);

              return (
                <div 
                  key={rec.id} 
                  className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 ${
                    isExpanded ? 'md:col-span-2 xl:col-span-2 ring-2 ring-orange-200' : ''
                  }`}
                  style={getCardAnimationStyle(rec.id)}
                >
                  {/* 头像区域 */}
                  <div className="aspect-[16/10] bg-gradient-to-br from-orange-100 via-pink-50 to-purple-100 flex items-center justify-center relative overflow-hidden">
                    {/* 背景装饰 */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-10 left-10 w-20 h-20 bg-orange-300 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-300 rounded-full blur-3xl"></div>
                    </div>
                    
                    {/* 头像 */}
                    <div className="relative z-10">
                      <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center text-5xl ring-4 ring-white/50">
                        {rec.avatar ? (
                          <img src={rec.avatar} alt={rec.nickname} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          '👤'
                        )}
                      </div>
                    </div>
                    
                    {/* 匹配度角标 */}
                    <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full ${scoreInfo.bg} ${scoreInfo.color} border ${scoreInfo.border} shadow-sm`}>
                      <span className="text-sm font-bold">{rec.matchScore}%</span>
                      <span className="text-xs ml-1 opacity-75">{scoreInfo.label}</span>
                    </div>
                    
                    {/* A2A 标识 */}
                    {rec.source === 'a2a' && (
                      <div className="absolute top-3 left-3 bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI 对话
                      </div>
                    )}
                    
                    {/* 对话时间 */}
                    <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                      {formatTime(rec.conversationTime)}
                    </div>
                  </div>
                  
                  {/* 信息区域 */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-800 text-lg">
                        {rec.nickname}
                      </h3>
                      {isMatch && (
                        <span className="flex items-center gap-1 text-red-500 text-sm font-medium">
                          <Heart className="w-4 h-4 fill-current" />
                          已匹配
                        </span>
                      )}
                    </div>
                    
                    {/* 推荐理由 */}
                    <div className="flex items-start gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-orange-600 line-clamp-2">
                        {rec.matchReason}
                      </p>
                    </div>
                    
                    {/* 标签 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {rec.tags.slice(0, 4).map((tag) => (
                        <span 
                          key={tag} 
                          className="px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-100"
                        >
                          {tag}
                        </span>
                      ))}
                      {rec.tags.length > 4 && (
                        <span className="px-3 py-1 bg-gray-50 text-gray-400 text-xs rounded-full">
                          +{rec.tags.length - 4}
                        </span>
                      )}
                    </div>
                    
                    {/* Agent 对话摘要 */}
                    {rec.agentConversation && (
                      <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-3 mb-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>AI 对话摘要</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {rec.agentConversation}
                        </p>
                      </div>
                    )}

                    {/* 对话质量指标（仅 A2A 数据） */}
                    {rec.conversationQuality && (
                      <div className="mb-4 space-y-2">
                        {renderQualityBar(rec.conversationQuality.engagement, '互动', 'bg-purple-400')}
                        {renderQualityBar(rec.conversationQuality.depth, '深度', 'bg-blue-400')}
                        {renderQualityBar(rec.conversationQuality.harmony, '和谐', 'bg-green-400')}
                      </div>
                    )}

                    {/* 查看对话分析按钮 */}
                    <button
                      onClick={(e) => toggleExpand(rec.id, e)}
                      className="w-full py-2.5 mb-4 bg-white border border-orange-200 text-orange-600 rounded-xl text-sm font-medium hover:bg-orange-50 transition-colors flex items-center justify-center gap-1"
                    >
                      {isLoadingReport ? (
                        <>
                          <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                          加载中...
                        </>
                      ) : isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          收起分析
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          查看对话分析
                        </>
                      )}
                    </button>

                    {/* 展开的对话报告 */}
                    {isExpanded && (
                      <div className="border-t border-orange-100 pt-4 mb-4">
                        {report ? (
                          <div className="space-y-4">
                            {/* 统计 */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-gray-50 rounded-xl p-3 text-center">
                                <div className="text-gray-400 text-xs mb-1">对话时长</div>
                                <div className="font-bold text-gray-700">{report.duration}</div>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-3 text-center">
                                <div className="text-gray-400 text-xs mb-1">消息数量</div>
                                <div className="font-bold text-gray-700">{report.messageCount}</div>
                              </div>
                            </div>

                            {/* 优点 */}
                            {report.analysis.pros.length > 0 && (
                              <div className="bg-green-50 rounded-xl p-3">
                                <div className="text-green-600 text-xs font-medium mb-2 flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  契合点
                                </div>
                                <ul className="space-y-1">
                                  {report.analysis.pros.map((pro, idx) => (
                                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                      <span className="text-green-500 mt-0.5">+</span>
                                      {pro}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* 精彩对话 */}
                            {report.highlights.length > 0 && (
                              <div className="bg-orange-50 rounded-xl p-3">
                                <div className="text-orange-600 text-xs font-medium mb-2">💬 精彩对话</div>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {report.highlights.slice(0, 3).map((msg, idx) => (
                                    <div key={idx} className="text-sm text-gray-600 bg-white rounded-lg p-2">
                                      <span className="text-orange-500 font-medium">{msg.speaker}:</span>
                                      <span className="ml-1">{msg.content.slice(0, 60)}...</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-sm text-gray-400 py-4">
                            暂无详细对话报告
                          </div>
                        )}
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex gap-3">
                      {isMatch ? (
                        <button
                          onClick={() => window.location.href = `/chat/${rec.id}`}
                          className="flex-1 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          发消息
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAction(rec.id, 'like', rec.nickname)}
                            disabled={isLiked}
                            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                              isLiked 
                                ? 'bg-red-100 text-red-500' 
                                : 'bg-gradient-to-r from-red-400 to-pink-400 text-white hover:shadow-lg'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                            {isLiked ? '已喜欢' : '喜欢'}
                          </button>
                          <button
                            onClick={() => handleAction(rec.id, 'dislike', rec.nickname)}
                            className="flex-1 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                          >
                            <X className="w-4 h-4" />
                            跳过
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
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">今天的推荐已看完</h3>
            <p className="text-gray-500 mb-6">明天会有新的匹配推荐给你</p>
            <button 
              onClick={handleRefresh}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-shadow"
            >
              刷新看看
            </button>
          </div>
        )}

        {/* 加载更多 */}
        {!loading && !error && visibleRecommendations.length > 0 && visibleRecommendations.length < recommendations.length && (
          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                const currentLen = visibleCards.length;
                const newCards = recommendations.slice(currentLen, currentLen + 3).map(r => r.id);
                setVisibleCards(prev => [...prev, ...newCards]);
              }}
              className="px-8 py-3 bg-white border border-gray-200 rounded-full text-gray-600 text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
            >
              加载更多 ({recommendations.length - visibleRecommendations.length})
            </button>
          </div>
        )}
      </main>

      {/* 底部导航 */}
      <BottomNav />
    </div>
  );
}
