# 設定ファイル集約 - 設計資料

## 📋 このドキュメントについて

本ドキュメントは、divichart-next-js-app における設定管理の現状を分析し、設定ファイル集約の仕様と実装計画をまとめたものです。

**作成日**: 2026年2月12日  
**最終更新**: 2026年2月12日  
**ステータス**: レビュー待ち

---

## 目次

1. [現状分析](#現状分析)
2. [問題点の整理](#問題点の整理)
3. [推奨アーキテクチャ](#推奨アーキテクチャ)
4. [詳細設計](#詳細設計)
5. [実装計画](#実装計画)
6. [マイグレーション手順](#マイグレーション手順)
7. [テスト戦略](#テスト戦略)

---

## 現状分析

### 📊 設定の分散状況

現在、アプリケーション設定が以下のように複数のファイルに分散しています：

#### 1. 為替レート設定

**場所**: `src/lib/exchangeRate.ts`

```typescript
export const DEFAULT_USD_TO_JPY_RATE = 150;
```

**環境変数**: `NEXT_PUBLIC_USD_TO_JPY_RATE`

**ストレージ**: localStorage (`'usdToJpyRate'`)

**管理コンポーネント**: `src/contexts/ExchangeRateContext.tsx`

**優先順位**:
1. localStorage に保存されたユーザー設定値
2. 環境変数 `NEXT_PUBLIC_USD_TO_JPY_RATE`
3. デフォルト値 (150円)

#### 2. CSVファイルパス

**問題**: 2箇所で同じパスがハードコーディングされている

**場所1**: `src/hooks/useDividendData.ts` (16行目)
```typescript
const csvFilePath = '/data/dividendlist_20260205.csv';
```

**場所2**: `src/app/portfolio/page.tsx` (34行目)
```typescript
const csvFilePath = '/data/dividendlist_20260205.csv';
```

**課題**: 
- パス変更時に2箇所の修正が必要
- 環境ごとに異なるファイルを使う場合の対応が困難

#### 3. 目標設定

**場所**: `src/lib/goalStorage.ts`

```typescript
export const DEFAULT_MONTHLY_TARGET = 30000; // 円
export const GOAL_SETTINGS_STORAGE_KEY = 'goalSettings';
```

**バリデーション定数** (2箇所に分散):

- `src/lib/goalStorage.ts`: 関数内でハードコーディング
- `src/components/GoalSettingsForm.tsx`: UIでのバリデーション

```typescript
// 最小値: 1,000円
// 最大値: 10,000,000円
```

#### 4. グラフ表示設定

**場所**: `src/lib/formatYAxisValue.ts`

```typescript
// Y軸の数値を千円単位・万円単位で表示するための定数
const THOUSAND = 1000;
const TEN_THOUSAND = 10000;
```

#### 5. ポートフォリオ表示設定

**場所**: `src/app/portfolio/page.tsx`

```typescript
// 上位10銘柄を個別に表示
const topStocks = sortedData.slice(0, 10);
const MIN_PERCENTAGE_FOR_LABEL = 3; // 3%未満はラベル非表示
```

#### 6. localStorage キー

現在、以下のlocalStorageキーがアプリケーション全体で使用されています：

| キー名 | 用途 | 定義場所 |
|--------|------|----------|
| `'theme'` | ダークモード設定 | `DarkModeProvider.tsx` |
| `'usdToJpyRate'` | 為替レート | `ExchangeRateContext.tsx` |
| `'goalSettings'` | 目標配当金設定 | `goalStorage.ts` |

**問題点**: キー名が各ファイルに分散し、統一性がない

---

## 問題点の整理

### 🚨 現状の課題

#### 1. 設定の分散による保守性の低下

**問題**:
- 同じ設定値が複数ファイルに記述されている（CSV パスなど）
- 設定変更時に複数箇所の修正が必要
- 設定値の所在が不明確で、開発者が探しにくい

**影響**:
- バグの混入リスク（修正漏れ）
- 開発効率の低下
- 新メンバーのオンボーディング困難

#### 2. 環境ごとの設定管理が困難

**問題**:
- `.env.example` が存在しない
- 環境変数の使用方法が明示されていない
- デフォルト値がコード内に埋め込まれている

**影響**:
- 開発環境・本番環境での設定切り替えが困難
- デプロイ時の設定ミスのリスク
- 環境変数の仕様が不明確

#### 3. マジックナンバーの存在

**問題**:
- 数値定数の意味が不明確（3, 10, 1000, 10000 など）
- 定数名がない、またはローカルスコープに限定
- 同じ意味の定数が複数箇所に重複

**影響**:
- コードの可読性低下
- 変更時の影響範囲が不明確
- バグの混入リスク

#### 4. 型安全性の欠如

**問題**:
- 設定値の型定義が不十分
- 環境変数の型チェックがない
- バリデーションが各所で個別実装

**影響**:
- ランタイムエラーのリスク
- 不正な設定値の検出が遅れる
- テストの困難さ

---

## 推奨アーキテクチャ

### 🎯 設計方針

#### 1. 設定の集約

すべてのアプリケーション設定を `src/config/` ディレクトリに集約します。

```
src/
├── config/
│   ├── index.ts           # 統合エクスポート
│   ├── app.config.ts      # アプリケーション基本設定
│   ├── chart.config.ts    # グラフ表示設定
│   ├── storage.config.ts  # localStorage設定
│   └── constants.ts       # 定数定義
```

#### 2. 環境変数の明示化

`.env.example` ファイルを作成し、すべての環境変数を明示します。

```bash
# 為替レート設定（オプション）
NEXT_PUBLIC_USD_TO_JPY_RATE=150

# CSVファイルパス（オプション）
NEXT_PUBLIC_CSV_FILE_PATH=/data/dividendlist_20260205.csv

# デフォルト月次目標（オプション）
NEXT_PUBLIC_DEFAULT_MONTHLY_TARGET=30000
```

#### 3. 型安全な設定管理

TypeScript の型システムを活用し、設定値の型安全性を確保します。

```typescript
// 設定値の型定義
export interface AppConfig {
  exchangeRate: ExchangeRateConfig;
  csvFilePath: string;
  goals: GoalConfig;
  chart: ChartConfig;
  storage: StorageConfig;
}

// バリデーション関数
export function validateConfig(config: AppConfig): boolean;
```

#### 4. 階層的な設定管理

設定の優先順位を明確にします：

1. **ランタイム設定** (localStorage など)
2. **環境変数** (`.env` ファイル)
3. **デフォルト値** (コード内定義)

---

## 詳細設計

### 📁 ファイル構成

#### 1. `src/config/app.config.ts`

アプリケーション全体の基本設定を管理します。

```typescript
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
 * 目標設定
 */
export const goalConfig: GoalConfig = {
  defaultMonthlyTarget: 30000,
  minTarget: 1000,
  maxTarget: 10000000,
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
```

#### 2. `src/config/chart.config.ts`

グラフ表示に関する設定を管理します。

```typescript
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
```

#### 3. `src/config/storage.config.ts`

localStorage のキー管理を一元化します。

```typescript
/**
 * localStorage設定
 * 
 * アプリケーションで使用するすべてのlocalStorageキーを定義
 */

/** localStorage設定の型定義 */
export interface StorageConfig {
  /** テーマ設定キー */
  theme: string;
  /** 為替レート設定キー */
  exchangeRate: string;
  /** 目標設定キー */
  goalSettings: string;
}

/**
 * localStorageキー定義
 */
export const storageKeys: StorageConfig = {
  theme: 'theme',
  exchangeRate: 'usdToJpyRate',
  goalSettings: 'goalSettings',
};

/**
 * localStorage操作のヘルパー関数
 */

/**
 * localStorageから値を取得
 * 
 * @param key - storageKeysで定義されたキー
 * @returns 保存された値、または null
 */
export function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(key);
}

/**
 * localStorageに値を保存
 * 
 * @param key - storageKeysで定義されたキー
 * @param value - 保存する値
 */
export function setStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(key, value);
}

/**
 * localStorageから値を削除
 * 
 * @param key - storageKeysで定義されたキー
 */
export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(key);
}

export default storageKeys;
```

#### 4. `src/config/constants.ts`

アプリケーション全体で使用する定数を定義します。

```typescript
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
```

#### 5. `src/config/index.ts`

すべての設定を統合してエクスポートします。

```typescript
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
```

---

### 📄 `.env.example`

環境変数の例示ファイルを作成します。

```bash
# ==============================================
# divichart-next-js-app 環境変数設定
# ==============================================
#
# このファイルを .env.local にコピーして使用してください
# 
# Next.js の環境変数の詳細:
# https://nextjs.org/docs/basic-features/environment-variables
#
# ==============================================

# ----------------------------------------------
# 為替レート設定
# ----------------------------------------------
# USD → JPY の為替レートを設定します
# 未設定の場合はデフォルト値（150円）が使用されます
#
# NEXT_PUBLIC_USD_TO_JPY_RATE=150

# ----------------------------------------------
# CSVファイルパス設定
# ----------------------------------------------
# 配当データのCSVファイルパスを設定します
# 未設定の場合はデフォルト値が使用されます
# パスは public ディレクトリからの相対パスで指定
#
# NEXT_PUBLIC_CSV_FILE_PATH=/data/dividendlist_20260205.csv

# ----------------------------------------------
# 目標配当金設定
# ----------------------------------------------
# デフォルトの月次配当金目標を設定します（円）
# 未設定の場合はデフォルト値（30,000円）が使用されます
#
# NEXT_PUBLIC_DEFAULT_MONTHLY_TARGET=30000

# ==============================================
# 開発用設定（オプション）
# ==============================================

# Next.js のポート番号（デフォルト: 3000）
# PORT=3000

# ==============================================
# 注意事項
# ==============================================
#
# 1. NEXT_PUBLIC_ プレフィックス付きの変数はクライアント側で使用可能
# 2. プレフィックスなしの変数はサーバー側のみで使用可能
# 3. .env.local ファイルは .gitignore に含まれています
# 4. 本番環境では環境変数を直接設定してください
#
```

---

## 実装計画

### 🚀 実装フェーズ

#### フェーズ1: 設定ファイルの作成（優先度: 高）

**工数**: 約2時間

**タスク**:
1. `src/config/` ディレクトリを作成
2. `app.config.ts` を作成
3. `chart.config.ts` を作成
4. `storage.config.ts` を作成
5. `constants.ts` を作成
6. `index.ts` を作成（統合エクスポート）
7. `.env.example` を作成

**成果物**:
- [ ] `src/config/app.config.ts`
- [ ] `src/config/chart.config.ts`
- [ ] `src/config/storage.config.ts`
- [ ] `src/config/constants.ts`
- [ ] `src/config/index.ts`
- [ ] `.env.example`

#### フェーズ2: 既存コードの移行（優先度: 高）

**工数**: 約4時間

**タスク**:
1. 為替レート関連の移行
   - `src/lib/exchangeRate.ts` を更新
   - `src/contexts/ExchangeRateContext.tsx` を更新
   - 各ページコンポーネントを更新

2. CSV パス関連の移行
   - `src/hooks/useDividendData.ts` を更新
   - `src/app/portfolio/page.tsx` を更新

3. 目標設定関連の移行
   - `src/lib/goalStorage.ts` を更新
   - `src/components/GoalSettingsForm.tsx` を更新

4. グラフ設定関連の移行
   - `src/lib/formatYAxisValue.ts` を更新
   - `src/app/portfolio/page.tsx` を更新

5. ストレージキー関連の移行
   - `src/app/components/DarkModeProvider.tsx` を更新
   - その他のlocalStorage使用箇所を更新

#### フェーズ3: テストの追加（優先度: 中）

**工数**: 約2時間

**タスク**:
1. 設定ファイルの単体テストを作成
2. 環境変数読み込みのテストを作成
3. localStorage ヘルパーのテストを作成

**成果物**:
- [ ] `__tests__/src/config/app.config.test.ts`
- [ ] `__tests__/src/config/chart.config.test.ts`
- [ ] `__tests__/src/config/storage.config.test.ts`
- [ ] `__tests__/src/config/constants.test.ts`

#### フェーズ4: ドキュメント更新（優先度: 低）

**工数**: 約1時間

**タスク**:
1. README.md を更新（環境変数の説明を追加）
2. .copilot-instructions.md を更新
3. 開発者ドキュメントを更新

**成果物**:
- [ ] README.md の更新
- [ ] .copilot-instructions.md の更新

### ⏱️ 総工数見積もり

| フェーズ | 内容 | 工数 |
|---------|------|------|
| フェーズ1 | 設定ファイルの作成 | 約2時間 |
| フェーズ2 | 既存コードの移行 | 約4時間 |
| フェーズ3 | テストの追加 | 約2時間 |
| フェーズ4 | ドキュメント更新 | 約1時間 |
| **合計** | | **約9時間 (2日)** |

---

## マイグレーション手順

### 📝 段階的移行ステップ

#### ステップ1: 設定ファイルの作成

```bash
# ディレクトリ作成
mkdir -p src/config

# 設定ファイル作成
touch src/config/app.config.ts
touch src/config/chart.config.ts
touch src/config/storage.config.ts
touch src/config/constants.ts
touch src/config/index.ts

# 環境変数例示ファイル作成
touch .env.example
```

#### ステップ2: 為替レート設定の移行

**Before** (`src/lib/exchangeRate.ts`):
```typescript
export const DEFAULT_USD_TO_JPY_RATE = 150;
```

**After** (`src/lib/exchangeRate.ts`):
```typescript
import { appConfig } from '@/config';

export const DEFAULT_USD_TO_JPY_RATE = appConfig.exchangeRate.defaultRate;
```

#### ステップ3: CSV パスの移行

**Before** (`src/hooks/useDividendData.ts`):
```typescript
const csvFilePath = '/data/dividendlist_20260205.csv';
```

**After** (`src/hooks/useDividendData.ts`):
```typescript
import { appConfig } from '@/config';

const csvFilePath = appConfig.csvFilePath;
```

#### ステップ4: 目標設定の移行

**Before** (`src/lib/goalStorage.ts`):
```typescript
export const DEFAULT_MONTHLY_TARGET = 30000;
```

**After** (`src/lib/goalStorage.ts`):
```typescript
import { appConfig } from '@/config';

export const DEFAULT_MONTHLY_TARGET = appConfig.goals.defaultMonthlyTarget;
```

#### ステップ5: グラフ設定の移行

**Before** (`src/lib/formatYAxisValue.ts`):
```typescript
const THOUSAND = 1000;
const TEN_THOUSAND = 10000;
```

**After** (`src/lib/formatYAxisValue.ts`):
```typescript
import { chartConfig } from '@/config';

const { thousand: THOUSAND, tenThousand: TEN_THOUSAND } = chartConfig.yAxis;
```

#### ステップ6: localStorage キーの移行

**Before** (`src/app/components/DarkModeProvider.tsx`):
```typescript
const savedTheme = localStorage.getItem('theme');
```

**After** (`src/app/components/DarkModeProvider.tsx`):
```typescript
import { storageKeys, getStorageItem } from '@/config';

const savedTheme = getStorageItem(storageKeys.theme);
```

### 🔄 移行チェックリスト

#### 事前確認
- [ ] すべてのテストがパスすることを確認
- [ ] リントエラーがないことを確認
- [ ] ビルドが成功することを確認

#### 移行作業
- [ ] `src/config/` ディレクトリ作成
- [ ] 設定ファイル作成（app.config.ts など）
- [ ] `.env.example` 作成
- [ ] 為替レート設定の移行
- [ ] CSV パス設定の移行
- [ ] 目標設定の移行
- [ ] グラフ設定の移行
- [ ] localStorage キーの移行
- [ ] テストの追加
- [ ] ドキュメントの更新

#### 事後確認
- [ ] すべてのテストがパスすることを確認
- [ ] リントエラーがないことを確認
- [ ] ビルドが成功することを確認
- [ ] 実際にアプリを起動して動作確認
- [ ] 設定変更が正しく反映されることを確認
- [ ] localStorage の動作確認
- [ ] 環境変数の動作確認

---

## テスト戦略

### 🧪 テスト方針

#### 1. 単体テスト

各設定ファイルの単体テストを作成します。

**テストケース例** (`__tests__/src/config/app.config.test.ts`):

```typescript
import { appConfig, getCsvFilePath } from '@/config';

describe('app.config', () => {
  describe('exchangeRateConfig', () => {
    it('should have default rate of 150', () => {
      expect(appConfig.exchangeRate.defaultRate).toBe(150);
    });

    it('should have correct env key', () => {
      expect(appConfig.exchangeRate.envKey).toBe('NEXT_PUBLIC_USD_TO_JPY_RATE');
    });
  });

  describe('goalConfig', () => {
    it('should have default monthly target', () => {
      expect(appConfig.goals.defaultMonthlyTarget).toBe(30000);
    });

    it('should have valid min and max targets', () => {
      expect(appConfig.goals.minTarget).toBe(1000);
      expect(appConfig.goals.maxTarget).toBe(10000000);
      expect(appConfig.goals.minTarget).toBeLessThan(appConfig.goals.maxTarget);
    });
  });

  describe('getCsvFilePath', () => {
    it('should return default path when env var is not set', () => {
      expect(getCsvFilePath()).toBe('/data/dividendlist_20260205.csv');
    });

    it('should return env var value when set', () => {
      process.env.NEXT_PUBLIC_CSV_FILE_PATH = '/data/test.csv';
      expect(getCsvFilePath()).toBe('/data/test.csv');
      delete process.env.NEXT_PUBLIC_CSV_FILE_PATH;
    });
  });
});
```

#### 2. 統合テスト

既存コンポーネントが新しい設定システムで正しく動作することを確認します。

**テスト対象**:
- 為替レート設定の読み込み
- CSV ファイルパスの読み込み
- 目標設定の読み込みと保存
- localStorage の読み書き

#### 3. E2Eテスト（オプション）

環境変数を設定した状態での動作確認を行います。

---

## 期待される効果

### 📈 改善効果

#### 1. 保守性の向上

**Before**:
- 設定変更時に複数ファイルを修正
- 設定値の所在が不明確
- 重複した設定定義

**After**:
- 設定変更が `src/config/` で完結
- すべての設定が一箇所に集約
- DRY原則の遵守

#### 2. 開発効率の向上

**Before**:
- 設定値を探すのに時間がかかる
- 新しい設定追加時に適切な場所が不明
- 環境変数の使い方が不明確

**After**:
- 設定値の場所が明確（`src/config/`）
- 統一された設定管理パターン
- `.env.example` で環境変数が明示

#### 3. バグの削減

**Before**:
- 設定の修正漏れによるバグ
- 環境変数の設定ミス
- 型安全性の欠如

**After**:
- 単一真実の情報源（Single Source of Truth）
- 型安全な設定管理
- バリデーション機能

#### 4. テスタビリティの向上

**Before**:
- 設定値のモックが困難
- テスト時の環境変数設定が煩雑

**After**:
- 設定ファイルを簡単にモック可能
- テスト用の設定を容易に作成

---

## リスクと対策

### ⚠️ 想定されるリスク

#### 1. 既存機能の破壊

**リスク**: 設定移行時に既存機能が動作しなくなる

**対策**:
- 段階的な移行（一度に全部を変更しない）
- 各ステップでテスト実行
- Git のコミットを細かく分ける

#### 2. パフォーマンスへの影響

**リスク**: 設定読み込みのオーバーヘッド

**対策**:
- 設定値は起動時に一度だけ読み込む
- 必要に応じてキャッシュを実装
- パフォーマンステストで確認

#### 3. 移行漏れ

**リスク**: 一部の設定が移行されずに残る

**対策**:
- 移行チェックリストの作成
- コードレビューでの確認
- ESLintルールで古い定義を検出

---

## 次のアクション

### 🎯 実装開始の判断

#### 実施を推奨する場合

以下の**いずれか1つ**に該当する場合は実施を推奨します：

- [ ] 環境ごとの設定管理が必要になった
- [ ] 設定値の変更頻度が高い
- [ ] 新メンバーが参加予定
- [ ] 保守フェーズに移行予定
- [ ] 設定の不整合によるバグが発生

#### 実施手順

1. **承認**: このIssueにコメントで実施を承認
2. **ブランチ作成**: `feature/config-consolidation` ブランチを作成
3. **実装**: フェーズ1から順次実施
4. **レビュー**: プルリクエストでレビュー
5. **マージ**: テスト合格後にマージ

#### 実施しない場合

1. このIssueにコメントで延期理由を記録
2. 次回見直し時期を設定（3ヶ月後など）
3. 代替案を検討（コーディング規約など）

---

## まとめ

### 📋 設計のポイント

1. **集約化**: すべての設定を `src/config/` に集約
2. **型安全**: TypeScript の型システムを活用
3. **階層化**: 優先順位の明確な設定管理
4. **明示化**: `.env.example` で環境変数を明示
5. **段階的**: リスクを抑えた段階的な移行

### 🎯 期待される成果

- ✅ 保守性の向上（設定変更が容易）
- ✅ 開発効率の向上（設定の所在が明確）
- ✅ バグの削減（単一真実の情報源）
- ✅ テスタビリティの向上（モックが容易）
- ✅ 新メンバーのオンボーディング改善

### ⏱️ 投資対効果

**初期投資**: 約9時間（2日）  
**効果**: 即時  
**投資回収期間**: 約1-2ヶ月

この設計により、アプリケーションの設定管理が大幅に改善され、長期的な保守性とスケーラビリティが向上することが期待されます。

---

**作成者**: GitHub Copilot  
**レビュー担当**: プロジェクトオーナー
