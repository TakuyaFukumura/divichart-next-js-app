/**
 * アプリケーション基本設定
 */

/** アプリケーション設定の型定義 */
export interface AppConfig {
  /** 為替レート設定 */
  exchangeRate: ExchangeRateConfig;
  /** CSVファイルパス */
  csvFilePath: string;
  /** 目標設定 */
  goals: GoalConfig;
}

/** 為替レート設定 */
export interface ExchangeRateConfig {
  /** デフォルトの USD → JPY レート */
  defaultRate: number;
  /** 環境変数キー */
  envKey: string;
}

/** 目標設定 */
export interface GoalConfig {
  /** デフォルト月次目標（円） */
  defaultMonthlyTarget: number;
  /** 最小目標金額（円） */
  minTarget: number;
  /** 最大目標金額（円） */
  maxTarget: number;
}

/**
 * 為替レート設定
 */
export const exchangeRateConfig: ExchangeRateConfig = {
  defaultRate: 150,
  envKey: 'NEXT_PUBLIC_USD_TO_JPY_RATE',
};

/**
 * 目標金額の定数
 */
const GOAL_MIN_TARGET = 1000;
const GOAL_MAX_TARGET = 10000000;
const GOAL_DEFAULT_MONTHLY_TARGET = 30000;

/**
 * 目標設定のデフォルト値を取得
 * 
 * @returns デフォルトの月次目標金額（円）
 */
export function getDefaultMonthlyTarget(): number {
  const envTarget = process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_TARGET;
  
  if (!envTarget) {
    return GOAL_DEFAULT_MONTHLY_TARGET;
  }
  
  const target = Number(envTarget);
  
  // バリデーション: 最小値と最大値の範囲内かチェック
  if (isNaN(target) || target < GOAL_MIN_TARGET || target > GOAL_MAX_TARGET) {
    return GOAL_DEFAULT_MONTHLY_TARGET;
  }
  
  return target;
}

/**
 * 目標設定
 */
export const goalConfig: GoalConfig = {
  defaultMonthlyTarget: getDefaultMonthlyTarget(),
  minTarget: GOAL_MIN_TARGET,
  maxTarget: GOAL_MAX_TARGET,
};

/**
 * CSVファイルパスを取得
 * 
 * @returns CSVファイルのパス
 */
export function getCsvFilePath(): string {
  return process.env.NEXT_PUBLIC_CSV_FILE_PATH || '/data/dividendlist_20260205.csv';
}

/**
 * アプリケーション設定を取得
 */
export const appConfig: AppConfig = {
  exchangeRate: exchangeRateConfig,
  csvFilePath: getCsvFilePath(),
  goals: goalConfig,
};

export default appConfig;
