import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 开发模式用户 ID
const DEV_USER_ID = 'dev-user-1';

// 模拟用户池（当 A2A 数据不足时作为 fallback）
const MOCK_USERS = [
  { id: 'user-1', nickname: '小明', tags: ['摄影', '旅行', '美食'], bio: '喜欢用镜头记录生活的美好瞬间' },
  { id: 'user-2', nickname: '小红', tags: ['音乐', '电影', '阅读'], bio: '文艺青年，热爱古典音乐和文学' },
  { id: 'user-3', nickname: '阿杰', tags: ['游戏', '编程', '科技'], bio: '全栈开发者，业余游戏主播' },
  { id: 'user-4', nickname: '琳达', tags: ['摄影', '绘画', '艺术'], bio: '设计师，喜欢用画笔和相机创作' },
  { id: 'user-5', nickname: '大伟', tags: ['运动', '健身', '户外'], bio: '马拉松爱好者，周末喜欢爬山' },
  { id: 'user-6', nickname: '晓雪', tags: ['美食', '烹饪', '烘焙'], bio: '美食博主，擅长做甜点' },
];

// 计算匹配分数（fallback）
function calculateMatchScore(userTags: string[], targetTags: string[]): number {
  const commonTags = userTags.filter(tag => targetTags.includes(tag));
  const totalUniqueTags = new Set([...userTags, ...targetTags]).size;
  
  if (totalUniqueTags === 0) return 60;
  
  const baseScore = 60;
  const matchBonus = (commonTags.length / totalUniqueTags) * 40;
  const randomFactor = (Math.random() - 0.5) * 10;
  
  let score = Math.round(baseScore + matchBonus + randomFactor);
  return Math.min(98, Math.max(60, score));
}

// 生成推荐理由（fallback）
function generateMatchReason(userTags: string[], targetTags: string[]): string {
  const commonTags = userTags.filter(tag => targetTags.includes(tag));
  
  if (commonTags.length === 0) {
    return '不同的兴趣也许能带来新鲜的体验';
  }
  
  if (commonTags.length >= 3) {
    return `你们都喜欢${commonTags.slice(0, 2).join('、')}等，兴趣非常契合！`;
  }
  
  if (commonTags.length === 2) {
    return `你们都热爱${commonTags.join('和')}，有很多共同话题`;
  }
  
  return `你们都喜欢${commonTags[0]}，有共同爱好`;
}

export async function GET() {
  try {
    // 获取当前用户
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { code: 401, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = user.id;
    
    // 优先尝试从 A2A 对话结果获取推荐
    const a2aRecommendations = await prisma.a2AConversation.findMany({
      where: {
        OR: [
          { userAId: userId },
          { userBId: userId },
        ],
        status: 'completed',
      },
      include: {
        userA: {
          select: {
            id: true,
            nickname: true,
            bio: true,
            avatar: true,
          },
        },
        userB: {
          select: {
            id: true,
            nickname: true,
            bio: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        compatibilityScore: 'desc',
      },
      take: 20,
    });
    
    // 如果有 A2A 数据，使用 A2A 结果
    if (a2aRecommendations.length > 0) {
      const recommendations = a2aRecommendations.map((conv) => {
        // 确定对方用户
        const isUserA = conv.userAId === userId;
        const otherUser = isUserA ? conv.userB : conv.userA;
        
        return {
          id: otherUser.id,
          nickname: otherUser.nickname || '匿名用户',
          bio: otherUser.bio || '暂无简介',
          avatar: otherUser.avatar,
          tags: conv.commonTags,
          matchScore: Math.round(conv.compatibilityScore || 75),
          matchReason: conv.summary || 'AI 分身们聊得很愉快',
          agentConversation: conv.summary || '你们的 AI 分身进行了愉快的交流',
          conversationTime: conv.completedAt?.toISOString() || new Date().toISOString(),
          // 额外信息（用于展示对话报告）
          hasA2AReport: true,
          highlights: conv.highlights || [],
          analysisPros: conv.analysisPros || [],
          analysisCons: conv.analysisCons || [],
          conversationQuality: conv.conversationQuality,
        };
      });
      
      return NextResponse.json({
        code: 0,
        data: recommendations,
        source: 'a2a',
      });
    }
    
    // Fallback：使用模拟数据
    console.log('[Recommendations] No A2A data, using mock data');
    
    const userTags = ['摄影', '旅行', '美食', '阅读'];
    
    const recommendations = MOCK_USERS.map((mockUser) => {
      const matchScore = calculateMatchScore(userTags, mockUser.tags);
      const matchReason = generateMatchReason(userTags, mockUser.tags);
      
      return {
        id: mockUser.id,
        nickname: mockUser.nickname,
        bio: mockUser.bio,
        avatar: null,
        tags: mockUser.tags,
        matchScore,
        matchReason,
        agentConversation: 'AI 分身正在准备交流...',
        conversationTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        hasA2AReport: false,
      };
    });
    
    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    
    return NextResponse.json({
      code: 0,
      data: recommendations,
      source: 'mock',
    });
    
  } catch (error) {
    console.error('Get recommendations error:', error);
    return NextResponse.json(
      { code: -1, message: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
