import { chartConfig } from '@/config';

/**
 * グラフのy軸用に金額を短縮表示する
 *
 * @param value - 表示する金額（円単位）
 * @returns 短縮表示された文字列
 *
 * @example
 * formatYAxisValue(0) // "0"
 * formatYAxisValue(500) // "500円"
 * formatYAxisValue(5000) // "5千円"
 * formatYAxisValue(50000) // "5万円"
 * formatYAxisValue(320000) // "32万円"
 * formatYAxisValue(3200000) // "320万円"
 */
export function formatYAxisValue(value: number): string {
    if (value === 0) {
        return '0';
    }

    const sign = value < 0 ? '-' : '';
    const absValue = Math.abs(value);

    // 1万円以上の場合は万円単位で表示（小数点なし）
    if (absValue >= chartConfig.yAxis.tenThousand) {
        const manValue = Math.floor(absValue / chartConfig.yAxis.tenThousand);
        return `${sign}${manValue}万円`;
    }

    // 1千円以上1万円未満の場合は千円単位で表示（小数点なし）
    if (absValue >= chartConfig.yAxis.thousand) {
        const senValue = Math.floor(absValue / chartConfig.yAxis.thousand);
        return `${sign}${senValue}千円`;
    }

    // 1千円未満の場合は円単位で表示（小数点なし）
    const yenValue = Math.floor(absValue);
    return `${sign}${yenValue}円`;
}
