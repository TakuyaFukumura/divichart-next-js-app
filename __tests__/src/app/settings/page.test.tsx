/**
 * Settings Page (settings/page.tsx) コンポーネントのテスト
 *
 * このテストファイルは、src/app/settings/page.tsxの機能をテストします。
 * 為替レート設定画面の入力、バリデーション、リセット、永続化をテストしています。
 */

import React from 'react';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsPage from '@/app/settings/page';
import {ExchangeRateProvider, useExchangeRate} from '@/app/contexts/ExchangeRateContext';
import {
    DEFAULT_USD_TO_JPY_RATE,
    MIN_USD_TO_JPY_RATE,
    MAX_USD_TO_JPY_RATE,
    EXCHANGE_RATE_DEBOUNCE_DELAY,
} from '@/lib/exchangeRate';

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

// テスト用ラッパー
const TestWrapper = ({children}: { children: React.ReactNode }) => (
    <ExchangeRateProvider>{children}</ExchangeRateProvider>
);

describe('SettingsPage', () => {
    beforeEach(() => {
        localStorageMock.clear();
        delete process.env.NEXT_PUBLIC_USD_TO_JPY_RATE;
    });

    describe('基本表示', () => {
        it('設定画面が正しく表示される', () => {
            render(<SettingsPage/>, {wrapper: TestWrapper});

            expect(screen.getByText('設定')).toBeInTheDocument();
            expect(screen.getByText('為替レート設定')).toBeInTheDocument();
            expect(screen.getByLabelText('為替レート（1ドル = 円）')).toBeInTheDocument();
            expect(screen.getByText('デフォルトに戻す')).toBeInTheDocument();
        });

        it('デフォルト値が表示される', () => {
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）') as HTMLInputElement;
            expect(input.value).toBe(String(DEFAULT_USD_TO_JPY_RATE));
            expect(screen.getByText(`デフォルト値: ${DEFAULT_USD_TO_JPY_RATE}円`)).toBeInTheDocument();
        });

        it('情報メッセージが表示される', () => {
            render(<SettingsPage/>, {wrapper: TestWrapper});

            expect(screen.getByText('為替レートの反映について')).toBeInTheDocument();
            expect(screen.getByText('設定はリアルタイムで全ページに反映されます')).toBeInTheDocument();
            expect(screen.getByText('設定はブラウザに保存され、次回アクセス時も保持されます')).toBeInTheDocument();
        });
    });

    describe('入力と更新', () => {
        it('為替レートを変更できる', async () => {
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）') as HTMLInputElement;

            await act(async () => {
                fireEvent.change(input, {target: {value: '160'}});
            });

            expect(input.value).toBe('160');
        });

        it('入力値がlocalStorageに保存される（デバウンス後）', async () => {
            jest.useFakeTimers();
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）');
            const initialStorageValue = localStorageMock.getItem('usdToJpyRate');

            await act(async () => {
                fireEvent.change(input, {target: {value: '160'}});
            });

            // デバウンス前は保存されない
            expect(localStorageMock.getItem('usdToJpyRate')).toBe(initialStorageValue);

            // デバウンス後に保存される
            await act(async () => {
                jest.advanceTimersByTime(EXCHANGE_RATE_DEBOUNCE_DELAY);
            });

            await waitFor(() => {
                expect(localStorageMock.getItem('usdToJpyRate')).toBe('160');
            });

            jest.useRealTimers();
        });

        it('小数点を含む値を設定できる', async () => {
            jest.useFakeTimers();
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）') as HTMLInputElement;

            await act(async () => {
                fireEvent.change(input, {target: {value: '155.5'}});
            });

            expect(input.value).toBe('155.5');

            await act(async () => {
                jest.advanceTimersByTime(EXCHANGE_RATE_DEBOUNCE_DELAY);
            });

            await waitFor(() => {
                expect(localStorageMock.getItem('usdToJpyRate')).toBe('155.5');
            });

            jest.useRealTimers();
        });

        it('デバウンス処理が正しく動作する', async () => {
            jest.useFakeTimers();
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）');
            const initialStorageValue = localStorageMock.getItem('usdToJpyRate');

            // 連続して入力
            await act(async () => {
                fireEvent.change(input, {target: {value: '140'}});
            });

            await act(async () => {
                fireEvent.change(input, {target: {value: '145'}});
            });

            await act(async () => {
                fireEvent.change(input, {target: {value: '150'}});
            });

            // デバウンス期間内なので保存されない
            expect(localStorageMock.getItem('usdToJpyRate')).toBe(initialStorageValue);

            // デバウンス後に最後の値で保存される
            await act(async () => {
                jest.advanceTimersByTime(EXCHANGE_RATE_DEBOUNCE_DELAY);
            });

            await waitFor(() => {
                expect(localStorageMock.getItem('usdToJpyRate')).toBe('150');
            });

            jest.useRealTimers();
        });

        it('有効値から無効値への変更でタイマーがキャンセルされる', async () => {
            jest.useFakeTimers();
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）');
            const initialStorageValue = localStorageMock.getItem('usdToJpyRate');

            // 有効値を入力
            await act(async () => {
                fireEvent.change(input, {target: {value: '160'}});
            });

            // タイマーがセットされているが発火前
            expect(localStorageMock.getItem('usdToJpyRate')).toBe(initialStorageValue);

            // 無効値（範囲外）を入力
            await act(async () => {
                fireEvent.change(input, {target: {value: '350'}});
            });

            // エラーが表示される
            expect(screen.getByText(/為替レートは/)).toBeInTheDocument();

            // デバウンス時間経過後も保存されない（タイマーがキャンセルされている）
            await act(async () => {
                jest.advanceTimersByTime(EXCHANGE_RATE_DEBOUNCE_DELAY);
            });

            expect(localStorageMock.getItem('usdToJpyRate')).toBe(initialStorageValue);

            jest.useRealTimers();
        });

        it('有効値から空文字への変更でタイマーがキャンセルされる', async () => {
            jest.useFakeTimers();
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）');
            const initialStorageValue = localStorageMock.getItem('usdToJpyRate');

            // 有効値を入力
            await act(async () => {
                fireEvent.change(input, {target: {value: '160'}});
            });

            // 空文字を入力
            await act(async () => {
                fireEvent.change(input, {target: {value: ''}});
            });

            // エラーが表示される
            expect(screen.getByText('数値を入力してください')).toBeInTheDocument();

            // デバウンス時間経過後も保存されない
            await act(async () => {
                jest.advanceTimersByTime(EXCHANGE_RATE_DEBOUNCE_DELAY);
            });

            expect(localStorageMock.getItem('usdToJpyRate')).toBe(initialStorageValue);

            jest.useRealTimers();
        });
    });

    describe('バリデーション', () => {
        it('空の値を入力するとエラーが表示される', async () => {
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）');

            await act(async () => {
                fireEvent.change(input, {target: {value: ''}});
            });

            expect(screen.getByText('数値を入力してください')).toBeInTheDocument();
        });

        it('最小値未満の値を入力するとエラーが表示される', async () => {
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）');

            await act(async () => {
                fireEvent.change(input, {target: {value: '40'}});
            });

            expect(screen.getByText(`為替レートは${MIN_USD_TO_JPY_RATE}円〜${MAX_USD_TO_JPY_RATE}円の範囲で入力してください`)).toBeInTheDocument();
        });

        it('最大値超過の値を入力するとエラーが表示される', async () => {
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）');

            await act(async () => {
                fireEvent.change(input, {target: {value: '350'}});
            });

            expect(screen.getByText(`為替レートは${MIN_USD_TO_JPY_RATE}円〜${MAX_USD_TO_JPY_RATE}円の範囲で入力してください`)).toBeInTheDocument();
        });

        it('文字列を入力するとエラーが表示される', async () => {
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）');

            await act(async () => {
                fireEvent.change(input, {target: {value: 'abc'}});
            });

            expect(screen.getByText('数値を入力してください')).toBeInTheDocument();
        });

        it('フォーカスが外れたときに無効な入力が有効な値にリセットされる', async () => {
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）') as HTMLInputElement;
            const initialValue = input.value;

            await act(async () => {
                fireEvent.change(input, {target: {value: ''}});
            });

            expect(screen.getByText('数値を入力してください')).toBeInTheDocument();

            await act(async () => {
                fireEvent.blur(input);
            });

            await waitFor(() => {
                expect(input.value).toBe(initialValue);
                expect(screen.queryByText('数値を入力してください')).not.toBeInTheDocument();
            });
        });

        it('境界値（最小値）が正しく処理される', async () => {
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）');

            await act(async () => {
                fireEvent.change(input, {target: {value: String(MIN_USD_TO_JPY_RATE)}});
            });

            expect(screen.queryByText(/為替レートは/)).not.toBeInTheDocument();
        });

        it('境界値（最大値）が正しく処理される', async () => {
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）');

            await act(async () => {
                fireEvent.change(input, {target: {value: String(MAX_USD_TO_JPY_RATE)}});
            });

            expect(screen.queryByText(/為替レートは/)).not.toBeInTheDocument();
        });

        it('境界値-0.01（最小値未満）でエラーが表示される', async () => {
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）');

            await act(async () => {
                fireEvent.change(input, {target: {value: '49.99'}});
            });

            expect(screen.getByText(/為替レートは/)).toBeInTheDocument();
        });

        it('境界値+0.01（最大値超過）でエラーが表示される', async () => {
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）');

            await act(async () => {
                fireEvent.change(input, {target: {value: '300.01'}});
            });

            expect(screen.getByText(/為替レートは/)).toBeInTheDocument();
        });

        it('blur時に保留中のデバウンスが即座に反映される', async () => {
            jest.useFakeTimers();
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）');

            // 有効値を入力
            await act(async () => {
                fireEvent.change(input, {target: {value: '160'}});
            });

            // デバウンス期間内にblur
            await act(async () => {
                fireEvent.blur(input);
            });

            // blur時に即座に保存される
            await waitFor(() => {
                expect(localStorageMock.getItem('usdToJpyRate')).toBe('160');
            });

            jest.useRealTimers();
        });
    });

    describe('リセット機能', () => {
        it('デフォルトに戻すボタンでデフォルト値にリセットされる', async () => {
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）') as HTMLInputElement;
            const resetButton = screen.getByText('デフォルトに戻す');

            // 値を変更
            await act(async () => {
                fireEvent.change(input, {target: {value: '160'}});
            });

            expect(input.value).toBe('160');

            // リセット
            await act(async () => {
                fireEvent.click(resetButton);
            });

            await waitFor(() => {
                expect(input.value).toBe(String(DEFAULT_USD_TO_JPY_RATE));
            });
        });

        it('リセット時にlocalStorageがクリアされる', async () => {
            jest.useFakeTimers();
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）');
            const resetButton = screen.getByText('デフォルトに戻す');

            await act(async () => {
                fireEvent.change(input, {target: {value: '160'}});
            });

            await act(async () => {
                jest.advanceTimersByTime(EXCHANGE_RATE_DEBOUNCE_DELAY);
            });

            await waitFor(() => {
                expect(localStorageMock.getItem('usdToJpyRate')).toBe('160');
            });

            await act(async () => {
                fireEvent.click(resetButton);
            });

            await waitFor(() => {
                expect(localStorageMock.getItem('usdToJpyRate')).toBeNull();
            });

            jest.useRealTimers();
        });

        it('環境変数が設定されていてもデフォルト値（150円）にリセットされる', async () => {
            process.env.NEXT_PUBLIC_USD_TO_JPY_RATE = '160';

            render(<SettingsPage/>, {wrapper: TestWrapper});

            const resetButton = screen.getByText('デフォルトに戻す');

            await act(async () => {
                fireEvent.click(resetButton);
            });

            const input = screen.getByLabelText('為替レート（1ドル = 円）') as HTMLInputElement;

            await waitFor(() => {
                expect(input.value).toBe('150');
            });
        });

        it('リセット時に保留中のデバウンスタイマーがキャンセルされる', async () => {
            jest.useFakeTimers();
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）');
            const resetButton = screen.getByText('デフォルトに戻す');

            // 有効値を入力（デバウンス待ち）
            await act(async () => {
                fireEvent.change(input, {target: {value: '160'}});
            });

            // デバウンス前にリセット
            await act(async () => {
                fireEvent.click(resetButton);
            });

            // リセット後はデフォルト値
            expect(localStorageMock.getItem('usdToJpyRate')).toBeNull();

            // デバウンス時間経過後も160は保存されない（タイマーがキャンセルされている）
            await act(async () => {
                jest.advanceTimersByTime(EXCHANGE_RATE_DEBOUNCE_DELAY);
            });

            expect(localStorageMock.getItem('usdToJpyRate')).toBeNull();

            jest.useRealTimers();
        });
    });

    describe('Context との連携', () => {
        it('Context の値が変更されたときに入力欄が同期される', async () => {
            const TestComponent = () => {
                const {setUsdToJpyRate} = useExchangeRate();
                return (
                    <div>
                        <SettingsPage/>
                        <button onClick={() => setUsdToJpyRate(170)}>外部更新</button>
                    </div>
                );
            };

            render(<TestComponent/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）') as HTMLInputElement;
            const externalButton = screen.getByText('外部更新');

            expect(input.value).toBe('150');

            await act(async () => {
                fireEvent.click(externalButton);
            });

            await waitFor(() => {
                expect(input.value).toBe('170');
            });
        });

        it('編集中は外部からの更新で上書きされない', async () => {
            jest.useFakeTimers();
            
            const TestComponent = () => {
                const {setUsdToJpyRate} = useExchangeRate();
                return (
                    <div>
                        <SettingsPage/>
                        <button onClick={() => setUsdToJpyRate(170)}>外部更新</button>
                    </div>
                );
            };

            render(<TestComponent/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）') as HTMLInputElement;
            const externalButton = screen.getByText('外部更新');

            // 編集を開始
            await act(async () => {
                fireEvent.change(input, {target: {value: '180'}});
            });

            expect(input.value).toBe('180');

            // 編集中に外部から更新（Contextは170になる）
            await act(async () => {
                fireEvent.click(externalButton);
            });

            // 編集中なので入力欄は上書きされず180のまま
            expect(input.value).toBe('180');

            // フォーカスを外すと、保留中の180が即座に反映される
            await act(async () => {
                fireEvent.blur(input);
            });

            // blur時に180が保存される（デバウンスがフラッシュされる）
            await waitFor(() => {
                expect(input.value).toBe('180');
                expect(localStorageMock.getItem('usdToJpyRate')).toBe('180');
            });

            jest.useRealTimers();
        });
    });
});
