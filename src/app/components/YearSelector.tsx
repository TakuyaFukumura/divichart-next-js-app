'use client';

/**
 * 年度選択コンポーネント
 *
 * 年度の表示と前年・次年への切り替えボタンを提供する
 *
 * @param props - コンポーネントのプロパティ
 * @param props.currentYear - 現在表示中の年
 * @param props.availableYears - 利用可能な年のリスト
 * @param props.onYearChangeAction - 年度変更時のコールバック関数
 */
export default function YearSelector({
                                         currentYear,
                                         availableYears,
                                         onYearChangeAction,
                                     }: {
    readonly currentYear: number;
    readonly availableYears: number[];
    readonly onYearChangeAction: (year: number) => void;
}) {
    const currentIndex = availableYears.indexOf(currentYear);
    const hasPrevYear = currentIndex > 0;
    const hasNextYear = currentIndex < availableYears.length - 1;

    const handlePrevYear = () => {
        if (hasPrevYear) {
            onYearChangeAction(availableYears[currentIndex - 1]);
        }
    };

    const handleNextYear = () => {
        if (hasNextYear) {
            onYearChangeAction(availableYears[currentIndex + 1]);
        }
    };

    return (
        <div className="flex items-center justify-center gap-4 mb-6">
            <button
                onClick={handlePrevYear}
                disabled={!hasPrevYear}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    hasPrevYear
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
                aria-label="前年"
            >
                &lt; 前年
            </button>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 min-w-[120px] text-center">
                {currentYear}年
            </div>
            <button
                onClick={handleNextYear}
                disabled={!hasNextYear}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    hasNextYear
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
                aria-label="次年"
            >
                次年 &gt;
            </button>
        </div>
    );
}
