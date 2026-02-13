/**
 * アプリケーション定数
 * 
 * アプリケーション全体で使用する定数を定義
 */

/**
 * 時間関連の定数
 */
export const TIME_CONSTANTS = {
  /** 1年あたりの月数 */
  MONTHS_PER_YEAR: 12,
} as const;

/**
 * 数値フォーマット関連の定数
 */
export const NUMBER_FORMAT_CONSTANTS = {
  /** 千円単位 */
  THOUSAND: 1000,
  /** 万円単位 */
  TEN_THOUSAND: 10000,
} as const;

/**
 * バリデーション関連の定数
 */
export const VALIDATION_CONSTANTS = {
  /** 目標金額の最小値（円） */
  MIN_GOAL_AMOUNT: 1000,
  /** 目標金額の最大値（円） */
  MAX_GOAL_AMOUNT: 10000000,
} as const;

/**
 * 表示関連の定数
 */
export const DISPLAY_CONSTANTS = {
  /** ポートフォリオで個別表示する上位銘柄数 */
  TOP_STOCKS_COUNT: 10,
  /** 円グラフでラベル表示する最小パーセンテージ（%） */
  MIN_PERCENTAGE_FOR_LABEL: 3,
} as const;

/**
 * デフォルト値
 */
export const DEFAULT_VALUES = {
  /** デフォルトの USD → JPY 為替レート */
  USD_TO_JPY_RATE: 150,
  /** デフォルトの月次配当目標（円） */
  MONTHLY_TARGET: 30000,
} as const;
