'use client';

import {Suspense, useCallback, useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {loadCSV} from '@/lib/csvLoader';
import {generateYearlyPortfolio, getAvailableYears} from '@/lib/dividendCalculator';
import {CSVRow, YearlyPortfolio} from '@/types/dividend';
import YearSelector from '@/app/components/YearSelector';
import DividendPieChart from '@/app/components/DividendPieChart';
import DividendTable from '@/app/components/DividendTable';
import {useExchangeRate} from '@/app/contexts/ExchangeRateContext';
import {LoadingScreen, ErrorScreen} from '@/app/components/LoadingState';

/**
 * 配当ポートフォリオコンポーネント（内部実装）
 * useSearchParams()を使用するため、Suspenseでラップされる必要がある
 */
function PortfolioContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [rawData, setRawData] = useState<CSVRow[]>([]);
    const [portfolioData, setPortfolioData] = useState<YearlyPortfolio | null>(null);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const {usdToJpyRate} = useExchangeRate();

    // CSVデータの読み込み（初回マウント時のみ）
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await loadCSV('/data/dividendlist_20260205.csv');
                setRawData(data);

                // 利用可能な年を取得
                const years = getAvailableYears(data);
                setAvailableYears(years);

                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
                setLoading(false);
            }
        };

        loadData();
    }, []); // 初回マウント時のみ実行

    // URLパラメータの年度を反映
    useEffect(() => {
        if (availableYears.length === 0) return;

        const yearParam = searchParams.get('year');
        let targetYear = yearParam ? Number.parseInt(yearParam, 10) : new Date().getFullYear();

        // データがない年の場合は最新年を使用
        if (!availableYears.includes(targetYear)) {
            targetYear = availableYears.at(-1)!;
        }

        setCurrentYear(targetYear);
    }, [searchParams, availableYears]);

    // 年度またはデータが変更されたときにポートフォリオを再計算
    useEffect(() => {
        if (rawData.length > 0) {
            const portfolio = generateYearlyPortfolio(rawData, currentYear, usdToJpyRate, 10);
            setPortfolioData(portfolio);
        }
    }, [currentYear, rawData, usdToJpyRate]);

    // 年度変更ハンドラ
    const handleYearChange = useCallback((year: number) => {
        setCurrentYear(year);
        router.push(`/portfolio?year=${year}`);
    }, [router]);

    if (loading) return <LoadingScreen />;
    if (error) return <ErrorScreen error={error} />;

    if (availableYears.length === 0) {
        return (
            <div
                className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200">
                            配当ポートフォリオ
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            表示可能な配当データがありません
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200">
                        配当ポートフォリオ
                    </h1>

                    <YearSelector
                        currentYear={currentYear}
                        availableYears={availableYears}
                        onYearChangeAction={handleYearChange}
                    />

                    {portfolioData && (
                        <>
                            <DividendPieChart data={portfolioData.stocks}/>

                            <DividendTable data={portfolioData.stocks}/>

                            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                                <p>
                                    このグラフは、{currentYear}年の配当金を銘柄別に集計して表示しています。
                                </p>
                                <p className="mt-1">
                                    ※ USドル建ての配当金は1ドル={usdToJpyRate}円で換算しています。
                                </p>
                                <p className="mt-1">
                                    ※ 上位10件を個別表示し、それ以外は「その他」として集約しています。
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * 配当ポートフォリオページ
 *
 * 指定した年の配当金を銘柄別に円グラフと表で表示する
 *
 * @returns 配当ポートフォリオページのJSX要素
 *
 * @remarks
 * - URLクエリパラメータで年度を指定可能（例: /portfolio?year=2026）
 * - 年度が指定されていない場合は現在年を表示
 * - データがない年の場合は最新年を表示
 * - 上位10件の銘柄を個別表示し、それ以外は「その他」として集約
 */
export default function PortfolioPage() {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <PortfolioContent/>
        </Suspense>
    );
}
