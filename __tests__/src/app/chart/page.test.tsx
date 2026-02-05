/**
 * Chart ページのテスト
 *
 * このテストファイルは、src/app/chart/page.tsxの機能をテストします。
 * CSVファイルの読み込み、グラフの表示、データテーブルの表示をテストしています。
 */

import React from 'react';
import {render, screen, waitFor, fireEvent} from '@testing-library/react';
import ChartPage from '../../../../src/app/chart/page';
import '@testing-library/jest-dom';

// モックデータ
const mockCSVData = `月,売上,費用
1月,45000,25000
2月,52000,28000`;

describe('ChartPage', () => {
    beforeEach(() => {
        // fetch のモック
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve(mockCSVData),
            })
        ) as jest.Mock;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('基本的なレンダリング', () => {
        it('ページタイトルが表示される', async () => {
            render(<ChartPage />);

            await waitFor(() => {
                expect(screen.getByText('CSVデータ可視化')).toBeInTheDocument();
            });
        });

        it('グラフの種類選択ボタンが表示される', async () => {
            render(<ChartPage />);

            await waitFor(() => {
                expect(screen.getByText('棒グラフ')).toBeInTheDocument();
                expect(screen.getByText('折れ線グラフ')).toBeInTheDocument();
            });
        });

        it('データテーブルが表示される', async () => {
            render(<ChartPage />);

            await waitFor(() => {
                expect(screen.getByText('データテーブル')).toBeInTheDocument();
            });
        });
    });

    describe('CSV読み込み', () => {
        it('CSV情報が表示される', async () => {
            render(<ChartPage />);

            await waitFor(() => {
                expect(screen.getByText(/CSVファイル:.*sample-data\.csv/)).toBeInTheDocument();
            });
        });

        it('データがテーブルに表示される', async () => {
            render(<ChartPage />);

            await waitFor(() => {
                expect(screen.getByText('1月')).toBeInTheDocument();
                expect(screen.getByText('45000')).toBeInTheDocument();
                expect(screen.getByText('25000')).toBeInTheDocument();
            });
        });
    });

    describe('グラフ切り替え機能', () => {
        it('棒グラフがデフォルトで選択されている', async () => {
            render(<ChartPage />);

            await waitFor(() => {
                const barButton = screen.getByText('棒グラフ');
                expect(barButton).toHaveClass('bg-blue-600');
            });
        });

        it('折れ線グラフボタンをクリックすると切り替わる', async () => {
            render(<ChartPage />);

            await waitFor(() => {
                const lineButton = screen.getByText('折れ線グラフ');
                fireEvent.click(lineButton);
                
                expect(lineButton).toHaveClass('bg-blue-600');
            });
        });
    });

    describe('エラー処理', () => {
        it('CSVファイルの読み込みに失敗した場合、エラーメッセージが表示される', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: false,
                })
            ) as jest.Mock;

            render(<ChartPage />);

            await waitFor(() => {
                expect(screen.getByText(/エラー:/)).toBeInTheDocument();
            });
        });
    });

    describe('ローディング状態', () => {
        it('データ読み込み中にローディング表示がされる', () => {
            render(<ChartPage />);
            
            expect(screen.getByText('読み込み中...')).toBeInTheDocument();
        });
    });
});
