'use client';

import {createContext, ReactNode, useContext, useEffect, useMemo, useState} from 'react';
import {DEFAULT_USD_TO_JPY_RATE, getUsdToJpyRate} from '@/lib/exchangeRate';
import { storageKeys, getStorageItem, setStorageItem, removeStorageItem } from '@/config';

/**
 * 為替レートコンテキストの型定義
 * 為替レートの状態と設定関数を提供するインターフェース
 */
interface ExchangeRateContextType {
    /** 現在の為替レート（1ドル = n円） */
    usdToJpyRate: number;
    /** 為替レートを変更する関数 */
    setUsdToJpyRate: (rate: number) => void;
    /** デフォルトの為替レート（定数） */
    defaultRate: number;
    /** デフォルト値にリセットする関数 */
    resetToDefault: () => void;
}

/**
 * 為替レートコンテキスト
 * アプリケーション全体で為替レート設定を共有するためのReactコンテキスト
 */
const ExchangeRateContext = createContext<ExchangeRateContextType | undefined>(undefined);

/**
 * 為替レートプロバイダーコンポーネント
 * アプリケーション全体に為替レート設定機能を提供する
 *
 * @param props - プロバイダーのプロパティ
 * @param props.children - 子要素として表示されるコンポーネント
 * @returns 為替レート設定機能を提供するコンテキストプロバイダー
 *
 * @remarks
 * - 為替レート設定はlocalStorageに永続化される
 * - 優先順位: 1. localStorage の値 → 2. 環境変数 → 3. デフォルト値(150円)
 * - 初回マウント時にlocalStorageから以前の設定を読み込む
 */
export function ExchangeRateProvider({children}: { readonly children: ReactNode }) {
    const [usdToJpyRate, setUsdToJpyRateState] = useState<number>(() => {
        // 初期値の設定（サーバーサイドレンダリング対応）
        return getUsdToJpyRate();
    });

    // 初回マウント時にlocalStorageから設定を読み込む
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedRate = getStorageItem(storageKeys.exchangeRate);
            if (savedRate) {
                const rate = parseFloat(savedRate);
                if (!isNaN(rate) && rate > 0) {
                    setUsdToJpyRateState(rate);
                    return;
                }
            }
            // localStorage に値がない場合は環境変数またはデフォルト値を使用
            setUsdToJpyRateState(getUsdToJpyRate());
        }
    }, []);

    /**
     * 為替レートを設定し、localStorageに保存する
     *
     * @param rate - 新しい為替レート（正の数値のみ有効）
     */
    const setUsdToJpyRate = (rate: number) => {
        if (!isNaN(rate) && rate > 0) {
            setUsdToJpyRateState(rate);
            if (typeof window !== 'undefined') {
                setStorageItem(storageKeys.exchangeRate, String(rate));
            }
        }
    };

    /**
     * 為替レートをデフォルト値にリセットする
     * デフォルト値（150円）に戻し、localStorageをクリアする
     */
    const resetToDefault = () => {
        setUsdToJpyRateState(DEFAULT_USD_TO_JPY_RATE);
        if (typeof window !== 'undefined') {
            removeStorageItem(storageKeys.exchangeRate);
        }
    };

    const value = useMemo(
        () => ({
            usdToJpyRate,
            setUsdToJpyRate,
            defaultRate: DEFAULT_USD_TO_JPY_RATE,
            resetToDefault,
        }),
        [usdToJpyRate]
    );

    return (
        <ExchangeRateContext.Provider value={value}>
            {children}
        </ExchangeRateContext.Provider>
    );
}

/**
 * 為替レートカスタムフック
 * 為替レートの状態と操作機能にアクセスするためのフック
 *
 * @returns 為替レートのコンテキスト値
 * @throws {Error} ExchangeRateProviderの外で使用された場合にエラーをスロー
 *
 * @example
 * ```tsx
 * const { usdToJpyRate, setUsdToJpyRate, resetToDefault } = useExchangeRate();
 * ```
 */
export function useExchangeRate(): ExchangeRateContextType {
    const context = useContext(ExchangeRateContext);
    if (context === undefined) {
        throw new Error('useExchangeRate must be used within an ExchangeRateProvider');
    }
    return context;
}
