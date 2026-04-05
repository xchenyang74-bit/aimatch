/**
 * A2A 引擎逻辑测试（使用模拟响应）
 * 测试整体流程，不依赖真实 API
 */

// 模拟用户数据
const mockUserA = {
  id: 'user-a-001',
  nickname: '小明',
  accessToken: 'mock-token-a',
  tags: ['摄影', '旅行', '美食', '电影'],
  bio: '喜欢拍照和旅行的设计师',
};

const mockUserB = {
  id: 'user-b-001',
  nickname: '小红',
  accessToken: 'mock-token-b',
  tags: ['音乐', '电影', '阅读', '旅行'],
  bio: '文艺青年，热爱古典音乐',
};

// 模拟 SSE 响应
const mockSSEResponses: Record<string, string> = {
  '小明': `data: {"choices": [{"delta": {"content": "你好呀小红！很高兴认识你~"}}]}
data: {"choices": [{"delta": {"content": "我也很喜欢旅行，最近刚去了云南，风景真的太美了！"}}]}
data: [DONE]`,
  
  '小红': `data: {"choices": [{"delta": {"content": "你好小明！我也很高兴认识你~"}}]}
data: {"choices": [{"delta": {"content": "哇，云南我也一直想去！你拍了好多照片吧？"}}]}
data: [DONE]`,
};

// 构建系统提示词
function buildSystemPrompt(speaker: typeof mockUserA, listener: typeof mockUserB, isFirstMessage: boolean): string {
  const commonTags = speaker.tags.filter(tag => listener.tags.includes(tag));
  
  let prompt = `你是 ${speaker.nickname} 的 AI 分身，正在与 ${listener.nickname} 的 AI 分身进行自由交流。\n\n`;
  
  prompt += `关于你自己（${speaker.nickname}）：\n`;
  if (speaker.bio) {
    prompt += `- 简介：${speaker.bio}\n`;
  }
  if (speaker.tags.length > 0) {
    prompt += `- 兴趣标签：${speaker.tags.join('、')}\n`;
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

// 解析 SSE 响应
function parseSSEResponse(sseText: string): string {
  const lines = sseText.split('\n');
  let fullContent = '';
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') break;
      
      try {
        const parsed = JSON.parse(data);
        if (parsed.choices && parsed.choices[0]?.delta?.content) {
          fullContent += parsed.choices[0].delta.content;
        }
      } catch {
        // 忽略解析错误的行
      }
    }
  }
  
  return fullContent || '...';
}

// 模拟调用 SecondMe Chat API
async function callSecondMeAPIMock(nickname: string): Promise<string> {
  console.log(`  → 调用 Chat API (${nickname})...`);
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const sseResponse = mockSSEResponses[nickname];
  if (!sseResponse) {
    throw new Error(`No mock response for ${nickname}`);
  }
  
  const content = parseSSEResponse(sseResponse);
  console.log(`  ← 返回: ${content.slice(0, 50)}...`);
  return content;
}

// 分析对话结果
function analyzeConversation(
  messages: Array<{ speaker: 'A' | 'B'; content: string; round: number }>,
  userA: typeof mockUserA,
  userB: typeof mockUserB,
  commonTags: string[]
) {
  // 基础分数（60-98）
  const baseScore = 60;
  const tagBonus = Math.min(commonTags.length * 8, 24);
  const randomFactor = Math.floor(Math.random() * 10) - 5;
  const avgMessageLength = messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length;
  const lengthBonus = avgMessageLength > 50 ? 5 : 0;
  
  const compatibilityScore = Math.min(98, Math.max(60, baseScore + tagBonus + randomFactor + lengthBonus));
  
  // 对话质量评估
  const conversationQuality = {
    engagement: Math.min(100, 60 + tagBonus + Math.floor(Math.random() * 10)),
    depth: Math.min(100, 60 + (avgMessageLength > 100 ? 20 : 10) + Math.floor(Math.random() * 10)),
    harmony: Math.min(100, 70 + Math.floor(Math.random() * 20)),
  };
  
  // 提取精彩对话
  const highlights = messages
    .filter(m => m.content.length > 20)
    .slice(0, 3)
    .map(m => `${m.speaker === 'A' ? userA.nickname : userB.nickname}: ${m.content.slice(0, 60)}...`);
  
  // 生成优缺点分析
  const analysisPros: string[] = [];
  const analysisCons: string[] = [];
  
  if (commonTags.length >= 2) {
    analysisPros.push(`都喜欢${commonTags.slice(0, 2).join('、')}，有很多共同话题`);
  } else if (commonTags.length === 1) {
    analysisPros.push(`都喜欢${commonTags[0]}，有共同兴趣`);
  }
  
  if (avgMessageLength > 50) {
    analysisPros.push('对话内容充实，交流深入');
  }
  
  analysisPros.push('交流氛围友好，互动积极');
  
  if (commonTags.length === 0) {
    analysisCons.push('没有明显的共同兴趣，可能需要更多了解');
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
    compatibilityScore,
    conversationQuality,
    highlights,
    analysisPros,
    analysisCons,
    summary,
  };
}

