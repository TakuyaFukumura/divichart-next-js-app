import {CSVRow, StockDividend, YearlyPortfolio} from '@/types/dividend';

/**
 * 指定年の銘柄別配当金を集計する
 * 
 * @param csvData - CSVから読み込んだ配当データ
 * @param targetYear - 集計対象年
 * @param exchangeRate - USドル→円の為替レート
 * @returns 銘柄別配当データの配列（降順ソート済み）
 * 
 * @remarks
 * - 同一銘柄の配当金を合算する
 * - USドル建ては為替換算する
 * - 金額の降順でソートする
 * - 合計金額から割合を計算する
 */
export function calculateStockDividends(
    csvData: CSVRow[],
    targetYear: number,
    exchangeRate: number
): StockDividend[] {
    // 1. 指定年のデータをフィルタリングし、銘柄名でグループ化
    const stockAmounts: { [stockName: string]: number } = {};

    csvData.forEach((row) => {
        const dateStr = row['入金日'];
        const stockName = row['銘柄'];
        const currency = row['受取通貨'];
        const amountStr = row['受取金額[円/現地通貨]'];

        if (!dateStr || !stockName || !amountStr) return;

        // 日付から年を抽出
        const year = parseInt(dateStr.split('/')[0], 10);
        if (year !== targetYear) return;

        // 金額を数値に変換
        const amountValue = amountStr === '-' ? 0 : parseFloat(amountStr.replace(/,/g, ''));
        if (isNaN(amountValue)) return;

        // USドルの場合は円に換算
        let amountInYen = amountValue;
        if (currency === 'USドル') {
            amountInYen = amountValue * exchangeRate;
        }

        // 銘柄名でグループ化して合算
        stockAmounts[stockName] = (stockAmounts[stockName] || 0) + amountInYen;
    });

    // 2. StockDividend配列に変換し、金額の降順でソート
    const roundedStocks = Object.entries(stockAmounts).map(([stockName, amount]) => ({
        stockName,
        amount: Math.round(amount),
    }));

    const totalRoundedAmount = roundedStocks.reduce((sum, stock) => sum + stock.amount, 0);

    const stocks: StockDividend[] = roundedStocks
        .map((stock) => ({
            ...stock,
            percentage: totalRoundedAmount === 0 ? 0 : (stock.amount / totalRoundedAmount) * 100,
        }))
        .sort((a, b) => b.amount - a.amount);

    return stocks;
}

/**
 * 上位N件以外を「その他」に集約
 * 
 * @param stocks - 銘柄別配当データ（ソート済み）
 * @param topN - 個別表示する銘柄数（デフォルト: 10）
 * @returns 「その他」集約後の銘柄別配当データ
 * 
 * @remarks
 * - 銘柄数がtopN以下の場合は集約しない
 * - 「その他」はグレー系の色で表示
 */
export function aggregateOthers(
    stocks: StockDividend[],
    topN: number = 10
): StockDividend[] {
    if (stocks.length <= topN) {
        return stocks;
    }

    const totalAmount = stocks.reduce((sum, s) => sum + s.amount, 0);

    const topStocks = stocks.slice(0, topN);
    const otherStocks = stocks.slice(topN);

    const otherAmount = otherStocks.reduce((sum, s) => sum + s.amount, 0);
    const otherPercentage = totalAmount === 0 ? 0 : (otherAmount / totalAmount) * 100;

    return [
        ...topStocks,
        {
            stockName: 'その他',
            amount: otherAmount,
            percentage: otherPercentage,
            color: '#9ca3af', // グレー系の色
        },
    ];
}

/**
 * 年度別配当ポートフォリオデータを生成
 * 
 * @param csvData - CSVから読み込んだ配当データ
 * @param targetYear - 対象年
 * @param exchangeRate - USドル→円の為替レート
 * @param topN - 個別表示する銘柄数（デフォルト: 10）
 * @returns 年度別配当ポートフォリオデータ
 */
export function generateYearlyPortfolio(
    csvData: CSVRow[],
    targetYear: number,
    exchangeRate: number,
    topN: number = 10
): YearlyPortfolio {
    const stocks = calculateStockDividends(csvData, targetYear, exchangeRate);
    const aggregatedStocks = aggregateOthers(stocks, topN);
    const totalAmount = stocks.reduce((sum, s) => sum + s.amount, 0);

    return {
        year: targetYear,
        stocks: aggregatedStocks,
        totalAmount,
    };
}

/**
 * 利用可能な年のリストを取得
 * 
 * @param csvData - CSVから読み込んだ配当データ
 * @returns 配当データが存在する年のリスト（昇順ソート済み）
 */
export function getAvailableYears(csvData: CSVRow[]): number[] {
    const years = new Set<number>();

    csvData.forEach((row) => {
        const dateStr = row['入金日'];
        if (!dateStr) return;

        const year = parseInt(dateStr.split('/')[0], 10);
        if (!isNaN(year)) {
            years.add(year);
        }
    });

    return Array.from(years).sort((a, b) => a - b);
}
