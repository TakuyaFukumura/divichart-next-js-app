'use client';

import {YearlyGoalAchievement} from '@/types/dividend';

/**
 * 年別目標達成プログレスバーコンポーネント
 */
export default function YearlyGoalProgressBar({achievement}: { achievement: YearlyGoalAchievement }) {
    /**
     * 達成率に応じたプログレスバーの色を決定
     */
    const getProgressColor = (rate: number): string => {
        if (rate >= 120) return 'bg-yellow-500';
        if (rate >= 100) return 'bg-green-500';
        return 'bg-blue-500';
    };

    /**
     * 達成率に応じたテキスト色を決定
     */
    const getTextColor = (rate: number): string => {
        if (rate >= 120) return 'text-yellow-600 dark:text-yellow-400';
        if (rate >= 100) return 'text-green-600 dark:text-green-400';
        return 'text-red-600 dark:text-red-400';
    };

    const progressWidth = Math.min(achievement.achievementRate, 100);
    const progressColor = getProgressColor(achievement.achievementRate);
    const textColor = getTextColor(achievement.achievementRate);

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {achievement.year}年
                </span>
                <span className={`text-lg font-bold ${textColor}`}>
                    {achievement.achievementRate.toFixed(1)}%
                </span>
            </div>

            {/* プログレスバー */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                <div
                    className={`h-full ${progressColor} transition-all duration-500 ease-out flex items-center justify-end pr-3`}
                    style={{width: `${progressWidth}%`}}
                    role="progressbar"
                    aria-valuenow={progressWidth}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${achievement.year}年の目標達成率`}
                    aria-valuetext={`${achievement.achievementRate.toFixed(1)}%`}
                >
                    {progressWidth > 15 && (
                        <span className="text-white text-sm font-semibold">
                            {achievement.achievementRate.toFixed(1)}%
                        </span>
                    )}
                </div>
            </div>

            {/* 詳細情報 */}
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                    <span>実績: ¥{achievement.actualAmount.toLocaleString()}</span>
                    <span>目標: ¥{achievement.targetAmount.toLocaleString()}</span>
                </div>
                <div className="mt-1">
          <span
              className={achievement.difference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
            差額: {achievement.difference >= 0 ? '+' : ''}¥{achievement.difference.toLocaleString()}
          </span>
                </div>
            </div>
        </div>
    );
}
