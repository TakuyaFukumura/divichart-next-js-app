'use client';

import {YearlyGoalAchievement} from '@/types/dividend';

type GoalAchievementTableProps = {
    achievements: YearlyGoalAchievement[];
};

/**
 * 目標達成度詳細テーブルコンポーネント
 */
export default function GoalAchievementTable({achievements}: GoalAchievementTableProps) {
    if (achievements.length === 0) {
        return (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                配当データがありません
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
                年別詳細
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-left font-semibold text-gray-700 dark:text-gray-300">
                            年
                        </th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-right font-semibold text-gray-700 dark:text-gray-300">
                            実績 [円]
                        </th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-right font-semibold text-gray-700 dark:text-gray-300">
                            目標 [円]
                        </th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-right font-semibold text-gray-700 dark:text-gray-300">
                            達成率
                        </th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-right font-semibold text-gray-700 dark:text-gray-300">
                            差額 [円]
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {achievements.map((achievement) => {
                        const rateColor =
                            achievement.achievementRate >= 120
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : achievement.achievementRate >= 100
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400';

                        const diffColor =
                            achievement.difference >= 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400';

                        return (
                            <tr
                                key={achievement.year}
                                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-800 dark:text-gray-200">
                                    {achievement.year}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-gray-800 dark:text-gray-200">
                                    {achievement.actualAmount.toLocaleString()}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-gray-800 dark:text-gray-200">
                                    {achievement.targetAmount.toLocaleString()}
                                </td>
                                <td className={`py-2 sm:py-3 px-2 sm:px-4 text-right font-semibold ${rateColor}`}>
                                    {achievement.achievementRate.toFixed(1)}%
                                </td>
                                <td className={`py-2 sm:py-3 px-2 sm:px-4 text-right font-semibold ${diffColor}`}>
                                    {achievement.difference >= 0 ? '+' : ''}
                                    {achievement.difference.toLocaleString()}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
