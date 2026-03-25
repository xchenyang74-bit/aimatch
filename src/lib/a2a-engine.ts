/**
 * A2A (Agent-to-Agent) 对话引擎
 * 
 * 核心功能：
 * 1. 通过中继模式协调两个用户的 SecondMe AI 分身进行对话
 * 2. 不预设议题，让 Agent 根据 memory、tag 自由交流
 * 3. 生成契合度分析报告
 */

import { prisma } from './prisma';

// 对话配置
const A2A_CONFIG = {
  MAX_ROUNDS: 5,           // 最大轮次
  MIN_ROUNDS: 3,           // 最小轮次
  MATCH_LIMIT: 50,         // 新用户匹配数量
};

// 消息类型
interface A2AMessage {
  speaker: 'A' | 'B';
  content: string;
  timestamp: string;
  round: number;
}

// 对话结果
interface A2AConversationResult {
  messages: A2AMessage[];
  compatibilityScore: number;
  conversationQuality: {
    engagement: number;    // 互动积极性 0-100
    depth: number;         // 话题深度 0-100
    harmony: number;       // 和谐度 0-100
  };
  highlights: string[];
  analysisPros: string[];
  analysisCons: string[];
  summary: string;
}

// 用户信息（简化版）
interface A2AUser {
  id: string;
  nickname: string;
  accessToken: string;
  tags: string[];
  bio?: string;
  memory?: string;  // SecondMe memory
}

/**
 * 构建系统提示词 - 自由对话模式
 */
function buildSystemPrompt(speaker: A2AUser, listener: A2AUser, isFirstMessage: boolean): string {
  const commonTags = speaker.tags.filter(tag => listener.tags.includes(tag));
  
  let prompt = `你是 ${speaker.nickname} 的 AI 分身，正在与 ${listener.nickname} 的 AI 分身进行自由交流。\n\n`;
  
  prompt += `关于你自己（${speaker.nickname}）：\n`;
  if (speaker.bio) {
    prompt += `- 简介：${speaker.bio}\n`;
  }
  if (speaker.tags.length > 0) {
    prompt += `- 兴趣标签：${speaker.tags.join('、')}\n`;
  }
  if (speaker.memory) {
    prompt += `- 其他信息：${speaker.memory}\n`;
  }
  
  prompt += `\n关于对方（${listener.nickname}）：\n`;
  if (listener.bio) {
    prompt += `- 简介：${listener.bio}\n`;
  }
  if (listener.tags.length > 0) {
    prompt += `- 兴趣标签：${listener.tags.join('、')}\n`;
  }
  
  if (commonTags.length > 0) {
    prompt += `\n你们共同感兴趣的标签：${commonTags.join('、')}\n`;
  }
  
  prompt += `\n交流规则：\n`;
  if (isFirstMessage) {
    prompt += `1. 这是对话的开始，请先进行自我介绍\n`;
    prompt += `2. 自然地打招呼，展现出 ${speaker.nickname} 的性格\n`;
  } else {
    prompt += `1. 自然地回应对方，保持对话流畅\n`;
  }
  prompt += `3. 可以聊双方的共同兴趣，也可以探索新话题\n`;
  prompt += `4. 保持友好、真诚的交流态度\n`;
  prompt += `5. 请像 ${speaker.nickname} 本人一样说话\n`;
  
  return prompt;
}

/**
 * 调用 SecondMe Chat API
 */
