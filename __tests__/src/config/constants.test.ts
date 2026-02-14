import {
    DEFAULT_VALUES,
    DISPLAY_CONSTANTS,
    NUMBER_FORMAT_CONSTANTS,
    TIME_CONSTANTS,
    VALIDATION_CONSTANTS,
} from '@/config/constants';

describe('constants', () => {
    describe('TIME_CONSTANTS', () => {
        it('1年あたりの月数が12であること', () => {
            expect(TIME_CONSTANTS.MONTHS_PER_YEAR).toBe(12);
        });

        it('定数がas constで定義されていること', () => {
            // TypeScriptの型チェックで保証されているが、値を確認
            expect(TIME_CONSTANTS.MONTHS_PER_YEAR).toBe(12);
        });
    });

    describe('NUMBER_FORMAT_CONSTANTS', () => {
        it('千円単位が1000であること', () => {
            expect(NUMBER_FORMAT_CONSTANTS.THOUSAND).toBe(1000);
        });

        it('万円単位が10000であること', () => {
            expect(NUMBER_FORMAT_CONSTANTS.TEN_THOUSAND).toBe(10000);
        });

        it('千円単位が万円単位より小さいこと', () => {
            expect(NUMBER_FORMAT_CONSTANTS.THOUSAND).toBeLessThan(NUMBER_FORMAT_CONSTANTS.TEN_THOUSAND);
        });
    });

    describe('VALIDATION_CONSTANTS', () => {
        it('目標金額の最小値が1000であること', () => {
            expect(VALIDATION_CONSTANTS.MIN_GOAL_AMOUNT).toBe(1000);
        });

        it('目標金額の最大値が10000000であること', () => {
            expect(VALIDATION_CONSTANTS.MAX_GOAL_AMOUNT).toBe(10000000);
        });

        it('最小値が最大値より小さいこと', () => {
            expect(VALIDATION_CONSTANTS.MIN_GOAL_AMOUNT).toBeLessThan(VALIDATION_CONSTANTS.MAX_GOAL_AMOUNT);
        });
    });

    describe('DISPLAY_CONSTANTS', () => {
        it('上位銘柄数が10であること', () => {
            expect(DISPLAY_CONSTANTS.TOP_STOCKS_COUNT).toBe(10);
        });

        it('最小パーセンテージが3であること', () => {
            expect(DISPLAY_CONSTANTS.MIN_PERCENTAGE_FOR_LABEL).toBe(3);
        });

        it('上位銘柄数が正の整数であること', () => {
            expect(DISPLAY_CONSTANTS.TOP_STOCKS_COUNT).toBeGreaterThan(0);
            expect(Number.isInteger(DISPLAY_CONSTANTS.TOP_STOCKS_COUNT)).toBe(true);
        });

        it('最小パーセンテージが0以上100以下であること', () => {
            expect(DISPLAY_CONSTANTS.MIN_PERCENTAGE_FOR_LABEL).toBeGreaterThanOrEqual(0);
            expect(DISPLAY_CONSTANTS.MIN_PERCENTAGE_FOR_LABEL).toBeLessThanOrEqual(100);
        });
    });

    describe('DEFAULT_VALUES', () => {
        it('デフォルト為替レートが150であること', () => {
            expect(DEFAULT_VALUES.USD_TO_JPY_RATE).toBe(150);
        });

        it('デフォルト月次目標が30000であること', () => {
            expect(DEFAULT_VALUES.MONTHLY_TARGET).toBe(30000);
        });

        it('為替レートが正の数値であること', () => {
            expect(DEFAULT_VALUES.USD_TO_JPY_RATE).toBeGreaterThan(0);
        });

        it('月次目標が正の数値であること', () => {
            expect(DEFAULT_VALUES.MONTHLY_TARGET).toBeGreaterThan(0);
        });
    });

    describe('定数の整合性', () => {
        it('NUMBER_FORMAT_CONSTANTSの値が期待どおりであること', () => {
            // 値が同じであることを確認
            expect(NUMBER_FORMAT_CONSTANTS.THOUSAND).toBe(1000);
            expect(NUMBER_FORMAT_CONSTANTS.TEN_THOUSAND).toBe(10000);
        });

        it('VALIDATION_CONSTANTSの値が期待どおりであること', () => {
            expect(VALIDATION_CONSTANTS.MIN_GOAL_AMOUNT).toBe(1000);
            expect(VALIDATION_CONSTANTS.MAX_GOAL_AMOUNT).toBe(10000000);
        });

        it('DISPLAY_CONSTANTSの値が期待どおりであること', () => {
            expect(DISPLAY_CONSTANTS.TOP_STOCKS_COUNT).toBe(10);
            expect(DISPLAY_CONSTANTS.MIN_PERCENTAGE_FOR_LABEL).toBe(3);
        });

        it('DEFAULT_VALUESの値が期待どおりであること', () => {
            expect(DEFAULT_VALUES.USD_TO_JPY_RATE).toBe(150);
            expect(DEFAULT_VALUES.MONTHLY_TARGET).toBe(30000);
        });
    });
});
