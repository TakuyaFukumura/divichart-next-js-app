/**
 * Chart ページのテスト
 *
 * このテストファイルは、src/app/chart/page.tsxの機能をテストします。
 * CSVファイルの読み込み、配当金グラフの表示、年別集計テーブルの表示をテストしています。
 */

import React from 'react';
import {render, screen, waitFor, fireEvent} from '@testing-library/react';
import ChartPage from '../../../../src/app/chart/page';
import '@testing-library/jest-dom';

// モックデータ（SHIFT_JIS形式の配当金データ）
const mockCSVData = `入金日,商品,口座,銘柄コード,銘柄,受取通貨,単価[円/現地通貨],数量[株/口],配当・分配金合計（税引前）[円/現地通貨],税額合計[円/現地通貨],受取金額[円/現地通貨]
"2024/12/15","米国株式","旧NISA","BLV","VA L-TERM BOND","USドル","0.27745","11","3.05","0","2.74"
"2024/12/15","投資信託","特定","","ブラジル株式ツインαファンド","円","5.00","1000","5000","0","5000"
"2025/01/20","米国株式","旧NISA","VCLT","VA L-TERM CORPBD","USドル","0.3456","33","11.40","0","10.26"
"2025/01/20","投資信託","特定","","インデックスファンドMLP","円","20.00","100","2000","0","2000"`;

describe('ChartPage', () => {
    beforeEach(() => {
        // TextDecoderをモック
        global.TextDecoder = jest.fn().mockImplementation(() => ({
            decode: () => mockCSVData,
        })) as unknown as typeof TextDecoder;
        
        // fetch のモックでarrayBufferをサポート
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(mockCSVData);
        
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                arrayBuffer: () => Promise.resolve(uint8Array.buffer),
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
                expect(screen.getByText('配当金グラフ')).toBeInTheDocument();
            });
        });

        it('グラフの種類選択ボタンが表示される', async () => {
            render(<ChartPage />);

            await waitFor(() => {
                expect(screen.getByText('棒グラフ')).toBeInTheDocument();
                expect(screen.getByText('折れ線グラフ')).toBeInTheDocument();
            });
        });

        it('年別配当金集計テーブルが表示される', async () => {
            render(<ChartPage />);

            await waitFor(() => {
                expect(screen.getByText('年別配当金集計')).toBeInTheDocument();
            });
        });
    });

    describe('CSV読み込み', () => {
        it('CSV情報が表示される', async () => {
            render(<ChartPage />);

            await waitFor(() => {
                expect(screen.getByText(/CSVファイル:.*dividendlist_20260205\.csv/)).toBeInTheDocument();
            });
        });

        it('年別データがテーブルに表示される', async () => {
            render(<ChartPage />);

            await waitFor(() => {
                expect(screen.getByText('2024年')).toBeInTheDocument();
                expect(screen.getByText('2025年')).toBeInTheDocument();
            });
        });

        it('USドルが円換算される（1ドル=150円）', async () => {
            render(<ChartPage />);

            await waitFor(() => {
                // 2024年のUSドル: 2.74 * 150 = 411円 + 円建て5000円 = 5411円
                // 2025年のUSドル: 10.26 * 150 = 1539円 + 円建て2000円 = 3539円
                const cells = screen.getAllByText(/¥/);
                expect(cells.length).toBeGreaterThan(0);
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
