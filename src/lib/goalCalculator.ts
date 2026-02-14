import {GoalAchievementSummary, YearlyGoalAchievement} from '@/types/dividend';

/**
 * 目標達成度の計算ロジック
 */

/**
 * 年別の目標達成データを計算
 * @param yearlyDividends - 年別配当金のMap
 * @param monthlyTarget - 月平均配当目標金額 [円]
 * @returns 年別目標達成データの配列（降順ソート済み）
 */
export function calculateGoalAchievements(
    yearlyDividends: Map<string, number>,
    monthlyTarget: number
): YearlyGoalAchievement[] {
    const yearlyTarget = monthlyTarget * 12;

    return Array.from(yearlyDividends.entries())
        .map(([yearStr, actualAmount]) => {
            const year = parseInt(yearStr, 10);
            const roundedActual = Math.round(actualAmount);
            const difference = roundedActual - yearlyTarget;
            const achievementRate = yearlyTarget === 0
                ? 0
                : (roundedActual / yearlyTarget) * 100;

            return {
                year,
                actualAmount: roundedActual,
                targetAmount: yearlyTarget,
                achievementRate: Math.round(achievementRate * 10) / 10, // 小数点第1位まで
                difference,
            };
        })
        .sort((a, b) => b.year - a.year); // 降順（最新年が先頭）
}

/**
 * 目標達成サマリーを計算
 * @param achievements - 年別目標達成データの配列
 * @returns 目標達成サマリー（データがない場合はnull）
 */
export function calculateGoalSummary(
    achievements: YearlyGoalAchievement[]
): GoalAchievementSummary | null {
    if (achievements.length === 0) {
        return null;
    }

    const achievedYearsCount = achievements.filter(
        a => a.achievementRate >= 100
    ).length;

    const totalYearsCount = achievements.length;

    const averageAchievementRate =
        achievements.reduce((sum, a) => sum + a.achievementRate, 0) /
        totalYearsCount;

    const sortedByRate = [...achievements].sort(
        (a, b) => b.achievementRate - a.achievementRate
    );

    const maxAchievement = sortedByRate[0];
    const minAchievement = sortedByRate[sortedByRate.length - 1];

    return {
        achievedYearsCount,
        totalYearsCount,
        averageAchievementRate: Math.round(averageAchievementRate * 10) / 10,
        maxAchievementRate: maxAchievement.achievementRate,
        maxAchievementYear: maxAchievement.year,
        minAchievementRate: minAchievement.achievementRate,
        minAchievementYear: minAchievement.year,
    };
}
