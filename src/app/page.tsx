"use client";

import { useP2P } from "@/hooks/useP2P";
import { ConnectionForm } from "@/components/ConnectionForm";
import { FileTransfer } from "@/components/FileTransfer";
import { Loader2 } from "lucide-react";
import NoiseField from "@/components/ui/background";

export default function Home() {
  const { 
    status, 
    error, 
    myCode,
    connectToPeer, 
    sendFiles, 
    incomingFiles, 
    transferProgress,
    disconnect,
    isInitiator
  } = useP2P();

  const handleConnect = (targetCode: string) => {
    connectToPeer(targetCode);
  };

  const renderContent = () => {
    if (status === "connected") {
      return (
        <div className="w-full animate-in fade-in duration-500">
           <FileTransfer
            onSendFile={sendFiles} 
            incomingFiles={incomingFiles}
            transferProgress={transferProgress}
            disconnect={disconnect}
            isInitiator={isInitiator} 
            roomId={myCode} 
          />
        </div>
      );
    }

    if (status === "waiting" || status === "idle" || status === "error") {
      return (
        <div className="flex flex-col items-center w-full max-w-lg animate-in slide-in-from-bottom-8 duration-700">
          
          <ConnectionForm 
            myCode={myCode}
            onConnect={handleConnect}
            isLoading={false} 
          />
          
          {error && (
            <div className="mt-6 p-4 bg-red-500/10 text-red-400 rounded-xl flex items-center gap-3 w-full border border-red-500/20 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}
        </div>
      );
    }

    // Connecting State
    if (status === "connecting") {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/5 max-w-md w-full text-center relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative mb-8">
             <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping opacity-25 duration-1000"></div>
             <div className="absolute inset-0 bg-cyan-500/10 rounded-full animate-ping opacity-50 duration-2000 delay-300"></div>
            <div className="relative bg-zinc-900 p-6 rounded-full border border-zinc-800 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 tracking-wide">ESTABLISHING LINK</h3>
          <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest">Searching for peer...</p>
          
          <button 
            onClick={disconnect}
            className="mt-10 px-8 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold tracking-widest uppercase transition-colors border border-zinc-700 hover:border-zinc-600"
          >
            Cancel
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-950 flex flex-col items-center justify-center p-4 md:p-8 selection:bg-cyan-500/30 relative overflow-hidden">
      
      {/* Dynamic Noise Field Background */}
      <div style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0 }} >
        <NoiseField 
          backgroundColor={"#09090b"} 
          particleNum={600} 
          step={3}
          base={1000}
          zInc={0.001}
          colorTheme={"cool"} 
          fadeSpeed={0.05}
          maxLines={600}
          spawnRate={10}
        />
      </div>

      <main className="relative z-10 w-full flex flex-col items-center">
        {renderContent()}
        
        <footer className="mt-16 text-center">
          <p className="text-zinc-600 text-xs font-mono tracking-widest uppercase backdrop-blur-sm px-2 py-1 rounded">
            © 2025 KeyPairDrop • E2E Encrypted
          </p>
        </footer>
      </main>
    </div>
  );
}
