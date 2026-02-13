'use client';

import {useEffect, useState, useRef, type ChangeEvent} from 'react';
import {useExchangeRate} from '@/app/contexts/ExchangeRateContext';
import {
    MIN_USD_TO_JPY_RATE,
    MAX_USD_TO_JPY_RATE,
    EXCHANGE_RATE_DEBOUNCE_DELAY,
} from '@/lib/exchangeRate';

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
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // usdToJpyRate が変更されたときに inputValue を同期（編集中でない場合のみ）
    useEffect(() => {
        if (!isEditing) {
            setInputValue(String(usdToJpyRate));
        }
    }, [usdToJpyRate, isEditing]);

    // クリーンアップ処理：コンポーネントのアンマウント時にデバウンスタイマーをクリア
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    /**
     * 入力値変更ハンドラー
     * 入力値をバリデーションして為替レートを更新する
     * デバウンス処理により、連続入力時の不要な再計算を防ぐ
     */
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setError('');
        setIsEditing(true);

        const numValue = parseFloat(value);
        if (value === '' || isNaN(numValue)) {
            setError('数値を入力してください');
            return;
        }

        if (numValue < MIN_USD_TO_JPY_RATE || numValue > MAX_USD_TO_JPY_RATE) {
            setError(`為替レートは${MIN_USD_TO_JPY_RATE}円〜${MAX_USD_TO_JPY_RATE}円の範囲で入力してください`);
            return;
        }

        // デバウンス処理でステート更新を遅延
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            setUsdToJpyRate(numValue);
        }, EXCHANGE_RATE_DEBOUNCE_DELAY);
    };

    /**
     * フォーカスが外れた際のハンドラー
     * 無効な入力値を現在の有効な値にリセットする
     */
    const handleBlur = () => {
        setIsEditing(false);
        if (error) {
            setInputValue(String(usdToJpyRate));
            setError('');
        }
    };

    /**
     * リセットボタンのハンドラー
     * 為替レートをデフォルト値（150円）に戻す
     */
    const handleReset = () => {
        resetToDefault();
        setInputValue(String(defaultRate));
        setError('');
        setIsEditing(false);
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
                            <div className="flex items-center gap-4 mb-2">
                                <input
                                    id="usd-jpy-rate"
                                    type="number"
                                    min={MIN_USD_TO_JPY_RATE}
                                    max={MAX_USD_TO_JPY_RATE}
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
                                    aria-describedby={error ? 'rate-error' : 'rate-guide'}
                                />
                                <span className="text-gray-600 dark:text-gray-400">円</span>
                            </div>
                            <p id="rate-guide" className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                入力可能範囲: {MIN_USD_TO_JPY_RATE}円 〜 {MAX_USD_TO_JPY_RATE}円
                            </p>
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
