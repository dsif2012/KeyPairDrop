/**
 * 安全的 Firebase 初始化
 * 處理 storage 訪問錯誤
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { storageSafe } from "./storage-safe";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let db: Database | null = null;

try {
  // 檢查 storage 是否可用（Firebase 可能會使用）
  if (!storageSafe.isAvailable()) {
    console.warn('Storage not available, Firebase may have limited functionality');
  }

  // Initialize Firebase (avoid re-initialization in Next.js)
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getDatabase(app);
} catch (error: any) {
  // 捕獲 storage 相關錯誤
  if (error.message?.includes('storage') || error.message?.includes('Access to storage')) {
    console.warn('Firebase initialization warning (storage access):', error.message);
    // 嘗試繼續初始化（某些 Firebase 功能可能受限）
    try {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      db = getDatabase(app);
    } catch (retryError) {
      console.error('Firebase initialization failed:', retryError);
    }
  } else {
    console.error('Firebase initialization error:', error);
  }
}

export { db };

