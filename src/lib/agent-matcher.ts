import { prisma } from './prisma';
import { cache } from './redis';

// Agent 对话接口
interface AgentMessage {
  role: 'agent1' | 'agent2';
  content: string;
  timestamp: string;
}

interface AgentConversationResult {
  messages: AgentMessage[];
  compatibilityScore: number;
  compatibilityProgress: number[];
  summary: string;
  highlights: { speaker: string; content: string }[];
  analysis: {
    pros: string[];
    cons: string[];
  };
  duration: string;
  messageCount: number;
}

// 生成 Agent 对话（调用 SecondMe API 或模拟）
export async function generateAgentConversation(
  user1Id: string,
  user2Id: string,
  user1Tags: string[],
  user2Tags: string[],
  user1Bio: string,
  user2Bio: string
): Promise<AgentConversationResult> {
  const cacheKey = `conversation:${user1Id}:${user2Id}`;
  
  // 检查缓存
  const cached = await cache.get(cacheKey);
  if (cached) {
    return cached as AgentConversationResult;
  }

  // 查找共同标签
  const commonTags = user1Tags.filter(tag => user2Tags.includes(tag));
  
  // 生成对话（实际生产环境调用 SecondMe Agent API）
  const conversation = await simulateAgentConversation(
    user1Id,
    user2Id,
    commonTags,
    user1Bio,
    user2Bio
  );

  // 缓存结果（1小时）
  await cache.set(cacheKey, conversation, 3600);

  return conversation;
}

// 模拟 Agent 对话（开发/测试用，实际应替换为 SecondMe API）
async function simulateAgentConversation(
  user1Id: string,
  user2Id: string,
  commonTags: string[],
  user1Bio: string,
  user2Bio: string
): Promise<AgentConversationResult> {
  const startTime = Date.now();
  
  // 模拟对话内容
  const messages: AgentMessage[] = [];
  const highlights: { speaker: string; content: string }[] = [];
  
  // 开场白
  if (commonTags.length > 0) {
    const tag = commonTags[0];
    messages.push({
      role: 'agent1',
      content: `你好呀！看到你的资料，发现我们都喜欢${tag} 😊`,
      timestamp: new Date(startTime).toISOString(),
    });
    messages.push({
      role: 'agent2',
      content: `对呀！你也喜欢${tag}吗？太巧了！`,
      timestamp: new Date(startTime + 30000).toISOString(),
    });
    highlights.push({ speaker: 'Agent A', content: `你好呀！看到你的资料，发现我们都喜欢${tag}` });
  } else {
    messages.push({
      role: 'agent1',
      content: '你好！看到你的资料，感觉挺有意思的～',
      timestamp: new Date(startTime).toISOString(),
    });
    messages.push({
      role: 'agent2',
      content: '嗨！谢谢，你的资料看起来也很有趣呢',
      timestamp: new Date(startTime + 30000).toISOString(),
    });
  }

  // 根据 bio 生成更多对话
  if (user1Bio && user2Bio) {
    messages.push({
      role: 'agent1',
      content: `看你的简介，${user2Bio.slice(0, 30)}...感觉你是个很有想法的人`,
      timestamp: new Date(startTime + 60000).toISOString(),
    });
    messages.push({
      role: 'agent2',
      content: `哈哈谢谢！我也注意到你的简介写着${user1Bio.slice(0, 30)}...我们应该挺聊得来的`,
      timestamp: new Date(startTime + 90000).toISOString(),
    });
  }

  // 深入话题
  if (commonTags.includes('旅行')) {
    messages.push({
      role: 'agent1',
      content: '你最近有去哪里旅行吗？我最近去了云南，风景太美了！',
      timestamp: new Date(startTime + 120000).toISOString(),
    });
    messages.push({
      role: 'agent2',
      content: '哇！云南我也一直想去，洱海和玉龙雪山都很想去看看',
      timestamp: new Date(startTime + 150000).toISOString(),
    });
    highlights.push({ speaker: 'Agent A', content: '你最近有去哪里旅行吗？我最近去了云南，风景太美了！' });
  }

  if (commonTags.includes('美食')) {
    messages.push({
      role: 'agent2',
      content: '对了，你平时喜欢吃什么类型的美食？',
      timestamp: new Date(startTime + 180000).toISOString(),
    });
    messages.push({
      role: 'agent1',
      content: '我喜欢吃火锅和日料！最近在探索一些隐藏的小馆子',
      timestamp: new Date(startTime + 210000).toISOString(),
    });
  }

  // 结束语
  messages.push({
    role: 'agent2',
    content: '聊得很开心！感觉我们挺聊得来的，期待有机会认识你本人～',
    timestamp: new Date(startTime + 240000).toISOString(),
  });
  messages.push({
    role: 'agent1',
    content: '我也觉得！下次可以一起去喝杯咖啡或者吃个饭 😊',
    timestamp: new Date(startTime + 270000).toISOString(),
  });
  highlights.push({ speaker: 'Agent B', content: '聊得很开心！感觉我们挺聊得来的，期待有机会认识你本人～' });

  // 计算契合度
  const baseScore = 60;
  const tagBonus = commonTags.length * 8;
  const randomFactor = Math.floor(Math.random() * 10) - 5;
  const compatibilityScore = Math.min(98, Math.max(60, baseScore + tagBonus + randomFactor));
  
  // 生成好感度变化曲线
  const compatibilityProgress = [
    60,
    60 + Math.floor((compatibilityScore - 60) * 0.3),
    60 + Math.floor((compatibilityScore - 60) * 0.6),
    compatibilityScore,
  ];

  // 生成优缺点分析
  const analysis = {
    pros: commonTags.length > 0 
      ? [`都喜欢${commonTags.slice(0, 2).join('、')}`, '话题互动积极', '交流顺畅自然']
      : ['性格互补', '交流友好', '愿意了解对方'],
    cons: commonTags.length < 2
      ? ['共同话题较少', '需要更多了解']
      : commonTags.length > 4
      ? ['兴趣过于相似，可能缺乏新鲜感']
      : [],
  };

  const endTime = Date.now();
  const durationMs = endTime - startTime + 300000; // 模拟5分钟对话
  const duration = formatDuration(durationMs);

  return {
    messages,
    compatibilityScore,
    compatibilityProgress,
    summary: generateSummary(commonTags, messages),
    highlights,
    analysis,
    duration,
    messageCount: messages.length,
  };
}

// 格式化时长
function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}分${seconds.toString().padStart(2, '0')}秒`;
}

// 生成对话摘要
function generateSummary(commonTags: string[], messages: AgentMessage[]): string {
  if (commonTags.length >= 2) {
    return `聊了很多关于${commonTags.slice(0, 2).join('、')}的话题，发现有不少共同点，聊得很投机`;
  } else if (commonTags.length === 1) {
    return `围绕${commonTags[0]}聊了不少，虽然其他兴趣不同，但交流很愉快`;
  } else {
    return '从兴趣爱好聊到生活日常，互相了解对方，氛围轻松愉快';
  }
}

// 实际生产环境：调用 SecondMe Agent API
export async function callSecondMeAgentAPI(
  userAccessToken: string,
  targetUserId: string,
  conversationConfig: any
): Promise<any> {
  // TODO: 实现真实的 SecondMe Agent API 调用
  // 参考 SecondMe 文档：https://docs.second.me
  
  /*
  const response = await fetch(`${process.env.SECONDME_API_BASE_URL}/api/agent/conversation`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetUserId,
      config: conversationConfig,
    }),
  });
  
  return response.json();
  */
  
  throw new Error('SecondMe Agent API not implemented yet');
}
