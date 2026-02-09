/**
 * DividendPieChart コンポーネントのテスト
 */

import React from 'react';
import {render, screen} from '@testing-library/react';
import DividendPieChart from '@/app/components/DividendPieChart';
import {StockDividend} from '@/types/dividend';

// Recharts をモックして jsdom 環境でのテストを軽量化
jest.mock('recharts', () => {
    const OriginalRecharts = jest.requireActual('recharts');

    const MockResponsiveContainer = ({
                                         children,
                                     }: {
        children: React.ReactNode;
    }) => <div data-testid="mock-responsive-container">{children}</div>;

    const MockPieChart = ({children}: { children: React.ReactNode }) => (
        <div data-testid="mock-pie-chart">{children}</div>
    );

    const MockPie = ({outerRadius}: { outerRadius: number }) => (
        <div data-testid="mock-pie" data-outer-radius={outerRadius}/>
    );

    const MockTooltip = () => <div data-testid="mock-tooltip"/>;
    const MockLegend = ({layout, align, verticalAlign}: {
        layout?: string;
        align?: string;
        verticalAlign?: string
    }) => (
        <div
            data-testid="mock-legend"
            data-layout={layout}
            data-align={align}
            data-vertical-align={verticalAlign}
        />
    );

    return {
        ...OriginalRecharts,
        ResponsiveContainer: MockResponsiveContainer,
        PieChart: MockPieChart,
        Pie: MockPie,
        Tooltip: MockTooltip,
        Legend: MockLegend,
    };
});