async function callSecondMeAPI(
  accessToken: string,
  prompt: string,
  history: { role: string; content: string }[] = []
): Promise<string> {
  const apiUrl = `${process.env.SECONDME_API_BASE_URL}/api/chat`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        history: history,
        stream: false,  // 非流式，简化处理
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SecondMe API error: ${error}`);
    }
    
    const data = await response.json();
    return data.response || data.message || data.content || '';
  } catch (error) {
    console.error('SecondMe API call failed:', error);
    throw error;
  }
}

/**
 * 执行 A2A 对话 - 中继模式
 */
export async function runA2AConversation(
  userA: A2AUser,
  userB: A2AUser
): Promise<A2AConversationResult> {
  const messages: A2AMessage[] = [];
  const commonTags = userA.tags.filter(tag => userB.tags.includes(tag));
  
  console.log(`[A2A] Starting conversation between ${userA.nickname} and ${userB.nickname}`);
  console.log(`[A2A] Common tags: ${commonTags.join(', ')}`);
  
  // 执行对话轮次
  for (let round = 1; round <= A2A_CONFIG.MAX_ROUNDS; round++) {
    console.log(`[A2A] Round ${round}/${A2A_CONFIG.MAX_ROUNDS}`);
    
    // A 发言
    const promptA = buildSystemPrompt(
      userA, 
      userB, 
      messages.length === 0
    );
    
    // 构建历史记录
    const historyA = messages.map(m => ({
      role: m.speaker === 'A' ? 'assistant' : 'user',
      content: m.content,
    }));
    
    try {
      const messageA = await callSecondMeAPI(userA.accessToken, promptA, historyA);
      messages.push({
        speaker: 'A',
        content: messageA,
        timestamp: new Date().toISOString(),
        round,
      });
    } catch (error) {
      console.error(`[A2A] Failed to get response from ${userA.nickname}:`, error);
      throw error;
    }
    
    // B 发言
    const promptB = buildSystemPrompt(
      userB,
      userA,
      messages.length === 1
    );
    
    const historyB = messages.map(m => ({
      role: m.speaker === 'B' ? 'assistant' : 'user',
      content: m.content,
    }));
    
    try {
      const messageB = await callSecondMeAPI(userB.accessToken, promptB, historyB);
      messages.push({
        speaker: 'B',
        content: messageB,
        timestamp: new Date().toISOString(),
        round,
      });
    } catch (error) {
      console.error(`[A2A] Failed to get response from ${userB.nickname}:`, error);
      throw error;
    }
  }
  
  // 分析对话结果
  const analysis = await analyzeConversation(messages, userA, userB, commonTags);
  
  console.log(`[A2A] Conversation completed. Score: ${analysis.compatibilityScore}`);
  
  return analysis;
}

/**
 * 分析对话，生成契合度报告
 */
async function analyzeConversation(
  messages: A2AMessage[],
  userA: A2AUser,
  userB: A2AUser,
  commonTags: string[]
): Promise<A2AConversationResult> {
  // 基础分数（60-98）
  const baseScore = 60;
  const tagBonus = Math.min(commonTags.length * 8, 24);  // 共同标签加分，最多24分
  const randomFactor = Math.floor(Math.random() * 10) - 5;  // 随机波动 -5 到 +5
  
  // 根据对话长度调整（如果对话很短，可能是没聊起来）
  const avgMessageLength = messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length;
  const lengthBonus = avgMessageLength > 50 ? 5 : 0;
  
  const compatibilityScore = Math.min(98, Math.max(60, baseScore + tagBonus + randomFactor + lengthBonus));
  
  // 对话质量评估
  const conversationQuality = {
    engagement: Math.min(100, 60 + tagBonus + Math.floor(Math.random() * 10)),
    depth: Math.min(100, 60 + (avgMessageLength > 100 ? 20 : 10) + Math.floor(Math.random() * 10)),
    harmony: Math.min(100, 70 + Math.floor(Math.random() * 20)),
  };
  
  // 提取精彩对话（每轮选一条）
  const highlights = messages
    .filter(m => m.content.length > 30)
    .slice(0, 3)
    .map(m => `${m.speaker === 'A' ? userA.nickname : userB.nickname}: ${m.content.slice(0, 100)}...`);
  
  // 生成优缺点分析
  const analysisPros: string[] = [];
  const analysisCons: string[] = [];
  
  if (commonTags.length >= 2) {
    analysisPros.push(`都喜欢${commonTags.slice(0, 2).join('、')}，有很多共同话题`);
  } else if (commonTags.length === 1) {
    analysisPros.push(`都喜欢${commonTags[0]}，有共同兴趣`);
  } else {
    analysisPros.push('虽然兴趣不同，但交流态度开放');
  }
  
  if (avgMessageLength > 100) {
    analysisPros.push('对话内容充实，交流深入');
  }
  
  analysisPros.push('交流氛围友好，互动积极');
  
  if (commonTags.length === 0) {
    analysisCons.push('没有明显的共同兴趣，可能需要更多了解');
  }
  
  if (avgMessageLength < 50) {
    analysisCons.push('对话较为简短，可能需要更多互动');
  }
  
  // 生成摘要
  let summary = '';
  if (commonTags.length >= 2) {
    summary = `聊了很多关于${commonTags.slice(0, 2).join('、')}的话题，发现有不少共同点，聊得很投机`;
  } else if (commonTags.length === 1) {
    summary = `围绕${commonTags[0]}聊了不少，虽然其他兴趣不同，但交流很愉快`;
  } else {
    summary = '从兴趣爱好聊到生活日常，互相了解对方，氛围轻松愉快';
  }
  
  return {
    messages,
    compatibilityScore,
    conversationQuality,
    highlights,
    analysisPros,
    analysisCons,
    summary,
  };
}

/**
 * 计算共同标签
 */
export function calculateCommonTags(tagsA: string[], tagsB: string[]): string[] {
  return tagsA.filter(tag => tagsB.includes(tag));
}

/**
 * 计算共同标签数量
 */
export function calculateCommonTagCount(tagsA: string[], tagsB: string[]): number {
  return calculateCommonTags(tagsA, tagsB).length;
}

export { A2A_CONFIG };
export type { A2AMessage, A2AConversationResult, A2AUser };
