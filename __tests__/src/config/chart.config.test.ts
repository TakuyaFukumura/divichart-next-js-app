import {chartConfig, portfolioConfig, yAxisConfig} from '@/config/chart.config';

describe('chart.config', () => {
    describe('yAxisConfig', () => {
        it('千円単位が1000であること', () => {
            expect(yAxisConfig.thousand).toBe(1000);
        });

        it('万円単位が10000であること', () => {
            expect(yAxisConfig.tenThousand).toBe(10000);
        });

        it('千円単位が万円単位より小さいこと', () => {
            expect(yAxisConfig.thousand).toBeLessThan(yAxisConfig.tenThousand);
        });
    });

    describe('portfolioConfig', () => {
        it('上位銘柄数が10であること', () => {
            expect(portfolioConfig.topStocksCount).toBe(10);
        });

        it('ラベル表示最小パーセンテージが3であること', () => {
            expect(portfolioConfig.minPercentageForLabel).toBe(3);
        });

        it('上位銘柄数が正の整数であること', () => {
            expect(portfolioConfig.topStocksCount).toBeGreaterThan(0);
            expect(Number.isInteger(portfolioConfig.topStocksCount)).toBe(true);
        });

        it('最小パーセンテージが0以上100以下であること', () => {
            expect(portfolioConfig.minPercentageForLabel).toBeGreaterThanOrEqual(0);
            expect(portfolioConfig.minPercentageForLabel).toBeLessThanOrEqual(100);
        });
    });

    describe('chartConfig', () => {
        it('すべての設定が含まれていること', () => {
            expect(chartConfig).toHaveProperty('yAxis');
            expect(chartConfig).toHaveProperty('portfolio');
        });

        it('yAxisが正しく設定されていること', () => {
            expect(chartConfig.yAxis).toEqual(yAxisConfig);
        });

        it('portfolioが正しく設定されていること', () => {
            expect(chartConfig.portfolio).toEqual(portfolioConfig);
        });
    });
});
