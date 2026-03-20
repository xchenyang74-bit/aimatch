// 内容审核工具

// 敏感词列表（简化版，实际应使用云服务）
const SENSITIVE_WORDS = [
  '赌博', '毒品', '色情', '暴力', '诈骗', '传销',
  'gun', 'drug', 'sex', 'violence', 'scam',
];

// 检测敏感内容
export function checkSensitiveContent(text: string): {
  isClean: boolean;
  flaggedWords: string[];
} {
  const flaggedWords: string[] = [];
  const lowerText = text.toLowerCase();

  for (const word of SENSITIVE_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      flaggedWords.push(word);
    }
  }

  return {
    isClean: flaggedWords.length === 0,
    flaggedWords,
  };
}

// 过滤敏感内容（替换为*）
export function filterSensitiveContent(text: string): string {
  let filtered = text;
  
  for (const word of SENSITIVE_WORDS) {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  }

  return filtered;
}

// 验证用户资料
export function validateProfile(nickname: string, bio: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 昵称长度检查
  if (nickname.length < 2 || nickname.length > 20) {
    errors.push('昵称长度需在 2-20 个字符之间');
  }

  // 简介长度检查
  if (bio.length > 500) {
    errors.push('简介不能超过 500 个字符');
  }

  // 敏感词检查
  const nicknameCheck = checkSensitiveContent(nickname);
  if (!nicknameCheck.isClean) {
    errors.push('昵称包含敏感词汇');
  }

  const bioCheck = checkSensitiveContent(bio);
  if (!bioCheck.isClean) {
    errors.push('简介包含敏感词汇');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// 验证消息内容
export function validateMessage(content: string): {
  valid: boolean;
  error?: string;
  filtered?: string;
} {
  // 长度检查
  if (!content || content.trim().length === 0) {
    return { valid: false, error: '消息不能为空' };
  }

  if (content.length > 1000) {
    return { valid: false, error: '消息不能超过 1000 个字符' };
  }

  // 敏感词检查
  const check = checkSensitiveContent(content);
  if (!check.isClean) {
    // 自动过滤
    return {
      valid: true,
      filtered: filterSensitiveContent(content),
    };
  }

  return { valid: true, filtered: content };
}

// 实际生产环境：调用阿里云/腾讯云内容审核 API
export async function moderateContentWithAPI(content: string, type: 'text' | 'image' = 'text'): Promise<{
  isSafe: boolean;
  confidence: number;
  labels?: string[];
}> {
  // TODO: 接入阿里云内容安全或腾讯云天御
  // 示例：
  /*
  const response = await fetch('https://green.aliyuncs.com/text/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.ALIYUN_ACCESS_KEY}`,
    },
    body: JSON.stringify({
      tasks: [{ content }],
      scenes: ['antispam'],
    }),
  });
  
  const result = await response.json();
  return {
    isSafe: result.data[0].results[0].suggestion === 'pass',
    confidence: result.data[0].results[0].rate,
    labels: result.data[0].results[0].labels,
  };
  */

  // 临时使用本地敏感词检测
  const check = checkSensitiveContent(content);
  return {
    isSafe: check.isClean,
    confidence: check.isClean ? 1 : 0.8,
    labels: check.flaggedWords,
  };
}

// 频率限制检查
export async function checkRateLimit(
  userId: string,
  action: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  // 实际生产环境使用 Redis
  // const key = `rate_limit:${action}:${userId}`;
  // const current = await redis.incr(key);
  // if (current === 1) await redis.expire(key, windowSeconds);
  
  // 简化版：返回允许
  return {
    allowed: true,
    remaining: maxRequests,
    resetTime: Date.now() + windowSeconds * 1000,
  };
}