// 执行 A2A 对话
async function runA2AConversation() {
  console.log('='.repeat(70));
  console.log('🤖 A2A (Agent-to-Agent) 对话模拟测试');
  console.log('='.repeat(70));
  
  const commonTags = mockUserA.tags.filter(tag => mockUserB.tags.includes(tag));
  
  console.log(`\n👤 用户 A: ${mockUserA.nickname}`);
  console.log(`   简介: ${mockUserA.bio}`);
  console.log(`   标签: ${mockUserA.tags.join(', ')}`);
  
  console.log(`\n👤 用户 B: ${mockUserB.nickname}`);
  console.log(`   简介: ${mockUserB.bio}`);
  console.log(`   标签: ${mockUserB.tags.join(', ')}`);
  
  console.log(`\n🎯 共同标签 (${commonTags.length}个): ${commonTags.join(', ') || '无'}`);
  
  const messages: Array<{ speaker: 'A' | 'B'; content: string; round: number }> = [];
  const maxRounds = 2; // 模拟测试用 2 轮
  
  console.log('\n' + '='.repeat(70));
  console.log('💬 开始对话');
  console.log('='.repeat(70));
  
  for (let round = 1; round <= maxRounds; round++) {
    console.log(`\n--- 第 ${round}/${maxRounds} 轮 ---`);
    
    // A 发言
    const promptA = buildSystemPrompt(mockUserA, mockUserB, messages.length === 0);
    console.log(`\n📝 ${mockUserA.nickname} (A) 正在思考...`);
    console.log(`   提示词长度: ${promptA.length} 字符`);
    
    const messageA = await callSecondMeAPIMock(mockUserA.nickname);
    messages.push({ speaker: 'A', content: messageA, round });
    console.log(`\n💬 ${mockUserA.nickname}: ${messageA}`);
    
    // B 发言
    const promptB = buildSystemPrompt(mockUserB, mockUserA, messages.length === 1);
    console.log(`\n📝 ${mockUserB.nickname} (B) 正在思考...`);
    console.log(`   提示词长度: ${promptB.length} 字符`);
    
    const messageB = await callSecondMeAPIMock(mockUserB.nickname);
    messages.push({ speaker: 'B', content: messageB, round });
    console.log(`\n💬 ${mockUserB.nickname}: ${messageB}`);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 对话分析');
  console.log('='.repeat(70));
  
  const analysis = analyzeConversation(messages, mockUserA, mockUserB, commonTags);
  
  console.log(`\n✅ 契合度评分: ${analysis.compatibilityScore}/100`);
  console.log(`\n📈 对话质量:`);
  console.log(`   - 互动积极性: ${analysis.conversationQuality.engagement}/100`);
  console.log(`   - 话题深度: ${analysis.conversationQuality.depth}/100`);
  console.log(`   - 和谐度: ${analysis.conversationQuality.harmony}/100`);
  
  console.log(`\n👍 优点:`);
  analysis.analysisPros.forEach((pro, i) => console.log(`   ${i + 1}. ${pro}`));
  
  if (analysis.analysisCons.length > 0) {
    console.log(`\n👎 缺点:`);
    analysis.analysisCons.forEach((con, i) => console.log(`   ${i + 1}. ${con}`));
  }
  
  console.log(`\n📝 对话摘要: ${analysis.summary}`);
  
  console.log(`\n💡 精彩对话片段:`);
  analysis.highlights.forEach((highlight, i) => {
    console.log(`   ${i + 1}. ${highlight}`);
  });
  
  console.log('\n' + '='.repeat(70));
  console.log('✨ 测试完成');
  console.log('='.repeat(70));
  
  // 验证结果
  console.log('\n📋 验证结果:');
  const checks = [
    { name: '消息数量', pass: messages.length === maxRounds * 2 },
    { name: '契合度分数范围', pass: analysis.compatibilityScore >= 60 && analysis.compatibilityScore <= 98 },
    { name: '有对话摘要', pass: analysis.summary.length > 0 },
    { name: '有优点分析', pass: analysis.analysisPros.length > 0 },
    { name: '有精彩对话', pass: analysis.highlights.length > 0 },
  ];
  
  checks.forEach(check => {
    console.log(`   ${check.pass ? '✅' : '❌'} ${check.name}`);
  });
  
  const allPassed = checks.every(c => c.pass);
  console.log(`\n${allPassed ? '🎉 所有测试通过!' : '⚠️ 部分测试失败'}`);
  
  process.exit(allPassed ? 0 : 1);
}

// 运行测试
runA2AConversation().catch(err => {
  console.error('❌ 测试失败:', err);
  process.exit(1);
});
