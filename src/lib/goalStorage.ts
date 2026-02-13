import {GoalSettings} from '@/types/dividend';
import { appConfig, storageKeys } from '@/config';

/**
 * 目標設定の保存・読み込みを管理するユーティリティ
 */

/** 目標設定の保存キー */
export const GOAL_SETTINGS_STORAGE_KEY = storageKeys.goalSettings;

/** デフォルト値: 月平均配当目標 [円] */
export const DEFAULT_MONTHLY_TARGET = appConfig.goals.defaultMonthlyTarget;

/**
 * 目標設定を保存
 * @param monthlyTarget - 月平均配当目標金額 [円]
 */
export function saveGoalSettings(monthlyTarget: number): void {
    if (typeof window === 'undefined') return; // SSR対応

    const settings: GoalSettings = {
        monthlyTargetAmount: monthlyTarget,
    };
    try {
        localStorage.setItem(
            GOAL_SETTINGS_STORAGE_KEY,
            JSON.stringify(settings)
        );
    } catch (error) {
        // LocalStorage が使用できない場合は、アプリを落とさずにログのみ出力
        console.error('目標設定の保存に失敗しました:', error);
    }
}

/**
 * 目標設定を読み込み
 * @returns 目標設定（未設定の場合はデフォルト値）
 */
export function loadGoalSettings(): GoalSettings {
    if (typeof window === 'undefined') {
        // SSR環境ではデフォルト値を返す
        return {
            monthlyTargetAmount: DEFAULT_MONTHLY_TARGET,
        };
    }

    try {
        const stored = localStorage.getItem(GOAL_SETTINGS_STORAGE_KEY);
        if (stored) {
            const settings = JSON.parse(stored) as GoalSettings;

            // バリデーション: monthlyTargetAmount が数値かつ範囲内かチェック
            if (
                typeof settings.monthlyTargetAmount === 'number' &&
                !isNaN(settings.monthlyTargetAmount) &&
                settings.monthlyTargetAmount >= appConfig.goals.minTarget &&
                settings.monthlyTargetAmount <= appConfig.goals.maxTarget
            ) {
                return settings;
            }
        }
    } catch (error) {
        console.error('目標設定の読み込みに失敗しました:', error);
    }

    // デフォルト値を返す（不正な値の場合もここに到達）
    return {
        monthlyTargetAmount: DEFAULT_MONTHLY_TARGET,
    };
}
