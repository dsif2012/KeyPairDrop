/**
 * 安全的 Storage 存取工具
 * 處理在 iframe 或受限環境中無法訪問 storage 的情況
 */

export const storageSafe = {
  /**
   * 安全地訪問 localStorage
   */
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem(key);
    } catch (e) {
      // 在 iframe 或受限環境中，localStorage 可能無法訪問
      return null;
    }
  },

  /**
   * 安全地設置 localStorage
   */
  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      window.localStorage.setItem(key, value);
      return true;
    } catch (e) {
      // 忽略 storage 錯誤，不影響應用運行
      return false;
    }
  },

  /**
   * 安全地移除 localStorage
   */
  removeItem: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      window.localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * 檢查 storage 是否可用
   */
  isAvailable: (): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      const test = '__storage_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },
};

