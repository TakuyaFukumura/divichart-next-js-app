import {DEFAULT_MONTHLY_TARGET, GOAL_SETTINGS_STORAGE_KEY, loadGoalSettings, saveGoalSettings} from '@/lib/goalStorage';

describe('goalStorage', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('saveGoalSettings', () => {
        it('目標設定を保存できる', () => {
            saveGoalSettings(50000);

            const stored = localStorage.getItem(GOAL_SETTINGS_STORAGE_KEY);
            expect(stored).not.toBeNull();

            const settings = JSON.parse(stored!);
            expect(settings.monthlyTargetAmount).toBe(50000);
        });

        it('複数回保存しても最後の値が保持される', () => {
            saveGoalSettings(30000);
            saveGoalSettings(50000);
            saveGoalSettings(70000);

            const stored = localStorage.getItem(GOAL_SETTINGS_STORAGE_KEY);
            const settings = JSON.parse(stored!);
            expect(settings.monthlyTargetAmount).toBe(70000);
        });
    });

    describe('loadGoalSettings', () => {
        it('保存された目標設定を読み込める', () => {
            localStorage.setItem(
                GOAL_SETTINGS_STORAGE_KEY,
                JSON.stringify({monthlyTargetAmount: 50000})
            );

            const settings = loadGoalSettings();
            expect(settings.monthlyTargetAmount).toBe(50000);
        });

        it('未保存の場合はデフォルト値を返す', () => {
            const settings = loadGoalSettings();
            expect(settings.monthlyTargetAmount).toBe(DEFAULT_MONTHLY_TARGET);
        });

        it('不正なJSON形式の場合はデフォルト値を返す', () => {
            localStorage.setItem(GOAL_SETTINGS_STORAGE_KEY, 'invalid json');

            const settings = loadGoalSettings();
            expect(settings.monthlyTargetAmount).toBe(DEFAULT_MONTHLY_TARGET);
        });

        it('monthlyTargetAmountが数値でない場合はデフォルト値を返す', () => {
            localStorage.setItem(
                GOAL_SETTINGS_STORAGE_KEY,
                JSON.stringify({monthlyTargetAmount: 'not a number'})
            );

            const settings = loadGoalSettings();
            expect(settings.monthlyTargetAmount).toBe(DEFAULT_MONTHLY_TARGET);
        });

        it('monthlyTargetAmountがNaNの場合はデフォルト値を返す', () => {
            localStorage.setItem(
                GOAL_SETTINGS_STORAGE_KEY,
                JSON.stringify({monthlyTargetAmount: NaN})
            );

            const settings = loadGoalSettings();
            expect(settings.monthlyTargetAmount).toBe(DEFAULT_MONTHLY_TARGET);
        });

        it('範囲外の値（最小値未満）の場合はデフォルト値を返す', () => {
            localStorage.setItem(
                GOAL_SETTINGS_STORAGE_KEY,
                JSON.stringify({monthlyTargetAmount: 500})
            );

            const settings = loadGoalSettings();
            expect(settings.monthlyTargetAmount).toBe(DEFAULT_MONTHLY_TARGET);
        });

        it('範囲外の値（最大値超過）の場合はデフォルト値を返す', () => {
            localStorage.setItem(
                GOAL_SETTINGS_STORAGE_KEY,
                JSON.stringify({monthlyTargetAmount: 20000000})
            );

            const settings = loadGoalSettings();
            expect(settings.monthlyTargetAmount).toBe(DEFAULT_MONTHLY_TARGET);
        });

        it('範囲内の最小値を正しく読み込める', () => {
            localStorage.setItem(
                GOAL_SETTINGS_STORAGE_KEY,
                JSON.stringify({monthlyTargetAmount: 1000})
            );

            const settings = loadGoalSettings();
            expect(settings.monthlyTargetAmount).toBe(1000);
        });

        it('範囲内の最大値を正しく読み込める', () => {
            localStorage.setItem(
                GOAL_SETTINGS_STORAGE_KEY,
                JSON.stringify({monthlyTargetAmount: 10000000})
            );

            const settings = loadGoalSettings();
            expect(settings.monthlyTargetAmount).toBe(10000000);
        });
    });

    describe('統合テスト', () => {
        it('保存→読み込みの流れが正しく動作する', () => {
            const targetAmount = 75000;

            saveGoalSettings(targetAmount);
            const loadedSettings = loadGoalSettings();

            expect(loadedSettings.monthlyTargetAmount).toBe(targetAmount);
        });
    });
});
