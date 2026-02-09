'use client';

import {useState} from 'react';
import {useExchangeRate} from '@/app/contexts/ExchangeRateContext';
import {getUsdToJpyRate} from '@/lib/exchangeRate';

/**
 * 設定画面コンポーネント
 * 為替レート設定を管理する画面
 *
 * @returns 設定画面のJSX要素
 *
 * @remarks
 * - 為替レートの表示と編集が可能
 * - デフォルト値へのリセット機能を提供
 * - 入力値のバリデーション（正の数値のみ）
 * - 設定はlocalStorageに自動保存される
 */
export default function SettingsPage() {
    const {usdToJpyRate, setUsdToJpyRate, defaultRate, resetToDefault} = useExchangeRate();
    const [inputValue, setInputValue] = useState<string>(String(usdToJpyRate));
    const [error, setError] = useState<string>('');

    /**
     * 入力値変更ハンドラー
     * 入力値をバリデーションして為替レートを更新する
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setError('');

        const numValue = parseFloat(value);
        if (value === '' || isNaN(numValue)) {
            setError('数値を入力してください');
            return;
        }

        if (numValue <= 0) {
            setError('正の数値を入力してください');
            return;
        }

        // 有効な値の場合は即座に反映
        setUsdToJpyRate(numValue);
    };

    /**
     * フォーカスが外れた際のハンドラー
     * 無効な入力値を現在の有効な値にリセットする
     */
    const handleBlur = () => {
        if (error) {
            setInputValue(String(usdToJpyRate));
            setError('');
        }
    };

    /**
     * リセットボタンのハンドラー
     * 為替レートをデフォルト値に戻す
     */
    const handleReset = () => {
        resetToDefault();
        const newRate = getUsdToJpyRate();
        setInputValue(String(newRate));
        setError('');
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                    <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                        設定
                    </h1>

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                                為替レート設定
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                USドル建ての配当金を円換算する際の為替レートを設定します。
                                この設定はすべてのページに反映されます。
                            </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                            <label htmlFor="usd-jpy-rate"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                為替レート（1ドル = 円）
                            </label>
                            <div className="flex items-center gap-4 mb-4">
                                <input
                                    id="usd-jpy-rate"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-[150px] ${
                                        error
                                            ? 'border-red-500 dark:border-red-500'
                                            : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                    aria-invalid={error ? 'true' : 'false'}
                                    aria-describedby={error ? 'rate-error' : undefined}
                                />
                                <span className="text-gray-600 dark:text-gray-400">円</span>
                            </div>
                            {error && (
                                <p id="rate-error" className="text-sm text-red-600 dark:text-red-400 mb-2">
                                    {error}
                                </p>
                            )}

                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    デフォルト値: {defaultRate}円
                                </p>
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                                >
                                    デフォルトに戻す
                                </button>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <span className="text-blue-600 dark:text-blue-400 text-xl mt-0.5">ℹ️</span>
                                <div className="text-sm text-blue-800 dark:text-blue-300">
                                    <p className="font-semibold mb-1">為替レートの反映について</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>設定はリアルタイムで全ページに反映されます</li>
                                        <li>設定はブラウザに保存され、次回アクセス時も保持されます</li>
                                        <li>環境変数やデフォルト値より優先して使用されます</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
