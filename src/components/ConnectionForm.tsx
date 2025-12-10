// src/components/ConnectionForm.tsx
import React, { useState } from 'react';
import { ArrowRight, Copy, Check, KeyRound, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ConnectionFormProps {
  myCode: string;
  onConnect: (targetCode: string) => void;
  isLoading: boolean;
}

export function ConnectionForm({ 
  myCode, 
  onConnect, 
  isLoading 
}: ConnectionFormProps) {
  const [targetCode, setTargetCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(myCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetCode && targetCode.length === 6) {
      onConnect(targetCode.toUpperCase());
    }
  };

  return (
    <div className="w-full max-w-lg bg-zinc-900/60 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 ring-1 ring-black/5">
      
      {/* Header Section (Merged) */}
      <div className="pt-10 pb-6 px-8 text-center bg-gradient-to-b from-zinc-800/50 to-transparent flex flex-col items-center">
        <div className="mb-4 relative w-20 h-20">
          <Image 
            src="/logo.png" 
            alt="KeyPairDrop Logo" 
            fill
            className="object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"
            priority
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-lg">
          KeyPair<span className="text-cyan-400">Drop</span>
        </h1>
        <p className="text-cyan-400 text-xs md:text-sm font-bold tracking-[0.2em] flex items-center justify-center gap-2 uppercase">
          <ShieldCheck className="w-4 h-4" />
          Secure P2P Encrypted
        </p>
      </div>

      {/* Code Display Section */}
      <div className="bg-gradient-to-br from-cyan-900/10 to-blue-900/10 p-6 md:p-8 text-center relative overflow-hidden group border-y border-white/5">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:16px_16px]" />
        
        <h2 className="text-cyan-200/70 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 flex items-center justify-center gap-2">
          <KeyRound className="w-3 h-3" />
          YOUR PAIR KEY
        </h2>
        
        <div 
          onClick={handleCopy}
          className="relative z-10 flex items-center justify-center gap-3 mb-4 cursor-pointer hover:scale-105 transition-transform duration-300"
        >
          <span className="text-4xl md:text-5xl font-mono font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 drop-shadow-sm filter select-none">
            {myCode ? myCode.slice(0, 3) + ' ' + myCode.slice(3) : '...'}
          </span>
        </div>

        <button 
          onClick={handleCopy}
          className="relative z-10 inline-flex items-center gap-2 text-[10px] font-bold text-cyan-200/70 hover:text-cyan-100 transition-colors bg-white/5 hover:bg-white/10 px-4 py-1.5 rounded-full border border-white/5 tracking-wider uppercase"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'COPIED' : 'CLICK TO COPY'}
        </button>
      </div>

      {/* Input Section */}
      <div className="p-6 md:p-8 bg-black/20">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <input
              type="text"
              value={targetCode}
              onChange={(e) => setTargetCode(e.target.value.toUpperCase().slice(0, 6))}
              className="w-full bg-black/40 border-2 border-zinc-700/50 text-zinc-100 text-center text-2xl md:text-3xl font-mono font-bold tracking-[0.3em] rounded-2xl px-4 py-5 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all placeholder:text-zinc-800 uppercase"
              placeholder="KEY"
              disabled={isLoading}
              maxLength={6}
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>

          <button
            type="submit"
            disabled={isLoading || targetCode.length !== 6}
            className={cn(
              "w-full bg-zinc-100 text-zinc-950 hover:bg-cyan-400 hover:text-zinc-950 font-black tracking-wider py-4 rounded-xl transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] shadow-lg shadow-black/20",
              "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-zinc-100 disabled:hover:text-zinc-950"
            )}
          >
            {isLoading ? (
              <span className="animate-pulse">CONNECTING...</span>
            ) : (
              <>
                CONNECT PAIR
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
