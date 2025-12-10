"use client";

import { useParams, useRouter } from "next/navigation";
import { useP2P } from "@/hooks/useP2P";
import { ConnectionForm } from "@/components/ConnectionForm";
import { FileTransfer } from "@/components/FileTransfer";
import { Loader2, AlertCircle } from "lucide-react";

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  
  const { 
    status, 
    error,
    myCode, 
    connectToPeer: connect, 
    disconnect, 
    isInitiator, 
    sendFiles: sendFile, 
    incomingFiles, 
    transferProgress 
  } = useP2P();

  const handleConnect = (rid: string) => {
    connect(rid);
  };

  const handleDisconnect = () => {
    disconnect();
    router.push('/');
  };

  const renderContent = () => {
    if (status === "connected") {
      return (
        <FileTransfer
          onSendFile={sendFile}
          incomingFiles={incomingFiles}
          transferProgress={transferProgress}
          disconnect={handleDisconnect}
          isInitiator={isInitiator}
          roomId={roomId}
        />
      );
    }

    if (status === "idle" || status === "error" || status === "waiting") {
      return (
        <div className="flex flex-col items-center w-full">
          <ConnectionForm 
            myCode={myCode}
            initialTargetCode={roomId}
            onConnect={handleConnect} 
            isLoading={false} 
          />
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 max-w-md w-full border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          
          <button 
             onClick={() => router.push('/')}
             className="mt-8 text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >
            ← 返回首頁建立房間
          </button>
        </div>
      );
    }

    // Connecting States
    let loadingText = "連線中...";
    if (status === "connecting") loadingText = "正在建立 P2P 連線...";

    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full text-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{loadingText}</h3>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col items-center justify-center p-4">
      {renderContent()}
      
      <footer className="mt-12 text-center text-gray-400 text-sm">
        <p>Quick Share - Secure P2P File Sharing</p>
      </footer>
    </div>
  );
}
