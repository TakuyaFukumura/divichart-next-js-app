'use client';

import {StockDividend} from '@/types/dividend';

/**
 * 配当テーブルコンポーネント
 *
 * 銘柄別の配当金を表形式で表示する
 *
 * @param props - コンポーネントのプロパティ
 * @param props.data - 銘柄別配当データ
 */
export default function DividendTable({
                                          data,
                                      }: Readonly<{
    data: StockDividend[];
}>) {
    if (data.length === 0) {
        return (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                    表示する配当データがありません
                </p>
            </div>
        );
    }

    // テーブル行の背景色を決定する関数
    const getRowBgClass = (row: StockDividend, index: number) => {
        if (row.stockName === 'その他') {
            return 'bg-gray-50 dark:bg-gray-700';
        }
        return index % 2 === 0
            ? 'bg-white dark:bg-gray-800'
            : 'bg-gray-50 dark:bg-gray-700';
    };

    return (
        <div className="mt-6 sm:mt-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-gray-200">
                配当内訳一覧
            </h2>
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            銘柄コード
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            銘柄名
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            配当金額[円]
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            割合[%]
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.map((row, index) => (
                        <tr
                            key={`${row.stockCode || 'NO_CODE'}-${row.stockName}`}
                            className={`${getRowBgClass(row, index)} hover:brightness-95 dark:hover:brightness-110 transition-colors`}
                        >
                            <td
                                className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-left ${
                                    row.stockCode
                                        ? 'font-medium text-gray-900 dark:text-gray-300'
                                        : 'text-gray-500 dark:text-gray-500'
                                } ${row.stockName === 'その他' ? 'italic' : ''}`}
                            >
                                {row.stockCode || '-'}
                            </td>
                            <td
                                className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 ${
                                    row.stockName === 'その他' ? 'italic font-medium' : ''
                                }`}
                            >
                                {row.stockName}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-right font-mono">
                                ¥{row.amount.toLocaleString()}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-right font-mono">
                                {row.percentage.toFixed(1)}%
                            </td>
                        </tr>
                    ))}
                    </tbody>
                    <tfoot className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        {/* 銘柄コードと銘柄名の2列を結合 */}
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-bold text-gray-900 dark:text-gray-200" colSpan={2}>
                            合計
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-bold text-gray-900 dark:text-gray-200 text-right font-mono">
                            ¥{data.reduce((sum, row) => sum + row.amount, 0).toLocaleString()}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-bold text-gray-900 dark:text-gray-200 text-right font-mono">
                            {data.length > 0
                                ? data.reduce((sum, row) => sum + row.percentage, 0).toFixed(1) + '%'
                                : '-'}
                        </td>
                    </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
