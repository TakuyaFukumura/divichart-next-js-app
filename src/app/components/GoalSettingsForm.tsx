'use client';

import {useState} from 'react';
import { appConfig } from '@/config';

type GoalSettingsFormProps = {
    initialValue: number;
    onSave: (value: number) => void;
};

/**
 * 目標設定フォームコンポーネント
 */
export default function GoalSettingsForm({initialValue, onSave}: GoalSettingsFormProps) {
    const [monthlyTarget, setMonthlyTarget] = useState<number>(initialValue);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * 保存ハンドラー
     */
    const handleSave = () => {
        // バリデーション
        if (isNaN(monthlyTarget) || monthlyTarget < appConfig.goals.minTarget || monthlyTarget > appConfig.goals.maxTarget) {
            setError('目標金額は1,000円〜10,000,000円の範囲で設定してください');
            return;
        }

        setError(null);
        onSave(monthlyTarget);

        // 成功メッセージを表示
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
        }, 3000);
    };

    // 無効な値の場合は初期値を使用
    const displayTarget = isNaN(monthlyTarget) || monthlyTarget === 0 ? initialValue : monthlyTarget;
    const yearlyTarget = displayTarget * 12;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                月平均配当目標
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1 w-full sm:w-auto">
                    <input
                        type="number"
                        value={monthlyTarget}
                        onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                        min={appConfig.goals.minTarget}
                        max={appConfig.goals.maxTarget}
                        step={1000}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                        bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="月平均配当目標金額"
                    />
                </div>

                <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md
                    transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    保存
                </button>
            </div>

            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                ※ 年間目標: ¥{yearlyTarget.toLocaleString()}
            </div>

            {/* エラーメッセージ */}
            {error && (
                <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-sm">
                    {error}
                </div>
            )}

            {/* 成功メッセージ */}
            {showSuccess && (
                <div
                    className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md text-sm">
                    目標設定を保存しました
                </div>
            )}
        </div>
    );
}
