'use client';

import {useCallback, useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {loadCSV} from '@/lib/csvLoader';
import {generateYearlyPortfolio, getAvailableYears} from '@/lib/dividendCalculator';
import {CSVRow, YearlyPortfolio} from '@/types/dividend';
import YearSelector from '@/app/components/YearSelector';
import DividendPieChart from '@/app/components/DividendPieChart';
import DividendTable from '@/app/components/DividendTable';

// 為替レート設定（1ドル=150円）
const DEFAULT_USD_TO_JPY_RATE = 150;
const envRate = process.env.NEXT_PUBLIC_USD_TO_JPY_RATE
    ? Number(process.env.NEXT_PUBLIC_USD_TO_JPY_RATE)
    : NaN;
const USD_TO_JPY_RATE = !isNaN(envRate) && envRate > 0 ? envRate : DEFAULT_USD_TO_JPY_RATE;

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
    const router = useRouter();
    const searchParams = useSearchParams();

    const [rawData, setRawData] = useState<CSVRow[]>([]);
    const [portfolioData, setPortfolioData] = useState<YearlyPortfolio | null>(null);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [usdToJpyRate] = useState<number>(USD_TO_JPY_RATE);

    // CSVデータの読み込み
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await loadCSV('/data/dividendlist_20260205.csv');
                setRawData(data);

                // 利用可能な年を取得
                const years = getAvailableYears(data);
                setAvailableYears(years);

                // URLパラメータから年度を取得、なければ現在年またはデータがある最新年
                const yearParam = searchParams.get('year');
                let targetYear = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

                // データがない年の場合は最新年を使用
                if (years.length > 0 && !years.includes(targetYear)) {
                    targetYear = years[years.length - 1];
                }

                setCurrentYear(targetYear);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
                setLoading(false);
            }
        };

        loadData();
    }, [searchParams]);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">読み込み中...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    エラー: {error}
                </div>
            </div>
        );
    }

    if (availableYears.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                        <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-gray-200">
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                    <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                        配当ポートフォリオ（{currentYear}年）
                    </h1>

                    <YearSelector
                        currentYear={currentYear}
                        availableYears={availableYears}
                        onYearChange={handleYearChange}
                    />

                    {portfolioData && (
                        <>
                            <DividendPieChart data={portfolioData.stocks} />

                            <DividendTable data={portfolioData.stocks} />

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
