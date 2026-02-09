'use client';

import {useCallback, useEffect, useState} from 'react';
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {useDividendData} from '@/hooks/useDividendData';
import {CSVRow} from '@/types/dividend';
import {formatYAxisValue} from '@/lib/formatYAxisValue';
import {getUsdToJpyRate} from '@/lib/exchangeRate';
import {LoadingScreen, ErrorScreen} from '@/app/components/LoadingState';

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

// 為替レート設定（1ドル=150円）
// 環境変数から読み込み、未設定の場合はデフォルト値を使用
const USD_TO_JPY_RATE = getUsdToJpyRate();

/**
 * ホームページコンポーネント
 * 配当金データをCSVファイルから読み込み、年別に集計してグラフと表で表示する
 *
 * @remarks
 * - CSVファイルはShift-JISエンコーディングで保存されている
 * - USドル建ての配当金は設定した為替レートで円換算される
 * - グラフは棒グラフで表示される
 *
 * @returns 配当金グラフアプリケーションのメインページ
 */
export default function Home() {
    const {data: rawData, loading, error} = useDividendData();
    const [data, setData] = useState<DividendData[]>([]);
    const [usdToJpyRate, setUsdToJpyRate] = useState<number>(USD_TO_JPY_RATE);
    const [inputValue, setInputValue] = useState<string>(String(USD_TO_JPY_RATE));

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
        return Object.keys(yearlyDividends)
            .sort()
            .map((year) => ({
                year: `${year}年`,
                totalDividend: Math.round(yearlyDividends[year]),
            }));
    }, []);

    // 為替レートが変更されたときにデータを再計算
    useEffect(() => {
        if (rawData.length > 0) {
            const chartData = calculateDividendData(rawData, usdToJpyRate);
            setData(chartData);
        }
    }, [usdToJpyRate, rawData, calculateDividendData]);

    if (loading) return <LoadingScreen />;
    if (error) return <ErrorScreen error={error} />;

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
            className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                    <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                        年別配当グラフ
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
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="year"/>
                                <YAxis tickFormatter={formatYAxisValue}/>
                                <Tooltip content={<CustomTooltip/>}/>
                                <Legend/>
                                <Bar dataKey="totalDividend" fill="#3b82f6" name="配当金（税引き後）[円]"/>
                            </BarChart>
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
                                    <tr key={row.year}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
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
