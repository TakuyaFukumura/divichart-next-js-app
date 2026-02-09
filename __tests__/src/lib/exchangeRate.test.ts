import { getUsdToJpyRate, DEFAULT_USD_TO_JPY_RATE } from '@/lib/exchangeRate';

describe('exchangeRate', () => {
    const originalEnv = process.env.NEXT_PUBLIC_USD_TO_JPY_RATE;

    afterEach(() => {
        if (originalEnv !== undefined) {
            process.env.NEXT_PUBLIC_USD_TO_JPY_RATE = originalEnv;
        } else {
            delete process.env.NEXT_PUBLIC_USD_TO_JPY_RATE;
        }
    });

    describe('getUsdToJpyRate', () => {
        it('環境変数が設定されていない場合はデフォルト値を返す', () => {
            delete process.env.NEXT_PUBLIC_USD_TO_JPY_RATE;
            expect(getUsdToJpyRate()).toBe(DEFAULT_USD_TO_JPY_RATE);
        });

        it('環境変数が有効な値の場合はその値を返す', () => {
            process.env.NEXT_PUBLIC_USD_TO_JPY_RATE = '160';
            expect(getUsdToJpyRate()).toBe(160);
        });

        it('環境変数が小数値の場合はその値を返す', () => {
            process.env.NEXT_PUBLIC_USD_TO_JPY_RATE = '155.5';
            expect(getUsdToJpyRate()).toBe(155.5);
        });

        it('環境変数が負の値の場合はデフォルト値を返す', () => {
            process.env.NEXT_PUBLIC_USD_TO_JPY_RATE = '-10';
            expect(getUsdToJpyRate()).toBe(DEFAULT_USD_TO_JPY_RATE);
        });

        it('環境変数が0の場合はデフォルト値を返す', () => {
            process.env.NEXT_PUBLIC_USD_TO_JPY_RATE = '0';
            expect(getUsdToJpyRate()).toBe(DEFAULT_USD_TO_JPY_RATE);
        });

        it('環境変数が数値でない場合はデフォルト値を返す', () => {
            process.env.NEXT_PUBLIC_USD_TO_JPY_RATE = 'invalid';
            expect(getUsdToJpyRate()).toBe(DEFAULT_USD_TO_JPY_RATE);
        });

        it('環境変数が空文字列の場合はデフォルト値を返す', () => {
            process.env.NEXT_PUBLIC_USD_TO_JPY_RATE = '';
            expect(getUsdToJpyRate()).toBe(DEFAULT_USD_TO_JPY_RATE);
        });
    });

    describe('DEFAULT_USD_TO_JPY_RATE', () => {
        it('デフォルト値は150である', () => {
            expect(DEFAULT_USD_TO_JPY_RATE).toBe(150);
        });
    });
});
