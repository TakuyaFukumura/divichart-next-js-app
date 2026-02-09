/**
 * dividendCalculator のテスト
 */

import {
    aggregateOthers,
    calculateStockDividends,
    generateYearlyPortfolio,
    getAvailableYears,
    aggregateDividendsByYear,
    formatYearlyDividendData,
    formatCumulativeDividendData,
} from '@/lib/dividendCalculator';
import {CSVRow} from '@/types/dividend';

describe('dividendCalculator', () => {
    const mockCSVData: CSVRow[] = [
        {
            '入金日': '2026/01/15',
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
            '入金日': '2026/02/15',
            '商品': '米国株式',
            '口座': '旧NISA',
            '銘柄コード': 'MSFT',
            '銘柄': 'Microsoft Corp',
            '受取通貨': 'USドル',
            '単価[円/現地通貨]': '0.6',
            '数量[株/口]': '10',
            '配当・分配金合計（税引前）[円/現地通貨]': '6.0',
            '税額合計[円/現地通貨]': '0.6',
            '受取金額[円/現地通貨]': '5.4',
        },
        {
            '入金日': '2025/12/15',
            '商品': '日本株式',
            '口座': '一般NISA',
            '銘柄コード': '1234',
            '銘柄': 'テスト株式会社',
            '受取通貨': '円',
            '単価[円/現地通貨]': '100',
            '数量[株/口]': '10',
            '配当・分配金合計（税引前）[円/現地通貨]': '1000',
            '税額合計[円/現地通貨]': '100',
            '受取金額[円/現地通貨]': '900',
        },
    ];

    describe('calculateStockDividends', () => {
        it('指定年の配当金を正しく集計する', () => {
            const result = calculateStockDividends(mockCSVData, 2026, 150);

            expect(result).toHaveLength(2);
            expect(result[0].stockCode).toBe('MSFT');
            expect(result[0].stockName).toBe('Microsoft Corp');
            expect(result[0].amount).toBe(810); // 5.4 * 150 = 810
            expect(result[1].stockCode).toBe('AAPL');
            expect(result[1].stockName).toBe('Apple Inc');
            expect(result[1].amount).toBe(675); // 4.5 * 150 = 675
        });

        it('円建ての配当金を正しく処理する', () => {
            const result = calculateStockDividends(mockCSVData, 2025, 150);

            expect(result).toHaveLength(1);
            expect(result[0].stockCode).toBe('1234');
            expect(result[0].stockName).toBe('テスト株式会社');
            expect(result[0].amount).toBe(900);
        });

        it('割合を正しく計算する', () => {
            const result = calculateStockDividends(mockCSVData, 2026, 150);

            const percentageSum = result.reduce((sum, item) => sum + item.percentage, 0);

            expect(percentageSum).toBeCloseTo(100, 1);
        });

        it('データがない年の場合は空配列を返す', () => {
            const result = calculateStockDividends(mockCSVData, 2024, 150);

            expect(result).toHaveLength(0);
        });

        it('銘柄コードがない場合は空文字列として扱う', () => {
            const dataWithoutCode: CSVRow[] = [
                {
                    '入金日': '2026/01/15',
                    '商品': '投資信託',
                    '口座': '旧NISA',
                    '銘柄コード': '',
                    '銘柄': 'テスト投資信託',
                    '受取通貨': '円',
                    '単価[円/現地通貨]': '100',
                    '数量[株/口]': '10',
                    '配当・分配金合計（税引前）[円/現地通貨]': '1000',
                    '税額合計[円/現地通貨]': '100',
                    '受取金額[円/現地通貨]': '900',
                },
            ];

            const result = calculateStockDividends(dataWithoutCode, 2026, 150);

            expect(result).toHaveLength(1);
            expect(result[0].stockCode).toBe('');
            expect(result[0].stockName).toBe('テスト投資信託');
        });

        it('同一銘柄名でも銘柄コードが異なる場合は別銘柄として扱う', () => {
            const dataWithSameName: CSVRow[] = [
                {
                    '入金日': '2026/01/15',
                    '商品': '米国株式',
                    '口座': '旧NISA',
                    '銘柄コード': 'AAPL',
                    '銘柄': 'Apple Inc',
                    '受取通貨': '円',
                    '単価[円/現地通貨]': '100',
                    '数量[株/口]': '10',
                    '配当・分配金合計（税引前）[円/現地通貨]': '1000',
                    '税額合計[円/現地通貨]': '100',
                    '受取金額[円/現地通貨]': '500',
                },
                {
                    '入金日': '2026/02/15',
                    '商品': '米国株式',
                    '口座': '旧NISA',
                    '銘柄コード': 'GOOGL',
                    '銘柄': 'Apple Inc',
                    '受取通貨': '円',
                    '単価[円/現地通貨]': '100',
                    '数量[株/口]': '10',
                    '配当・分配金合計（税引前）[円/現地通貨]': '1000',
                    '税額合計[円/現地通貨]': '100',
                    '受取金額[円/現地通貨]': '300',
                },
            ];

            const result = calculateStockDividends(dataWithSameName, 2026, 150);

            expect(result).toHaveLength(2);
            expect(result[0].stockCode).toBe('AAPL');
            expect(result[0].stockName).toBe('Apple Inc');
            expect(result[0].amount).toBe(500);
            expect(result[1].stockCode).toBe('GOOGL');
            expect(result[1].stockName).toBe('Apple Inc');
            expect(result[1].amount).toBe(300);
        });
    });

    describe('aggregateOthers', () => {
        it('銘柄数がtopN以下の場合は集約しない', () => {
            const stocks = [
                {stockCode: 'A', stockName: 'Stock A', amount: 1000, percentage: 50},
                {stockCode: 'B', stockName: 'Stock B', amount: 1000, percentage: 50},
            ];

            const result = aggregateOthers(stocks, 10);

            expect(result).toHaveLength(2);
            expect(result).toEqual(stocks);
        });

        it('銘柄数がtopNより多い場合は上位topN件と「その他」に集約する', () => {
            const stocks = Array.from({length: 15}, (_, i) => ({
                stockCode: `CODE${i}`,
                stockName: `Stock ${i}`,
                amount: 100 - i,
                percentage: (100 - i) / 10,
            }));

            const result = aggregateOthers(stocks, 10);

            expect(result).toHaveLength(11);
            expect(result[10].stockCode).toBe('');
            expect(result[10].stockName).toBe('その他');
        });
    });

    describe('generateYearlyPortfolio', () => {
        it('年度別ポートフォリオデータを生成する', () => {
            const result = generateYearlyPortfolio(mockCSVData, 2026, 150, 10);

            expect(result.year).toBe(2026);
            expect(result.stocks).toHaveLength(2);
            expect(result.totalAmount).toBeGreaterThan(0);
        });
    });

    describe('getAvailableYears', () => {
        it('データが存在する年のリストを返す', () => {
            const result = getAvailableYears(mockCSVData);

            expect(result).toEqual([2025, 2026]);
        });

        it('データが空の場合は空配列を返す', () => {
            const result = getAvailableYears([]);

            expect(result).toEqual([]);
        });
    });

    describe('aggregateDividendsByYear', () => {
        it('年別に配当金を集計する', () => {
            const csvData: CSVRow[] = [
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
                    '入金日': '2024/06/15',
                    '商品': '日本株式',
                    '口座': '一般NISA',
                    '銘柄コード': '5678',
                    '銘柄': 'テスト2株式会社',
                    '受取通貨': '円',
                    '単価[円/現地通貨]': '200',
                    '数量[株/口]': '10',
                    '配当・分配金合計（税引前）[円/現地通貨]': '2000',
                    '税額合計[円/現地通貨]': '0',
                    '受取金額[円/現地通貨]': '2000',
                },
                {
                    '入金日': '2025/01/15',
                    '商品': '日本株式',
                    '口座': '一般NISA',
                    '銘柄コード': '1234',
                    '銘柄': 'テスト株式会社',
                    '受取通貨': '円',
                    '単価[円/現地通貨]': '150',
                    '数量[株/口]': '10',
                    '配当・分配金合計（税引前）[円/現地通貨]': '1500',
                    '税額合計[円/現地通貨]': '0',
                    '受取金額[円/現地通貨]': '1500',
                },
            ];

            const result = aggregateDividendsByYear(csvData, 150);

            expect(result.get('2024')).toBe(3000);
            expect(result.get('2025')).toBe(1500);
        });

        it('USドルを円に換算する', () => {
            const csvData: CSVRow[] = [
                {
                    '入金日': '2024/01/15',
                    '商品': '米国株式',
                    '口座': '旧NISA',
                    '銘柄コード': 'AAPL',
                    '銘柄': 'Apple Inc',
                    '受取通貨': 'USドル',
                    '単価[円/現地通貨]': '0.5',
                    '数量[株/口]': '10',
                    '配当・分配金合計（税引前）[円/現地通貨]': '5.0',
                    '税額合計[円/現地通貨]': '0.5',
                    '受取金額[円/現地通貨]': '10',
                },
            ];

            const result = aggregateDividendsByYear(csvData, 150);

            expect(result.get('2024')).toBe(1500);
        });

        it('"-"を0として扱う', () => {
            const csvData: CSVRow[] = [
                {
                    '入金日': '2024/01/15',
                    '商品': '日本株式',
                    '口座': '一般NISA',
                    '銘柄コード': '1234',
                    '銘柄': 'テスト株式会社',
                    '受取通貨': '円',
                    '単価[円/現地通貨]': '100',
                    '数量[株/口]': '0',
                    '配当・分配金合計（税引前）[円/現地通貨]': '0',
                    '税額合計[円/現地通貨]': '-',
                    '受取金額[円/現地通貨]': '-',
                },
            ];

            const result = aggregateDividendsByYear(csvData, 150);

            expect(result.get('2024')).toBe(0);
        });

        it('カンマ区切りの金額を正しくパースする', () => {
            const csvData: CSVRow[] = [
                {
                    '入金日': '2024/01/15',
                    '商品': '日本株式',
                    '口座': '一般NISA',
                    '銘柄コード': '1234',
                    '銘柄': 'テスト株式会社',
                    '受取通貨': '円',
                    '単価[円/現地通貨]': '1,000',
                    '数量[株/口]': '10',
                    '配当・分配金合計（税引前）[円/現地通貨]': '10,000',
                    '税額合計[円/現地通貨]': '0',
                    '受取金額[円/現地通貨]': '10,000',
                },
            ];

            const result = aggregateDividendsByYear(csvData, 150);

            expect(result.get('2024')).toBe(10000);
        });
    });

    describe('formatYearlyDividendData', () => {
        it('Mapを配列に変換し年でソートする', () => {
            const map = new Map([
                ['2025', 2000],
                ['2023', 1000],
                ['2024', 1500],
            ]);

            const result = formatYearlyDividendData(map);

            expect(result).toEqual([
                { year: '2023年', totalDividend: 1000 },
                { year: '2024年', totalDividend: 1500 },
                { year: '2025年', totalDividend: 2000 },
            ]);
        });

        it('金額を四捨五入する', () => {
            const map = new Map([
                ['2024', 1234.5],
                ['2025', 5678.4],
            ]);

            const result = formatYearlyDividendData(map);

            expect(result).toEqual([
                { year: '2024年', totalDividend: 1235 },
                { year: '2025年', totalDividend: 5678 },
            ]);
        });

        it('空のMapの場合は空配列を返す', () => {
            const map = new Map<string, number>();

            const result = formatYearlyDividendData(map);

            expect(result).toEqual([]);
        });
    });

    describe('formatCumulativeDividendData', () => {
        it('累計配当金を計算する', () => {
            const map = new Map([
                ['2023', 1000],
                ['2024', 1500],
                ['2025', 2000],
            ]);

            const result = formatCumulativeDividendData(map);

            expect(result).toEqual([
                { year: '2023年', yearlyDividend: 1000, cumulativeDividend: 1000 },
                { year: '2024年', yearlyDividend: 1500, cumulativeDividend: 2500 },
                { year: '2025年', yearlyDividend: 2000, cumulativeDividend: 4500 },
            ]);
        });

        it('金額を四捨五入する', () => {
            const map = new Map([
                ['2023', 1234.5],
                ['2024', 5678.4],
            ]);

            const result = formatCumulativeDividendData(map);

            expect(result).toEqual([
                { year: '2023年', yearlyDividend: 1235, cumulativeDividend: 1235 },
                { year: '2024年', yearlyDividend: 5678, cumulativeDividend: 6913 },
            ]);
        });

        it('空のMapの場合は空配列を返す', () => {
            const map = new Map<string, number>();

            const result = formatCumulativeDividendData(map);

            expect(result).toEqual([]);
        });

        it('年が順不同でも正しくソートして累計を計算する', () => {
            const map = new Map([
                ['2025', 3000],
                ['2023', 1000],
                ['2024', 2000],
            ]);

            const result = formatCumulativeDividendData(map);

            expect(result).toEqual([
                { year: '2023年', yearlyDividend: 1000, cumulativeDividend: 1000 },
                { year: '2024年', yearlyDividend: 2000, cumulativeDividend: 3000 },
                { year: '2025年', yearlyDividend: 3000, cumulativeDividend: 6000 },
            ]);
        });
    });
});
