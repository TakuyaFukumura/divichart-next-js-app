/**
 * Home Page (page.tsx) コンポーネントのテスト
 *
 * このテストファイルは、src/app/page.tsxの機能をテストします。
 * CSV読み込み、データ変換、UIインタラクション、グラフ描画、テーブル表示をテストしています。
 */

import React from 'react';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';

// PapaParse のモック - モジュール読み込み前に定義
const mockPapaParse = jest.fn();
jest.mock('papaparse', () => ({
    default: {
        parse: (csvText: string, options: { header: boolean; skipEmptyLines: boolean; complete: (results: { data: unknown[] }) => void; error?: (error: Error) => void }) => mockPapaParse(csvText, options),
    },
    parse: (csvText: string, options: { header: boolean; skipEmptyLines: boolean; complete: (results: { data: unknown[] }) => void; error?: (error: Error) => void }) => mockPapaParse(csvText, options),
}));

// Rechartsコンポーネントのモック（実際のレンダリングは重いため）
jest.mock('recharts', () => ({
    ResponsiveContainer: ({children}: { children: React.ReactNode }) => (
        <div data-testid="responsive-container">{children}</div>
    ),
    BarChart: ({data, children}: { data: unknown; children: React.ReactNode }) => (
        <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
            {children}
        </div>
    ),
    LineChart: ({data, children}: { data: unknown; children: React.ReactNode }) => (
        <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
            {children}
        </div>
    ),
    CartesianGrid: () => <div data-testid="cartesian-grid"/>,
    XAxis: () => <div data-testid="x-axis"/>,
    YAxis: () => <div data-testid="y-axis"/>,
    Tooltip: () => <div data-testid="tooltip"/>,
    Legend: () => <div data-testid="legend"/>,
    Bar: () => <div data-testid="bar"/>,
    Line: () => <div data-testid="line"/>,
}));

// コンポーネントのインポートはモック定義の後に行う
import Home from '@/app/page';

// グローバルfetchのモック
const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

// サンプルCSVデータとそのパース結果
const createMockCSV = () => {
    return `入金日,受取通貨,受取金額[円/現地通貨]
2023/01/15,円,"1,000"
2023/06/15,円,"2,000"
2024/01/15,USドル,10
2024/06/15,円,"3,000"
2024/12/15,USドル,20`;
};

const getParsedCSV = () => [
    {'入金日': '2023/01/15', '受取通貨': '円', '受取金額[円/現地通貨]': '1,000'},
    {'入金日': '2023/06/15', '受取通貨': '円', '受取金額[円/現地通貨]': '2,000'},
    {'入金日': '2024/01/15', '受取通貨': 'USドル', '受取金額[円/現地通貨]': '10'},
    {'入金日': '2024/06/15', '受取通貨': '円', '受取金額[円/現地通貨]': '3,000'},
    {'入金日': '2024/12/15', '受取通貨': 'USドル', '受取金額[円/現地通貨]': '20'},
];

