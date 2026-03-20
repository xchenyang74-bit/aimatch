import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 开发模式用户 ID
const DEV_USER_ID = 'dev-user-1';

// 模拟用户池
const MOCK_USERS = [
  { id: 'user-1', nickname: '小明', tags: ['摄影', '旅行', '美食'], bio: '喜欢用镜头记录生活的美好瞬间' },
  { id: 'user-2', nickname: '小红', tags: ['音乐', '电影', '阅读'], bio: '文艺青年，热爱古典音乐和文学' },
  { id: 'user-3', nickname: '阿杰', tags: ['游戏', '编程', '科技'], bio: '全栈开发者，业余游戏主播' },
  { id: 'user-4', nickname: '琳达', tags: ['摄影', '绘画', '艺术'], bio: '设计师，喜欢用画笔和相机创作' },
  { id: 'user-5', nickname: '大伟', tags: ['运动', '健身', '户外'], bio: '马拉松爱好者，周末喜欢爬山' },
  { id: 'user-6', nickname: '晓雪', tags: ['美食', '烹饪', '烘焙'], bio: '美食博主，擅长做甜点' },
  { id: 'user-7', nickname: '浩然', tags: ['旅行', '摄影', '音乐'], bio: '背包客，已经去过20个国家' },
  { id: 'user-8', nickname: '诗诗', tags: ['阅读', '写作', '电影'], bio: '自由撰稿人，热爱文学创作' },
  { id: 'user-9', nickname: '子轩', tags: ['游戏', '动漫', '科技'], bio: '二次元爱好者，资深游戏玩家' },
  { id: 'user-10', nickname: '雨桐', tags: ['瑜伽', '健身', '美食'], bio: '瑜伽教练，追求健康生活方式' },
  { id: 'user-11', nickname: '宇航', tags: ['天文', '科技', '编程'], bio: '天文爱好者，梦想是去太空' },
  { id: 'user-12', nickname: '梦琪', tags: ['绘画', '手工', '艺术'], bio: '插画师，喜欢做各种手工' },
];

// 计算匹配分数
function calculateMatchScore(userTags: string[], targetTags: string[]): number {
  const commonTags = userTags.filter(tag => targetTags.includes(tag));
  const totalUniqueTags = new Set([...userTags, ...targetTags]).size;
  
  if (totalUniqueTags === 0) return 60;
  
  // 基础分数 + 共同标签加成
  const baseScore = 60;
  const matchBonus = (commonTags.length / totalUniqueTags) * 40;
  
  // 添加一些随机波动（-5 到 +5）
  const randomFactor = (Math.random() - 0.5) * 10;
  
  let score = Math.round(baseScore + matchBonus + randomFactor);
  
  // 限制在 60-98 之间
  return Math.min(98, Math.max(60, score));
}

