/**
 * 安全的 Firebase 初始化
 * 處理 storage 訪問錯誤，僅在客戶端初始化
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";

let app: FirebaseApp | undefined;
let dbInstance: Database | undefined;

function initializeFirebase(): Database {
  // 只在客戶端初始化
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be initialized on the client side.');
  }

  // 如果已經初始化，返回現有的實例
  if (dbInstance) {
    return dbInstance;
  }

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // 驗證必需的配置
  if (!firebaseConfig.databaseURL || !firebaseConfig.projectId) {
    throw new Error('Firebase configuration is incomplete. Please check your environment variables (NEXT_PUBLIC_FIREBASE_DATABASE_URL and NEXT_PUBLIC_FIREBASE_PROJECT_ID).');
  }

  try {
    // Initialize Firebase (avoid re-initialization in Next.js)
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    dbInstance = getDatabase(app);
    return dbInstance;
  } catch (error: any) {
    // 捕獲 storage 相關錯誤（Firebase 可能會嘗試訪問 storage）
    if (error.message?.includes('storage') || error.message?.includes('Access to storage')) {
      // 在開發環境顯示警告，生產環境靜默處理
      if (process.env.NODE_ENV === 'development') {
        console.warn('Firebase initialization warning (storage access):', error.message);
      }
      // 嘗試繼續初始化（某些 Firebase 功能可能受限，但不影響 Realtime Database）
      try {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        dbInstance = getDatabase(app);
        return dbInstance;
      } catch (retryError) {
        console.error('Firebase initialization failed:', retryError);
        // 如果重試也失敗，仍然嘗試初始化（某些環境下可能仍能工作）
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        dbInstance = getDatabase(app);
        return dbInstance;
      }
    } else {
      console.error('Firebase initialization error:', error);
      // 即使有錯誤，也嘗試初始化（應用需要 Firebase 才能運行）
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      dbInstance = getDatabase(app);
      return dbInstance;
    }
  }
}

// 導出一個 getter 函數，延遲初始化直到實際使用
export function getDb(): Database {
  return initializeFirebase();
}

