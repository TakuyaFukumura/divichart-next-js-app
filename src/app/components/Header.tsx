'use client';

import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
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
 * - モバイル画面（768px未満）ではハンバーガーメニューを表示
 * - デスクトップ画面（768px以上）では水平ナビゲーションを表示
 */
export default function Header() {
    const {theme, setTheme} = useDarkMode();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const previousOverflowRef = useRef<string>('');

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

    /**
     * メニューを開閉する関数
     */
    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    /**
     * メニューを閉じる関数
     */
    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    /**
     * ESCキーでメニューを閉じる
     */
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMenu();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isMenuOpen]);

    /**
     * メニューが開いている間、背後のコンテンツのスクロールを防止
     */
    useEffect(() => {
        if (isMenuOpen) {
            // メニューを開く前の overflow 値を保存
            if (previousOverflowRef.current === '') {
                previousOverflowRef.current = document.body.style.overflow;
            }
            document.body.style.overflow = 'hidden';
        } else if (previousOverflowRef.current !== '') {
            // メニューを閉じる際は、保存していた値を復元
            document.body.style.overflow = previousOverflowRef.current;
            previousOverflowRef.current = '';
        }

        return () => {
            // クリーンアップ時にも保存していた値を復元
            if (previousOverflowRef.current !== '') {
                document.body.style.overflow = previousOverflowRef.current;
                previousOverflowRef.current = '';
            }
        };
    }, [isMenuOpen]);

    return (
        <>
            <header
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b
            border-gray-200 dark:border-gray-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-6">
                            {/* ハンバーガーメニューボタン（モバイルのみ） */}
                            <button
                                onClick={toggleMenu}
                                className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
                                aria-expanded={isMenuOpen}
                                aria-controls="mobile-menu"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>

                            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                divichart
                            </h1>

                            {/* デスクトップナビゲーション */}
                            <nav className="hidden md:flex gap-4">
                                <Link
                                    href="/"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    年別配当
                                </Link>
                                <Link
                                    href="/cumulative"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    累計配当
                                </Link>
                                <Link
                                    href="/portfolio"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    ポートフォリオ
                                </Link>
                                <Link
                                    href="/settings"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    ⚙️ 設定
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

            {/* オーバーレイ（メニューが開いている時のみ表示） */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
                    onClick={closeMenu}
                    aria-hidden="true"
                />
            )}

            {/* モバイルメニューパネル */}
            <nav
                id="mobile-menu"
                role="navigation"
                aria-label="メインメニュー"
                className={`fixed inset-y-0 left-0 w-80 max-w-[80vw] bg-white dark:bg-gray-800 
                    shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
                    ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* メニューヘッダー */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            divichart
                        </h2>
                        <button
                            onClick={closeMenu}
                            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            aria-label="メニューを閉じる"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* メニュー項目 */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="flex flex-col py-4">
                            <Link
                                href="/"
                                onClick={closeMenu}
                                className="py-4 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                📊 年別配当
                            </Link>
                            <Link
                                href="/cumulative"
                                onClick={closeMenu}
                                className="py-4 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                📈 累計配当
                            </Link>
                            <Link
                                href="/portfolio"
                                onClick={closeMenu}
                                className="py-4 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                💼 ポートフォリオ
                            </Link>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                            <Link
                                href="/settings"
                                onClick={closeMenu}
                                className="py-4 px-6 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                ⚙️ 設定
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}