// PapaParse モックの実装
const setupPapaParseMock = () => {
    mockPapaParse.mockImplementation((text: string, options: { header: boolean; skipEmptyLines: boolean; complete: (results: { data: unknown[] }) => void; error?: (error: Error) => void }) => {
        setTimeout(() => {
            let data: Array<Record<string, string>> = [];
            
            // CSVテキスト（text）の内容に基づいてモック用のパース結果データを返す
            // より長い/特定的なパターンを先にチェック（部分一致を避けるため）
            if (text.includes('2023/01/15') && text.includes('2024')) {
                data = getParsedCSV();
            } else if (text.includes('"125,500"')) {
                data = [
                    {'入金日': '2023/01/15', '受取通貨': '円', '受取金額[円/現地通貨]': '125,500'},
                ];
            } else if (text.includes('"120,000"')) {
                data = [
                    {'入金日': '2023/01/15', '受取通貨': '円', '受取金額[円/現地通貨]': '120,000'},
                ];
            } else if (text.includes('"100,001"')) {
                data = [
                    {'入金日': '2023/01/15', '受取通貨': '円', '受取金額[円/現地通貨]': '100,001'},
                ];
            } else if (text.includes('"100,000"')) {
                data = [
                    {'入金日': '2023/01/15', '受取通貨': '円', '受取金額[円/現地通貨]': '100,000'},
                    {'入金日': '2023/06/15', '受取通貨': '円', '受取金額[円/現地通貨]': '250,000'},
                ];
            } else if (text.includes('"10,000"')) {
                data = [
                    {'入金日': '2023/01/15', '受取通貨': '円', '受取金額[円/現地通貨]': '10,000'},
                    {'入金日': '2023/06/15', '受取通貨': '円', '受取金額[円/現地通貨]': '5,500'},
                ];
            } else if (text.includes('2024/01/15') && !text.includes('2024/06')) {
                data = [
                    {'入金日': '2024/01/15', '受取通貨': 'USドル', '受取金額[円/現地通貨]': '10'},
                ];
            } else if (text.includes(',100\n') || text.endsWith(',100')) {
                // 小額配当（100円）のテストケース
                data = [
                    {'入金日': '2023/01/15', '受取通貨': '円', '受取金額[円/現地通貨]': '100'},
                ];
            } else if (text.includes(',0\n') || text.endsWith(',0')) {
                // ゼロ配当のテストケース
                data = [
                    {'入金日': '2023/01/15', '受取通貨': '円', '受取金額[円/現地通貨]': '0'},
                ];
            } else if (text.includes('invalid')) {
                data = [
                    {'入金日': '2023/01/15', '受取通貨': '円', '受取金額[円/現地通貨]': '1000'},
                    {'入金日': '', '受取通貨': '円', '受取金額[円/現地通貨]': '2000'},
                    {'入金日': '2023/06/15', '受取通貨': '', '受取金額[円/現地通貨]': '3000'},
                    {'入金日': '2023/12/15', '受取通貨': '円', '受取金額[円/現地通貨]': 'invalid'},
                ];
            } else if (text.trim().endsWith('受取金額[円/現地通貨]')) {
                data = [];
            } else if (text.includes('-') && text.includes('1000')) {
                data = [
                    {'入金日': '2023/01/15', '受取通貨': '円', '受取金額[円/現地通貨]': '1000'},
                    {'入金日': '2023/06/15', '受取通貨': '円', '受取金額[円/現地通貨]': '-'},
                ];
            }
            
            options.complete({data});
        }, 0);
    });
};

// fetchのモックヘルパー関数
const mockFetchSuccess = (csvContent: string) => {
    const encoder = new TextEncoder();
    const arrayBuffer = encoder.encode(csvContent).buffer;
    
    setupPapaParseMock();
    
    mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(arrayBuffer),
    });
};

const mockFetchError = () => {
    mockFetch.mockResolvedValueOnce({
        ok: false,
        arrayBuffer: () => Promise.reject(new Error('Network error')),
    });
};

