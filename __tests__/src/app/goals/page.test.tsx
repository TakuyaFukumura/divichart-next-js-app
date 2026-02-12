import {render, screen, waitFor} from '@testing-library/react';
import GoalsPage from '@/app/goals/page';
import {useDividendData} from '@/hooks/useDividendData';
import {useExchangeRate} from '@/app/contexts/ExchangeRateContext';

// モック
jest.mock('@/hooks/useDividendData');
jest.mock('@/app/contexts/ExchangeRateContext');

const mockUseDividendData = useDividendData as jest.MockedFunction<typeof useDividendData>;
const mockUseExchangeRate = useExchangeRate as jest.MockedFunction<typeof useExchangeRate>;

describe('GoalsPage', () => {
    beforeEach(() => {
        localStorage.clear();
        mockUseExchangeRate.mockReturnValue({
            usdToJpyRate: 150,
            setUsdToJpyRate: jest.fn(),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it('ローディング中は LoadingScreen を表示する', () => {
        mockUseDividendData.mockReturnValue({
            data: [],
            loading: true,
            error: null,
        });

        render(<GoalsPage/>);

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    it('エラー時はエラーメッセージを表示する', () => {
        mockUseDividendData.mockReturnValue({
            data: [],
            loading: false,
            error: 'データの読み込みに失敗しました',
        });

        render(<GoalsPage/>);

        expect(screen.getByText(/エラー:/)).toBeInTheDocument();
        expect(screen.getByText(/データの読み込みに失敗しました/)).toBeInTheDocument();
    });

    it('目標達成度ページが正しくレンダリングされる', async () => {
        const mockData = [
            {
                '入金日': '2024/01/15',
                '商品': '米国株式',
                '口座': '旧NISA',
                '銘柄コード': 'AAPL',
                '銘柄': 'Apple Inc.',
                '受取通貨': 'USドル',
                '単価[円/現地通貨]': '100',
                '数量[株/口]': '10',
                '配当・分配金合計（税引前）[円/現地通貨]': '1000',
                '税額合計[円/現地通貨]': '100',
                '受取金額[円/現地通貨]': '1000',
            },
            {
                '入金日': '2024/06/15',
                '商品': '米国株式',
                '口座': '旧NISA',
                '銘柄コード': 'MSFT',
                '銘柄': 'Microsoft Corp.',
                '受取通貨': 'USドル',
                '単価[円/現地通貨]': '100',
                '数量[株/口]': '10',
                '配当・分配金合計（税引前）[円/現地通貨]': '1000',
                '税額合計[円/現地通貨]': '100',
                '受取金額[円/現地通貨]': '1000',
            },
        ];

        mockUseDividendData.mockReturnValue({
            data: mockData,
            loading: false,
            error: null,
        });

        render(<GoalsPage/>);

        await waitFor(() => {
            expect(screen.getByText('配当目標達成度')).toBeInTheDocument();
            expect(screen.getByText('月平均配当目標')).toBeInTheDocument();
            expect(screen.getByText('年別達成状況')).toBeInTheDocument();
            expect(screen.getByText('年別詳細')).toBeInTheDocument();
        });
    });

    it('プログレスバーが表示される', async () => {
        const mockData = [
            {
                '入金日': '2024/01/15',
                '商品': '米国株式',
                '口座': '旧NISA',
                '銘柄コード': 'AAPL',
                '銘柄': 'Apple Inc.',
                '受取通貨': 'USドル',
                '単価[円/現地通貨]': '100',
                '数量[株/口]': '10',
                '配当・分配金合計（税引前）[円/現地通貨]': '1000',
                '税額合計[円/現地通貨]': '100',
                '受取金額[円/現地通貨]': '1000',
            },
        ];

        mockUseDividendData.mockReturnValue({
            data: mockData,
            loading: false,
            error: null,
        });

        render(<GoalsPage/>);

        await waitFor(() => {
            const progressbars = screen.getAllByRole('progressbar');
            expect(progressbars.length).toBeGreaterThan(0);
        });
    });

    it('配当データがない場合は適切なメッセージを表示する', async () => {
        mockUseDividendData.mockReturnValue({
            data: [],
            loading: false,
            error: null,
        });

        render(<GoalsPage/>);

        await waitFor(() => {
            expect(screen.getByText('配当目標達成度')).toBeInTheDocument();
            expect(screen.getAllByText('配当データがありません')).toHaveLength(2);
        });
    });

    it('保存ボタンが表示される', async () => {
        mockUseDividendData.mockReturnValue({
            data: [],
            loading: false,
            error: null,
        });

        render(<GoalsPage/>);

        await waitFor(() => {
            expect(screen.getByText('保存')).toBeInTheDocument();
        });
    });
});
