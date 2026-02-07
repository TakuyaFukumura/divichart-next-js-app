/**
 * dividendCalculator のテスト
 */

import {
    calculateStockDividends,
    aggregateOthers,
    generateYearlyPortfolio,
    getAvailableYears,
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
});
