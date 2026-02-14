/**
 * 設定ファイル統合エクスポート
 *
 * すべての設定をこのファイル経由でインポート可能にする
 */

// アプリケーション設定
export {
    appConfig,
    exchangeRateConfig,
    goalConfig,
    getCsvFilePath,
    getDefaultMonthlyTarget,
    type AppConfig,
    type ExchangeRateConfig,
    type GoalConfig,
} from './app.config';

// グラフ設定
export {
    chartConfig,
    yAxisConfig,
    portfolioConfig,
    type ChartConfig,
    type YAxisConfig,
    type PortfolioConfig,
} from './chart.config';

// ストレージ設定
export {
    storageKeys,
    getStorageItem,
    setStorageItem,
    removeStorageItem,
    type StorageConfig,
} from './storage.config';

// 定数
export {
    TIME_CONSTANTS,
    NUMBER_FORMAT_CONSTANTS,
    VALIDATION_CONSTANTS,
    DISPLAY_CONSTANTS,
    DEFAULT_VALUES,
} from './constants';

/**
 * 使用例:
 *
 * import { appConfig, chartConfig, storageKeys } from '@/config';
 * import { DEFAULT_VALUES, VALIDATION_CONSTANTS } from '@/config';
 *
 * const rate = appConfig.exchangeRate.defaultRate;
 * const csvPath = appConfig.csvFilePath;
 * const theme = getStorageItem(storageKeys.theme);
 */
