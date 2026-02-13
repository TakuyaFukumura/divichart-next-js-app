import { appConfig, exchangeRateConfig, goalConfig, getCsvFilePath } from '@/config/app.config';

describe('app.config', () => {
  describe('exchangeRateConfig', () => {
    it('デフォルトレートが150であること', () => {
      expect(exchangeRateConfig.defaultRate).toBe(150);
    });

    it('環境変数キーが正しく設定されていること', () => {
      expect(exchangeRateConfig.envKey).toBe('NEXT_PUBLIC_USD_TO_JPY_RATE');
    });
  });

  describe('goalConfig', () => {
    const originalDefaultMonthlyTargetEnv = process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_TARGET;

    afterAll(() => {
      if (originalDefaultMonthlyTargetEnv !== undefined) {
        process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_TARGET = originalDefaultMonthlyTargetEnv;
      } else {
        delete process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_TARGET;
      }
    });

    it('デフォルト月次目標が30000であること', () => {
      delete process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_TARGET;
      jest.resetModules();
      // 環境変数未設定時のデフォルト値を検証するために再 import する
      const { goalConfig: freshGoalConfig } = require('@/config/app.config');
      expect(freshGoalConfig.defaultMonthlyTarget).toBe(30000);
    });

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
