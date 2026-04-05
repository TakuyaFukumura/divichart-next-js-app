'use client';

import {YearlyGoalAchievement} from '@/types/dividend';

type YearlyGoalProgressBarProps = Readonly<{
    achievement: YearlyGoalAchievement;
}>;

/**
 * 年別目標達成プログレスバーコンポーネント
 */
export default function YearlyGoalProgressBar({achievement}: YearlyGoalProgressBarProps) {
    /**
     * 達成率に応じたプログレスバーの色を決定
     */
    const getProgressColor = (rate: number): string => {
        if (rate >= 120) return 'bg-yellow-500';
        if (rate >= 100) return 'bg-green-500';
        return 'bg-blue-500';
    };

    /**
     * progress要素用の色クラスを決定
     */
    const getProgressValueColorClasses = (rate: number): string => {
        if (rate >= 120) return '[&::-webkit-progress-value]:bg-yellow-500 [&::-moz-progress-bar]:bg-yellow-500';
        if (rate >= 100) return '[&::-webkit-progress-value]:bg-green-500 [&::-moz-progress-bar]:bg-green-500';
        return '[&::-webkit-progress-value]:bg-blue-500 [&::-moz-progress-bar]:bg-blue-500';
    };

    /**
     * 達成率に応じたテキスト色を決定
     */
    const getTextColor = (rate: number): string => {
        if (rate >= 120) return 'text-yellow-600 dark:text-yellow-400';
        if (rate >= 100) return 'text-green-600 dark:text-green-400';
        return 'text-red-600 dark:text-red-400';
    };

    const progressWidth = Math.max(0, Math.min(achievement.achievementRate, 100));
    const progressColor = getProgressColor(achievement.achievementRate);
    const progressValueColorClasses = getProgressValueColorClasses(achievement.achievementRate);
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
            <div className="relative w-full">
                <progress
                    className={`h-8 w-full overflow-hidden rounded-full border-0 bg-gray-200 transition-all duration-500 ease-out appearance-none dark:bg-gray-700 [&::-webkit-progress-bar]:bg-gray-200 dark:[&::-webkit-progress-bar]:bg-gray-700 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-moz-progress-bar]:rounded-full ${progressColor} ${progressValueColorClasses}`}
                    value={progressWidth}
                    max={100}
                    aria-label={`${achievement.year}年の目標達成率`}
                    aria-valuetext={`${achievement.achievementRate.toFixed(1)}%`}
                />
                {progressWidth > 15 && (
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-white">
                        {achievement.achievementRate.toFixed(1)}%
                    </span>
                )}
            </div>

            {/* 詳細情報 */}
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                    <span>実績: ¥{achievement.actualAmount.toLocaleString()}</span>
                    <span>目標: ¥{achievement.targetAmount.toLocaleString()}</span>
                </div>
                <div className="mt-1">
                    <span
                        className={achievement.difference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                    >
                        差額: {achievement.difference >= 0 ? '+' : ''}¥{achievement.difference.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
}
