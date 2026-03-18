import { NextResponse } from 'next/server';

// 模拟不同用户的 Agent 对话报告
const MOCK_CONVERSATIONS: Record<string, {
  duration: string;
  messageCount: number;
  compatibilityProgress: number[];
  highlights: { speaker: string; content: string }[];
  analysis: {
    pros: string[];
    cons: string[];
  };
}> = {
  'user-1': {
    duration: '5分32秒',
    messageCount: 24,
    compatibilityProgress: [70, 78, 85, 89],
    highlights: [
      { speaker: '小明Agent', content: '你好呀！看到你的资料，发现我们都喜欢摄影 📷' },
      { speaker: '你的Agent', content: '对呀！你平时喜欢拍什么类型的照片？' },
      { speaker: '小明Agent', content: '我特别喜欢风景和街拍，你去过哪些地方拍照？' },
      { speaker: '你的Agent', content: '上个月刚去了云南，洱海的日出太美了！' },
      { speaker: '小明Agent', content: '哇！我也一直想去，能推荐几个拍摄点吗？' },
    ],
    analysis: {
      pros: ['都喜欢旅行摄影', '话题互动积极', '性格外向开朗'],
      cons: ['居住地距离较远'],
    },
  },
  'user-2': {
    duration: '4分18秒',
    messageCount: 18,
    compatibilityProgress: [65, 72, 80, 84],
    highlights: [
      { speaker: '小红Agent', content: '嗨！看到你也喜欢音乐和电影 🎵🎬' },
      { speaker: '你的Agent', content: '是的！最近在看《星际穿越》，配乐太棒了' },
      { speaker: '小红Agent', content: '汉斯季默的配乐！我也超喜欢，特别是原野追逐那段' },
      { speaker: '你的Agent', content: '对！那种宏大又细腻的感觉，听多少次都震撼' },
    ],
    analysis: {
      pros: ['音乐品味相似', '都喜欢科幻电影', '有深度交流'],
      cons: ['生活节奏可能不同'],
    },
  },
  'user-3': {
    duration: '3分45秒',
    messageCount: 15,
    compatibilityProgress: [60, 68, 75, 78],
    highlights: [
      { speaker: '阿杰Agent', content: '哈喽！游戏和编程，同道中人啊 🎮💻' },
      { speaker: '你的Agent', content: '哈哈是啊，你最近在玩什么游戏？' },
      { speaker: '阿杰Agent', content: '沉迷《塞尔达传说》，开放世界太香了' },
      { speaker: '你的Agent', content: '我也是！神庙解谜特别有意思' },
    ],
    analysis: {
      pros: ['都是游戏玩家', '技术背景相似', '有共同娱乐方式'],
      cons: ['可能都太忙没时间约会'],
    },
  },
  'user-4': {
    duration: '6分12秒',
    messageCount: 28,
    compatibilityProgress: [75, 82, 88, 92],
    highlights: [
      { speaker: '琳达Agent', content: '你好！设计师+摄影师，感觉会有很多话题 🎨📷' },
      { speaker: '你的Agent', content: '对呀！你平时用什么相机？' },
      { speaker: '琳达Agent', content: '主要用富士，色彩直出很讨喜，你呢？' },
      { speaker: '你的Agent', content: '我也是富士党！XT-4用了两年了' },
      { speaker: '琳达Agent', content: '太巧了！下次可以一起扫街呀' },
    ],
    analysis: {
      pros: ['都用富士相机', '艺术审美相似', '创作理念契合', '同城概率高'],
      cons: [],
    },
  },
  'user-5': {
    duration: '4分05秒',
    messageCount: 20,
    compatibilityProgress: [62, 70, 76, 80],
    highlights: [
      { speaker: '大伟Agent', content: '嗨！运动爱好者，周末一般怎么安排？🏃' },
      { speaker: '你的Agent', content: '喜欢晨跑和周末爬山，你呢？' },
      { speaker: '大伟Agent', content: '马拉松选手！下周有个半马比赛要参加' },
      { speaker: '你的Agent', content: '太厉害了！我最多跑10公里，想挑战半马' },
    ],
    analysis: {
      pros: ['都热爱运动', '生活作息规律', '积极向上的生活态度'],
      cons: ['运动强度差异较大'],
    },
  },
  'user-6': {
    duration: '5分48秒',
    messageCount: 26,
    compatibilityProgress: [68, 75, 83, 87],
    highlights: [
      { speaker: '晓雪Agent', content: '你好呀！美食博主，有什么推荐的餐厅吗？🍰' },
      { speaker: '你的Agent', content: '你才是专家吧！看你的动态做的甜点都好精致' },
      { speaker: '晓雪Agent', content: '哈哈谢谢！最近在做巴斯克芝士蛋糕，超简单' },
      { speaker: '你的Agent', content: '我也想做！求教程' },
      { speaker: '晓雪Agent', content: '没问题，我可以手把手教你，很简单的' },
    ],
    analysis: {
      pros: ['都对美食有热情', '互动友好热情', '愿意分享和帮助他人'],
      cons: ['可能饮食偏好有差异'],
    },
  },
};

// 默认对话报告
const DEFAULT_CONVERSATION = {
  duration: '4分30秒',
  messageCount: 20,
  compatibilityProgress: [65, 72, 80, 85],
  highlights: [
    { speaker: '对方Agent', content: '你好！看到你的资料，感觉我们有一些共同点' },
    { speaker: '你的Agent', content: '嗨！我也注意到了，聊聊看？' },
    { speaker: '对方Agent', content: '好啊！你平时周末一般怎么安排？' },
    { speaker: '你的Agent', content: '喜欢出去走走，或者在家看看电影' },
    { speaker: '对方Agent', content: '我也是！有喜欢的电影类型吗？' },
  ],
  analysis: {
    pros: ['有共同话题', '交流顺畅'],
    cons: ['需要更多了解'],
  },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { code: -1, message: 'Missing userId' },
        { status: 400 }
      );
    }

    // 获取对话报告
    const conversation = MOCK_CONVERSATIONS[userId] || DEFAULT_CONVERSATION;

    return NextResponse.json({
      code: 0,
      data: conversation,
    });
  } catch (error) {
    console.error('Get agent conversation error:', error);
    return NextResponse.json(
      { code: -1, message: 'Failed to get conversation' },
      { status: 500 }
    );
  }
}
