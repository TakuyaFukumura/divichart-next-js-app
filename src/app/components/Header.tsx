'use client';

import Link from 'next/link';
import {useDarkMode} from './DarkModeProvider';

/**
 * ヘッダーコンポーネント
 * アプリケーション共通のヘッダー部分を表示する
 * 
 * @returns ヘッダーのJSX要素
 * 
 * @remarks
 * - ダークモード切り替えボタンを含む
 * - スティッキーポジショニングで常に画面上部に表示
 * - 背景にぼかし効果を適用
 */
export default function Header() {
    const {theme, setTheme} = useDarkMode();

    /**
     * テーマ切り替えハンドラー
     * ライトモードとダークモードを切り替える
     */
    const handleThemeToggle = () => {
        if (theme === 'light') {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    };

    /**
     * テーマに応じたアイコンを取得する
     * 
     * @returns テーマを表す絵文字（☀️または🌙）
     */
    const getThemeIcon = () => {
        if (theme === 'light') {
            return '☀️';
        } else {
            return '🌙';
        }
    };

    /**
     * テーマに応じたラベルテキストを取得する
     * 
     * @returns テーマを表すラベル文字列（ライトモードまたはダークモード）
     */
    const getThemeLabel = () => {
        if (theme === 'light') {
            return 'ライトモード';
        } else {
            return 'ダークモード';
        }
    };

    return (
        <header
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b
            border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-6">
                        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            divichart-next-js-app
                        </h1>
                        <nav className="flex gap-4">
                            <Link
                                href="/"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                ホーム
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center">
                        <button
                            onClick={handleThemeToggle}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium
                            text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                            rounded-lg transition-colors duration-200"
                            title={`現在: ${getThemeLabel()}`}
                        >
                            <span className="text-lg">{getThemeIcon()}</span>
                            <span className="hidden sm:inline">{getThemeLabel()}</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