// 生成推荐理由
function generateMatchReason(userTags: string[], targetTags: string[], targetNickname: string): string {
  const commonTags = userTags.filter(tag => targetTags.includes(tag));
  
  if (commonTags.length === 0) {
    const reasons = [
      `你们的生活方式互补，可能会有意想不到的火花`,
      `不同的兴趣也许能带来新鲜的体验`,
      `尝试一下，说不定会有惊喜`,
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }
  
  if (commonTags.length >= 3) {
    return `你们都喜欢${commonTags.slice(0, 2).join('、')}等，兴趣非常契合！`;
  }
  
  if (commonTags.length === 2) {
    return `你们都热爱${commonTags.join('和')}，有很多共同话题`;
  }
  
  // 只有1个共同标签
  const tag = commonTags[0];
  const specificReasons: Record<string, string[]> = {
    '摄影': [
      '你们都喜欢摄影，可以一起探讨拍摄技巧',
      '喜欢用镜头记录生活，你们应该很有共鸣',
    ],
    '旅行': [
      '都是旅行爱好者，说不定能结伴出游',
      '对世界充满好奇，你们有很多故事可以分享',
    ],
    '美食': [
      '美食是你们的共同语言，可以互相推荐好吃的',
      '都是吃货，约饭肯定很愉快',
    ],
    '音乐': [
      '音乐品味相似，可以分享歌单',
      '都用音乐表达情感，很有默契',
    ],
    '电影': [
      '电影爱好者，可以一起讨论影评',
      '喜欢通过电影看世界，观念可能很合拍',
    ],
    '阅读': [
      '都是书虫，可以交流读书心得',
      '热爱阅读，精神世界应该很丰富',
    ],
    '运动': [
      '都热爱运动，可以互相督促健身',
      '阳光积极的运动爱好者，很般配',
    ],
    '游戏': [
      '游戏玩家，可以组队开黑',
      '在游戏世界里都很投入，有共同语言',
    ],
  };
  
  const reasons = specificReasons[tag] || [`你们都喜欢${tag}，有共同爱好`];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

// 模拟 Agent 对话摘要
function generateAgentConversation(userTags: string[], targetTags: string[]): string {
  const commonTags = userTags.filter(tag => targetTags.includes(tag));
  
  if (commonTags.includes('摄影') && commonTags.includes('旅行')) {
    return '聊了很多关于旅行摄影的话题，从相机选择到最佳拍摄地点，聊得很投机';
  }
  if (commonTags.includes('美食')) {
    return '讨论了不少美食话题，互相推荐了很多餐厅和食谱';
  }
  if (commonTags.includes('音乐')) {
    return '分享了各自喜欢的音乐和歌手，发现品味很相似';
  }
  if (commonTags.includes('游戏')) {
    return '交流了最近在玩的游戏，讨论了很多游戏策略';
  }
  if (commonTags.includes('阅读')) {
    return '聊了很多读过的书，推荐了不少好书给对方';
  }
  if (commonTags.includes('运动')) {
    return '分享了健身和运动的日常，互相鼓励坚持锻炼';
  }
  
  const genericSummaries = [
    '从兴趣爱好聊到生活日常，发现有不少共同点',
    '聊得很愉快，有很多相似的生活观念',
    '互相了解了对方的生活方式，感觉很合拍',
    '话题不断，聊了很多有趣的事情',
  ];
  return genericSummaries[Math.floor(Math.random() * genericSummaries.length)];
}

export async function GET() {
  try {
    let user = null;
    
    // 尝试从数据库获取用户（生产环境可能无数据库）
    try {
      user = await prisma.user.findFirst({
        where: { id: DEV_USER_ID },
      });

      // 如果用户不存在，创建默认用户
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: DEV_USER_ID,
            secondmeUserId: 'dev-secondme-id',
            accessToken: 'dev-token',
            refreshToken: 'dev-refresh',
            tokenExpiresAt: new Date(Date.now() + 86400000),
            nickname: '开发者',
            bio: '热爱摄影和旅行，喜欢用镜头记录美好瞬间',
            avatar: null,
          },
        });
      }
    } catch (dbError) {
      console.log('Database not available, using mock mode');
    }

    // 用户的兴趣标签
    const userTags = ['摄影', '旅行', '美食', '阅读']; // 简化处理

    // 生成推荐列表
    const recommendations = MOCK_USERS.map((mockUser) => {
      const matchScore = calculateMatchScore(userTags, mockUser.tags);
      const matchReason = generateMatchReason(userTags, mockUser.tags, mockUser.nickname);
      const agentConversation = generateAgentConversation(userTags, mockUser.tags);

      return {
        id: mockUser.id,
        nickname: mockUser.nickname,
        bio: mockUser.bio,
        avatar: null,
        tags: mockUser.tags,
        matchScore,
        matchReason,
        agentConversation,
        // 模拟对话时间（最近1-7天）
        conversationTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
    });

    // 按匹配分数排序
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      code: 0,
      data: recommendations,
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    return NextResponse.json(
      { code: -1, message: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
