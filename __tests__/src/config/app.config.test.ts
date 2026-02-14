import {appConfig, exchangeRateConfig, getCsvFilePath, goalConfig} from '@/config/app.config';

describe('app.config', () => {
    describe('exchangeRateConfig', () => {
        it('デフォルトレートが150であること', () => {
            expect(exchangeRateConfig.defaultRate).toBe(150);
        });
    });

    describe('getDefaultMonthlyTarget', () => {
        const originalEnv = process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_TARGET;

        afterEach(() => {
            // 環境変数を元に戻す
            if (originalEnv !== undefined) {
                process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_TARGET = originalEnv;
            } else {
                delete process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_TARGET;
            }
            jest.resetModules();
        });

        it('環境変数が未設定の場合、デフォルト値30000を返すこと', async () => {
            delete process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_TARGET;
            jest.resetModules();
            const {getDefaultMonthlyTarget: freshGetDefault} = await import('@/config/app.config');
            expect(freshGetDefault()).toBe(30000);
        });

        it('環境変数が有効な値の場合、その値を返すこと', async () => {
            process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_TARGET = '50000';
            jest.resetModules();
            const {getDefaultMonthlyTarget: freshGetDefault} = await import('@/config/app.config');
            expect(freshGetDefault()).toBe(50000);
        });

        it('環境変数が範囲内の最小値の場合、その値を返すこと', async () => {
            process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_TARGET = '1000';
            jest.resetModules();
            const {getDefaultMonthlyTarget: freshGetDefault} = await import('@/config/app.config');
            expect(freshGetDefault()).toBe(1000);
        });

        it('環境変数が範囲内の最大値の場合、その値を返すこと', async () => {
            process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_TARGET = '10000000';
            jest.resetModules();
            const {getDefaultMonthlyTarget: freshGetDefault} = await import('@/config/app.config');
            expect(freshGetDefault()).toBe(10000000);
        });

        it('環境変数が範囲外（小さすぎる）の場合、デフォルト値30000を返すこと', async () => {
            process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_TARGET = '999';
            jest.resetModules();
            const {getDefaultMonthlyTarget: freshGetDefault} = await import('@/config/app.config');
            expect(freshGetDefault()).toBe(30000);
        });

        it('環境変数が範囲外（大きすぎる）の場合、デフォルト値30000を返すこと', async () => {
            process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_TARGET = '10000001';
            jest.resetModules();
            const {getDefaultMonthlyTarget: freshGetDefault} = await import('@/config/app.config');
            expect(freshGetDefault()).toBe(30000);
        });

        it('環境変数が非数値の場合、デフォルト値30000を返すこと', async () => {
            process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_TARGET = 'invalid';
            jest.resetModules();
            const {getDefaultMonthlyTarget: freshGetDefault} = await import('@/config/app.config');
            expect(freshGetDefault()).toBe(30000);
        });

        it('環境変数が空文字列の場合、デフォルト値30000を返すこと', async () => {
            process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_TARGET = '';
            jest.resetModules();
            const {getDefaultMonthlyTarget: freshGetDefault} = await import('@/config/app.config');
            expect(freshGetDefault()).toBe(30000);
        });
    });

    describe('goalConfig', () => {
        it('最小目標金額が1000であること', () => {
            expect(goalConfig.minTarget).toBe(1000);
        });

        it('最大目標金額が10000000であること', () => {
            expect(goalConfig.maxTarget).toBe(10000000);
        });

        it('最小値が最大値より小さいこと', () => {
            expect(goalConfig.minTarget).toBeLessThan(goalConfig.maxTarget);
        });

        it('デフォルト値が最小値と最大値の範囲内であること', () => {
            expect(goalConfig.defaultMonthlyTarget).toBeGreaterThanOrEqual(goalConfig.minTarget);
            expect(goalConfig.defaultMonthlyTarget).toBeLessThanOrEqual(goalConfig.maxTarget);
        });
    });

    describe('getCsvFilePath', () => {
        const originalEnv = process.env.NEXT_PUBLIC_CSV_FILE_PATH;

        afterEach(() => {
            // 環境変数を元に戻す
            if (originalEnv) {
                process.env.NEXT_PUBLIC_CSV_FILE_PATH = originalEnv;
            } else {
                delete process.env.NEXT_PUBLIC_CSV_FILE_PATH;
            }
        });

        it('環境変数が未設定の場合、デフォルトパスを返すこと', () => {
            delete process.env.NEXT_PUBLIC_CSV_FILE_PATH;
            expect(getCsvFilePath()).toBe('/data/dividendlist_20260205.csv');
        });

        it('環境変数が設定されている場合、その値を返すこと', () => {
            process.env.NEXT_PUBLIC_CSV_FILE_PATH = '/data/test.csv';
            expect(getCsvFilePath()).toBe('/data/test.csv');
        });
    });

    describe('appConfig', () => {
        it('すべての設定が含まれていること', () => {
            expect(appConfig).toHaveProperty('exchangeRate');
            expect(appConfig).toHaveProperty('csvFilePath');
            expect(appConfig).toHaveProperty('goals');
        });

        it('exchangeRateが正しく設定されていること', () => {
            expect(appConfig.exchangeRate).toEqual(exchangeRateConfig);
        });

        it('goalsが正しく設定されていること', () => {
            expect(appConfig.goals).toEqual(goalConfig);
        });

        it('csvFilePathが文字列であること', () => {
            expect(typeof appConfig.csvFilePath).toBe('string');
        });
    });
});
