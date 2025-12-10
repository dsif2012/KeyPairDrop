export type ConnectionStatus = 
  | "idle" 
  | "waiting"      
  | "connecting"   
  | "connected"    
  | "error";

export interface ReceivedFile {
  id: string;
  name: string;
  path?: string; // Relative path for folders
  size: number;
  type: string;
  blob: Blob;
  url: string;
}

export interface TransferProgress {
  fileName: string;
  transferred: number;
  total: number;
  percentage: number;
  queueSize: number; // Remaining files in queue
}

export interface FileMeta {
  type: 'file-start';
  id: string;
  name: string;
  path?: string;
  size: number;
  mime: string;
}

