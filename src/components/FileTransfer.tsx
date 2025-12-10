// src/components/FileTransfer.tsx
import React, { useRef, useState } from 'react';
import { Upload, File as FileIcon, Download, Loader2, PlayCircle, Image as ImageIcon, X, Folder, Layers, Package, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';
import { ReceivedFile, TransferProgress } from '@/types/p2p';
import { logger } from '@/lib/logger';

interface FileTransferProps {
  onSendFile: (files: File[]) => void;
  incomingFiles: ReceivedFile[];
  transferProgress: TransferProgress | null;
  disconnect: () => void;
  isInitiator: boolean;
  roomId: string;
}

export function FileTransfer({
  onSendFile,
  incomingFiles,
  transferProgress,
  disconnect,
  roomId
}: FileTransferProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [previewFile, setPreviewFile] = useState<ReceivedFile | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onSendFile(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (transferProgress) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onSendFile(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDownloadAll = async () => {
    if (incomingFiles.length === 0) return;
    
    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      // Add files to zip with folder structure
      incomingFiles.forEach(file => {
        // Use path if available, otherwise just name
        const filePath = file.path || file.name;
        zip.file(filePath, file.blob);
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `KeyPairDrop_${new Date().toISOString().slice(0,10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      logger.error("Zip generation failed:", err);
      alert("Failed to create zip file");
    } finally {
      setIsZipping(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (type: string) => type.startsWith('image/');
  const isVideo = (type: string) => type.startsWith('video/');

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      
      {/* Upload & Status Section */}
      <div className="w-full">
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
              <span className="text-sm font-mono text-zinc-400">
                CONNECTED: <span className="text-cyan-400 font-bold tracking-wider">{roomId.slice(0,3)} {roomId.slice(3)}</span>
              </span>
            </div>
            <button
              onClick={disconnect}
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-full transition-colors border border-red-500/20"
            >
              DISCONNECT
            </button>
          </div>

          {/* Drop Zone */}
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={cn(
              "group relative border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center transition-all duration-300 overflow-hidden",
              transferProgress 
                ? "border-zinc-800 bg-zinc-900/50 cursor-not-allowed opacity-50" 
                : "border-zinc-700 bg-zinc-900/30 hover:bg-zinc-800/50 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="bg-zinc-800 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-cyan-500/20">
              <Upload className="w-8 h-8 text-cyan-400" />
            </div>
            <p className="text-zinc-300 font-medium text-lg mb-1">Drop files to send</p>
            
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={!!transferProgress}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg border border-zinc-700 transition-colors flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                Select Files
              </button>
              
              <button 
                onClick={() => folderInputRef.current?.click()}
                disabled={!!transferProgress}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg border border-zinc-700 transition-colors flex items-center gap-2"
              >
                <Folder className="w-4 h-4" />
                Select Folder
              </button>
            </div>

            {/* Hidden Inputs */}
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
            />
            <input
              type="file"
              className="hidden"
              ref={folderInputRef}
              onChange={handleFileChange}
              {...{ webkitdirectory: "", directory: "" } as any} 
            />
          </div>

          {/* Progress Bar */}
          {transferProgress && (
            <div className="mt-6 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-5 shadow-lg relative overflow-hidden">
               <div className="absolute inset-0 bg-cyan-500/5 animate-pulse" />
              <div className="relative flex justify-between items-center mb-3">
                <div className="flex flex-col">
                  <span className="font-bold text-zinc-200 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    Sending: {transferProgress.fileName}
                  </span>
                  {transferProgress.queueSize > 0 && (
                     <span className="text-xs text-zinc-500 ml-6">
                       +{transferProgress.queueSize} files in queue
                     </span>
                  )}
                </div>
                <span className="text-xs font-mono text-cyan-400">
                  {transferProgress.percentage}%
                </span>
              </div>
              <div className="w-full bg-zinc-900/80 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-cyan-500 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                  style={{ width: `${transferProgress.percentage}%` }}
                ></div>
              </div>
              <div className="mt-2 text-right text-xs text-zinc-500 font-mono">
                 {formatSize(transferProgress.transferred)} / {formatSize(transferProgress.total)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Received Files Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-zinc-400 text-sm tracking-wider uppercase flex items-center gap-2">
            Received Files
            <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-xs font-mono">
              {incomingFiles.length}
            </span>
          </h3>
          
          {incomingFiles.length > 1 && (
            <button
              onClick={handleDownloadAll}
              disabled={isZipping}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-full transition-colors disabled:opacity-50"
            >
              {isZipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
              {isZipping ? 'Zipping...' : 'Download All (Zip)'}
            </button>
          )}
        </div>
        
        <div className="space-y-3 lg:h-[calc(100vh-200px)] h-auto overflow-y-auto pr-2 custom-scrollbar max-h-[500px] lg:max-h-none">
          {incomingFiles.length === 0 ? (
            <div className="h-32 lg:h-40 flex items-center justify-center text-zinc-600 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl text-sm">
              Waiting for files...
            </div>
          ) : (
            [...incomingFiles].reverse().map((file) => (
              <div key={file.id} className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all shadow-lg hover:shadow-cyan-500/5">
                
                {/* Media Preview Trigger */}
                {(isImage(file.type) || isVideo(file.type)) && (
                  <div 
                    onClick={() => setPreviewFile(file)}
                    className="aspect-video bg-zinc-950 relative cursor-pointer overflow-hidden group/preview"
                  >
                    {isImage(file.type) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover opacity-80 group-hover/preview:opacity-100 transition-opacity" />
                    ) : (
                      <video src={file.url} className="w-full h-full object-cover opacity-80" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/preview:opacity-100 transition-opacity">
                      {isImage(file.type) ? <ImageIcon className="w-8 h-8 text-white" /> : <PlayCircle className="w-8 h-8 text-white" />}
                    </div>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-200 truncate text-sm" title={file.name}>{file.name}</p>
                      
                      {/* Show Path if available (for folder structures) */}
                      {file.path && file.path !== file.name && (
                         <p className="text-[10px] text-zinc-600 truncate mt-0.5 flex items-center gap-1" title={file.path}>
                           <Folder className="w-3 h-3" />
                           {file.path}
                         </p>
                      )}
                      
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">{formatSize(file.size)}</p>
                    </div>
                    
                    {!(isImage(file.type) || isVideo(file.type)) && (
                       <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
                         {file.path && file.path !== file.name ? <Package className="w-5 h-5" /> : <FileIcon className="w-5 h-5" />}
                       </div>
                    )}
                  </div>
                  
                  <a
                    href={file.url}
                    download={file.name} 
                    className="flex items-center justify-center w-full gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors text-xs font-bold uppercase tracking-wide"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Full Screen Media Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <button 
            onClick={() => setPreviewFile(null)}
            className="absolute top-6 right-6 p-2 bg-zinc-800/50 hover:bg-zinc-700 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="max-w-5xl max-h-[85vh] w-full bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
             <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
                <h3 className="font-medium text-zinc-200 truncate">{previewFile.name}</h3>
                <a 
                   href={previewFile.url}
                   download={previewFile.name}
                   className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Save
                </a>
             </div>
             <div className="bg-black flex items-center justify-center h-[calc(85vh-60px)]">
               {isImage(previewFile.type) ? (
                 // eslint-disable-next-line @next/next/no-img-element
                 <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-full object-contain" />
               ) : (
                 <video src={previewFile.url} controls autoPlay className="max-w-full max-h-full" />
               )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
