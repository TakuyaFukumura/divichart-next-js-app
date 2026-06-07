import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import MonthlyDividendPage from '@/app/monthly/page';
import {CSVRow} from '@/types/dividend';

const mockPush = jest.fn();
const mockSearchParamsGet = jest.fn();
const mockUseDividendData = jest.fn();
const mockUseExchangeRate = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    useSearchParams: () => ({
        get: mockSearchParamsGet,
    }),
}));

jest.mock('recharts', () => ({
    ResponsiveContainer: ({children}: { children: React.ReactNode }) => (
        <div data-testid="responsive-container">{children}</div>
    ),
    BarChart: ({data, children}: { data: unknown; children: React.ReactNode }) => (
        <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
            {children}
        </div>
    ),
    CartesianGrid: () => <div data-testid="cartesian-grid"/>,
    XAxis: () => <div data-testid="x-axis"/>,
    YAxis: () => <div data-testid="y-axis"/>,
    Tooltip: () => <div data-testid="tooltip"/>,
    Legend: () => <div data-testid="legend"/>,
    Bar: () => <div data-testid="bar"/>,
}));

jest.mock('@/hooks/useDividendData', () => ({
    useDividendData: () => mockUseDividendData(),
}));

jest.mock('@/app/contexts/ExchangeRateContext', () => ({
    useExchangeRate: () => mockUseExchangeRate(),
}));

describe('MonthlyDividendPage', () => {
    const mockData: CSVRow[] = [
        {
            '入金日': '2024/01/15',
            '商品': '日本株式',
            '口座': '一般NISA',
            '銘柄コード': '1234',
            '銘柄': 'テスト株式会社',
            '受取通貨': '円',
            '単価[円/現地通貨]': '100',
            '数量[株/口]': '10',
            '配当・分配金合計（税引前）[円/現地通貨]': '1000',
            '税額合計[円/現地通貨]': '0',
            '受取金額[円/現地通貨]': '1000',
        },
        {
            '入金日': '2025/03/15',
            '商品': '米国株式',
            '口座': '旧NISA',
            '銘柄コード': 'AAPL',
            '銘柄': 'Apple Inc',
            '受取通貨': 'USドル',
            '単価[円/現地通貨]': '0.5',
            '数量[株/口]': '10',
            '配当・分配金合計（税引前）[円/現地通貨]': '5.0',
            '税額合計[円/現地通貨]': '0.5',
            '受取金額[円/現地通貨]': '4.5',
        },
        {
            '入金日': '2025/09/15',
            '商品': '日本株式',
            '口座': '一般NISA',
            '銘柄コード': '5678',
            '銘柄': 'テスト2株式会社',
            '受取通貨': '円',
            '単価[円/現地通貨]': '500',
            '数量[株/口]': '10',
            '配当・分配金合計（税引前）[円/現地通貨]': '5000',
            '税額合計[円/現地通貨]': '0',
            '受取金額[円/現地通貨]': '5000',
        },
    ];

    beforeEach(() => {
        mockPush.mockClear();
        mockSearchParamsGet.mockReset();
        mockUseDividendData.mockReset();
        mockUseExchangeRate.mockReset();

        mockUseDividendData.mockReturnValue({
            data: mockData,
            loading: false,
            error: null,
        });
        mockUseExchangeRate.mockReturnValue({
            usdToJpyRate: 150,
        });
    });

    it('年指定がない場合は最新年の月別配当を表示する', async () => {
        mockSearchParamsGet.mockReturnValue(null);

        render(<MonthlyDividendPage/>);

        await waitFor(() => {
            expect(screen.getByText('2025年')).toBeInTheDocument();
        });

        expect(screen.getByText('月別配当')).toBeInTheDocument();
        expect(screen.getByText('合計配当金額')).toBeInTheDocument();
        expect(screen.getByText('月平均配当金額')).toBeInTheDocument();
        expect(screen.getByText('¥5,675')).toBeInTheDocument();
        expect(screen.getByText('¥472')).toBeInTheDocument();
        expect(screen.getByText('3月')).toBeInTheDocument();
        expect(screen.getByText('9月')).toBeInTheDocument();
        expect(screen.getByText('¥675')).toBeInTheDocument();

        const chart = screen.getByTestId('bar-chart');
        const chartData = JSON.parse(chart.getAttribute('data-chart-data') ?? '[]');
        expect(chartData).toHaveLength(12);
        expect(chartData[0]).toEqual({month: '1月', totalDividend: 0});
        expect(chartData[2]).toEqual({month: '3月', totalDividend: 675});
    });

    it('前年ボタンで年を切り替えてURLを更新する', async () => {
        mockSearchParamsGet.mockReturnValue(null);
        mockPush.mockImplementation((url: string) => {
            const year = url.split('year=')[1];
            mockSearchParamsGet.mockReturnValue(year ?? null);
        });

        render(<MonthlyDividendPage/>);

        await waitFor(() => {
            expect(screen.getByText('2025年')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', {name: '前年'}));

        expect(mockPush).toHaveBeenCalledWith('/monthly?year=2024');

        await waitFor(() => {
            expect(screen.getByText('2024年')).toBeInTheDocument();
        });

        expect(screen.getAllByText('¥1,000').length).toBeGreaterThan(0);
    });

    it('存在しないyearクエリは最新年にフォールバックする', async () => {
        mockSearchParamsGet.mockReturnValue('2023');

        render(<MonthlyDividendPage/>);

        await waitFor(() => {
            expect(screen.getByText('2025年')).toBeInTheDocument();
        });
    });

    it('表示可能な配当データがない場合はメッセージを表示する', () => {
        mockSearchParamsGet.mockReturnValue(null);
        mockUseDividendData.mockReturnValue({
            data: [],
            loading: false,
            error: null,
        });

        render(<MonthlyDividendPage/>);

        expect(screen.getByText('表示可能な配当データがありません')).toBeInTheDocument();
    });
});
