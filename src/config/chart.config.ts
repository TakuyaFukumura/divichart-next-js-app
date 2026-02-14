/**
 * グラフ表示設定
 */

/** グラフ設定の型定義 */
export interface ChartConfig {
    /** Y軸フォーマット設定 */
    yAxis: YAxisConfig;
    /** ポートフォリオ表示設定 */
    portfolio: PortfolioConfig;
}

/** Y軸フォーマット設定 */
export interface YAxisConfig {
    /** 千円単位 */
    thousand: number;
    /** 万円単位 */
    tenThousand: number;
}

/** ポートフォリオ表示設定 */
export interface PortfolioConfig {
    /** 個別表示する上位銘柄数 */
    topStocksCount: number;
    /** ラベル表示する最小パーセンテージ */
    minPercentageForLabel: number;
}

/**
 * Y軸フォーマット設定
 */
export const yAxisConfig: YAxisConfig = {
    thousand: 1000,
    tenThousand: 10000,
};

/**
 * ポートフォリオ表示設定
 */
export const portfolioConfig: PortfolioConfig = {
    topStocksCount: 10,
    minPercentageForLabel: 3,
};

/**
 * グラフ設定
 */
export const chartConfig: ChartConfig = {
    yAxis: yAxisConfig,
    portfolio: portfolioConfig,
};

export default chartConfig;
