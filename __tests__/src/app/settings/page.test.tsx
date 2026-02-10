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

        it('入力値がlocalStorageに保存される', async () => {
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）');

            await act(async () => {
                fireEvent.change(input, {target: {value: '160'}});
            });

            expect(localStorageMock.getItem('usdToJpyRate')).toBe('160');
        });

        it('小数点を含む値を設定できる', async () => {
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）') as HTMLInputElement;

            await act(async () => {
                fireEvent.change(input, {target: {value: '155.5'}});
            });

            expect(input.value).toBe('155.5');
            expect(localStorageMock.getItem('usdToJpyRate')).toBe('155.5');
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

        it('負の値を入力するとエラーが表示される', async () => {
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）');

            await act(async () => {
                fireEvent.change(input, {target: {value: '-100'}});
            });

            expect(screen.getByText('正の数値を入力してください')).toBeInTheDocument();
        });

        it('0を入力するとエラーが表示される', async () => {
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）');

            await act(async () => {
                fireEvent.change(input, {target: {value: '0'}});
            });

            expect(screen.getByText('正の数値を入力してください')).toBeInTheDocument();
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
            render(<SettingsPage/>, {wrapper: TestWrapper});

            const input = screen.getByLabelText('為替レート（1ドル = 円）');
            const resetButton = screen.getByText('デフォルトに戻す');

            await act(async () => {
                fireEvent.change(input, {target: {value: '160'}});
            });

            expect(localStorageMock.getItem('usdToJpyRate')).toBe('160');

            await act(async () => {
                fireEvent.click(resetButton);
            });

            await waitFor(() => {
                expect(localStorageMock.getItem('usdToJpyRate')).toBeNull();
            });
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

            // フォーカスを外すと編集中フラグがクリアされ、Contextの値に同期される
            await act(async () => {
                fireEvent.blur(input);
            });

            // 編集終了後、Contextの値（170）に同期される
            await waitFor(() => {
                expect(input.value).toBe('170');
            });
        });
    });
});
