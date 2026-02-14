'use client';

import {createContext, ReactNode, useContext, useEffect, useMemo, useState} from 'react';
import {getStorageItem, setStorageItem, storageKeys} from '@/config';

/**
 * テーマの種類を表す型
 * ライトモードまたはダークモードを指定する
 */
type Theme = 'light' | 'dark';

/**
 * ダークモードコンテキストの型定義
 * テーマの状態と設定関数を提供するインターフェース
 */
interface DarkModeContextType {
    /** 現在のテーマ設定 */
    theme: Theme;
    /** テーマを変更する関数 */
    setTheme: (theme: Theme) => void;
    /** ダークモードが有効かどうかを示すフラグ */
    isDark: boolean;
}

/**
 * ダークモードコンテキスト
 * アプリケーション全体でダークモードの状態を共有するためのReactコンテキスト
 */
const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

/**
 * ダークモードプロバイダーコンポーネント
 * アプリケーション全体にダークモード機能を提供する
 *
 * @param props - プロバイダーのプロパティ
 * @param props.children - 子要素として表示されるコンポーネント
 * @returns ダークモード機能を提供するコンテキストプロバイダー
 *
 * @remarks
 * - テーマ設定はlocalStorageに永続化される
 * - HTMLルート要素にdarkクラスを追加/削除してTailwind CSSのダークモードを制御
 * - 初回マウント時にlocalStorageから以前の設定を読み込む
 */
export function DarkModeProvider({children}: { readonly children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // ブラウザ環境のみlocalStorageにアクセス
        if (globalThis.window !== undefined) {
            const savedTheme = getStorageItem(storageKeys.theme) as Theme;
            if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
                setTheme(savedTheme);
            }
        }
    }, []);

    useEffect(() => {
        const updateTheme = () => {
            const isDarkMode = theme === 'dark';
            setIsDark(isDarkMode);

            // HTMLタグにdarkクラスを追加/削除
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        updateTheme();
    }, [theme]);

    const handleSetTheme = (newTheme: Theme) => {
        setTheme(newTheme);
        setStorageItem(storageKeys.theme, newTheme);
    };

    const value = useMemo(() => ({theme, setTheme: handleSetTheme, isDark}), [theme, isDark]);

    return (
        <DarkModeContext.Provider value={value}>
            {children}
        </DarkModeContext.Provider>
    );
}

/**
 * ダークモードカスタムフック
 * ダークモードの状態と操作機能にアクセスするためのフック
 *
 * @returns ダークモードのコンテキスト値（theme, setTheme, isDark）
 * @throws {Error} DarkModeProviderの外で使用された場合にエラーをスロー
 *
 * @example
 * ```tsx
 * const { theme, setTheme, isDark } = useDarkMode();
 * ```
 */
export function useDarkMode(): DarkModeContextType {
    const context = useContext(DarkModeContext);
    if (context === undefined) {
        throw new Error('useDarkMode must be used within a DarkModeProvider');
    }
    return context;
}
