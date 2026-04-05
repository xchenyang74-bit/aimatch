/**
 * SSE 响应解析测试
 * 验证 SecondMe Chat API 的 SSE 响应解析逻辑
 */

// 真实的 SSE 响应示例（来自之前的测试）
const realSSEResponse = `event: session
data: {"sessionId": "labs_sess_xxx"}

data: {"choices": [{"delta": {"content": "你好！"}}]}
data: {"choices": [{"delta": {"content": "收到你的消息"}}]}
data: {"choices": [{"delta": {"content": "啦～"}}]}
data: [DONE]`;

// 解析 SSE 响应（与 a2a-engine.ts 中相同的逻辑）
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
  
  return fullContent;
}

// 测试
console.log('='.repeat(60));
console.log('SSE 响应解析测试');
console.log('='.repeat(60));

console.log('\n原始 SSE 响应:');
console.log(realSSEResponse);

console.log('\n解析结果:');
const result = parseSSEResponse(realSSEResponse);
console.log(`"${result}"`);

console.log('\n验证:');
const expected = '你好！收到你的消息啦～';
if (result === expected) {
  console.log('✅ 解析结果与预期一致');
} else {
  console.log('❌ 解析结果与预期不一致');
  console.log(`   预期: "${expected}"`);
  console.log(`   实际: "${result}"`);
}

// 测试其他格式
console.log('\n' + '='.repeat(60));
console.log('其他格式测试');
console.log('='.repeat(60));

// 测试空响应
const emptyResponse = 'data: [DONE]';
console.log('\n1. 空响应 (只有 DONE):');
console.log(`   结果: "${parseSSEResponse(emptyResponse)}"`);

// 测试多行 content
const multiLineResponse = `data: {"choices": [{"delta": {"content": "第一行"}}]}
data: {"choices": [{"delta": {"content": "第二行"}}]}
data: {"choices": [{"delta": {"content": "第三行"}}]}
data: [DONE]`;
console.log('\n2. 多行 content:');
console.log(`   结果: "${parseSSEResponse(multiLineResponse)}"`);

console.log('\n✅ 所有 SSE 解析测试完成');
