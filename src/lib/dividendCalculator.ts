import {CSVRow, StockDividend, YearlyPortfolio} from '@/types/dividend';

/**
 * 日付文字列から年を抽出
 * 
 * @param dateStr - YYYY/MM/DD形式の日付文字列
 * @returns 年（YYYY形式）、抽出失敗時はnull
 */
function extractYear(dateStr: string | undefined): string | null {
    if (!dateStr) return null;
    const year = dateStr.split('/')[0];
    return year && year.length === 4 ? year : null;
}

/**
 * 配当金額をパースし、必要に応じて円換算
 * 
 * @param row - CSVデータ行
 * @param exchangeRate - USドル→円の為替レート
 * @returns 円換算された金額、パース失敗時はNaN
 */
function parseAndConvertAmount(row: CSVRow, exchangeRate: number): number {
    const amountStr = row['受取金額[円/現地通貨]'];
    const currency = row['受取通貨'];
    
    if (!amountStr) return NaN;
    
    // "-"は0として扱う（税額表示用）
    const amount = amountStr === '-' 
        ? 0 
        : parseFloat(amountStr.replace(/,/g, ''));
    
    if (isNaN(amount)) return NaN;
    
    // USドルの場合は円換算
    return currency === 'USドル' ? amount * exchangeRate : amount;
}

/**
 * CSVデータから年別配当金を集計
 * 
 * @param csvData - CSVファイルから読み込んだ配当データ
 * @param exchangeRate - USドル→円の為替レート
 * @returns 年をキー、配当金合計を値とするMap
 * 
 * @remarks
 * - USドル建て配当は為替レートで円換算
 * - 金額が"-"の場合は0として扱う
 * - 無効なデータはスキップ
 */
export function aggregateDividendsByYear(
    csvData: CSVRow[],
    exchangeRate: number
): Map<string, number> {
    const yearlyDividends = new Map<string, number>();
    
    for (const row of csvData) {
        const year = extractYear(row['入金日']);
        if (!year) continue;
        
        const amount = parseAndConvertAmount(row, exchangeRate);
        if (isNaN(amount)) continue;
        
        const current = yearlyDividends.get(year) ?? 0;
        yearlyDividends.set(year, current + amount);
    }
    
    return yearlyDividends;
}

/**
 * 年別配当金データをグラフ用に整形
 * 
 * @param yearlyDividends - 年別配当金のMap
 * @returns グラフ表示用の配当金データ配列（年でソート済み）
 */
export function formatYearlyDividendData(
    yearlyDividends: Map<string, number>
): Array<{ year: string; totalDividend: number }> {
    return Array.from(yearlyDividends.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([year, amount]) => ({
            year: `${year}年`,
            totalDividend: Math.round(amount),
        }));
}

/**
 * 累計配当金データをグラフ用に整形
 * 
 * @param yearlyDividends - 年別配当金のMap
 * @returns グラフ表示用の累計配当金データ配列（年でソート済み）
 */
export function formatCumulativeDividendData(
    yearlyDividends: Map<string, number>
): Array<{ year: string; yearlyDividend: number; cumulativeDividend: number }> {
    const sortedEntries = Array.from(yearlyDividends.entries())
        .sort((a, b) => a[0].localeCompare(b[0]));
    
    let cumulative = 0;
    return sortedEntries.map(([year, yearlyAmount]) => {
        cumulative += yearlyAmount;
        return {
            year: `${year}年`,
            yearlyDividend: Math.round(yearlyAmount),
            cumulativeDividend: Math.round(cumulative),
        };
    });
}

/**
 * 銘柄を一意に識別するためのキーを生成
 *
 * @param stockCode - 銘柄コード
 * @param stockName - 銘柄名
 * @returns 一意な識別キー
 *
 * @remarks
 * - 銘柄コードがある場合: "{銘柄コード}:{銘柄名}"
 * - 銘柄コードがない場合: "NO_CODE:{銘柄名}"
 * - これにより、同じ銘柄名でも銘柄コードが異なる場合は別銘柄として扱われる
 */
function generateStockKey(stockCode: string, stockName: string): string {
    const code = stockCode.trim();
    return code ? `${code}:${stockName}` : `NO_CODE:${stockName}`;
}

/**
 * 指定年の銘柄別配当金を集計する
 *
 * @param csvData - CSVから読み込んだ配当データ
 * @param targetYear - 集計対象年
 * @param exchangeRate - USドル→円の為替レート
 * @returns 銘柄別配当データの配列（降順ソート済み）
 *
 * @remarks
 * - 同一銘柄（銘柄コード+銘柄名）の配当金を合算する
 * - USドル建ては為替換算する
 * - 金額の降順でソートする
 * - 合計金額から割合を計算する
 */
export function calculateStockDividends(
    csvData: CSVRow[],
    targetYear: number,
    exchangeRate: number
): StockDividend[] {
    // 1. 指定年のデータをフィルタリングし、銘柄コード+銘柄名でグループ化
    const stockData: Map<string, { stockCode: string; stockName: string; amount: number }> = new Map();

    csvData.forEach((row) => {
        const dateStr = row['入金日'];
        const stockCode = (row['銘柄コード'] || '').trim();
        const stockName = row['銘柄'];
        const currency = row['受取通貨'];
        const amountStr = row['受取金額[円/現地通貨]'];

        if (!dateStr || !stockName || !amountStr) return;

        // 日付から年を抽出
        const year = Number.parseInt(dateStr.split('/')[0], 10);
        if (year !== targetYear) return;

        // 金額を数値に変換
        const amountValue = amountStr === '-' ? 0 : Number.parseFloat(amountStr.replaceAll(',', ''));
        if (Number.isNaN(amountValue)) return;

        // USドルの場合は円に換算
        let amountInYen = amountValue;
        if (currency === 'USドル') {
            amountInYen = amountValue * exchangeRate;
        }

        // 一意なキーを生成
        const key = generateStockKey(stockCode, stockName);

        // 銘柄別に集計
        const existing = stockData.get(key);
        if (existing) {
            existing.amount += amountInYen;
        } else {
            stockData.set(key, {
                stockCode,
                stockName,
                amount: amountInYen,
            });
        }
    });

    // 2. StockDividend配列に変換し、金額の降順でソート
    const roundedStocks = Array.from(stockData.values()).map((stock) => ({
        stockCode: stock.stockCode,
        stockName: stock.stockName,
        amount: Math.round(stock.amount),
    }));

    const totalRoundedAmount = roundedStocks.reduce((sum, stock) => sum + stock.amount, 0);

    return roundedStocks
        .map((stock) => ({
            ...stock,
            percentage: totalRoundedAmount === 0 ? 0 : (stock.amount / totalRoundedAmount) * 100,
        }))
        .sort((a, b) => b.amount - a.amount);
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
 * - 「その他」は銘柄コードなし（空文字列）
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
            stockCode: '', // 「その他」は銘柄コードなし
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

        const year = Number.parseInt(dateStr.split('/')[0], 10);
        if (!Number.isNaN(year)) {
            years.add(year);
        }
    });

    return Array.from(years).sort((a, b) => a - b);
}
