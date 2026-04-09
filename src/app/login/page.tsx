import { redirect } from 'next/navigation';

// 服务端组件 - 直接渲染静态 HTML
export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; detail?: string };
}) {
  const error = searchParams.error;
  const detail = searchParams.detail;

  const getErrorMessage = (err: string | undefined) => {
    if (!err) return null;
    const messages: Record<string, string> = {
      invalid_state: '安全验证失败，请重试',
      no_code: '授权失败，请重试',
      token_exchange: '登录失败，请重试',
      user_info: '获取用户信息失败',
      server: '服务器错误，请稍后重试',
      oauth: 'OAuth 授权失败',
    };
    return messages[err] || '登录失败';
  };

  const errorMsg = getErrorMessage(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-4">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-300/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-400 via-pink-400 to-purple-400 flex items-center justify-center shadow-lg shadow-orange-200">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Aimatch
            </h1>
            <p className="text-gray-500">AI 驱动的社交匹配平台</p>
          </div>

          {/* 错误提示 */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
              <div className="font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {errorMsg}
              </div>
              {detail && (
                <div className="text-xs text-red-400 mt-1 break-all font-mono bg-red-100/50 p-2 rounded">
                  {decodeURIComponent(detail)}
                </div>
              )}
            </div>
          )}

          {/* 特性介绍 */}
          <div className="space-y-4 mb-8">
            {/* Feature 1 */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-transparent border border-orange-100/50">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">AI Agent 智能匹配</h3>
                <p className="text-sm text-gray-500">两个 AI 分身先对话，发现契合点</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-pink-50 to-transparent border border-pink-100/50">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Agent 先聊，你再决定</h3>
                <p className="text-sm text-gray-500">基于 AI 对话报告，选择是否匹配</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-transparent border border-purple-100/50">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">每日精选推荐</h3>
                <p className="text-sm text-gray-500">根据兴趣标签，推荐最契合的人</p>
              </div>
            </div>
          </div>

          {/* 登录按钮 - 使用表单提交 */}
          <form action="/api/auth/login" method="GET">
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 text-white rounded-xl font-semibold text-lg shadow-lg shadow-orange-200 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              使用 SecondMe 登录
            </button>
          </form>

          {/* 提示文字 */}
          <p className="mt-6 text-center text-sm text-gray-400">
            登录即表示你同意我们的服务条款和隐私政策
          </p>
        </div>
      </div>
    </div>
  );
}
