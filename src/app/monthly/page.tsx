'use client';

import {Suspense, useCallback, useEffect, useMemo, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import YearSelector from '@/app/components/YearSelector';
import {ErrorScreen, LoadingScreen} from '@/app/components/LoadingState';
import {useExchangeRate} from '@/app/contexts/ExchangeRateContext';
import {useDividendData} from '@/hooks/useDividendData';
import {aggregateDividendsByMonth, formatMonthlyDividendData, getAvailableYears} from '@/lib/dividendCalculator';
import {formatYAxisValue} from '@/lib/formatYAxisValue';
import {MonthlyDividendData} from '@/types/dividend';

function MonthlyDividendContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const {data: rawData, loading, error} = useDividendData();
    const {usdToJpyRate} = useExchangeRate();
    const [currentYear, setCurrentYear] = useState<number | null>(null);
    const [data, setData] = useState<MonthlyDividendData[]>([]);
    const availableYears = useMemo(() => getAvailableYears(rawData), [rawData]);

    const calculateMonthlyDividendData = useCallback((targetYear: number, exchangeRate: number): MonthlyDividendData[] => {
        const monthlyDividends = aggregateDividendsByMonth(rawData, targetYear, exchangeRate);
        return formatMonthlyDividendData(monthlyDividends);
    }, [rawData]);

    useEffect(() => {
        if (availableYears.length === 0) return;

        const yearParam = searchParams.get('year');
        let targetYear = yearParam ? Number.parseInt(yearParam, 10) : availableYears.at(-1)!;

        if (!availableYears.includes(targetYear)) {
            targetYear = availableYears.at(-1)!;
        }

        setCurrentYear(targetYear);
    }, [availableYears, searchParams]);

    useEffect(() => {
        if (currentYear === null || rawData.length === 0) return;

        setData(calculateMonthlyDividendData(currentYear, usdToJpyRate));
    }, [calculateMonthlyDividendData, currentYear, rawData, usdToJpyRate]);

    const handleYearChange = useCallback((year: number) => {
        setCurrentYear(year);
        router.push(`/monthly?year=${year}`);
    }, [router]);

    if (loading) return <LoadingScreen/>;
    if (error) return <ErrorScreen error={error}/>;

    if (availableYears.length === 0) {
        return (
            <div
                className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200">
                            月別配当
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            表示可能な配当データがありません
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (currentYear === null || data.length === 0) return <LoadingScreen/>;

    const totalDividend = data.reduce((sum, item) => sum + item.totalDividend, 0);
    const averageDividend = data.length === 0 ? 0 : Math.floor(totalDividend / data.length);

    return (
        <div
            className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200">
                        月別配当
                    </h1>

                    {currentYear !== null && (
                        <YearSelector
                            currentYear={currentYear}
                            availableYears={availableYears}
                            onYearChangeAction={handleYearChange}
                        />
                    )}

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-2 sm:p-4 lg:p-6 mb-6 sm:mb-8">
                        <div className="h-[300px] sm:h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="month"/>
                                    <YAxis tickFormatter={formatYAxisValue}/>
                                    <Tooltip content={<CustomTooltip/>}/>
                                    <Legend/>
                                    <Bar dataKey="totalDividend" fill="#3b82f6" name="配当金（税引き後）[円]"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 mb-6 sm:mb-8">
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">合計配当金額</p>
                            <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-gray-200 font-mono">
                                ¥{totalDividend.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">月平均配当金額</p>
                            <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-gray-200 font-mono">
                                ¥{averageDividend.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-gray-200">
                            月別配当金集計
                        </h2>
                        <div className="overflow-x-auto">
                            <table
                                className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        月
                                    </th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        税引後配当合計[円]
                                    </th>
                                </tr>
                                </thead>
                                <tbody
                                    className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {data.map((row) => (
                                    <tr key={row.month} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100 font-mono">
                                            {row.month}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100 font-mono">
                                            ¥{row.totalDividend.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        <p>このグラフは、指定した年の配当金を月別に集計して表示しています。</p>
                        <p>※ USドル建ての配当金は1ドル={usdToJpyRate}円で換算しています。</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function CustomTooltip({active, payload}: Readonly<{
    active?: boolean;
    payload?: Array<{ payload: MonthlyDividendData; value: number }>;
}>) {
    if (active && payload?.length) {
        return (
            <div
                className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
                <p className="text-gray-800 dark:text-gray-200 font-semibold">{payload[0].payload.month}</p>
                <p className="text-blue-600 dark:text-blue-400">
                    配当金: ¥{payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }

    return null;
}

export default function MonthlyDividendPage() {
    return (
        <Suspense fallback={<LoadingScreen/>}>
            <MonthlyDividendContent/>
        </Suspense>
    );
}
