import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
          404
        </h1>
        <h2 className="text-2xl font-bold text-white">頁面不存在</h2>
        <p className="text-zinc-400">
          抱歉，您要尋找的頁面不存在或已被移除。
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition-colors"
        >
          <Home className="w-5 h-5" />
          返回首頁
        </Link>
      </div>
    </div>
  );
}