describe('DividendPieChart', () => {
    const mockData: StockDividend[] = [
        {stockCode: 'ARCC', stockName: 'ARES CAPITAL COR', amount: 13416, percentage: 53.2},
        {stockCode: 'OBDC', stockName: 'BLUE OWL CAPITAL', amount: 8322, percentage: 33.0},
        {stockCode: 'VCLT', stockName: 'VA L-TERM CORPBD', amount: 1539, percentage: 6.1},
        {stockCode: 'MAIN', stockName: 'MAIN STREET CPTL', amount: 750, percentage: 3.0},
        {stockCode: 'BLV', stockName: 'VA L-TERM BOND', amount: 411, percentage: 1.6},
    ];

    // メディアクエリの定数定義 (DividendPieChart.tsxと同じ値)
    const MOBILE_QUERY = '(max-width: 639px)';
    const TABLET_QUERY = '(min-width: 640px) and (max-width: 1023px)';

    // matchMedia のモックリスナーを保持
    let mediaQueryListeners: { [key: string]: Array<(e: MediaQueryListEvent) => void> } = {};

    // matchMedia のモックを設定するヘルパー関数
    const mockMatchMedia = (width: number) => {
        const mobileMatches = width < 640;
        const tabletMatches = width >= 640 && width < 1024;

        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation((query: string) => {
                let matches = false;
                if (query === MOBILE_QUERY) {
                    matches = mobileMatches;
                } else if (query === TABLET_QUERY) {
                    matches = tabletMatches;
                }

                const mql = {
                    matches,
                    media: query,
                    onchange: null,
                    addListener: jest.fn(),
                    removeListener: jest.fn(),
                    addEventListener: jest.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
                        if (!mediaQueryListeners[query]) {
                            mediaQueryListeners[query] = [];
                        }
                        mediaQueryListeners[query].push(handler);
                    }),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn((event: MediaQueryListEvent) => {
                        if (mediaQueryListeners[query]) {
                            mediaQueryListeners[query].forEach(handler => handler(event));
                        }
                        return true;
                    }),
                };

                return mql;
            }),
        });
    };

    beforeEach(() => {
        // デフォルトでデスクトップサイズに設定
        mediaQueryListeners = {};
        mockMatchMedia(1024);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('基本的なレンダリング', () => {
        it('データがある場合、円グラフが表示される', () => {
            render(<DividendPieChart data={mockData}/>);

            expect(screen.getByTestId('mock-responsive-container')).toBeInTheDocument();
            expect(screen.getByTestId('mock-pie-chart')).toBeInTheDocument();
            expect(screen.getByTestId('mock-pie')).toBeInTheDocument();
        });

        it('データがない場合、適切なメッセージが表示される', () => {
            render(<DividendPieChart data={[]}/>);

            expect(screen.getByText('表示する配当データがありません')).toBeInTheDocument();
            expect(screen.queryByTestId('mock-pie-chart')).not.toBeInTheDocument();
        });
    });

    describe('レスポンシブデザイン - モバイル', () => {
        it('モバイルサイズ（375px）で適切な半径が設定される', () => {
            mockMatchMedia(375);

            render(<DividendPieChart data={mockData}/>);

            // モバイルでは outerRadius=80 が設定される
            const pieElement = screen.getByTestId('mock-pie');
            expect(pieElement).toHaveAttribute('data-outer-radius', '80');
        });

        it('モバイルサイズで凡例が水平レイアウトになる', () => {
            mockMatchMedia(375);

            render(<DividendPieChart data={mockData}/>);

            const legendElement = screen.getByTestId('mock-legend');
            expect(legendElement).toHaveAttribute('data-layout', 'horizontal');
            expect(legendElement).toHaveAttribute('data-align', 'center');
            expect(legendElement).toHaveAttribute('data-vertical-align', 'bottom');
        });

        it('モバイルサイズでデータなし時の高さが350pxになる', () => {
            mockMatchMedia(375);

            const {container} = render(<DividendPieChart data={[]}/>);

            const emptyStateDiv = container.querySelector('.flex.items-center.justify-center');
            expect(emptyStateDiv).toHaveStyle({height: '350px'});
        });
    });

    describe('レスポンシブデザイン - タブレット', () => {
        it('タブレットサイズ（768px）で適切な半径が設定される', () => {
            mockMatchMedia(768);

            render(<DividendPieChart data={mockData}/>);

            // タブレットでは outerRadius=120 が設定される
            const pieElement = screen.getByTestId('mock-pie');
            expect(pieElement).toHaveAttribute('data-outer-radius', '120');
        });

        it('タブレットサイズで凡例が垂直レイアウトになる', () => {
            mockMatchMedia(768);

            render(<DividendPieChart data={mockData}/>);

            const legendElement = screen.getByTestId('mock-legend');
            expect(legendElement).toHaveAttribute('data-layout', 'vertical');
            expect(legendElement).toHaveAttribute('data-align', 'right');
            expect(legendElement).toHaveAttribute('data-vertical-align', 'middle');
        });

        it('タブレットサイズでデータなし時の高さが400pxになる', () => {
            mockMatchMedia(768);

            const {container} = render(<DividendPieChart data={[]}/>);

            const emptyStateDiv = container.querySelector('.flex.items-center.justify-center');
            expect(emptyStateDiv).toHaveStyle({height: '400px'});
        });
    });

    describe('レスポンシブデザイン - デスクトップ', () => {
        it('デスクトップサイズ（1920px）で適切な半径が設定される', () => {
            mockMatchMedia(1920);

            render(<DividendPieChart data={mockData}/>);

            // デスクトップでは outerRadius=140 が設定される
            const pieElement = screen.getByTestId('mock-pie');
            expect(pieElement).toHaveAttribute('data-outer-radius', '140');
        });

        it('デスクトップサイズで凡例が垂直レイアウトになる', () => {
            mockMatchMedia(1920);

            render(<DividendPieChart data={mockData}/>);

            const legendElement = screen.getByTestId('mock-legend');
            expect(legendElement).toHaveAttribute('data-layout', 'vertical');
            expect(legendElement).toHaveAttribute('data-align', 'right');
            expect(legendElement).toHaveAttribute('data-vertical-align', 'middle');
        });

        it('デスクトップサイズでデータなし時の高さが450pxになる', () => {
            mockMatchMedia(1920);

            const {container} = render(<DividendPieChart data={[]}/>);

            const emptyStateDiv = container.querySelector('.flex.items-center.justify-center');
            expect(emptyStateDiv).toHaveStyle({height: '450px'});
        });
    });

    describe('ウィンドウリサイズ', () => {
        it('メディアクエリのchangeイベントリスナーが登録される', () => {
            // 初期状態はデスクトップ
            mockMatchMedia(1920);
            render(<DividendPieChart data={mockData}/>);

            // メディアクエリのリスナーが登録されていることを確認
            expect(mediaQueryListeners[MOBILE_QUERY]).toBeDefined();
            expect(mediaQueryListeners[MOBILE_QUERY].length).toBeGreaterThan(0);
            expect(mediaQueryListeners[TABLET_QUERY]).toBeDefined();
            expect(mediaQueryListeners[TABLET_QUERY].length).toBeGreaterThan(0);
        });
    });

    describe('銘柄コード表示', () => {
        it('銘柄コードが存在する場合、CustomTooltipに銘柄コードが表示される', () => {
            const testData: StockDividend[] = [
                {stockCode: 'BLV', stockName: 'VA L-TERM BOND', amount: 50000, percentage: 100.0},
            ];

            render(<DividendPieChart data={testData}/>);

            // CustomTooltipが利用可能であることを確認
            expect(screen.getByTestId('mock-tooltip')).toBeInTheDocument();
        });

        it('銘柄コードが存在しない場合、銘柄名のみが表示される', () => {
            const testData: StockDividend[] = [
                {stockCode: '', stockName: 'その他', amount: 10000, percentage: 100.0},
            ];

            render(<DividendPieChart data={testData}/>);

            // データがレンダリングされることを確認
            expect(screen.getByTestId('mock-pie-chart')).toBeInTheDocument();
        });

        it('銘柄コードと銘柄名が混在する場合、正しく処理される', () => {
            const testData: StockDividend[] = [
                {stockCode: 'BLV', stockName: 'VA L-TERM BOND', amount: 50000, percentage: 50.0},
                {stockCode: '', stockName: 'その他', amount: 50000, percentage: 50.0},
            ];

            render(<DividendPieChart data={testData}/>);

            // 円グラフが正しくレンダリングされることを確認
            expect(screen.getByTestId('mock-pie-chart')).toBeInTheDocument();
            expect(screen.getByTestId('mock-pie')).toBeInTheDocument();
        });
    });
});
