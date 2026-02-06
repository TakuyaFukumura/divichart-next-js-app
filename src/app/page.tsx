'use client';

import {useCallback, useEffect, useState} from 'react';
import Papa from 'papaparse';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

/**
 * 配当金データの型定義
 * グラフ表示に使用される年別配当金の集計データ
 */
type DividendData = {
    /** 表示用の年（例: "2024年"） */
    year: string;
    /** 年間配当金合計（税引き後）[円] */
    totalDividend: number;
};

/**
 * CSVファイルの行データ型定義
 * 配当金リストのCSVファイルから読み込まれるデータの形式
 */
type CSVRow = {
    /** 入金日（YYYY/MM/DD形式） */
    '入金日': string;
    /** 受取通貨（例: "円", "USドル"） */
    '受取通貨': string;
    /** 受取金額（現地通貨）の文字列表現 */
    '受取金額[円/現地通貨]': string;
};

// 為替レート設定（1ドル=150円）
// 環境変数から読み込み、未設定の場合はデフォルト値を使用
const DEFAULT_USD_TO_JPY_RATE = 150;
const envRate = process.env.NEXT_PUBLIC_USD_TO_JPY_RATE
    ? Number(process.env.NEXT_PUBLIC_USD_TO_JPY_RATE)
    : NaN;
const USD_TO_JPY_RATE = !isNaN(envRate) && envRate > 0 ? envRate : DEFAULT_USD_TO_JPY_RATE;

/**
 * ホームページコンポーネント
 * 配当金データをCSVファイルから読み込み、年別に集計してグラフと表で表示する
 * 
 * @remarks
 * - CSVファイルはShift-JISエンコーディングで保存されている
 * - USドル建ての配当金は設定した為替レートで円換算される
 * - グラフは棒グラフと折れ線グラフを切り替え可能
 * 
 * @returns 配当金グラフアプリケーションのメインページ
 */
