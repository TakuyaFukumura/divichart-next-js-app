/**
 * ExchangeRateContext のテスト
 *
 * このテストファイルは、src/app/contexts/ExchangeRateContext.tsxの機能をテストします。
 * Context による為替レート管理、localStorage への永続化、リセット機能をテストしています。
 */

import React from 'react';
import {act, render, renderHook, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {ExchangeRateProvider, useExchangeRate} from '@/app/contexts/ExchangeRateContext';
import {DEFAULT_USD_TO_JPY_RATE} from '@/lib/exchangeRate';

// localStorage のモック
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('ExchangeRateContext', () => {
    beforeEach(() => {
        localStorageMock.clear();
        delete process.env.NEXT_PUBLIC_USD_TO_JPY_RATE;
    });

    describe('初期化', () => {
        it('デフォルト値で初期化される', () => {
            const {result} = renderHook(() => useExchangeRate(), {
                wrapper: ExchangeRateProvider,
            });

            expect(result.current.usdToJpyRate).toBe(DEFAULT_USD_TO_JPY_RATE);
            expect(result.current.defaultRate).toBe(DEFAULT_USD_TO_JPY_RATE);
        });

        it('localStorage に保存された値で初期化される', async () => {
            localStorageMock.setItem('usdToJpyRate', '140');

            const {result} = renderHook(() => useExchangeRate(), {
                wrapper: ExchangeRateProvider,
            });

            await waitFor(() => {
                expect(result.current.usdToJpyRate).toBe(140);
            });
        });

        it('環境変数が設定されている場合はその値で初期化される', () => {
            process.env.NEXT_PUBLIC_USD_TO_JPY_RATE = '160';

            const {result} = renderHook(() => useExchangeRate(), {
                wrapper: ExchangeRateProvider,
            });

            expect(result.current.usdToJpyRate).toBe(160);
        });

        it('localStorage の値が環境変数より優先される', async () => {
            process.env.NEXT_PUBLIC_USD_TO_JPY_RATE = '160';
            localStorageMock.setItem('usdToJpyRate', '140');

            const {result} = renderHook(() => useExchangeRate(), {
                wrapper: ExchangeRateProvider,
            });

            await waitFor(() => {
                expect(result.current.usdToJpyRate).toBe(140);
            });
        });
    });

    describe('setUsdToJpyRate', () => {
        it('為替レートを更新できる', () => {
            const {result} = renderHook(() => useExchangeRate(), {
                wrapper: ExchangeRateProvider,
            });

            act(() => {
                result.current.setUsdToJpyRate(160);
            });

            expect(result.current.usdToJpyRate).toBe(160);
        });

        it('localStorage に保存される', () => {
            const {result} = renderHook(() => useExchangeRate(), {
                wrapper: ExchangeRateProvider,
            });

            act(() => {
                result.current.setUsdToJpyRate(160);
            });

            expect(localStorageMock.getItem('usdToJpyRate')).toBe('160');
        });

        it('負の値は設定されない', () => {
            const {result} = renderHook(() => useExchangeRate(), {
                wrapper: ExchangeRateProvider,
            });

            const initialRate = result.current.usdToJpyRate;

            act(() => {
                result.current.setUsdToJpyRate(-100);
            });

            expect(result.current.usdToJpyRate).toBe(initialRate);
        });

        it('0は設定されない', () => {
            const {result} = renderHook(() => useExchangeRate(), {
                wrapper: ExchangeRateProvider,
            });

            const initialRate = result.current.usdToJpyRate;

            act(() => {
                result.current.setUsdToJpyRate(0);
            });

            expect(result.current.usdToJpyRate).toBe(initialRate);
        });

        it('NaNは設定されない', () => {
            const {result} = renderHook(() => useExchangeRate(), {
                wrapper: ExchangeRateProvider,
            });

            const initialRate = result.current.usdToJpyRate;

            act(() => {
                result.current.setUsdToJpyRate(NaN);
            });

            expect(result.current.usdToJpyRate).toBe(initialRate);
        });
    });

    describe('resetToDefault', () => {
        it('デフォルト値にリセットされる', () => {
            const {result} = renderHook(() => useExchangeRate(), {
                wrapper: ExchangeRateProvider,
            });

            act(() => {
                result.current.setUsdToJpyRate(160);
            });

            expect(result.current.usdToJpyRate).toBe(160);

            act(() => {
                result.current.resetToDefault();
            });

            expect(result.current.usdToJpyRate).toBe(DEFAULT_USD_TO_JPY_RATE);
        });

        it('localStorage がクリアされる', () => {
            const {result} = renderHook(() => useExchangeRate(), {
                wrapper: ExchangeRateProvider,
            });

            act(() => {
                result.current.setUsdToJpyRate(160);
            });

            expect(localStorageMock.getItem('usdToJpyRate')).toBe('160');

            act(() => {
                result.current.resetToDefault();
            });

            expect(localStorageMock.getItem('usdToJpyRate')).toBeNull();
        });

        it('環境変数が設定されていてもデフォルト値（150円）にリセットされる', () => {
            process.env.NEXT_PUBLIC_USD_TO_JPY_RATE = '160';

            const {result} = renderHook(() => useExchangeRate(), {
                wrapper: ExchangeRateProvider,
            });

            act(() => {
                result.current.setUsdToJpyRate(140);
            });

            expect(result.current.usdToJpyRate).toBe(140);

            act(() => {
                result.current.resetToDefault();
            });

            expect(result.current.usdToJpyRate).toBe(DEFAULT_USD_TO_JPY_RATE);
        });
    });

    describe('useExchangeRate フック', () => {
        it('Provider の外で使用するとエラーをスロー', () => {
            // エラーログを抑制
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            expect(() => {
                renderHook(() => useExchangeRate());
            }).toThrow('useExchangeRate must be used within an ExchangeRateProvider');

            consoleSpy.mockRestore();
        });
    });

    describe('複数コンポーネント間での状態共有', () => {
        it('複数のコンポーネントで同じ値を共有する', () => {
            const TestComponent1 = () => {
                const {usdToJpyRate} = useExchangeRate();
                return <div data-testid="component1">{usdToJpyRate}</div>;
            };

            const TestComponent2 = () => {
                const {usdToJpyRate, setUsdToJpyRate} = useExchangeRate();
                return (
                    <div>
                        <div data-testid="component2">{usdToJpyRate}</div>
                        <button onClick={() => setUsdToJpyRate(170)}>Update</button>
                    </div>
                );
            };

            render(
                <ExchangeRateProvider>
                    <TestComponent1/>
                    <TestComponent2/>
                </ExchangeRateProvider>
            );

            expect(screen.getByTestId('component1')).toHaveTextContent('150');
            expect(screen.getByTestId('component2')).toHaveTextContent('150');

            act(() => {
                screen.getByText('Update').click();
            });

            expect(screen.getByTestId('component1')).toHaveTextContent('170');
            expect(screen.getByTestId('component2')).toHaveTextContent('170');
        });
    });
});
