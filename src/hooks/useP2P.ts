"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { getDb } from "@/lib/firebase";
import { ref, set, onValue, off, remove, onDisconnect } from "firebase/database";
import SimplePeer, { Instance as PeerInstance } from "simple-peer";
import { generateShareCode } from "@/lib/utils";
import { ConnectionStatus, ReceivedFile, TransferProgress, FileMeta } from "@/types/p2p";
import { logger } from "@/lib/logger";

const CHUNK_SIZE = 16 * 1024; // 16KB
const BACKPRESSURE_THRESHOLD = CHUNK_SIZE * 5;

type FileSystemWritable = {
  write: (data: BufferSource | Blob | string) => Promise<void>;
  close: () => Promise<void>;
  abort: () => Promise<void>;
};

type ReceivingFileState = {
  meta: FileMeta;
  buffer: Uint8Array[];
  receivedSize: number;
  writer: FileSystemWritable | null;
  fileHandle: FileSystemFileHandle | null;
  useDirectSave: boolean;
};

const sanitizeFilename = (name: string) =>
  name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");

export function useP2P() {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [myCode, setMyCode] = useState<string>("");
  const [isInitiator, setIsInitiator] = useState<boolean>(false);
  
  const [incomingFiles, setIncomingFiles] = useState<ReceivedFile[]>([]);
  const [transferProgress, setTransferProgress] = useState<TransferProgress | null>(null);
  const [directSaveEnabled, setDirectSaveEnabled] = useState(false);
  const [directSaveError, setDirectSaveError] = useState<string | null>(null);
  
  const peerRef = useRef<PeerInstance | null>(null);
  const myCodeRef = useRef<string>("");
  const targetCodeRef = useRef<string>("");
  const downloadDirHandleRef = useRef<FileSystemDirectoryHandle | null>(null);
  const receiveQueueRef = useRef<Promise<void>>(Promise.resolve());
  
  // File Queue System
  const fileQueueRef = useRef<File[]>([]);
  const isSendingRef = useRef(false);

  // Receiving state
  const receivingFileRef = useRef<ReceivingFileState | null>(null);

  const cleanup = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    if (myCodeRef.current && typeof window !== 'undefined') {
      const db = getDb();
      const myRoomRef = ref(db, `rooms/${myCodeRef.current}`);
      off(myRoomRef);
      remove(myRoomRef);
    }
    if (targetCodeRef.current && typeof window !== 'undefined') {
      const db = getDb();
      const targetRoomRef = ref(db, `rooms/${targetCodeRef.current}`);
      off(targetRoomRef);
    }
    if (receivingFileRef.current?.writer) {
      receivingFileRef.current.writer.abort().catch((err) => logger.error("Writer abort failed", err));
    }
    receivingFileRef.current = null;
  }, []);

  useEffect(() => {
    const code = generateShareCode();
    setMyCode(code);
    myCodeRef.current = code;
    startListening(code);

    return () => cleanup();
  }, [cleanup]);

  const startListening = (code: string) => {
    if (typeof window === 'undefined') return;
    setStatus("waiting");
    setError(null);
    const db = getDb();
    const roomRef = ref(db, `rooms/${code}`);
    set(roomRef, { created: Date.now() });
    onDisconnect(roomRef).remove();

    const clientSignalRef = ref(db, `rooms/${code}/clientSignal`);
    onValue(clientSignalRef, (snapshot) => {
      const data = snapshot.val();
      if (data && !peerRef.current) {
        initializePeer(false, code);
        try {
          const signal = JSON.parse(data);
          setTimeout(() => {
             if (peerRef.current && !peerRef.current.destroyed) {
               peerRef.current.signal(signal);
             }
          }, 100);
        } catch (e) {
          logger.error("Signal parse error", e);
        }
      }
    });
  };

  const connectToPeer = async (targetCode: string) => {
    if (typeof window === 'undefined') return;
    if (myCodeRef.current) {
      const db = getDb();
      const myRoomRef = ref(db, `rooms/${myCodeRef.current}`);
      off(myRoomRef);
      remove(myRoomRef);
    }
    targetCodeRef.current = targetCode;
    setStatus("connecting");
    setError(null);
    initializePeer(true, targetCode);
  };

  const initializePeer = (initiator: boolean, roomId: string) => {
    setIsInitiator(initiator);
    try {
      const p = new SimplePeer({
        initiator,
        trickle: false,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' },
            // 備用 STUN 伺服器
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ],
          // 增加 ICE 候選者收集時間
          iceCandidatePoolSize: 10
        }
      });

      peerRef.current = p;

      p.on('signal', (data) => {
        if (typeof window === 'undefined') return;
        const db = getDb();
        const targetPath = initiator ? 'clientSignal' : 'hostSignal';
        set(ref(db, `rooms/${roomId}/${targetPath}`), JSON.stringify(data));
      });

      p.on('connect', () => {
        logger.log('WebRTC Connected');
        setStatus("connected");
      });

      p.on('data', (data) => {
        receiveQueueRef.current = receiveQueueRef.current.then(() => handleData(data));
        receiveQueueRef.current.catch((err) => {
          logger.error("Receive queue error", err);
        });
      });

      p.on('error', (err) => {
        logger.error('Peer error:', err);
        const error = err as any;
        // Ignore "User-Initiated Abort" as it often means the peer closed the connection
        if (error.code === 'ERR_DATA_CHANNEL' || error.message?.includes('User-Initiated Abort') || error.message?.includes('Close called')) {
          return;
        }
        
        // 處理連接失敗的特定錯誤
        let errorMessage = "連線錯誤";
        if (error.message?.includes('Connection failed')) {
          errorMessage = "無法建立連線，請檢查網路連線或防火牆設定";
        } else if (error.code === 'ERR_ICE_CONNECTION_FAILURE') {
          errorMessage = "NAT/防火牆阻擋連線，請嘗試使用不同的網路";
        } else if (error.message) {
          errorMessage = "連線錯誤: " + error.message;
        }
        
        setError(errorMessage);
        setStatus("error");
      });
      
      // 監聽 ICE 連接狀態變化
      p.on('iceStateChange', (state: string) => {
        logger.log('ICE state:', state);
        if (state === 'failed' || state === 'disconnected') {
          setError("網路連線中斷，請重試");
          setStatus("error");
        }
      });

      p.on('close', () => {
        setStatus("idle");
        setTransferProgress(null);
        // Clean up connection but don't force reload
        cleanup();
      });

      if (initiator) {
        const db = getDb();
        const hostSignalRef = ref(db, `rooms/${roomId}/hostSignal`);
        onValue(hostSignalRef, (snapshot) => {
          const data = snapshot.val();
          if (data && !p.destroyed) {
             try {
              const signal = JSON.parse(data);
              p.signal(signal);
            } catch (e) {
              logger.error("Signal parse error", e);
            }
          }
        });
      }
    } catch (err: any) {
      setError("初始化失敗: " + err.message);
      setStatus("error");
    }
  };

  const handleFileStart = async (data: string) => {
    try {
      const meta = JSON.parse(data) as FileMeta;
      const state: ReceivingFileState = {
        meta,
        buffer: [],
        receivedSize: 0,
        writer: null,
        fileHandle: null,
        useDirectSave: false,
      };

      if (downloadDirHandleRef.current && typeof downloadDirHandleRef.current.getFileHandle === "function") {
        try {
          const dirHandle = downloadDirHandleRef.current;
          const safeName = sanitizeFilename(meta.name);
          const fileHandle = await dirHandle.getFileHandle(safeName, { create: true });
          const writable = await fileHandle.createWritable();
          state.writer = writable as FileSystemWritable;
          state.fileHandle = fileHandle;
          state.useDirectSave = true;
        } catch (err) {
          logger.error("Direct save init failed", err);
        }
      }

      receivingFileRef.current = state;
      setTransferProgress({
        fileName: meta.name,
        transferred: 0,
        total: meta.size,
        percentage: 0,
        queueSize: 0 // Receiver doesn't know queue size
      });
    } catch (e) {
      logger.error("Meta parse error", e);
    }
  };

  const handleFileChunk = async (data: Uint8Array) => {
    if (!receivingFileRef.current) return;

    const current = receivingFileRef.current;
    const chunk = new Uint8Array(data);
    if (current.useDirectSave && current.writer) {
      await current.writer.write(chunk);
    } else {
      current.buffer.push(chunk);
    }
    current.receivedSize += chunk.byteLength;

    setTransferProgress({
      fileName: current.meta.name,
      transferred: current.receivedSize,
      total: current.meta.size,
      percentage: Math.min(100, Math.round((current.receivedSize / current.meta.size) * 100)),
      queueSize: 0
    });

    if (current.receivedSize >= current.meta.size) {
      let blob: Blob;
      let url: string;

      if (current.useDirectSave && current.writer && current.fileHandle) {
        await current.writer.close();
        const savedFile = await current.fileHandle.getFile();
        blob = savedFile;
        url = URL.createObjectURL(savedFile);
      } else {
        blob = new Blob(current.buffer as unknown as BlobPart[], { type: current.meta.mime });
        url = URL.createObjectURL(blob);
      }
      
      const newFile: ReceivedFile = {
        id: current.meta.id,
        name: current.meta.name,
        path: current.meta.path,
        size: current.meta.size,
        type: current.meta.mime,
        blob,
        url
      };
      
      setIncomingFiles(prev => [...prev, newFile]);
      setTransferProgress(null);
      receivingFileRef.current = null;
    }
  };

  const handleData = async (data: any) => {
    const dataStr = data.toString();
    if (dataStr.startsWith('{') && dataStr.includes('"type":"file-start"')) {
      await handleFileStart(dataStr);
    } else if (receivingFileRef.current) {
      await handleFileChunk(data);
    }
  };

  const sendSingleFile = async (file: File) => {
    if (!peerRef.current) throw new Error("No peer connection");

    const fileId = crypto.randomUUID();
    // Use webkitRelativePath if available (for folder uploads)
    const path = (file as any).webkitRelativePath || file.name;

    const meta: FileMeta = {
      type: 'file-start',
      id: fileId,
      name: file.name,
      path: path,
      size: file.size,
      mime: file.type
    };

    peerRef.current.send(JSON.stringify(meta));

    const reader = file.stream().getReader();
    let bytesSent = 0;

    // Initial progress
    setTransferProgress({
      fileName: file.name,
      transferred: 0,
      total: file.size,
      percentage: 0,
      queueSize: fileQueueRef.current.length
    });

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done || !value) break;
        if (!peerRef.current) break; // Connection lost

        let cursor = 0;
        while (cursor < value.length) {
          const slice = value.subarray(cursor, cursor + CHUNK_SIZE);
          
          // Simple backpressure check
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (peerRef.current && (peerRef.current as any)._channel.bufferedAmount > BACKPRESSURE_THRESHOLD) {
            await new Promise(r => setTimeout(r, 50));
          }

          peerRef.current.send(slice);
          cursor += slice.length;
          bytesSent += slice.length;

          setTransferProgress({
            fileName: file.name,
            transferred: bytesSent,
            total: file.size,
            percentage: Math.min(100, Math.round((bytesSent / file.size) * 100)),
            queueSize: fileQueueRef.current.length
          });

          // Yield to event loop to keep UI responsive
          if (bytesSent % BACKPRESSURE_THRESHOLD === 0) {
            await new Promise(r => setTimeout(r, 0));
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  const processQueue = async () => {
    if (isSendingRef.current || fileQueueRef.current.length === 0 || !peerRef.current) return;

    isSendingRef.current = true;
    const file = fileQueueRef.current.shift()!;
    
    try {
      await sendSingleFile(file);
    } catch (e) {
      logger.error("Failed to send file", file.name, e);
    } finally {
      isSendingRef.current = false;
      // Continue to next file
      if (fileQueueRef.current.length > 0) {
        processQueue();
      } else {
        setTransferProgress(null);
      }
    }
  };

  const sendFiles = (files: File[]) => {
    if (!peerRef.current || status !== 'connected') {
      throw new Error("尚未連線");
    }
    fileQueueRef.current.push(...files);
    processQueue();
  };

  return {
    status,
    error,
    myCode,
    connectToPeer,
    sendFiles,
    incomingFiles,
    transferProgress,
    isInitiator,
    directSaveEnabled,
    directSaveError,
    requestDownloadDirectory: async () => {
      if (typeof window === 'undefined') {
        const message = "目前瀏覽器不支援自動保存，建議使用桌面版 Chrome / Edge。";
        setDirectSaveError(message);
        throw new Error(message);
      }
      const directoryPickerWindow = window as typeof window & {
        showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
      };
      if (typeof directoryPickerWindow.showDirectoryPicker !== 'function') {
        const message = "目前瀏覽器不支援自動保存，建議使用桌面版 Chrome / Edge。";
        setDirectSaveError(message);
        throw new Error(message);
      }
      try {
        const dirHandle = await directoryPickerWindow.showDirectoryPicker();
        downloadDirHandleRef.current = dirHandle;
        setDirectSaveEnabled(true);
        setDirectSaveError(null);
      } catch (err) {
        if ((err as DOMException).name !== "AbortError") {
          const message = "無法啟用自動保存：" + ((err as Error).message ?? "未知錯誤");
          setDirectSaveError(message);
          throw new Error(message);
        }
        throw err;
      }
    },
    disconnect: cleanup
  };
}
