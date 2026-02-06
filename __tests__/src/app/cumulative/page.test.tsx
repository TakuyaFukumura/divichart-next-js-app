/**
 * Cumulative Dividend Page (cumulative/page.tsx) コンポーネントのテスト
 *
 * このテストファイルは、src/app/cumulative/page.tsxの機能をテストします。
 * CSV読み込み、累計計算、UIインタラクション、グラフ描画、テーブル表示をテストしています。
 */

import React from 'react';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';

// PapaParse オプションの型定義
type PapaParseOptions = {
    header: boolean;
    skipEmptyLines: boolean;
    complete: (results: { data: unknown[] }) => void;
    error?: (error: Error) => void;
};

// PapaParse のモック - モジュール読み込み前に定義
const mockPapaParse = jest.fn();
jest.mock('papaparse', () => ({
    default: {
        parse: (csvText: string, options: PapaParseOptions) => mockPapaParse(csvText, options),
    },
    parse: (csvText: string, options: PapaParseOptions) => mockPapaParse(csvText, options),
}));

// Rechartsコンポーネントのモック
jest.mock('recharts', () => ({
    ResponsiveContainer: ({children}: { children: React.ReactNode }) => (
        <div data-testid="responsive-container">{children}</div>
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
    Line: () => <div data-testid="line"/>,
}));

// コンポーネントのインポートはモック定義の後に行う
import CumulativeDividendPage from '@/app/cumulative/page';

// グローバルfetchのモック
const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

// サンプルCSVデータ
const getParsedCSV = () => [
    {'入金日': '2020/01/15', '受取通貨': '円', '受取金額[円/現地通貨]': '10000'},
    {'入金日': '2020/06/15', '受取通貨': '円', '受取金額[円/現地通貨]': '15000'},
    {'入金日': '2021/01/15', '受取通貨': '円', '受取金額[円/現地通貨]': '20000'},
    {'入金日': '2022/01/15', '受取通貨': 'USドル', '受取金額[円/現地通貨]': '100'},
];

// PapaParse モックの実装
const setupPapaParseMock = () => {
    mockPapaParse.mockImplementation((text: string, options: PapaParseOptions) => {
        setTimeout(() => {
            const data = getParsedCSV();
            options.complete({data});
        }, 0);
    });
};

// Fetch モックの実装
const setupFetchMock = () => {
    mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => {
            const encoder = new TextEncoder();
            return encoder.encode('dummy csv').buffer;
        },
    });
};

describe('CumulativeDividendPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupPapaParseMock();
        setupFetchMock();
    });

    test('ローディング中はスピナーが表示される', () => {
        render(<CumulativeDividendPage/>);
        expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    test('データ読み込み後にタイトルが表示される', async () => {
        render(<CumulativeDividendPage/>);

        await waitFor(() => {
            expect(screen.getByText('累計配当グラフ')).toBeInTheDocument();
        });
    });

    test('データ読み込み後にグラフが表示される', async () => {
        render(<CumulativeDividendPage/>);

        await waitFor(() => {
            expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        });
    });

    test('データ読み込み後にテーブルが表示される', async () => {
        render(<CumulativeDividendPage/>);

        await waitFor(() => {
            expect(screen.getByText('年別累計配当金集計')).toBeInTheDocument();
        });
    });

    test('累計配当金が正しく計算される', async () => {
        render(<CumulativeDividendPage/>);

        await waitFor(() => {
            // 2020年: 10000 + 15000 = 25000
            const yearlyValues = screen.getAllByText('¥25,000');
            expect(yearlyValues.length).toBeGreaterThan(0);
            // 2021年: 20000, 累計: 25000 + 20000 = 45000
            expect(screen.getByText('¥45,000')).toBeInTheDocument();
            // 2022年: 100 * 150 = 15000, 累計: 45000 + 15000 = 60000
            expect(screen.getByText('¥60,000')).toBeInTheDocument();
        });
    });

    test('為替レート入力フィールドが表示される', async () => {
        render(<CumulativeDividendPage/>);

        await waitFor(() => {
            const input = screen.getByLabelText('為替レート（1ドル = 円）');
            expect(input).toBeInTheDocument();
            expect(input).toHaveValue(150);
        });
    });

    test('為替レート変更時にデータが再計算される', async () => {
        render(<CumulativeDividendPage/>);

        await waitFor(() => {
            expect(screen.getByText('¥60,000')).toBeInTheDocument();
        });

        const input = screen.getByLabelText('為替レート（1ドル = 円）');

        // 為替レートを140に変更
        await act(async () => {
            fireEvent.change(input, {target: {value: '140'}});
        });

        await waitFor(() => {
            // 2022年: 100 * 140 = 14000, 累計: 45000 + 14000 = 59000
            expect(screen.getByText('¥59,000')).toBeInTheDocument();
        });
    });

    test('エラー時にエラーメッセージが表示される', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        render(<CumulativeDividendPage/>);

        await waitFor(() => {
            expect(screen.getByText(/エラー:/)).toBeInTheDocument();
        });
    });

    test('説明文が表示される', async () => {
        render(<CumulativeDividendPage/>);

        await waitFor(() => {
            expect(screen.getByText(/このグラフは、配当金データから年別に税引き後の配当金を累計して表示しています。/)).toBeInTheDocument();
        });
    });
});
