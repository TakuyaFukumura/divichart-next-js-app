import type {Metadata} from "next";
import "./globals.css";
import {DarkModeProvider} from "./components/DarkModeProvider";
import Header from "./components/Header";
import React from "react";

/**
 * メタデータ設定
 * ページのタイトルと説明を定義する
 */
export const metadata: Metadata = {
    title: "配当金グラフアプリ",
    description: "配当金データを可視化するNext.jsアプリケーション",
};

/**
 * ルートレイアウトコンポーネント
 * アプリケーション全体の共通レイアウトを定義する
 *
 * @param props - レイアウトのプロパティ
 * @param props.children - 子要素として表示されるページコンテンツ
 * @returns アプリケーション全体のレイアウト構造
 *
 * @remarks
 * - DarkModeProviderでダークモード機能を提供
 * - Headerコンポーネントで共通のヘッダーを表示
 * - 言語設定は日本語（ja）
 */
export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
        <body className="antialiased">
        <DarkModeProvider>
            <Header/>
            {children}
        </DarkModeProvider>
        </body>
        </html>
    );
}
