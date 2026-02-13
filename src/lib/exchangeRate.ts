/**
 * 為替レート設定モジュール
 * 
 * 環境変数から為替レートを取得し、未設定の場合はデフォルト値を返します。
 */

import { appConfig } from '@/config';

/** デフォルトの為替レート（1ドル=150円） */
export const DEFAULT_USD_TO_JPY_RATE = appConfig.exchangeRate.defaultRate;

/** 為替レートの最小値（円） */
export const MIN_USD_TO_JPY_RATE = 50;

/** 為替レートの最大値（円） */
export const MAX_USD_TO_JPY_RATE = 300;

/** 為替レート入力のデバウンス遅延（ミリ秒） */
export const EXCHANGE_RATE_DEBOUNCE_DELAY = 500;

/**
 * USドルから日本円への為替レートを取得
 * 
 * @returns 為替レート（1ドル = n円）
 * 
 * @remarks
 * - 環境変数 NEXT_PUBLIC_USD_TO_JPY_RATE から取得
 * - 環境変数が未設定または無効な場合はデフォルト値(150円)を使用
 * - 負の値やNaNの場合もデフォルト値を使用
 */
export function getUsdToJpyRate(): number {
    const envRate = process.env.NEXT_PUBLIC_USD_TO_JPY_RATE;
    
    if (!envRate) {
        return DEFAULT_USD_TO_JPY_RATE;
    }
    
    const rate = Number(envRate);
    
    if (isNaN(rate) || rate <= 0) {
        return DEFAULT_USD_TO_JPY_RATE;
    }
    
    return rate;
}