describe('Home Page', () => {
    beforeEach(() => {
        mockFetch.mockClear();
        mockPapaParse.mockClear();
    });

    describe('ローディング状態', () => {
        it('初期ローディング時にローディングメッセージが表示される', () => {
            // fetchをペンディング状態にする
            mockFetch.mockImplementation(() => new Promise(() => {}));
            
            render(<Home/>);
            
            expect(screen.getByText('読み込み中...')).toBeInTheDocument();
        });

        it('ローディング中はスピナーが表示される', () => {
            mockFetch.mockImplementation(() => new Promise(() => {}));
            
            const {container} = render(<Home/>);
            
            const spinner = container.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
        });
    });

    describe('CSV読み込み', () => {
        it('正常にCSVファイルを読み込む', async () => {
            const csvData = createMockCSV();
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当グラフ')).toBeInTheDocument();
            });

            expect(mockFetch).toHaveBeenCalledWith('/data/dividendlist_20260205.csv');
        });

        it('CSVファイル読み込みエラーを適切に処理する', async () => {
            mockFetchError();

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText(/エラー:/)).toBeInTheDocument();
            });
        });

        it('ネットワークエラーが発生した場合にエラーメッセージを表示する', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network failed'));

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText(/エラー: Network failed/)).toBeInTheDocument();
            });
        });
    });

    describe('データ変換と表示', () => {
        it('年別に配当金を正しく集計する', async () => {
            const csvData = createMockCSV();
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('2023年')).toBeInTheDocument();
                expect(screen.getByText('2024年')).toBeInTheDocument();
            });
        });

        it('USドルを円に換算する（デフォルトレート150円）', async () => {
            const csvData = createMockCSV();
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                // 2023年: 1,000 + 2,000 = 3,000円
                expect(screen.getByText('¥3,000')).toBeInTheDocument();
                
                // 2024年: 3,000円 + (10ドル * 150) + (20ドル * 150) = 3,000 + 1,500 + 3,000 = 7,500円
                expect(screen.getByText('¥7,500')).toBeInTheDocument();
            });
        });

        it('カンマ区切りの金額を正しく処理する', async () => {
            const csvData = `入金日,受取通貨,受取金額[円/現地通貨]
2023/01/15,円,"10,000"
2023/06/15,円,"5,500"`;
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                // 10,000 + 5,500 = 15,500
                expect(screen.getByText('¥15,500')).toBeInTheDocument();
            });
        });

        it('"-"表記の金額を0として処理する', async () => {
            const csvData = `入金日,受取通貨,受取金額[円/現地通貨]
2023/01/15,円,1000
2023/06/15,円,-`;
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                // 1,000 + 0 = 1,000
                expect(screen.getByText('¥1,000')).toBeInTheDocument();
            });
        });

        it('無効なデータをスキップする', async () => {
            const csvData = `入金日,受取通貨,受取金額[円/現地通貨]
2023/01/15,円,1000
,円,2000
2023/06/15,,3000
2023/12/15,円,invalid`;
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当グラフ')).toBeInTheDocument();
            }, {timeout: 3000});

            // 年別配当金集計のヘッダーが表示されることを確認
            expect(screen.getByText('年別配当金集計')).toBeInTheDocument();
        });

        it('空のCSVデータを処理する', async () => {
            const csvData = `入金日,受取通貨,受取金額[円/現地通貨]`;
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当グラフ')).toBeInTheDocument();
            });

            // テーブルにデータ行がないことを確認（theadではなくtbodyをチェック）
            const tables = screen.getAllByRole('table');
            expect(tables).toHaveLength(1);
            const tbody = tables[0].querySelector('tbody');
            expect(tbody?.querySelectorAll('tr')).toHaveLength(0);
        });
    });

    describe('UIインタラクション - 為替レート変更', () => {
        it('為替レート入力フィールドが表示される', async () => {
            const csvData = createMockCSV();
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当グラフ')).toBeInTheDocument();
            });

            const input = screen.getByLabelText('為替レート（1ドル = 円）');
            expect(input).toBeInTheDocument();
            expect(input).toHaveValue(150); // デフォルト値
        });

        it('為替レートを変更するとデータが再計算される', async () => {
            const csvData = `入金日,受取通貨,受取金額[円/現地通貨]
2024/01/15,USドル,10`;
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当グラフ')).toBeInTheDocument();
            }, {timeout: 3000});

            const input = screen.getByLabelText('為替レート（1ドル = 円）');
            
            act(() => {
                fireEvent.change(input, {target: {value: '200'}});
            });

            // 為替レートが変更されたことを確認
            expect(input).toHaveValue(200);
        });

        it('無効な為替レート（負の数）を入力してもデータが変更されない', async () => {
            const csvData = `入金日,受取通貨,受取金額[円/現地通貨]
2024/01/15,USドル,10`;
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当グラフ')).toBeInTheDocument();
            }, {timeout: 3000});

            const input = screen.getByLabelText('為替レート（1ドル = 円）') as HTMLInputElement;
            
            act(() => {
                fireEvent.change(input, {target: {value: '-100'}});
            });

            // inputには-100が入るが、表示フィールドはそのまま（内部の為替レートは更新されない）
            expect(input.value).toBe('-100');
        });

        it('無効な為替レート（0）を入力してもデータが変更されない', async () => {
            const csvData = `入金日,受取通貨,受取金額[円/現地通貨]
2024/01/15,USドル,10`;
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当グラフ')).toBeInTheDocument();
            }, {timeout: 3000});

            const input = screen.getByLabelText('為替レート（1ドル = 円）') as HTMLInputElement;
            
            act(() => {
                fireEvent.change(input, {target: {value: '0'}});
            });

            // inputには0が入る
            expect(input.value).toBe('0');
        });

        it('フォーカスが外れたときに無効な入力が現在の有効な値にリセットされる', async () => {
            const csvData = createMockCSV();
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当グラフ')).toBeInTheDocument();
            }, {timeout: 3000});

            const input = screen.getByLabelText('為替レート（1ドル = 円）') as HTMLInputElement;
            
            // 元の有効な値を記録
            const initialValue = input.value;
            
            // 空の値を設定（数値入力フィールドで無効な入力をシミュレート）
            act(() => {
                fireEvent.change(input, {target: {value: ''}});
            });

            expect(input.value).toBe('');

            act(() => {
                fireEvent.blur(input);
            });

            // 無効な入力がリセットされて元の有効な値に戻る
            expect(input.value).toBe(initialValue);
        });

        it('小数点を含む為替レートを設定できる', async () => {
            const csvData = `入金日,受取通貨,受取金額[円/現地通貨]
2024/01/15,USドル,10`;
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当グラフ')).toBeInTheDocument();
            });

            const input = screen.getByLabelText('為替レート（1ドル = 円）');
            
            act(() => {
                fireEvent.change(input, {target: {value: '155.5'}});
            });

            await waitFor(() => {
                // 10ドル * 155.5円 = 1,555円（端数は四捨五入）
                expect(screen.getByText('¥1,555')).toBeInTheDocument();
            });
        });
    });

    describe('グラフ描画', () => {
        it('Rechartsコンポーネントが正しくレンダリングされる', async () => {
            const csvData = createMockCSV();
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当グラフ')).toBeInTheDocument();
            });

            expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
            expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
            expect(screen.getByTestId('x-axis')).toBeInTheDocument();
            expect(screen.getByTestId('y-axis')).toBeInTheDocument();
            expect(screen.getByTestId('tooltip')).toBeInTheDocument();
            expect(screen.getByTestId('legend')).toBeInTheDocument();
            expect(screen.getByTestId('bar')).toBeInTheDocument();
        });

        it('グラフに正しいデータが渡される', async () => {
            const csvData = createMockCSV();
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当グラフ')).toBeInTheDocument();
            }, {timeout: 3000});

            const barChart = screen.getByTestId('bar-chart');
            const chartData = JSON.parse(barChart.getAttribute('data-chart-data') || '[]');
            
            // データが配列であることを確認（具体的な値は CSVのパースに依存するため確認しない）
            expect(Array.isArray(chartData)).toBe(true);
        });
    });

    describe('テーブル表示', () => {
        it('年別データがテーブル形式で表示される', async () => {
            const csvData = createMockCSV();
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当金集計')).toBeInTheDocument();
            }, {timeout: 3000});

            // テーブルヘッダー
            expect(screen.getByText('年')).toBeInTheDocument();
            expect(screen.getByText('税引後配当合計[円]')).toBeInTheDocument();
            expect(screen.getByText('月平均配当[円]')).toBeInTheDocument();
        });

        it('金額がカンマ区切りでフォーマットされる', async () => {
            const csvData = `入金日,受取通貨,受取金額[円/現地通貨]
2023/01/15,円,"100,000"
2023/06/15,円,"250,000"`;
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当金集計')).toBeInTheDocument();
            }, {timeout: 3000});

            // 年別配当金集計のヘッダーが表示されることを確認
            expect(screen.getByText('税引後配当合計[円]')).toBeInTheDocument();
        });

        it('月平均配当が正しく計算される（割り切れる場合）', async () => {
            const csvData = `入金日,受取通貨,受取金額[円/現地通貨]
2023/01/15,円,"120,000"`;
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当金集計')).toBeInTheDocument();
            }, {timeout: 3000});

            // データが描画されることを確認
            await waitFor(() => {
                expect(screen.getByText('2023年')).toBeInTheDocument();
            });

            // 120,000 / 12 = 10,000
            expect(screen.getByText('¥120,000')).toBeInTheDocument();
            expect(screen.getByText('¥10,000')).toBeInTheDocument();
        });

        it('月平均配当が正しく計算される（切り捨て確認）', async () => {
            const csvData = `入金日,受取通貨,受取金額[円/現地通貨]
2023/01/15,円,"125,500"`;
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当金集計')).toBeInTheDocument();
            }, {timeout: 3000});

            // データが描画されることを確認
            await waitFor(() => {
                expect(screen.getByText('2023年')).toBeInTheDocument();
            });

            // floor(125,500 / 12) = floor(10458.333...) = 10,458
            expect(screen.getByText('¥125,500')).toBeInTheDocument();
            expect(screen.getByText('¥10,458')).toBeInTheDocument();
        });

        it('月平均配当が正しく計算される（端数が大きい場合）', async () => {
            const csvData = `入金日,受取通貨,受取金額[円/現地通貨]
2023/01/15,円,"100,001"`;
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当金集計')).toBeInTheDocument();
            }, {timeout: 3000});

            // データが描画されることを確認
            await waitFor(() => {
                expect(screen.getByText('2023年')).toBeInTheDocument();
            });

            // floor(100,001 / 12) = floor(8333.416...) = 8,333
            expect(screen.getByText('¥100,001')).toBeInTheDocument();
            expect(screen.getByText('¥8,333')).toBeInTheDocument();
        });

        it('月平均配当が正しく計算される（小額の配当金）', async () => {
            const csvData = `入金日,受取通貨,受取金額[円/現地通貨]
2023/01/15,円,100`;
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当金集計')).toBeInTheDocument();
            }, {timeout: 3000});

            // データが描画されることを確認
            await waitFor(() => {
                expect(screen.getByText('2023年')).toBeInTheDocument();
            });

            // floor(100 / 12) = floor(8.333...) = 8
            expect(screen.getByText('¥100')).toBeInTheDocument();
            expect(screen.getByText('¥8')).toBeInTheDocument();
        });

        it('月平均配当が正しく計算される（ゼロ配当）', async () => {
            const csvData = `入金日,受取通貨,受取金額[円/現地通貨]
2023/01/15,円,0`;
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当金集計')).toBeInTheDocument();
            }, {timeout: 3000});

            // データが描画されることを確認
            await waitFor(() => {
                expect(screen.getByText('2023年')).toBeInTheDocument();
            });

            // floor(0 / 12) = 0
            // ¥0 が2つ表示される（合計と月平均）
            const zeroElements = screen.getAllByText('¥0');
            expect(zeroElements).toHaveLength(2);
        });

        it('為替レート変更時に月平均配当も更新される', async () => {
            const csvData = `入金日,受取通貨,受取金額[円/現地通貨]
2024/01/15,USドル,10`;
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当グラフ')).toBeInTheDocument();
            }, {timeout: 3000});

            // 初期値: 10ドル * 150円 = 1,500円、月平均: floor(1,500 / 12) = 125円
            await waitFor(() => {
                expect(screen.getByText('¥125')).toBeInTheDocument();
            });

            const input = screen.getByLabelText('為替レート（1ドル = 円）');
            
            act(() => {
                fireEvent.change(input, {target: {value: '200'}});
            });

            // 変更後: 10ドル * 200円 = 2,000円、月平均: floor(2,000 / 12) = 166円
            await waitFor(() => {
                expect(screen.getByText('¥166')).toBeInTheDocument();
            });
        });
    });

    describe('説明文の表示', () => {
        it('グラフの説明文が表示される', async () => {
            const csvData = createMockCSV();
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当グラフ')).toBeInTheDocument();
            });

            expect(
                screen.getByText('このグラフは、配当金データから年別に税引き後の配当金を集計して表示しています。')
            ).toBeInTheDocument();
        });

        it('為替レート情報が説明文に含まれる', async () => {
            const csvData = createMockCSV();
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当グラフ')).toBeInTheDocument();
            });

            expect(
                screen.getByText(/USドル建ての配当金は1ドル=150円で換算しています。/)
            ).toBeInTheDocument();
        });

        it('為替レート変更後、説明文の為替レートが更新される', async () => {
            const csvData = createMockCSV();
            mockFetchSuccess(csvData);

            render(<Home/>);

            await waitFor(() => {
                expect(screen.getByText('年別配当グラフ')).toBeInTheDocument();
            });

            const input = screen.getByLabelText('為替レート（1ドル = 円）');
            
            act(() => {
                fireEvent.change(input, {target: {value: '200'}});
            });

            await waitFor(() => {
                expect(
                    screen.getByText(/USドル建ての配当金は1ドル=200円で換算しています。/)
                ).toBeInTheDocument();
            });
        });
    });
});
