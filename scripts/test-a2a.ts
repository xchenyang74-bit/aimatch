/**
 * A2A 引擎测试脚本
 * 直接测试 A2A 对话逻辑，不依赖数据库
 */

// 模拟用户数据
const mockUserA = {
  id: 'user-a-001',
  nickname: '小明',
  accessToken: process.env.TEST_ACCESS_TOKEN_A || '',
  tags: ['摄影', '旅行', '美食', '电影'],
  bio: '喜欢拍照和旅行的设计师',
};

const mockUserB = {
  id: 'user-b-001',
  nickname: '小红',
  accessToken: process.env.TEST_ACCESS_TOKEN_B || '',
  tags: ['音乐', '电影', '阅读', '旅行'],
  bio: '文艺青年，热爱古典音乐',
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

// 调用 SecondMe Chat API
async function callSecondMeAPI(accessToken: string, prompt: string, history: { role: string; content: string }[] = []): Promise<string> {
  const apiUrl = `${process.env.SECONDME_API_BASE_URL || 'https://api.mindverse.com/gate/lab'}/api/secondme/chat/stream`;
  
  console.log(`\n[Chat API] Calling ${apiUrl}`);
  console.log(`[Chat API] Token: ${accessToken.slice(0, 20)}...`);
  console.log(`[Chat API] Prompt length: ${prompt.length} chars`);
  
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
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SecondMe API error (${response.status}): ${error}`);
    }
    
    // 解析 SSE 流式响应
    const text = await response.text();
    const lines = text.split('\n');
    let fullContent = '';
    
    console.log(`[Chat API] Response lines: ${lines.length}`);
    
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
    
    console.log(`[Chat API] Response content: ${fullContent.slice(0, 100)}...`);
    return fullContent || '...';
  } catch (error) {
    console.error('[Chat API] Failed:', error);
    throw error;
  }
}

// 执行 A2A 对话
async function runA2AConversation() {
  console.log('='.repeat(60));
  console.log('A2A 对话测试');
  console.log('='.repeat(60));
  
  // 检查环境变量
  if (!mockUserA.accessToken || !mockUserB.accessToken) {
    console.error('\n❌ 错误：需要设置测试用的 Access Token');
    console.log('\n请设置环境变量：');
    console.log('  TEST_ACCESS_TOKEN_A=用户A的token');
    console.log('  TEST_ACCESS_TOKEN_B=用户B的token');
    console.log('\n获取方式：登录后从数据库中获取 accessToken');
    process.exit(1);
  }
  
  const commonTags = mockUserA.tags.filter(tag => mockUserB.tags.includes(tag));
  console.log(`\n👤 用户 A: ${mockUserA.nickname}`);
  console.log(`   标签: ${mockUserA.tags.join(', ')}`);
  console.log(`\n👤 用户 B: ${mockUserB.nickname}`);
  console.log(`   标签: ${mockUserB.tags.join(', ')}`);
  console.log(`\n🎯 共同标签 (${commonTags.length}): ${commonTags.join(', ') || '无'}`);
  
  const messages: Array<{ speaker: 'A' | 'B'; content: string; round: number }> = [];
  const maxRounds = 3; // 测试时减少轮次
  
  console.log('\n' + '='.repeat(60));
  console.log('开始对话');
  console.log('='.repeat(60));
  
  for (let round = 1; round <= maxRounds; round++) {
    console.log(`\n--- 第 ${round}/${maxRounds} 轮 ---`);
    
    // A 发言
    const promptA = buildSystemPrompt(mockUserA, mockUserB, messages.length === 0);
    const historyA = messages.map(m => ({
      role: m.speaker === 'A' ? 'assistant' : 'user',
      content: m.content,
    }));
    
    try {
      console.log(`\n📝 ${mockUserA.nickname} (A) 正在思考...`);
      const messageA = await callSecondMeAPI(mockUserA.accessToken, promptA, historyA);
      messages.push({ speaker: 'A', content: messageA, round });
      console.log(`\n💬 ${mockUserA.nickname}: ${messageA}`);
    } catch (error: any) {
      console.error(`\n❌ ${mockUserA.nickname} 响应失败:`, error.message);
      break;
    }
    
    // B 发言
    const promptB = buildSystemPrompt(mockUserB, mockUserA, messages.length === 1);
    const historyB = messages.map(m => ({
      role: m.speaker === 'B' ? 'assistant' : 'user',
      content: m.content,
    }));
    
    try {
      console.log(`\n📝 ${mockUserB.nickname} (B) 正在思考...`);
      const messageB = await callSecondMeAPI(mockUserB.accessToken, promptB, historyB);
      messages.push({ speaker: 'B', content: messageB, round });
      console.log(`\n💬 ${mockUserB.nickname}: ${messageB}`);
    } catch (error: any) {
      console.error(`\n❌ ${mockUserB.nickname} 响应失败:`, error.message);
      break;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('对话完成');
  console.log('='.repeat(60));
  console.log(`\n总计消息: ${messages.length} 条`);
  console.log('\n完整对话记录:');
  messages.forEach((m, i) => {
    console.log(`\n[${i + 1}] ${m.speaker === 'A' ? mockUserA.nickname : mockUserB.nickname}:`);
    console.log(`    ${m.content}`);
  });
}

// 运行测试
runA2AConversation().catch(console.error);
