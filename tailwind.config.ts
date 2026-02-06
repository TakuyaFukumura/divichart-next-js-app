import type {Config} from "tailwindcss";

/**
 * Tailwind CSS設定オブジェクト
 * スタイリングフレームワークTailwind CSSの設定を定義する
 * 
 * @remarks
 * - content: スキャンするファイルのパスパターンを指定
 * - darkMode: "class"を使用してダークモードをクラスベースで切り替え
 * - theme: デフォルトテーマの拡張設定（現在は空）
 * - plugins: 使用するTailwindプラグイン（現在は空）
 */
export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {},
    },
    plugins: [],
} satisfies Config;
