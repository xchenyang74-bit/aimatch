/**
 * 调试 API - 检查环境变量配置
 * GET /api/debug/config
 */

export async function GET() {
  const config = {
    SECONDME_CLIENT_ID: process.env.SECONDME_CLIENT_ID ? '✅ 已设置' : '❌ 未设置',
    SECONDME_CLIENT_SECRET: process.env.SECONDME_CLIENT_SECRET ? '✅ 已设置' : '❌ 未设置',
    SECONDME_REDIRECT_URI: process.env.SECONDME_REDIRECT_URI,
    SECONDME_API_BASE_URL: process.env.SECONDME_API_BASE_URL,
    SECONDME_OAUTH_URL: process.env.SECONDME_OAUTH_URL,
    SECONDME_TOKEN_ENDPOINT: process.env.SECONDME_TOKEN_ENDPOINT,
    DATABASE_URL: process.env.DATABASE_URL ? '✅ 已设置' : '❌ 未设置',
    NODE_ENV: process.env.NODE_ENV,
  };

  return Response.json({
    code: 0,
    data: config,
  });
}
