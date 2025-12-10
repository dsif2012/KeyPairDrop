/**
 * 生產環境安全的日誌工具
 * 在開發環境顯示 console，生產環境可整合錯誤監控服務
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
    // 生產環境：可整合 Sentry, LogRocket 等服務
  },
  
  error: (...args: unknown[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
    // 生產環境：發送到錯誤監控服務
    // 例如: Sentry.captureException(args[0]);
  },
  
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};

