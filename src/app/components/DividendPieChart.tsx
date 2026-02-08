'use client';

import {Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';
import {StockDividend} from '@/types/dividend';
import {useEffect, useState} from 'react';

/**
 * 配当円グラフコンポーネント
 *
 * 銘柄別の配当金を円グラフで表示する
 *
 * @param props - コンポーネントのプロパティ
 * @param props.data - 銘柄別配当データ
 */

// CustomTooltipを親コンポーネント外に移動
interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        payload: { percentage: number };
    }>;
}

export const CustomTooltip = ({active, payload}: CustomTooltipProps) => {
    if (active && payload?.length) {
        return (
            <div
                className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
                <p className="text-gray-800 dark:text-gray-200 font-semibold">
                    {payload[0].name}
                </p>
                <p className="text-blue-600 dark:text-blue-400">
                    金額: ¥{payload[0].value.toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                    割合: {payload[0].payload.percentage.toFixed(1)}%
                </p>
            </div>
        );
    }
    return null;
};

interface DividendPieChartProps {
    readonly data: readonly StockDividend[];
}

export default function DividendPieChart({
                                             data,
                                         }: DividendPieChartProps) {
    // デバイス判定用のステート
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const mobileQuery = window.matchMedia('(max-width: 639px)');
        const tabletQuery = window.matchMedia('(min-width: 640px) and (max-width: 1023px)');

        const updateFromMediaQueries = () => {
            const isMobileMatch = mobileQuery.matches;
            const isTabletMatch = tabletQuery.matches;

            setIsMobile(isMobileMatch);
            setIsTablet(!isMobileMatch && isTabletMatch);
        };

        // 初期判定
        updateFromMediaQueries();

        mobileQuery.addEventListener('change', updateFromMediaQueries);
        tabletQuery.addEventListener('change', updateFromMediaQueries);

        return () => {
            mobileQuery.removeEventListener('change', updateFromMediaQueries);
            tabletQuery.removeEventListener('change', updateFromMediaQueries);
        };
    }, []);

    // デバイスに応じたチャート設定
    const chartConfig = {
        outerRadius: isMobile ? 80 : isTablet ? 120 : 140,
        height: isMobile ? 350 : isTablet ? 400 : 450,
        labelThreshold: 3,
        showLabels: !isMobile, // モバイルではラベルを非表示
    };

    // Rechartsのデフォルトカラーパレット
    const COLORS = [
        '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
        '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1',
    ];

    // データを円グラフ用の形式に変換
    const chartData = data.map((item, index) => ({
        name: item.stockName,
        value: item.amount,
        percentage: item.percentage,
        fill: item.color || COLORS[index % COLORS.length],
    }));

    /**
     * カスタムラベル
     * 円グラフのセグメントに銘柄名と割合を表示
     */
    const renderLabel = (entry: {
        name?: string;
        percentage?: number;
        cx?: number;
        cy?: number;
        midAngle?: number;
        innerRadius?: number;
        outerRadius?: number;
    }) => {
        // 必要なプロパティがない場合は表示しない
        if (
            !entry.name ||
            entry.percentage === undefined ||
            entry.cx === undefined ||
            entry.cy === undefined ||
            entry.midAngle === undefined ||
            entry.innerRadius === undefined ||
            entry.outerRadius === undefined
        ) {
            return null;
        }

        // モバイルではラベルを非表示
        if (!chartConfig.showLabels) {
            return null;
        }

        // 割合が小さい場合は表示しない
        if (entry.percentage < chartConfig.labelThreshold) {
            return null;
        }

        const RADIAN = Math.PI / 180;
        const radius = entry.innerRadius + (entry.outerRadius - entry.innerRadius) * 0.5;
        const x = entry.cx + radius * Math.cos(-entry.midAngle * RADIAN);
        const y = entry.cy + radius * Math.sin(-entry.midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > entry.cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-xs font-medium"
            >
                {`${entry.name} ${entry.percentage.toFixed(1)}%`}
            </text>
        );
    };

    if (data.length === 0) {
        return (
            <div
                className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl"
                style={{ height: `${chartConfig.height}px` }}
            >
                <p className="text-gray-500 dark:text-gray-400">
                    表示する配当データがありません
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 md:p-6">
            <ResponsiveContainer width="100%" height={chartConfig.height}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderLabel}
                        outerRadius={chartConfig.outerRadius}
                        fill="#8884d8"
                        nameKey="name"
                        // 各データのfillプロパティで色を指定
                        dataKey="value"
                        // Cellは非推奨なのでfillプロパティをデータに持たせる
                        // Pieコンポーネントがfillプロパティを参照する
                    />
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend
                        layout={isMobile ? "horizontal" : "vertical"}
                        align={isMobile ? "center" : "right"}
                        verticalAlign={isMobile ? "bottom" : "middle"}
                        wrapperStyle={{
                            fontSize: isMobile ? '11px' : '14px',
                            paddingTop: isMobile ? '10px' : '0',
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
