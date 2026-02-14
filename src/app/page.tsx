'use client';

import {useCallback, useEffect, useState} from 'react';
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {useDividendData} from '@/hooks/useDividendData';
import {CSVRow} from '@/types/dividend';
import {formatYAxisValue} from '@/lib/formatYAxisValue';
import {useExchangeRate} from '@/app/contexts/ExchangeRateContext';
import {ErrorScreen, LoadingScreen} from '@/app/components/LoadingState';
import {aggregateDividendsByYear, formatYearlyDividendData} from '@/lib/dividendCalculator';

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
 * ホームページコンポーネント
 * 配当金データをCSVファイルから読み込み、年別に集計してグラフと表で表示する
 *
 * @remarks
 * - CSVファイルはShift-JISエンコーディングで保存されている
 * - USドル建ての配当金は設定画面で設定した為替レートで円換算される
 * - グラフは棒グラフで表示される
 *
 * @returns 配当金グラフアプリケーションのメインページ
 */
export default function Home() {
    const {data: rawData, loading, error} = useDividendData();
    const [data, setData] = useState<DividendData[]>([]);
    const {usdToJpyRate} = useExchangeRate();

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
        const yearlyDividends = aggregateDividendsByYear(csvData, exchangeRate);
        return formatYearlyDividendData(yearlyDividends);
    }, []);

    // 為替レートが変更されたときにデータを再計算
    useEffect(() => {
        if (rawData.length > 0) {
            const chartData = calculateDividendData(rawData, usdToJpyRate);
            setData(chartData);
        }
    }, [usdToJpyRate, rawData, calculateDividendData]);

    if (loading) return <LoadingScreen/>;
    if (error) return <ErrorScreen error={error}/>;

    // データが空の場合の表示
    if (rawData.length === 0) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200">
                            年別配当
                        </h1>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-2 sm:p-4 lg:p-6">
                            <p className="text-gray-500 dark:text-gray-400 text-center">
                                表示する配当データがありません
                            </p>
                        </div>
                    </div>
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
            className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200">
                        年別配当
                    </h1>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-2 sm:p-4 lg:p-6">
                        <div className="h-[300px] sm:h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
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
                    </div>

                    <div className="mt-6 sm:mt-8">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-gray-200">
                            年別配当金集計
                        </h2>
                        <div className="overflow-x-auto">
                            <table
                                className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        年
                                    </th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        税引後配当合計[円]
                                    </th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        月平均配当[円]
                                    </th>
                                </tr>
                                </thead>
                                <tbody
                                    className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {data.map((row) => (
                                    <tr key={row.year}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-right font-mono">
                                            {row.year}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-right font-mono">
                                            ¥{row.totalDividend.toLocaleString()}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-right font-mono">
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
