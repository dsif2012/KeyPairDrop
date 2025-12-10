"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, set, onValue, off, remove, onDisconnect } from "firebase/database";
import SimplePeer, { Instance as PeerInstance } from "simple-peer";
import { generateShareCode } from "@/lib/utils";
import { ConnectionStatus, ReceivedFile, TransferProgress, FileMeta } from "@/types/p2p";

const CHUNK_SIZE = 16 * 1024; // 16KB
const BACKPRESSURE_THRESHOLD = CHUNK_SIZE * 5;

export function useP2P() {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [myCode, setMyCode] = useState<string>("");
  const [isInitiator, setIsInitiator] = useState<boolean>(false);
  
  const [incomingFiles, setIncomingFiles] = useState<ReceivedFile[]>([]);
  const [transferProgress, setTransferProgress] = useState<TransferProgress | null>(null);
  
  const peerRef = useRef<PeerInstance | null>(null);
  const myCodeRef = useRef<string>("");
  const targetCodeRef = useRef<string>("");
  
  // File Queue System
  const fileQueueRef = useRef<File[]>([]);
  const isSendingRef = useRef(false);

  // Receiving state
  const receivingFileRef = useRef<{
    meta: FileMeta;
    buffer: Uint8Array[];
    receivedSize: number;
  } | null>(null);

  const cleanup = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    if (myCodeRef.current) {
      const myRoomRef = ref(db, `rooms/${myCodeRef.current}`);
      off(myRoomRef);
      remove(myRoomRef);
    }
    if (targetCodeRef.current) {
      const targetRoomRef = ref(db, `rooms/${targetCodeRef.current}`);
      off(targetRoomRef);
    }
  }, []);

  useEffect(() => {
    const code = generateShareCode();
    setMyCode(code);
    myCodeRef.current = code;
    startListening(code);

    return () => cleanup();
  }, [cleanup]);

  const startListening = (code: string) => {
    setStatus("waiting");
    setError(null);
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
          console.error("Signal parse error", e);
        }
      }
    });
  };

  const connectToPeer = async (targetCode: string) => {
    if (myCodeRef.current) {
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
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      peerRef.current = p;

      p.on('signal', (data) => {
        const targetPath = initiator ? 'clientSignal' : 'hostSignal';
        set(ref(db, `rooms/${roomId}/${targetPath}`), JSON.stringify(data));
      });

      p.on('connect', () => {
        console.log('WebRTC Connected');
        setStatus("connected");
      });

      p.on('data', handleData);

      p.on('error', (err) => {
        console.error('Peer error:', err);
        setError("連線錯誤: " + err.message);
        setStatus("error");
      });

      p.on('close', () => {
        setStatus("idle");
        setTransferProgress(null);
        // Clean up connection but don't force reload
        cleanup();
      });

      if (initiator) {
        const hostSignalRef = ref(db, `rooms/${roomId}/hostSignal`);
        onValue(hostSignalRef, (snapshot) => {
          const data = snapshot.val();
          if (data && !p.destroyed) {
             try {
              const signal = JSON.parse(data);
              p.signal(signal);
            } catch (e) {
              console.error("Signal parse error", e);
            }
          }
        });
      }
    } catch (err: any) {
      setError("初始化失敗: " + err.message);
      setStatus("error");
    }
  };

  const handleFileStart = (data: string) => {
    try {
      const meta = JSON.parse(data) as FileMeta;
      receivingFileRef.current = {
        meta,
        buffer: [],
        receivedSize: 0
      };
      setTransferProgress({
        fileName: meta.name,
        transferred: 0,
        total: meta.size,
        percentage: 0,
        queueSize: 0 // Receiver doesn't know queue size
      });
    } catch (e) {
      console.error("Meta parse error", e);
    }
  };

  const handleFileChunk = (data: Uint8Array) => {
    if (!receivingFileRef.current) return;

    const current = receivingFileRef.current;
    const chunk = new Uint8Array(data);
    current.buffer.push(chunk);
    current.receivedSize += chunk.byteLength;

    setTransferProgress({
      fileName: current.meta.name,
      transferred: current.receivedSize,
      total: current.meta.size,
      percentage: Math.min(100, Math.round((current.receivedSize / current.meta.size) * 100)),
      queueSize: 0
    });

    if (current.receivedSize >= current.meta.size) {
      const blob = new Blob(current.buffer as unknown as BlobPart[], { type: current.meta.mime });
      const url = URL.createObjectURL(blob);
      
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

  const handleData = (data: any) => {
    const dataStr = data.toString();
    if (dataStr.startsWith('{') && dataStr.includes('"type":"file-start"')) {
      handleFileStart(dataStr);
    } else if (receivingFileRef.current) {
      handleFileChunk(data);
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

    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    let offset = 0;

    // Initial progress
    setTransferProgress({
      fileName: file.name,
      transferred: 0,
      total: file.size,
      percentage: 0,
      queueSize: fileQueueRef.current.length
    });

    while (offset < uint8Array.length) {
      if (!peerRef.current) break; // Connection lost

      const end = Math.min(offset + CHUNK_SIZE, uint8Array.length);
      const chunk = uint8Array.slice(offset, end);
      
      // Simple backpressure check
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (peerRef.current && (peerRef.current as any)._channel.bufferedAmount > BACKPRESSURE_THRESHOLD) {
        await new Promise(r => setTimeout(r, 50));
      }

      peerRef.current.send(chunk);
      offset = end;
      
      setTransferProgress({
        fileName: file.name,
        transferred: offset,
        total: file.size,
        percentage: Math.round((offset / file.size) * 100),
        queueSize: fileQueueRef.current.length
      });
      
      // Yield to event loop to keep UI responsive
      if (offset % BACKPRESSURE_THRESHOLD === 0) {
        await new Promise(r => setTimeout(r, 0));
      }
    }
  };

  const processQueue = async () => {
    if (isSendingRef.current || fileQueueRef.current.length === 0 || !peerRef.current) return;

    isSendingRef.current = true;
    const file = fileQueueRef.current.shift()!;
    
    try {
      await sendSingleFile(file);
    } catch (e) {
      console.error("Failed to send file", file.name, e);
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
    disconnect: cleanup
  };
}
