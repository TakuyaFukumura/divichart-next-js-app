'use client';

import {useCallback, useEffect, useState} from 'react';
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {CSVRow, CumulativeDividendData} from '@/types/dividend';
import {useDividendData} from '@/hooks/useDividendData';
import {formatYAxisValue} from '@/lib/formatYAxisValue';
import {getUsdToJpyRate} from '@/lib/exchangeRate';

// 為替レート設定（1ドル=150円）
// 環境変数から読み込み、未設定の場合はデフォルト値を使用
const USD_TO_JPY_RATE = getUsdToJpyRate();

/**
 * 累計配当グラフページコンポーネント
 * 配当金データをCSVファイルから読み込み、年別に累計して表示する
 *
 * @remarks
 * - CSVファイルはShift-JISエンコーディングで保存されている
 * - USドル建ての配当金は設定した為替レートで円換算される
 * - グラフは折れ線グラフで累計配当金を表示する
 *
 * @returns 累計配当グラフアプリケーションのページ
 */
export default function CumulativeDividendPage() {
    const {data: rawData, loading, error} = useDividendData();
    const [data, setData] = useState<CumulativeDividendData[]>([]);
    const [usdToJpyRate, setUsdToJpyRate] = useState<number>(USD_TO_JPY_RATE);
    const [inputValue, setInputValue] = useState<string>(String(USD_TO_JPY_RATE));

    /**
     * CSVデータから累計配当金データを計算する関数
     *
     * @param csvData - CSVファイルから読み込まれた配当金データの配列
     * @param exchangeRate - USドルから円への為替レート
     * @returns 年別に集計された累計配当金データの配列（年でソート済み）
     *
     * @remarks
     * - USドル建ての配当金は為替レートを使用して円に換算される
     * - 配当金額が"-"の場合は0として扱われる（税額表示用）
     * - 年別に集計し、累計を計算し、最終的に円単位で四捨五入される
     */
    const calculateCumulativeDividendData = useCallback((csvData: CSVRow[], exchangeRate: number): CumulativeDividendData[] => {
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
            const amountValue = amountStr === '-' ? 0 : Number.parseFloat(amountStr.replaceAll(',', ''));
            if (Number.isNaN(amountValue)) return;

            // USドルの場合は円に換算、円の場合はそのまま
            let amountInYen = amountValue;
            if (currency === 'USドル') {
                amountInYen = amountValue * exchangeRate;
            }

            // 年別に集計
            yearlyDividends[year] = (yearlyDividends[year] || 0) + amountInYen;
        });

        // 年でソート
        const sortedYears = Object.keys(yearlyDividends).sort((a, b) => a.localeCompare(b));

        // 累計配当金を計算
        let cumulative = 0;
        return sortedYears.map((year) => {
            const yearlyAmount = yearlyDividends[year];
            cumulative += yearlyAmount;
            return {
                year: `${year}年`,
                yearlyDividend: Math.round(yearlyAmount),
                cumulativeDividend: Math.round(cumulative),
            };
        });
    }, []);

    // 為替レートが変更されたときにデータを再計算
    useEffect(() => {
        if (rawData.length > 0) {
            const chartData = calculateCumulativeDividendData(rawData, usdToJpyRate);
            setData(chartData);
        }
    }, [usdToJpyRate, rawData, calculateCumulativeDividendData]);

    if (loading) {
        return (
            <div
                className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
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
                className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    エラー: {error}
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                    <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                        累計配当グラフ
                    </h1>

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

                                    const numValue = Number.parseFloat(value);
                                    if (!Number.isNaN(numValue) && numValue > 0) {
                                        setUsdToJpyRate(numValue);
                                    }
                                }}
                                onBlur={() => {
                                    // フォーカスが外れたときに、無効な入力を現在の有効な値にリセット
                                    setInputValue(String(usdToJpyRate));
                                }}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-37.5"
                            />
                            <span className="text-gray-600 dark:text-gray-400">円</span>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-8">
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"
                                               className="dark:stroke-gray-600"/>
                                <XAxis
                                    dataKey="year"
                                    tick={{fill: '#6b7280'}}
                                    className="dark:fill-gray-400"
                                />
                                <YAxis
                                    tick={{fill: '#6b7280'}}
                                    className="dark:fill-gray-400"
                                    tickFormatter={formatYAxisValue}
                                />
                                <Tooltip content={<CustomTooltip/>}/>
                                <Legend
                                    wrapperStyle={{
                                        paddingTop: '20px',
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="cumulativeDividend"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    name="累計配当金（税引き後）[円]"
                                    dot={{fill: '#3b82f6', r: 4}}
                                    activeDot={{r: 6}}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                            年別累計配当金集計
                        </h2>
                        <div className="overflow-x-auto">
                            <table
                                className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        年
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        税引後年間配当[円]
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        税引後累計配当[円]
                                    </th>
                                </tr>
                                </thead>
                                <tbody
                                    className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {data.map((item) => (
                                    <tr key={item.year} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                                            {item.year}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                                            ¥{item.yearlyDividend.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-gray-100">
                                            ¥{item.cumulativeDividend.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        <p>このグラフは、配当金データから年別に税引き後の配当金を累計して表示しています。</p>
                        <p>※ USドル建ての配当金は1ドル={usdToJpyRate}円で換算しています。</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * チャート用のカスタムツールチップコンポーネント
 * マウスホバー時に表示される配当金情報のツールチップをカスタマイズする
 * @param props - ツールチップのプロパティ
 * @returns カスタマイズされたツールチップのJSX要素、または非表示の場合はnull
 */
export function CustomTooltip({active, payload}: Readonly<{
    active?: boolean;
    payload?: Array<{ payload: CumulativeDividendData; value: number }>;
}>) {
    if (active && payload?.length) {
        return (
            <div
                className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
                <p className="text-gray-800 dark:text-gray-200 font-semibold">{payload[0].payload.year}</p>
                <p className="text-blue-600 dark:text-blue-400">
                    年間配当金: ¥{payload[0].payload.yearlyDividend.toLocaleString()}
                </p>
                <p className="text-blue-600 dark:text-blue-400 font-semibold">
                    累計配当金: ¥{payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
}
