'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">出错了</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <p className="text-xs text-gray-400 mb-4">Digest: {error.digest}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          重试
        </button>
      </div>
    </div>
  );
}
