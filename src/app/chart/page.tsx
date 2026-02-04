'use client';

import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ChartData = {
    [key: string]: string | number;
};

export default function ChartPage() {
    const [data, setData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [chartType, setChartType] = useState<'line' | 'bar'>('bar');

    useEffect(() => {
        const loadCSV = async () => {
            try {
                const response = await fetch('/data/sample-data.csv');
                if (!response.ok) {
                    throw new Error('CSVファイルの読み込みに失敗しました');
                }
                const csvText = await response.text();
                
                Papa.parse(csvText, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        setData(results.data as ChartData[]);
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
    }, []);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                    <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                        CSVデータ可視化
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

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                        <ResponsiveContainer width="100%" height={400}>
                            {chartType === 'bar' ? (
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="月" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="売上" fill="#3b82f6" name="売上" />
                                    <Bar dataKey="費用" fill="#ef4444" name="費用" />
                                </BarChart>
                            ) : (
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="月" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="売上" stroke="#3b82f6" strokeWidth={2} name="売上" />
                                    <Line type="monotone" dataKey="費用" stroke="#ef4444" strokeWidth={2} name="費用" />
                                </LineChart>
                            )}
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                            データテーブル
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        {data.length > 0 && Object.keys(data[0]).map((key) => (
                                            <th
                                                key={key}
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                                            >
                                                {key}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {data.map((row, index) => (
                                        <tr key={index}>
                                            {Object.values(row).map((value, i) => (
                                                <td
                                                    key={i}
                                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300"
                                                >
                                                    {value}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                        <p>CSVファイル: /data/sample-data.csv</p>
                        <p className="mt-2">
                            このグラフは、リポジトリ内のCSVファイルから読み込まれたデータを可視化しています。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
