'use client';

import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';
import {StockDividend} from '@/types/dividend';

/**
 * 配当円グラフコンポーネント
 * 
 * 銘柄別の配当金を円グラフで表示する
 * 
 * @param props - コンポーネントのプロパティ
 * @param props.data - 銘柄別配当データ
 */
export default function DividendPieChart({
    data,
}: {
    data: StockDividend[];
}) {
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
     * カスタムツールチップ
     * マウスホバー時に詳細情報を表示
     */
    const CustomTooltip = ({
        active,
        payload,
    }: {
        active?: boolean;
        payload?: Array<{
            name: string;
            value: number;
            payload: { percentage: number };
        }>;
    }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
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

    /**
     * カスタムラベル
     * 円グラフのセグメントに銘柄名と割合を表示
     */
    const renderLabel = (entry: {
        name: string;
        percentage: number;
        cx: number;
        cy: number;
        midAngle: number;
        innerRadius: number;
        outerRadius: number;
    }) => {
        // 割合が小さい場合は表示しない
        if (entry.percentage < 3) {
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
            <div className="flex items-center justify-center h-[400px] bg-gray-50 dark:bg-gray-900 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400">
                    表示する配当データがありません
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderLabel}
                        outerRadius={140}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
