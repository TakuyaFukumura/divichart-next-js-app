/**
 * localStorage設定
 * 
 * アプリケーションで使用するすべてのlocalStorageキーを定義
 */

/** localStorage設定の型定義 */
export interface StorageConfig {
  /** テーマ設定キー */
  theme: string;
  /** 為替レート設定キー */
  exchangeRate: string;
  /** 目標設定キー */
  goalSettings: string;
}

/**
 * localStorageキー定義
 */
export const storageKeys: StorageConfig = {
  theme: 'theme',
  exchangeRate: 'usdToJpyRate',
  goalSettings: 'goalSettings',
};

/**
 * localStorage操作のヘルパー関数
 */

/**
 * localStorageから値を取得
 * 
 * @param key - storageKeysで定義されたキー
 * @returns 保存された値、または null
 */
export function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(key);
}

/**
 * localStorageに値を保存
 * 
 * @param key - storageKeysで定義されたキー
 * @param value - 保存する値
 */
export function setStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(key, value);
}

/**
 * localStorageから値を削除
 * 
 * @param key - storageKeysで定義されたキー
 */
export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(key);
}

export default storageKeys;
