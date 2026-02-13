'use client';

import {useMemo, useState} from 'react';
import {useDividendData} from '@/hooks/useDividendData';
import {useExchangeRate} from '@/app/contexts/ExchangeRateContext';
import {aggregateDividendsByYear} from '@/lib/dividendCalculator';
import {calculateGoalAchievements} from '@/lib/goalCalculator';
import {loadGoalSettings, saveGoalSettings} from '@/lib/goalStorage';
import {LoadingScreen, ErrorScreen} from '@/app/components/LoadingState';
import GoalSettingsForm from '@/app/components/GoalSettingsForm';
import YearlyGoalProgressBar from '@/app/components/YearlyGoalProgressBar';
import GoalAchievementTable from '@/app/components/GoalAchievementTable';

/**
 * 配当目標達成度画面
 */
export default function GoalsPage() {
    const {data: rawData, loading, error} = useDividendData();
    const {usdToJpyRate} = useExchangeRate();
    const [goalSettings, setGoalSettings] = useState(() => loadGoalSettings());

    /**
     * 目標設定保存ハンドラー
     */
    const handleSaveGoal = (monthlyTarget: number) => {
        saveGoalSettings(monthlyTarget);
        setGoalSettings({monthlyTargetAmount: monthlyTarget});
    };

    /**
     * 年別達成度データを計算
     */
    const achievements = useMemo(() => {
        if (rawData.length === 0) return [];
        const yearlyDividends = aggregateDividendsByYear(rawData, usdToJpyRate);
        return calculateGoalAchievements(yearlyDividends, goalSettings.monthlyTargetAmount);
    }, [rawData, usdToJpyRate, goalSettings.monthlyTargetAmount]);

    if (loading) {
        return <LoadingScreen/>;
    }

    if (error) {
        return <ErrorScreen error={error}/>;
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* ページタイトル */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6 sm:mb-8">
                    配当目標達成度
                </h1>

                {/* 目標設定フォーム */}
                <GoalSettingsForm
                    initialValue={goalSettings.monthlyTargetAmount}
                    onSave={handleSaveGoal}
                />

                {/* プログレスバー表示エリア */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 sm:mb-6">
                        年別達成状況
                    </h2>

                    {achievements.length === 0 ? (
                        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                            配当データがありません
                        </div>
                    ) : (
                        <div>
                            {achievements.map((achievement) => (
                                <YearlyGoalProgressBar
                                    key={achievement.year}
                                    achievement={achievement}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* 詳細テーブル */}
                <GoalAchievementTable achievements={achievements}/>
            </div>
        </div>
    );
}