export default function Home() {
    const [data, setData] = useState<DividendData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [chartType, setChartType] = useState<'line' | 'bar'>('bar');
    const [usdToJpyRate, setUsdToJpyRate] = useState<number>(USD_TO_JPY_RATE);
    const [inputValue, setInputValue] = useState<string>(String(USD_TO_JPY_RATE));
    const [rawData, setRawData] = useState<CSVRow[]>([]);

    /**
     * CSVデータから年別配当金データを計算する関数
     * 
     * @param csvData - CSVファイルから読み込まれた配当金データの配列
     * @param exchangeRate - USドルから円への為替レート
     * @returns 年別に集計された配当金データの配列（年でソート済み）
     * 
     * @remarks
     * - USドル建ての配当金は為替レートを使用して円に換算される
     * - 配当金額が"-"の場合は0として扱われる（税額表示用）
     * - 年別に集計し、最終的に円単位で四捨五入される
     */
    const calculateDividendData = useCallback((csvData: CSVRow[], exchangeRate: number): DividendData[] => {
        // 年別に配当金を集計
        const yearlyDividends: { [year: string]: number } = {};

        csvData.forEach((row) => {
            const dateStr = row['入金日'];
            const currency = row['受取通貨'];
            const amountStr = row['受取金額[円/現地通貨]'];

            if (!dateStr || !amountStr) return;

            // 日付から年を抽出（YYYY/MM/DD形式）
            const year = dateStr.split('/')[0];
            if (!year) return;

            // 金額を数値に変換（カンマを除去）
            // NOTE: CSVデータでは税額が"-"で表示されることがあり、その場合は0として扱う
            const amountValue = amountStr === '-' ? 0 : parseFloat(amountStr.replace(/,/g, ''));
            if (isNaN(amountValue)) return;

            // USドルの場合は円に換算、円の場合はそのまま
            let amountInYen = amountValue;
            if (currency === 'USドル') {
                amountInYen = amountValue * exchangeRate;
            }

            // 年別に集計
            yearlyDividends[year] = (yearlyDividends[year] || 0) + amountInYen;
        });

        // グラフ用のデータに変換（年でソート）
        const chartData: DividendData[] = Object.keys(yearlyDividends)
            .sort()
            .map((year) => ({
                year: `${year}年`,
                totalDividend: Math.round(yearlyDividends[year]),
            }));

        return chartData;
    }, []);

    useEffect(() => {
        const loadCSV = async () => {
            try {
                const response = await fetch('/data/dividendlist_20260205.csv');
                if (!response.ok) {
                    throw new Error('CSVファイルの読み込みに失敗しました');
                }

                // SHIFT_JIS エンコーディングを処理するため、arrayBufferとして取得
                const arrayBuffer = await response.arrayBuffer();
                const decoder = new TextDecoder('shift-jis');
                const csvText = decoder.decode(arrayBuffer);

                Papa.parse<CSVRow>(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        setRawData(results.data);
                        setLoading(false);
                    },
                    error: (error: Error) => {
                        setError(error.message);
                        setLoading(false);
                    },
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
                setLoading(false);
            }
        };

        loadCSV();
        // CSVは初回マウント時のみ読み込む。usdToJpyRateとcalculateDividendDataは
        // 初期値としてのみ使用され、その後の変更は別のuseEffectで処理される
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 為替レートが変更されたときにデータを再計算
    useEffect(() => {
        if (rawData.length > 0) {
            const chartData = calculateDividendData(rawData, usdToJpyRate);
            setData(chartData);
        }
    }, [usdToJpyRate, rawData, calculateDividendData]);

    if (loading) {
        return (
            <div
                className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">読み込み中...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    エラー: {error}
                </div>
            </div>
        );
    }

    /**
     * チャート用のカスタムツールチップコンポーネント
     * マウスホバー時に表示される配当金情報のツールチップをカスタマイズする
     * 
     * @param props - ツールチップのプロパティ
     * @param props.active - ツールチップがアクティブ（表示中）かどうか
     * @param props.payload - 表示するデータの配列
     * @returns カスタマイズされたツールチップのJSX要素、または非表示の場合はnull
     */
    const CustomTooltip = ({active, payload}: {
        active?: boolean;
        payload?: Array<{ payload: DividendData; value: number }>
    }) => {
        if (active && payload && payload.length) {
            return (
                <div
                    className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
                    <p className="text-gray-800 dark:text-gray-200 font-semibold">{payload[0].payload.year}</p>
                    <p className="text-blue-600 dark:text-blue-400">
                        配当金: ¥{payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                    <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                        年別配当グラフ
                    </h1>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            グラフの種類
                        </label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setChartType('bar')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    chartType === 'bar'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                棒グラフ
                            </button>
                            <button
                                onClick={() => setChartType('line')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    chartType === 'line'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                折れ線グラフ
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="usd-jpy-rate"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            為替レート（1ドル = 円）
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                id="usd-jpy-rate"
                                type="number"
                                min="1"
                                step="0.01"
                                value={inputValue}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setInputValue(value);

                                    const numValue = parseFloat(value);
                                    if (!isNaN(numValue) && numValue > 0) {
                                        setUsdToJpyRate(numValue);
                                    }
                                }}
                                onBlur={() => {
                                    // フォーカスが外れたときに、無効な入力を現在の有効な値にリセット
                                    setInputValue(String(usdToJpyRate));
                                }}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-[150px]"
                            />
                            <span className="text-gray-600 dark:text-gray-400">円</span>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                        <ResponsiveContainer width="100%" height={400}>
                            {chartType === 'bar' ? (
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="year"/>
                                    <YAxis/>
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <Legend/>
                                    <Bar dataKey="totalDividend" fill="#3b82f6" name="配当金（税引き後）[円]"/>
                                </BarChart>
                            ) : (
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="year"/>
                                    <YAxis/>
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <Legend/>
                                    <Line type="monotone" dataKey="totalDividend" stroke="#3b82f6" strokeWidth={2}
                                          name="配当金（税引き後）[円]"/>
                                </LineChart>
                            )}
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                            年別配当金集計
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        年
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        税引後配当合計[円]
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        月平均配当[円]
                                    </th>
                                </tr>
                                </thead>
                                <tbody
                                    className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {data.map((row) => (
                                    <tr key={row.year}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-right">
                                            {row.year}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-right">
                                            ¥{row.totalDividend.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-right">
                                            ¥{Math.floor(row.totalDividend / 12).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                        <p>
                            このグラフは、配当金データから年別に税引き後の配当金を集計して表示しています。
                        </p>
                        <p className="mt-1">
                            ※ USドル建ての配当金は1ドル={usdToJpyRate}円で換算しています。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
