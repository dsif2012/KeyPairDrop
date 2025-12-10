'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 在生產環境中，將錯誤記錄到錯誤監控服務
    // 例如: Sentry, LogRocket 等
    if (process.env.NODE_ENV === 'production') {
      // 不要在這裡使用 console.error，使用錯誤監控服務
      // console.error('Application error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-[100dvh] bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
          500
        </h1>
        <h2 className="text-2xl font-bold text-white">發生錯誤</h2>
        <p className="text-zinc-400">
          抱歉，應用程式發生未預期的錯誤。請稍後再試。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            重試
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors"
          >
            <Home className="w-5 h-5" />
            返回首頁
          </Link>
        </div>
      </div>
    </div>
  );
}

