'use client';

/**
 * ローディング画面コンポーネント
 * 
 * データ読み込み中に表示される共通のローディング画面
 */
export function LoadingScreen() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="flex items-center justify-center" role="status" aria-live="polite">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">読み込み中...</span>
            </div>
        </div>
    );
}

/**
 * エラー画面コンポーネント
 * 
 * @param props - コンポーネントのプロパティ
 * @param props.error - 表示するエラーメッセージ
 */
export function ErrorScreen({ error }: { error: string }) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div
                className="text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg"
                role="alert"
                aria-live="assertive"
            >
                エラー: {error}
            </div>
        </div>
    );
}
