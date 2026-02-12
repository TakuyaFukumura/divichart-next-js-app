import {calculateGoalAchievements, calculateGoalSummary} from '@/lib/goalCalculator';

describe('goalCalculator', () => {
    describe('calculateGoalAchievements', () => {
        it('正しく達成度を計算できる', () => {
            const yearlyDividends = new Map([
                ['2024', 180000],
                ['2025', 360000],
                ['2026', 540000],
            ]);
            const monthlyTarget = 30000;

            const result = calculateGoalAchievements(yearlyDividends, monthlyTarget);

            expect(result).toHaveLength(3);
            // 降順ソート（最新年が先頭）
            expect(result[0].year).toBe(2026);
            expect(result[0].achievementRate).toBe(150.0);
            expect(result[0].actualAmount).toBe(540000);
            expect(result[0].targetAmount).toBe(360000);
            expect(result[0].difference).toBe(180000);

            expect(result[1].year).toBe(2025);
            expect(result[1].achievementRate).toBe(100.0);

            expect(result[2].year).toBe(2024);
            expect(result[2].achievementRate).toBe(50.0);
        });

        it('目標が0の場合は達成率0%を返す', () => {
            const yearlyDividends = new Map([['2024', 100000]]);
            const result = calculateGoalAchievements(yearlyDividends, 0);

            expect(result).toHaveLength(1);
            expect(result[0].achievementRate).toBe(0);
            expect(result[0].targetAmount).toBe(0);
        });

        it('空のMapを渡すと空の配列を返す', () => {
            const yearlyDividends = new Map<string, number>();
            const result = calculateGoalAchievements(yearlyDividends, 30000);

            expect(result).toHaveLength(0);
        });

        it('達成率を小数点第1位まで丸める', () => {
            const yearlyDividends = new Map([
                ['2024', 100000],
            ]);
            const monthlyTarget = 27000; // 年間目標: 324000

            const result = calculateGoalAchievements(yearlyDividends, monthlyTarget);

            expect(result[0].achievementRate).toBe(30.9);
        });

        it('金額を丸める', () => {
            const yearlyDividends = new Map([
                ['2024', 100000.7],
            ]);
            const monthlyTarget = 30000;

            const result = calculateGoalAchievements(yearlyDividends, monthlyTarget);

            expect(result[0].actualAmount).toBe(100001);
        });
    });

    describe('calculateGoalSummary', () => {
        it('正しくサマリーを計算できる', () => {
            const achievements = [
                {year: 2024, actualAmount: 180000, targetAmount: 360000, achievementRate: 50.0, difference: -180000},
                {
                    year: 2025,
                    actualAmount: 360000,
                    targetAmount: 360000,
                    achievementRate: 100.0,
                    difference: 0
                },
                {year: 2026, actualAmount: 540000, targetAmount: 360000, achievementRate: 150.0, difference: 180000},
            ];

            const result = calculateGoalSummary(achievements);

            expect(result).not.toBeNull();
            expect(result!.achievedYearsCount).toBe(2); // 100%以上が2年
            expect(result!.totalYearsCount).toBe(3);
            expect(result!.averageAchievementRate).toBe(100.0); // (50 + 100 + 150) / 3
            expect(result!.maxAchievementRate).toBe(150.0);
            expect(result!.maxAchievementYear).toBe(2026);
            expect(result!.minAchievementRate).toBe(50.0);
            expect(result!.minAchievementYear).toBe(2024);
        });

        it('空の配列を渡すとnullを返す', () => {
            const result = calculateGoalSummary([]);

            expect(result).toBeNull();
        });

        it('1年だけのデータでも正しく計算できる', () => {
            const achievements = [
                {year: 2024, actualAmount: 360000, targetAmount: 360000, achievementRate: 100.0, difference: 0},
            ];

            const result = calculateGoalSummary(achievements);

            expect(result).not.toBeNull();
            expect(result!.achievedYearsCount).toBe(1);
            expect(result!.totalYearsCount).toBe(1);
            expect(result!.averageAchievementRate).toBe(100.0);
            expect(result!.maxAchievementRate).toBe(100.0);
            expect(result!.maxAchievementYear).toBe(2024);
            expect(result!.minAchievementRate).toBe(100.0);
            expect(result!.minAchievementYear).toBe(2024);
        });

        it('全ての年で未達成の場合、achievedYearsCountは0', () => {
            const achievements = [
                {year: 2024, actualAmount: 100000, targetAmount: 360000, achievementRate: 27.8, difference: -260000},
                {year: 2025, actualAmount: 150000, targetAmount: 360000, achievementRate: 41.7, difference: -210000},
            ];

            const result = calculateGoalSummary(achievements);

            expect(result).not.toBeNull();
            expect(result!.achievedYearsCount).toBe(0);
        });
    });
});
