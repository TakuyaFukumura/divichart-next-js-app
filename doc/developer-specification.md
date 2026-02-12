# 開発者向けアプリ仕様書

## 1. ドキュメント情報

- **作成日**: 2026年2月5日
- **最終更新日**: 2026年2月12日
- **対象バージョン**: v0.19.0
- **対象読者**: 開発者、システムアーキテクト、保守担当者

---

## 2. アプリケーション概要

### 2.1 目的

divichart-next-js-appは、証券会社から提供される配当金データ（CSV形式）を読み込み、年別の配当金推移を視覚化するWebアプリケーションです。投資家が配当金の受取履歴を一目で把握し、投資戦略の分析に役立てることを目的としています。

### 2.2 主要機能

1. **CSVデータ読み込み**
    - Shift-JISエンコーディングのCSVファイルを読み込み
    - 複数通貨（円、USドル等）の配当金データに対応
    - カスタムフック（useDividendData）による再利用可能なデータ取得

2. **データ集計・変換**
    - 入金日から年を抽出し、年別に配当金を集計
    - USドル建て配当を設定可能な為替レートで円換算
    - 税引き後配当金を表示
    - 銘柄別配当金の集計と割合計算

3. **データ可視化**（メインページ）
    - 年別配当金の棒グラフ表示
    - インタラクティブなツールチップ表示
    - 年別配当金を集計したテーブル表示

4. **累計配当グラフ**（/cumulativeページ）
    - 年別配当金の折れ線グラフ表示
    - 累計配当金の推移を可視化
    - 配当金の成長を長期的に追跡

5. **配当ポートフォリオ**（/portfolioページ）
    - 年度選択機能（前年・次年ボタン）
    - 銘柄別配当金の円グラフ表示
    - 配当金の内訳をテーブル表示
    - 上位10銘柄の個別表示と「その他」の集約

6. **配当目標管理**（/goalsページ）
    - 月次・年次配当目標の設定
    - 目標達成率の計算と表示
    - 年別目標進捗バーの可視化
    - 目標達成状況のサマリー統計

7. **設定機能**（/settingsページ）
    - ダークモード/ライトモードの切り替え
    - 為替レートのリアルタイム変更
    - デフォルト為替レートへのリセット機能
    - ナビゲーションによる複数ページの切り替え

### 2.3 対象ユーザー

- 個人投資家
- 配当金投資を行っている投資家
- 証券口座を保有し、配当金データをダウンロードできるユーザー

---

## 3. システムアーキテクチャ

### 3.1 全体構成

```
┌─────────────────────────────────────────────────┐
│                  ブラウザ                         │
│  ┌──────────────────────────────────────────┐  │
│  │         Next.js App Router               │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │  Layout (Header + DarkMode         │  │  │
│  │  │          + ExchangeRateContext)    │  │  │
│  │  │  ┌──────────────────────────────┐  │  │  │
│  │  │  │  Page (メインページ)         │  │  │  │
│  │  │  │  - useDividendData Hook     │  │  │  │
│  │  │  │  - データ集計ロジック        │  │  │  │
│  │  │  │  - 棒グラフ表示             │  │  │  │
│  │  │  │  - テーブル表示             │  │  │  │
│  │  │  └──────────────────────────────┘  │  │  │
│  │  │  ┌──────────────────────────────┐  │  │  │
│  │  │  │  /cumulative (累計ページ)    │  │  │  │
│  │  │  │  - useDividendData Hook     │  │  │  │
│  │  │  │  - 累計配当計算ロジック      │  │  │  │
│  │  │  │  - 折れ線グラフ表示         │  │  │  │
│  │  │  └──────────────────────────────┘  │  │  │
│  │  │  ┌──────────────────────────────┐  │  │  │
│  │  │  │  /portfolio (ポートフォリオ) │  │  │  │
│  │  │  │  - csvLoader利用            │  │  │  │
│  │  │  │  - dividendCalculator利用   │  │  │  │
│  │  │  │  - 円グラフ表示             │  │  │  │
│  │  │  │  - YearSelector             │  │  │  │
│  │  │  │  - DividendTable            │  │  │  │
│  │  │  └──────────────────────────────┘  │  │  │
│  │  │  ┌──────────────────────────────┐  │  │  │
│  │  │  │  /goals (配当目標管理)       │  │  │  │
│  │  │  │  - useDividendData Hook     │  │  │  │
│  │  │  │  - goalStorage利用          │  │  │  │
│  │  │  │  - goalCalculator利用       │  │  │  │
│  │  │  │  - GoalSettingsForm         │  │  │  │
│  │  │  │  - YearlyGoalProgressBar    │  │  │  │
│  │  │  │  - GoalAchievementTable     │  │  │  │
│  │  │  └──────────────────────────────┘  │  │  │
│  │  │  ┌──────────────────────────────┐  │  │  │
│  │  │  │  /settings (設定ページ)      │  │  │  │
│  │  │  │  - ExchangeRateContext利用  │  │  │  │
│  │  │  │  - 為替レート設定UI          │  │  │  │
│  │  │  │  - デフォルト値リセット      │  │  │  │
│  │  │  └──────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                     ↓ HTTP
┌─────────────────────────────────────────────────┐
│              静的ファイルサーバー                  │
│  /public/data/dividendlist_YYYYMMDD.csv         │
└─────────────────────────────────────────────────┘
```

### 3.2 技術スタック

#### フロントエンド

| カテゴリ    | 技術           | バージョン  | 用途                     |
|---------|--------------|--------|------------------------|
| フレームワーク | Next.js      | 16.1.6 | Reactベースのフルスタックフレームワーク |
| UIライブラリ | React        | 19.2.4 | ユーザーインターフェース構築         |
| 言語      | TypeScript   | 5.x    | 型安全性の確保                |
| スタイリング  | Tailwind CSS | 4.x    | ユーティリティファーストCSS        |
| チャート    | Recharts     | 3.7.0  | グラフ描画ライブラリ             |
| CSV解析   | PapaParse    | 5.5.3  | CSVパーサー                |

#### 開発ツール

| カテゴリ | 技術                    | バージョン  | 用途                |
|------|-----------------------|--------|-------------------|
| リンター | ESLint                | 9.x    | コード品質管理           |
| テスト  | Jest                  | 30.2.0 | ユニット・インテグレーションテスト |
| テスト  | React Testing Library | 16.3.2 | Reactコンポーネントテスト   |
| ビルド  | Next.js Turbopack     | -      | 高速ビルド             |

#### CI/CD

| カテゴリ   | 技術             | 用途        |
|--------|----------------|-----------|
| CI     | GitHub Actions | 自動テスト・ビルド |
| 依存関係管理 | Dependabot     | セキュリティ更新  |

### 3.3 ディレクトリ構成

```
divichart-next-js-app/
├── .github/
│   ├── copilot-instructions.md # GitHub Copilot用指示
│   ├── dependabot.yml          # Dependabot設定
│   ├── PULL_REQUEST_TEMPLATE.md # PR テンプレート
│   ├── ISSUE_TEMPLATE/
│   │   ├── config.yml          # Issueテンプレート設定
│   │   ├── ai-doc.md           # AI用ドキュメント作成Issue
│   │   └── ai-dev.md           # AI用開発Issue
│   └── workflows/
│       └── ci.yml              # CI/CDワークフロー
├── __tests__/                  # テストファイル（src構造をミラー）
│   └── src/
│       ├── app/
│       │   ├── components/
│       │   │   ├── CustomTooltip.test.tsx
│       │   │   ├── DarkModeProvider.test.tsx
│       │   │   ├── DividendPieChart.test.tsx
│       │   │   ├── Header.test.tsx
│       │   │   ├── LoadingState.test.tsx
│       │   │   └── YearSelector.test.tsx
│       │   ├── contexts/
│       │   │   └── ExchangeRateContext.test.tsx
│       │   ├── cumulative/
│       │   │   └── page.test.tsx
│       │   ├── goals/
│       │   │   └── page.test.tsx
│       │   ├── settings/
│       │   │   └── page.test.tsx
│       │   ├── layout.test.tsx
│       │   └── page.test.tsx
│       └── lib/
│           ├── dividendCalculator.test.ts
│           ├── exchangeRate.test.ts
│           ├── formatYAxisValue.test.ts
│           ├── goalCalculator.test.ts
│           └── goalStorage.test.ts
├── doc/                        # ドキュメント
│   ├── developer-specification.md      # 本ドキュメント
│   ├── feature-addition-consideration.md # 機能追加検討
│   ├── improvements.md                 # 改善提案リスト
│   ├── refactoring-decision-guide.md   # リファクタリング判断基準
│   ├── refactoring-plan.md             # リファクタリング計画
│   └── refactoring-summary.md          # リファクタリング概要
├── public/                     # 静的ファイル
│   └── data/                   # CSVデータファイル
│       └── dividendlist_20260205.csv
├── src/
│   ├── app/
│   │   ├── components/         # Reactコンポーネント
│   │   │   ├── DarkModeProvider.tsx        # ダークモードProvider
│   │   │   ├── DividendPieChart.tsx        # 円グラフコンポーネント
│   │   │   ├── DividendTable.tsx           # 配当テーブルコンポーネント
│   │   │   ├── GoalAchievementTable.tsx    # 目標達成テーブル
│   │   │   ├── GoalSettingsForm.tsx        # 目標設定フォーム
│   │   │   ├── Header.tsx                  # ヘッダーコンポーネント
│   │   │   ├── LoadingState.tsx            # ローディング状態コンポーネント
│   │   │   ├── YearSelector.tsx            # 年度選択コンポーネント
│   │   │   └── YearlyGoalProgressBar.tsx   # 年別目標進捗バー
│   │   ├── contexts/           # React Context
│   │   │   └── ExchangeRateContext.tsx     # 為替レートContext
│   │   ├── cumulative/         # 累計配当グラフページ
│   │   │   └── page.tsx
│   │   ├── goals/              # 配当目標管理ページ
│   │   │   └── page.tsx
│   │   ├── portfolio/          # ポートフォリオページ
│   │   │   └── page.tsx
│   │   ├── settings/           # 設定ページ
│   │   │   └── page.tsx
│   │   ├── globals.css         # グローバルスタイル
│   │   ├── layout.tsx          # アプリケーションレイアウト
│   │   └── page.tsx            # メインページ（年別配当グラフ）
│   ├── hooks/                  # カスタムフック
│   │   └── useDividendData.ts  # 配当データ読み込みフック
│   ├── lib/                    # ユーティリティ関数
│   │   ├── csvLoader.ts        # CSV読み込み処理
│   │   ├── dividendCalculator.ts  # 配当金計算ロジック
│   │   ├── exchangeRate.ts     # 為替レート関連ユーティリティ
│   │   ├── formatYAxisValue.ts # Y軸値フォーマット
│   │   ├── goalCalculator.ts   # 目標達成計算ロジック
│   │   └── goalStorage.ts      # 目標設定LocalStorage管理
│   └── types/                  # TypeScript型定義
│       ├── dividend.ts         # 配当金関連の型定義
│       └── react-inert.d.ts    # React inert属性の型定義
├── .gitignore
├── eslint.config.mjs           # ESLint設定
├── jest.config.mjs             # Jest設定
├── jest.setup.js               # Jestセットアップ
├── next.config.ts              # Next.js設定
├── package.json                # 依存関係定義
├── postcss.config.mjs          # PostCSS設定
├── README.md                   # プロジェクト説明
├── tailwind.config.ts          # Tailwind CSS設定
└── tsconfig.json               # TypeScript設定
```

---

## 4. データモデル

### 4.1 CSVデータ形式

#### 入力データ（CSVファイル）

**ファイル情報**

- **エンコーディング**: Shift-JIS
- **ファイル名**: `dividendlist_YYYYMMDD.csv`
- **配置場所**: `public/data/`

**CSVカラム定義**

| カラム名                  | データ型                | 必須 | 説明       | 例              |
|-----------------------|---------------------|----|----------|----------------|
| 入金日                   | string (YYYY/MM/DD) | ✓  | 配当金の入金日  | 2026/02/06     |
| 商品                    | string              | -  | 商品種別     | 米国株式           |
| 口座                    | string              | -  | 口座種別     | 旧NISA          |
| 銘柄コード                 | string              | -  | 証券コード    | BLV            |
| 銘柄                    | string              | -  | 銘柄名      | VA L-TERM BOND |
| 受取通貨                  | string              | ✓  | 通貨コード    | USドル, 円        |
| 単価[円/現地通貨]            | string              | -  | 1株あたり配当金 | 0.27745        |
| 数量[株/口]               | string              | -  | 保有株数     | 11             |
| 配当・分配金合計（税引前）[円/現地通貨] | string              | -  | 税引前配当金額  | 3.05           |
| 税額合計[円/現地通貨]          | string              | -  | 税額       | 0              |
| 受取金額[円/現地通貨]          | string              | ✓  | 税引き後配当金額 | 2.74           |

**特殊値の扱い**

- 税額が`-`の場合は0として扱う
- カンマ区切りの数値（例: `3,683`）は正常にパース可能

### 4.2 内部データ型

#### TypeScript型定義

```typescript
/**
 * CSVから読み込んだ1行分のデータ
 */
export type CSVRow = {
    /** 入金日（YYYY/MM/DD形式） */
    '入金日': string;
    /** 商品名（例: "米国株式"） */
    '商品': string;
    /** 口座名（例: "旧NISA"） */
    '口座': string;
    /** 銘柄コード */
    '銘柄コード': string;
    /** 銘柄名 */
    '銘柄': string;
    /** 受取通貨（例: "円", "USドル"） */
    '受取通貨': string;
    /** 単価[円/現地通貨] */
    '単価[円/現地通貨]': string;
    /** 数量[株/口] */
    '数量[株/口]': string;
    /** 配当・分配金合計（税引前）[円/現地通貨] */
    '配当・分配金合計（税引前）[円/現地通貨]': string;
    /** 税額合計[円/現地通貨] */
    '税額合計[円/現地通貨]': string;
    /** 受取金額（税引き後）[円/現地通貨] */
    '受取金額[円/現地通貨]': string;
};

/**
 * グラフ・テーブル表示用の年別集計データ
 */
export type DividendData = {
    /** 表示用の年（例: "2024年"） */
    year: string;
    /** 年間配当金合計（税引き後）[円] */
    totalDividend: number;
};

/**
 * 累計配当金データの型定義
 */
export type CumulativeDividendData = {
    /** 表示用の年（例: "2024年"） */
    year: string;
    /** 年間配当金合計（税引き後）[円] */
    yearlyDividend: number;
    /** 累計配当金（税引き後）[円] */
    cumulativeDividend: number;
};

/**
 * 銘柄別配当データ
 */
export type StockDividend = {
    /** 銘柄コード（ティッカーシンボル等、空の場合は空文字列） */
    stockCode: string;
    /** 銘柄名 */
    stockName: string;
    /** 配当金額（税引き後）[円] */
    amount: number;
    /** 配当割合 [%] */
    percentage: number;
    /** 色コード（円グラフ用） */
    color?: string;
};

/**
 * 年度別配当ポートフォリオデータ
 */
export type YearlyPortfolio = {
    /** 対象年 */
    year: number;
    /** 銘柄別配当データ（降順ソート済み） */
    stocks: StockDividend[];
    /** 年間配当金合計 [円] */
    totalAmount: number;
};

/**
 * 年別目標達成データ
 */
export type YearlyGoalAchievement = {
    /** 対象年 */
    year: number;
    /** 実際の年間配当金 [円] */
    actualAmount: number;
    /** 目標金額（年間） [円] */
    targetAmount: number;
    /** 達成率 [%] */
    achievementRate: number;
    /** 差額 [円] (正の値: 超過達成, 負の値: 未達成) */
    difference: number;
};

/**
 * 目標達成サマリーの型定義
 */
export type GoalAchievementSummary = {
    /** 達成した年数 */
    achievedYearsCount: number;
    /** 総年数 */
    totalYearsCount: number;
    /** 平均達成率 [%] */
    averageAchievementRate: number;
    /** 最高達成率 [%] */
    maxAchievementRate: number;
    /** 最高達成率の年 */
    maxAchievementYear: number;
    /** 最低達成率 [%] */
    minAchievementRate: number;
    /** 最低達成率の年 */
    minAchievementYear: number;
};
```

#### データ変換フロー

```
CSVファイル (Shift-JIS)
    ↓ loadCSV() - TextDecoder('shift-jis')
UTF-8テキスト
    ↓ PapaParse
CSVRow[]
    ↓ [メインページ] calculateDividendData()
    ├─ 入金日から年を抽出
    ├─ 通貨に応じて為替換算
    └─ 年別に集計
DividendData[]
    ↓
棒グラフ・テーブルに表示

CSVRow[]
    ↓ [累計ページ] calculateCumulativeDividendData()
    ├─ 年別配当金を計算
    ├─ 累計値を算出
    └─ 年でソート
CumulativeDividendData[]
    ↓
折れ線グラフに表示

CSVRow[]
    ↓ [ポートフォリオページ] generateYearlyPortfolio()
    ├─ 指定年の配当金を抽出
    ├─ 銘柄別に集計
    ├─ 金額順にソート
    └─ 上位N件と「その他」に集約
YearlyPortfolio
    ↓
円グラフ・テーブルに表示

CSVRow[]
    ↓ [目標ページ] aggregateDividendsByYear() → calculateGoalAchievements()
    ├─ 年別配当金を集計
    ├─ 目標額と比較
    └─ 達成率を計算
YearlyGoalAchievement[]
    ↓
目標達成テーブル・進捗バーに表示
```

---

## 5. コンポーネント仕様

### 5.1 ページコンポーネント

#### `src/app/page.tsx` - メインページ（年別配当グラフ）

**責務**

- カスタムフック（useDividendData）を使用したCSVデータの読み込み
- 年別配当金の集計
- 棒グラフとテーブルの表示
- 為替レート変更処理

**主要な状態**

| 状態変数         | 型              | 初期値   | 説明           |
|--------------|----------------|-------|--------------|
| data         | DividendData[] | []    | 年別集計データ      |
| usdToJpyRate | number         | 150   | 為替レート（1ドル=円） |
| inputValue   | string         | "150" | 為替レート入力値     |

**主要な関数**

```typescript
/**
 * CSVデータから年別配当金データを計算
 * @param csvData パース済みCSVデータ
 * @param exchangeRate 為替レート（1ドル=円）
 * @returns 年別配当金データ（年でソート済み）
 */
const calculateDividendData = (
        csvData: CSVRow[],
        exchangeRate: number
    ): DividendData[]
```

**処理フロー**

1. **初期化** (useDividendData)
    - カスタムフックがCSVファイルをfetchでHTTP取得
    - Shift-JISからUTF-8にデコード
    - PapaParseでCSVをパース
    - data, loading, errorを返す

2. **データ集計** (useEffect)
    - rawDataと為替レートが変更されたら再計算
    - calculateDividendData()を呼び出し
    - 年別に配当金を集計（USドルは為替換算）
    - 年でソートしてdataに保存

3. **レンダリング**
    - loading中: スピナー表示
    - error発生時: エラーメッセージ表示
    - 成功時: グラフと設定UI、テーブルを表示

#### `src/app/cumulative/page.tsx` - 累計配当グラフページ

**責務**

- カスタムフック（useDividendData）を使用したCSVデータの読み込み
- 年別および累計配当金の計算
- 折れ線グラフによる累計配当金の可視化
- 為替レート変更処理

**主要な状態**

| 状態変数         | 型                        | 初期値   | 説明           |
|--------------|--------------------------|-------|--------------|
| data         | CumulativeDividendData[] | []    | 累計配当データ      |
| usdToJpyRate | number                   | 150   | 為替レート（1ドル=円） |
| inputValue   | string                   | "150" | 為替レート入力値     |

**主要な関数**

```typescript
/**
 * CSVデータから累計配当金データを計算
 * @param csvData パース済みCSVデータ
 * @param exchangeRate 為替レート（1ドル=円）
 * @returns 累計配当金データ（年でソート済み）
 */
const calculateCumulativeDividendData = (
        csvData: CSVRow[],
        exchangeRate: number
    ): CumulativeDividendData[]
```

**UIコンポーネント構成**

```
CumulativeDividendPage
├── 為替レート入力フィールド
├── LineChart（累計配当金）
└── 年別配当金テーブル
```

#### `src/app/portfolio/page.tsx` - 配当ポートフォリオページ

**責務**

- CSVデータの読み込み（loadCSV関数を直接使用、useDividendDataフックは使用しない）
- 年度選択機能の提供
- 銘柄別配当金の集計と表示
- 円グラフとテーブルによる可視化
- URLクエリパラメータによる年度管理

**注意**: ポートフォリオページは、メインページや累計ページと異なり、`useDividendData`フックを使用せず、`loadCSV()`
関数を直接呼び出してCSVデータを読み込みます。これは、Suspenseとの互換性およびURLパラメータとの連携を最適化するためです。

**主要な状態**

| 状態変数           | 型                       | 初期値  | 説明           |
|----------------|-------------------------|------|--------------|
| rawData        | CSVRow[]                | []   | パース済みCSVデータ  |
| portfolioData  | YearlyPortfolio \| null | null | ポートフォリオデータ   |
| availableYears | number[]                | []   | 利用可能な年のリスト   |
| currentYear    | number                  | 現在年  | 表示中の年        |
| loading        | boolean                 | true | 読み込み状態       |
| error          | string \| null          | null | エラーメッセージ     |
| usdToJpyRate   | number                  | 150  | 為替レート（1ドル=円） |

**ライブラリ関数の使用**

```typescript
// src/lib/dividendCalculator.ts から
import {generateYearlyPortfolio, getAvailableYears} from '@/lib/dividendCalculator';

// src/lib/csvLoader.ts から
import {loadCSV} from '@/lib/csvLoader';
```

**UIコンポーネント構成**

```
PortfolioContent (Suspenseでラップ)
├── YearSelector（年度選択）
├── DividendPieChart（円グラフ）
└── DividendTable（配当内訳テーブル）
```

#### `src/app/goals/page.tsx` - 配当目標管理ページ

**責務**

- CSVデータの読み込み（useDividendDataフックを使用）
- 月次・年次配当目標の設定機能の提供
- 目標達成率の計算と表示
- 年別目標進捗の可視化
- 目標達成状況のサマリー統計表示

**主要な状態**

| 状態変数          | 型                    | 初期値 | 説明                                             |
|-------------------|-----------------------|--------|--------------------------------------------------|
| rawData           | CSVRow[]              | []     | パース済みCSVデータ                              |
| goalSettings      | GoalSettings          | loadGoalSettings()から読み込み   | 目標設定情報（monthlyTargetAmountなど）         |
| achievements      | YearlyGoalAchievement[]     | []     | 目標達成状況一覧（年別の実績サマリを含む） |

**ライブラリ関数の使用**

```typescript
// src/lib/goalStorage.ts から
import {loadGoalSettings, saveGoalSettings} from '@/lib/goalStorage';

// src/lib/dividendCalculator.ts から
import {aggregateDividendsByYear} from '@/lib/dividendCalculator';

// src/lib/goalCalculator.ts から
import {calculateGoalAchievements} from '@/lib/goalCalculator';
```

**UIコンポーネント構成**

```
GoalsPage
├── GoalSettingsForm（目標設定フォーム）
├── GoalAchievementTable（目標達成テーブル）
└── YearlyGoalProgressBar（年別目標進捗バー）× N年分
```

#### `src/app/settings/page.tsx` - 設定ページ

**責務**

- 為替レートの設定と変更
- デフォルト為替レートへのリセット機能
- ExchangeRateContextを使用したグローバル為替レート管理

**主要な状態**

| 状態変数      | スコープ   | 型             | 初期値                                      | 説明                             |
|-----------|--------|----------------|-------------------------------------------|--------------------------------|
| usdToJpyRate | Context | number         | `NEXT_PUBLIC_USD_TO_JPY_RATE` または `150` | グローバル為替レート（1ドル=円）        |
| inputValue  | Local  | string         | `usdToJpyRate` を文字列化した値               | 為替レート入力フィールドの表示用文字列       |
| error       | Local  | string \| null | `null`                                    | バリデーションエラーメッセージ（なければ null） |
| isEditing   | Local  | boolean        | `false`                                   | 入力中かどうかのフラグ                  |

**Context APIの使用**

```typescript
// src/app/contexts/ExchangeRateContext.tsx から
import {useExchangeRate} from '@/app/contexts/ExchangeRateContext';
```

**主要機能**

- 為替レート入力フィールド
- リアルタイム為替レート更新
- デフォルト値（150円）へのリセットボタン
- 設定値のLocalStorage保存

**UIコンポーネント構成**

```
SettingsPage
├── 為替レート入力フィールド
├── リセットボタン
└── 説明文
```

### 5.2 レイアウトコンポーネント

#### `src/app/layout.tsx` - ルートレイアウト

**責務**

- アプリケーション全体のレイアウト構造
- メタデータの設定
- グローバルスタイルの適用
- ExchangeRateProviderの配置
- DarkModeProviderの配置
- ナビゲーション機能の提供（Header内）

**構成**

```tsx
<html lang="ja">
<body>
<DarkModeProvider>
    <ExchangeRateProvider>
        <Header/>
        {children}
    </ExchangeRateProvider>
</DarkModeProvider>
</body>
</html>
```

### 5.3 UIコンポーネント

#### `src/app/components/Header.tsx` - ヘッダー

**責務**

- アプリケーションタイトルの表示
- ダークモード切り替えボタンの提供
- ページ間のナビゲーションメニューの表示

**主要機能**

- `useDarkMode()`フックでテーマ情報を取得
- テーマに応じたアイコン表示（☀️/🌙）
- ボタンクリックでテーマ切り替え
- Next.js Linkコンポーネントによるページ遷移

**ナビゲーション**

- ホーム（/）: 年別配当グラフ
- 累計（/cumulative）: 累計配当グラフ
- ポートフォリオ（/portfolio）: 銘柄別配当表示
- 目標（/goals）: 配当目標管理
- 設定（/settings）: アプリケーション設定

**Props**: なし

**スタイル特性**

- スティッキーヘッダー（`sticky top-0`）
- ガラスモルフィズム（`backdrop-blur-sm`）
- ダークモード対応
- レスポンシブデザイン

#### `src/app/components/YearSelector.tsx` - 年度選択コンポーネント

**責務**

- 現在の年度表示
- 前年・次年への切り替えボタンの提供
- 利用可能な年の範囲内での移動制御

**Props**

```typescript
{
    currentYear: number;           // 現在表示中の年
    availableYears: number[];      // 利用可能な年のリスト
    onYearChange: (year: number) => void;  // 年度変更時のコールバック
}
```

**主要機能**

- 前年ボタン: 利用可能な場合のみ有効化
- 次年ボタン: 利用可能な場合のみ有効化
- 年の表示: 「YYYY年」形式

#### `src/app/components/DividendPieChart.tsx` - 配当円グラフ

**責務**

- 銘柄別配当金を円グラフで可視化
- インタラクティブなツールチップ表示
- カスタムカラーパレットの適用

**Props**

```typescript
{
    data: StockDividend[];  // 銘柄別配当データ
}
```

**主要機能**

- Rechartsの`PieChart`コンポーネントを使用
- 各セクターに配当金額と割合を表示
- レスポンシブコンテナによるサイズ調整
- ダークモード対応のカラーリング

#### `src/app/components/DividendTable.tsx` - 配当内訳テーブル

**責務**

- 銘柄別配当金をテーブル形式で表示
- 配当金額と割合の詳細表示
- ダークモード対応

**Props**

```typescript
{
    data: StockDividend[];  // 銘柄別配当データ
}
```

**表示カラム**

| カラム名    | 説明           | フォーマット       |
|---------|--------------|--------------|
| 銘柄コード   | ティッカーシンボル等   | 文字列          |
| 銘柄名     | 銘柄の名称        | 文字列          |
| 配当金額[円] | 配当金額（税引き後）   | 3桁区切り（カンマ付き） |
| 割合[%]   | 全体に占める配当金の割合 | 小数点1桁        |

#### `src/app/components/GoalSettingsForm.tsx` - 目標設定フォーム

**責務**

- 月平均配当目標の入力フォームの提供
- 入力値のバリデーション（1,000円〜10,000,000円の範囲チェック）
- LocalStorageへの目標値保存

**Props**

```typescript
{
    initialValue: number;                     // 初期の月平均目標額
    onSave: (value: number) => void;          // 目標保存時のコールバック
}
```

**主要機能**

- 月平均目標入力フィールド
- 年間目標の自動計算表示（月平均 × 12）
- 保存ボタン
- 入力値の数値バリデーション（1,000円〜10,000,000円）
- 保存成功メッセージの表示

#### `src/app/components/YearlyGoalProgressBar.tsx` - 年別目標進捗バー

**責務**

- 年別目標達成率の視覚的表示
- プログレスバーによる達成度の可視化
- 達成率に応じた色分け表示
- 実績・目標・差額の詳細情報表示

**Props**

```typescript
{
    achievement: YearlyGoalAchievement;  // 年別目標達成データ
}
```

**主要機能**

- 年の表示
- プログレスバー（0-100%、100%以上は100%で表示）
- 達成率の数値表示
- 色分け
  - 120%以上: 黄色（bg-yellow-500）
  - 100%以上120%未満: 緑色（bg-green-500）
  - 100%未満: 青色（bg-blue-500）
- 詳細情報（実績金額、目標金額、差額）の表示

#### `src/app/components/GoalAchievementTable.tsx` - 目標達成テーブル

**責務**

- 年別目標達成状況をテーブル形式で表示
- 配当金額、目標額、達成率、差額の詳細表示
- ダークモード対応
- 達成率・差額の色分け表示

**Props**

```typescript
{
    achievements: YearlyGoalAchievement[];  // 年別目標達成データ
}
```

**表示カラム**

| カラム名     | 説明           | フォーマット       |
|----------|--------------|--------------|
| 年        | 対象年          | YYYY        |
| 実績[円]  | 実際の配当金額（税引き後） | 3桁区切り（カンマ付き） |
| 目標[円]   | 年次目標額        | 3桁区切り（カンマ付き） |
| 達成率[%]   | 目標に対する達成率    | 小数点1桁、色分け（120%以上: 黄色、100%以上: 緑色、未達成: 赤色）        |
| 差額[円]   | 実績と目標の差額（超過達成: 正の値、未達成: 負の値）    | 3桁区切り（カンマ付き）、色分け（正: 緑色、負: 赤色）        |

#### `src/app/components/LoadingState.tsx` - ローディング状態コンポーネント

**責務**

- ローディング中の全画面表示（`LoadingScreen`）
- エラー発生時の全画面表示（`ErrorScreen`）
- ページコンポーネント等からの再利用可能な状態画面コンポーネント

**提供コンポーネント**

- `LoadingScreen`
    - 配当データなどの取得中に表示するローディング画面
    - スピナーやローディングメッセージを表示
- `ErrorScreen`
    - データ取得や処理でエラーが発生した際に表示するエラー画面
    - エラー内容に応じたメッセージを表示

**利用方針**

- データフェッチ中のページで `LoadingScreen` を直接レンダリングして使用
- 致命的なエラーが発生した場合に `ErrorScreen` をレンダリングしてユーザーに通知
- より細かい制御が必要な場合は、これらをラップするコンポーネントを別途実装
#### `src/app/components/DarkModeProvider.tsx` - ダークモードプロバイダー

**責務**

- ダークモード状態の管理
- localStorageへのテーマ保存
- HTML要素へのdarkクラス適用
- テーマ変更APIの提供

**Context API**

```typescript
interface DarkModeContextType {
    theme: 'light' | 'dark';      // 現在のテーマ
    setTheme: (theme: Theme) => void;  // テーマ変更関数
    isDark: boolean;              // ダークモードかどうか
}
```

**カスタムフック**

```typescript
/**
 * DarkModeContextを利用するフック
 * @returns テーマ情報とテーマ変更関数
 * @throws DarkModeProvider外で使用した場合にエラー
 */
function useDarkMode(): DarkModeContextType
```

**永続化**

- `localStorage.getItem('theme')`で初期テーマを読み込み
- `localStorage.setItem('theme', newTheme)`でテーマを保存

#### `src/app/contexts/ExchangeRateContext.tsx` - 為替レートContext

**責務**

- 為替レート状態のグローバル管理
- LocalStorageへの為替レート保存
- 為替レート変更APIの提供
- デフォルト値へのリセット機能
- 全ページでの為替レート共有

**Context API**

```typescript
interface ExchangeRateContextType {
    usdToJpyRate: number;                       // 現在の為替レート（1ドル=円）
    setUsdToJpyRate: (rate: number) => void;    // 為替レート変更関数
    defaultRate: number;                        // デフォルトの為替レート（定数）
    resetToDefault: () => void;                 // デフォルト値にリセットする関数
}
```

**カスタムフック**

```typescript
/**
 * ExchangeRateContextを利用するフック
 * @returns 為替レート情報と為替レート変更関数
 * @throws ExchangeRateProvider外で使用した場合にエラー
 */
function useExchangeRate(): ExchangeRateContextType
```

**永続化**

- `localStorage.getItem('usdToJpyRate')`で初期為替レートを読み込み
- `localStorage.setItem('usdToJpyRate', rate)`で為替レートを保存
- 優先順位: 1. localStorage の値 → 2. 環境変数（NEXT_PUBLIC_USD_TO_JPY_RATE） → 3. デフォルト値（150円）

---

## 5.4 カスタムフックとライブラリ関数

### カスタムフック

#### `src/hooks/useDividendData.ts` - 配当データ読み込みフック

**責務**

- CSVファイルの読み込み処理を抽象化
- ローディング状態とエラー状態の管理
- 複数ページでの再利用を可能にする

**パラメータ**

```typescript
csvFilePath: string = '/data/dividendlist_20260205.csv'
```

**戻り値**

```typescript
{
    data: CSVRow[];        // パース済みCSVデータ
    loading: boolean;      // 読み込み中フラグ
    error: string | null;  // エラーメッセージ
}
```

**使用例**

```typescript
const {data: rawData, loading, error} = useDividendData();
```

### ライブラリ関数

#### `src/lib/csvLoader.ts` - CSV読み込み処理

**主要関数**

```typescript
/**
 * CSVファイルを読み込み、パースする
 * @param filePath CSVファイルのパス
 * @returns CSVデータの配列
 * @throws CSVファイルの読み込みまたはパースに失敗した場合
 */
export async function loadCSV(filePath: string): Promise<CSVRow[]>
```

**処理内容**

1. fetchでCSVファイルを取得
2. arrayBufferとして受信
3. TextDecoderでShift-JISからUTF-8に変換
4. PapaParseでパース
5. CSVRow配列を返す

#### `src/lib/dividendCalculator.ts` - 配当金計算ロジック

**主要関数**

```typescript
/**
 * 指定年の銘柄別配当金を集計する
 * @param csvData CSVから読み込んだ配当データ
 * @param targetYear 集計対象年
 * @param exchangeRate USドル→円の為替レート
 * @returns 銘柄別配当データの配列（降順ソート済み）
 */
export function calculateStockDividends(
    csvData: CSVRow[],
    targetYear: number,
    exchangeRate: number
): StockDividend[]

/**
 * 上位N件以外を「その他」に集約
 * @param stocks 銘柄別配当データ（ソート済み）
 * @param topN 個別表示する銘柄数（デフォルト: 10）
 * @returns 「その他」集約後の銘柄別配当データ
 */
export function aggregateOthers(
    stocks: StockDividend[],
    topN: number = 10
): StockDividend[]

/**
 * 年度別配当ポートフォリオデータを生成
 * @param csvData CSVから読み込んだ配当データ
 * @param targetYear 対象年
 * @param exchangeRate USドル→円の為替レート
 * @param topN 個別表示する銘柄数（デフォルト: 10）
 * @returns 年度別配当ポートフォリオデータ
 */
export function generateYearlyPortfolio(
    csvData: CSVRow[],
    targetYear: number,
    exchangeRate: number,
    topN: number = 10
): YearlyPortfolio

/**
 * 利用可能な年のリストを取得
 * @param csvData CSVから読み込んだ配当データ
 * @returns 配当データが存在する年のリスト（昇順ソート済み）
 */
export function getAvailableYears(csvData: CSVRow[]): number[]
```

**特徴**

- 銘柄コードと銘柄名の組み合わせで一意性を確保
- 同一銘柄の配当金を自動集約
- 通貨の自動為替換算
- パーセンテージの自動計算

#### `src/lib/goalCalculator.ts` - 目標達成計算ロジック

**主要関数**

```typescript
/**
 * 年別の目標達成データを計算
 * @param yearlyDividends 年別配当金のMap（キー: 年、値: 年間配当金[円]）
 * @param monthlyTarget 月平均配当目標金額[円]
 * @returns 年別目標達成データの配列（降順ソート済み）
 */
export function calculateGoalAchievements(
    yearlyDividends: Map<string, number>,
    monthlyTarget: number
): YearlyGoalAchievement[]

/**
 * 目標達成サマリーを計算
 * @param achievements 年別目標達成データの配列
 * @returns 目標達成サマリー（データがない場合はnull）
 */
export function calculateGoalSummary(
    achievements: YearlyGoalAchievement[]
): GoalAchievementSummary | null
```

**特徴**

- 年次目標は月平均目標 × 12で自動計算
- 年別配当金の集計（Mapから取得）
- 目標達成率の自動計算（小数点第1位まで）
- 差額（実績 - 目標）の計算
- 達成年数・総年数の集計
- 平均達成率・最高/最低達成率の算出

#### `src/lib/goalStorage.ts` - 目標設定LocalStorage管理

**主要関数**

```typescript
/**
 * 目標設定を保存
 * @param monthlyTarget 月平均配当目標金額[円]
 */
export function saveGoalSettings(monthlyTarget: number): void

/**
 * 目標設定を読み込み
 * @returns 目標設定（未設定の場合はデフォルト値）
 */
export function loadGoalSettings(): GoalSettings
```

**特徴**

- LocalStorageキー: 'goalSettings'
- JSON形式での保存
- デフォルト値: { monthlyTargetAmount: 30000 }（月平均30,000円）
- 数値バリデーション（1,000円〜10,000,000円の範囲チェック）
- 読み込み失敗時のフォールバック処理
- SSR対応（window未定義時の処理）

#### `src/lib/exchangeRate.ts` - 為替レート関連ユーティリティ

**主要関数**

```typescript
/**
 * USドルから日本円への為替レートを取得
 * @returns 為替レート（1ドル = n円）
 */
export function getUsdToJpyRate(): number

/**
 * デフォルトの為替レート（定数）
 */
export const DEFAULT_USD_TO_JPY_RATE = 150;
```

**特徴**

- 環境変数 `NEXT_PUBLIC_USD_TO_JPY_RATE` から為替レートを取得
- 環境変数が未設定または無効な場合はデフォルト値（150円）を使用
- 負の値やNaNの場合もデフォルト値を使用
- LocalStorage操作はExchangeRateContext側で実装

#### `src/lib/formatYAxisValue.ts` - Y軸値フォーマット

**主要関数**

```typescript
/**
 * Y軸の値を読みやすい形式にフォーマットする
 * @param value フォーマット対象の値
 * @returns フォーマット済みの文字列（例: "1.5万", "10万"）
 */
export function formatYAxisValue(value: number): string
```

**特徴**

- 10,000以上: "万"単位で表示（例: "1.5万"、"10万"）
- 10,000未満: そのまま数値表示（例: "5000"）
- グラフの可読性向上
- 日本語表記対応

---

## 6. 状態管理

### 6.1 状態管理の方針

本アプリケーションでは、状態管理ライブラリ（Redux, Zustand等）を使用せず、React標準のフックとContext APIで状態を管理しています。

### 6.2 ローカル状態（useState）

各コンポーネント内でのみ使用する状態は`useState`で管理します。

**使用例**

- CSVデータ（各ページコンポーネント）
- 為替レート（各ページコンポーネント、v0.19.0以降はExchangeRateContextも使用）
- ローディング状態（各ページコンポーネント）
- 表示年（portfolioページ）
- ポートフォリオデータ（portfolioページ）
- 月次・年次目標（goalsページ）
- 目標達成データ（goalsページ）

### 6.3 グローバル状態（Context API）

複数コンポーネント間で共有する状態は`Context API`で管理します。

**現在の使用例**

- ダークモードのテーマ状態（`DarkModeProvider`）
- 為替レート状態（`ExchangeRateProvider`、v0.19.0で追加）

### 6.4 カスタムフック

再利用可能なロジックはカスタムフックとして抽出しています。

**現在の使用例**

- `useDividendData`: CSVデータ読み込みと状態管理
- `useDarkMode`: ダークモードのテーマ管理
- `useExchangeRate`: 為替レート管理（v0.19.0で追加）

### 6.5 LocalStorage永続化

ユーザー設定は`localStorage`を使用して永続化しています。

**永続化している設定**

- ダークモードのテーマ（key: 'theme'）
- 為替レート（key: 'usdToJpyRate'）
- 配当目標設定（key: 'goalSettings'）

### 6.6 サーバー状態

現在、サーバー状態の管理は行っていません。CSVファイルは静的ファイルとして配信され、クライアントで読み込まれます。カスタムフック（useDividendData）は初回マウント時および
`csvFilePath`変更時にデータを取得し、その結果としてページリロード時にも再取得されます。

---

## 7. データフロー

### 7.1 CSVデータ読み込みフロー

#### メインページ・累計ページ・目標ページ（useDividendDataフック使用）

```
[ユーザーがページアクセス]
    ↓
[ページコンポーネント マウント]
    ↓
[useDividendData フック実行]
    ↓
[loadCSV('/data/dividendlist_20260205.csv')]
    ↓
[fetch でCSVファイル取得]
    ↓
[arrayBuffer取得]
    ↓
[TextDecoder('shift-jis')でデコード]
    ↓
[PapaParse.parse()]
    ↓
[{data: CSVRow[], loading: false, error: null} を返す]
    ↓
[ページで集計処理を実行]
    ├─ [メインページ] calculateDividendData()
    └─ [累計ページ] calculateCumulativeDividendData()
    ↓
[グラフ・テーブル描画]
```

#### ポートフォリオページ（loadCSV直接呼び出し）

```
[ユーザーがページアクセス]
    ↓
[PortfolioContent コンポーネント マウント]
    ↓
[useEffect: CSVデータ読み込み]
    ↓
[loadCSV('/data/dividendlist_20260205.csv')]
    ↓
[fetch でCSVファイル取得]
    ↓
[arrayBuffer取得]
    ↓
[TextDecoder('shift-jis')でデコード]
    ↓
[PapaParse.parse()]
    ↓
[setRawData(CSVRow[])]
    ↓
[getAvailableYears(data)]
    ↓
[setAvailableYears(years)]
    ↓
[URLパラメータから年度を取得]
    ↓
[generateYearlyPortfolio(rawData, currentYear, exchangeRate)]
    ↓
[setPortfolioData(portfolio)]
    ↓
[円グラフ・テーブル描画]
```

### 7.2 為替レート変更フロー

```
[ユーザーが為替レート入力]
    ↓
[onChange イベント]
    ↓
[setInputValue(value)] ← 即座に入力値を反映
    ↓
[parseFloat(value)]
    ↓
[有効な数値の場合]
    ├→ [setUsdToJpyRate(numValue)]
    ↓
[useEffect: 為替レート変更検知]
    ↓
[calculateXxxData(rawData, usdToJpyRate)]
    ↓
[setData(chartData)]
    ↓
[グラフ・テーブル再描画]
```

### 7.3 ポートフォリオページの年度切り替えフロー

```
[ユーザーが前年/次年ボタンクリック]
    ↓
[YearSelector.handlePrevYear() / handleNextYear()]
    ↓
[onYearChange(newYear)] ← コールバック実行
    ↓
[router.push(`/portfolio?year=${newYear}`)] ← URLパラメータ更新
    ↓
[useEffect: URLパラメータ変更検知]
    ↓
[setCurrentYear(newYear)]
    ↓
[generateYearlyPortfolio(rawData, newYear, exchangeRate)]
    ↓
[setPortfolioData(portfolio)]
    ↓
[円グラフ・テーブル再描画]
```

### 7.4 ダークモード切り替えフロー

```
[ユーザーがテーマ切り替えボタンクリック]
    ↓
[Header.handleThemeToggle()]
    ↓
[setTheme(newTheme)] ← DarkModeContextから取得
    ↓
[DarkModeProvider.handleSetTheme()]
    ↓
[localStorage.setItem('theme', newTheme)]
    ↓
[setTheme(newTheme)]
    ↓
[useEffect: theme変更検知]
    ↓
[document.documentElement.classList.add/remove('dark')]
    ↓
[Tailwindのdark:プレフィックスが有効化]
    ↓
[全コンポーネント再レンダリング（ダークモードスタイル適用）]
```

---

## 8. 環境変数

### 8.1 環境変数一覧

| 変数名                         | 型      | デフォルト値 | 説明             | 必須 |
|-----------------------------|--------|--------|----------------|----|
| NEXT_PUBLIC_USD_TO_JPY_RATE | number | 150    | 初期為替レート（1ドル=円） | ✗  |

### 8.2 環境変数の設定方法

#### 開発環境

`.env.local`ファイルを作成して設定：

```bash
NEXT_PUBLIC_USD_TO_JPY_RATE=145
```

#### 本番環境

ホスティングサービスの環境変数設定機能で設定：

- Vercel: プロジェクト設定 > Environment Variables
- Netlify: Site settings > Environment variables

### 8.3 環境変数の読み込み

```typescript
const envRate = process.env.NEXT_PUBLIC_USD_TO_JPY_RATE
    ? Number(process.env.NEXT_PUBLIC_USD_TO_JPY_RATE)
    : NaN;
const USD_TO_JPY_RATE = !isNaN(envRate) && envRate > 0
    ? envRate
    : DEFAULT_USD_TO_JPY_RATE;
```

**注意事項**

- `NEXT_PUBLIC_`プレフィックスが必須（クライアントサイドで使用するため）
- 無効な値の場合はデフォルト値にフォールバック
- 0以下の値は無効とみなす

---

## 9. スタイリング

### 9.1 Tailwind CSS

#### クラス命名規則

- ユーティリティファーストアプローチ
- レスポンシブ: `sm:`, `md:`, `lg:` プレフィックス
- ダークモード: `dark:` プレフィックス

#### カラーパレット

**ライトモード**

- 背景: `bg-gradient-to-br from-blue-50 to-indigo-100`
- カード: `bg-white`
- テキスト: `text-gray-800`, `text-gray-600`
- アクセント: `text-blue-600`

**ダークモード**

- 背景: `dark:from-gray-900 dark:to-gray-800`
- カード: `dark:bg-gray-800`
- テキスト: `dark:text-gray-200`, `dark:text-gray-400`
- アクセント: `dark:text-blue-400`

### 9.2 グローバルスタイル

`src/app/globals.css`に定義されています。

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 10. テスト

### 10.1 テスト戦略

**テストピラミッド**

```
       /\
      /  \  E2E (未実装)
     /────\
    / 統合  \
   /────────\
  / ユニット  \
 /____________\
```

現在はユニットテストのみ実装されています。

### 10.2 テストファイル構成

```
__tests__/
└── src/
    ├── app/
    │   ├── components/
    │   │   ├── DarkModeProvider.test.tsx
    │   │   ├── Header.test.tsx
    │   │   └── YearSelector.test.tsx
    │   ├── cumulative/
    │   │   └── page.test.tsx
    │   ├── layout.test.tsx
    │   └── page.test.tsx
    └── lib/
        └── dividendCalculator.test.ts
```

**命名規則**

- テストファイル: `{ComponentName}.test.tsx` または `{moduleName}.test.ts`
- ソースコードの構造をミラーする

**テストカバレッジ**

- UIコンポーネント: DarkModeProvider, Header, YearSelector
- ページコンポーネント: メインページ, 累計ページ, レイアウト
- ユーティリティ関数: dividendCalculator

### 10.3 テストツール

- **Jest**: テストランナー
- **React Testing Library**: Reactコンポーネントテスト
- **@testing-library/jest-dom**: DOM要素のアサーション

### 10.4 テスト実行

```bash
# 全テスト実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジレポート生成
npm run test:coverage
```

### 10.5 モックの使用

**localStorage**

```typescript
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();
```

### 10.6 テストカバレッジ目標

| カテゴリ       | 目標カバレッジ | 現状 |
|------------|---------|----|
| Statements | 80%以上   | 良好 |
| Branches   | 70%以上   | 良好 |
| Functions  | 80%以上   | 良好 |
| Lines      | 80%以上   | 良好 |

**テスト実装済みの領域**

- `src/app/components/DarkModeProvider.tsx` - ダークモードProvider
- `src/app/components/Header.tsx` - ヘッダーコンポーネント
- `src/app/components/YearSelector.tsx` - 年度選択コンポーネント
- `src/app/page.tsx` - メインページ
- `src/app/cumulative/page.tsx` - 累計配当ページ
- `src/app/layout.tsx` - レイアウト
- `src/lib/dividendCalculator.ts` - 配当金計算ロジック

**今後のテスト拡張予定**

- `src/app/components/DividendPieChart.tsx` - 円グラフコンポーネント
- `src/app/components/DividendTable.tsx` - テーブルコンポーネント
- `src/app/portfolio/page.tsx` - ポートフォリオページ
- `src/lib/csvLoader.ts` - CSV読み込み処理
- `src/hooks/useDividendData.ts` - カスタムフック

---

## 11. ビルド・デプロイ

### 11.1 開発サーバー

```bash
npm run dev
```

- ポート: 3000
- Turbopack使用（高速ビルド）
- ホットリロード有効

### 11.2 本番ビルド

```bash
npm run build
```

**ビルド成果物**

- `.next/`ディレクトリに出力
- 静的最適化されたHTML
- バンドルされたJavaScript
- 最適化されたCSS

### 11.3 本番サーバー起動

```bash
npm start
```

### 11.4 デプロイ推奨環境

#### Vercel（推奨）

- Next.js開発元が提供するホスティング
- ゼロコンフィグデプロイ
- 自動プレビューURL生成

**デプロイ手順**

1. GitHubリポジトリをVercelに接続
2. 自動的にビルド・デプロイ

#### その他の選択肢

- **Netlify**: 静的サイトホスティング
- **AWS Amplify**: AWSベースのホスティング
- **Docker**: コンテナ化してデプロイ

### 11.5 CI/CD

#### GitHub Actions

**ワークフロー**: `.github/workflows/ci.yml`

**トリガー**

- `main`ブランチへのプッシュ
- プルリクエストの作成・更新

**実行内容**

1. Node.js 20.xのセットアップ
2. 依存関係のインストール
3. ESLint実行
4. TypeScript型チェック
5. Jestテスト実行
6. ビルド検証

**実行時間**: 約2-3分

---

## 12. セキュリティ

### 12.1 セキュリティ対策

#### 依存関係の管理

- **Dependabot**: 月次で依存関係の脆弱性チェック
    - スケジュール: 毎週月曜日 09:00 JST
    - 対象: npm packages, GitHub Actions

#### CSP（Content Security Policy）

現在未設定。将来的な実装を推奨。

#### XSS対策

- Reactの自動エスケープ機能に依存
- `dangerouslySetInnerHTML`は使用していない

### 12.2 認証・認可

現在、認証・認可機能は実装されていません。アプリケーションは完全に公開されており、誰でもアクセス可能です。

### 12.3 データプライバシー

- CSVファイルはパブリックディレクトリに配置
- 個人情報を含むCSVファイルの配置は非推奨
- 本番環境では認証機能の追加を推奨

---

## 13. パフォーマンス

### 13.1 最適化手法

#### Next.js標準機能

- **自動コード分割**: ページごとに自動的にバンドルを分割
- **画像最適化**: 未使用（現在画像なし）
- **Font最適化**: 自動的にGoogleフォントを最適化

#### React最適化

- `useCallback`: `calculateDividendData`関数をメモ化
- `useMemo`: DarkModeProvider内で値をメモ化

#### ビルド最適化

- Turbopack使用（開発時）
- 本番ビルドでミニファイ・圧縮

### 13.2 パフォーマンス指標

**目標値**

| 指標                             | 目標値    | 説明              |
|--------------------------------|--------|-----------------|
| FCP (First Contentful Paint)   | < 1.8秒 | 最初のコンテンツ描画      |
| LCP (Largest Contentful Paint) | < 2.5秒 | 最大コンテンツ描画       |
| TTI (Time to Interactive)      | < 3.8秒 | インタラクション可能になるまで |
| CLS (Cumulative Layout Shift)  | < 0.1  | レイアウトシフト累積      |

### 13.3 パフォーマンス改善案

1. **CSVキャッシング**: Service Workerでのキャッシュ戦略
2. **仮想スクロール**: 大量データ対応
3. **遅延ロード**: チャートライブラリの動的インポート
4. **Web Workers**: データ集計処理のオフロード

---

## 14. 国際化（i18n）

### 14.1 現状

現在、アプリケーションは日本語のみで実装されています。

### 14.2 将来の国際化対応

国際化を実装する場合の推奨アプローチ：

#### 使用ライブラリ

- `next-intl` または `next-i18next`

#### 対応言語

- 日本語（ja）
- 英語（en）

#### 翻訳対象

- UIラベル
- エラーメッセージ
- チャート・テーブルのラベル

---

## 15. 開発ガイドライン

### 15.1 コーディング規約

#### TypeScript

- **厳格な型指定**: `any`の使用は最小限に
- **明示的な型定義**: 関数の引数・戻り値には型を明記
- **型ガード**: ランタイムチェックを適切に行う

#### React

- **関数コンポーネント**: クラスコンポーネントは使用しない
- **フック**: カスタムフックで再利用可能なロジックを分離
- **Props型定義**: 全てのコンポーネントでPropsの型を定義

#### ファイル命名

- **コンポーネント**: PascalCase（例: `DarkModeProvider.tsx`）
- **ユーティリティ**: camelCase（例: `calculateDividend.ts`）
- **テスト**: `{ComponentName}.test.tsx`

### 15.2 コミット規約

推奨フォーマット：

```
<type>: <subject>

<body>
```

**Type一覧**

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードスタイル変更（機能に影響なし）
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルド・設定変更

**例**

```
feat: 為替レート変更機能を追加

ユーザーが為替レートを動的に変更できるように、
入力フィールドとリアルタイム計算機能を実装。
```

### 15.3 プルリクエスト

#### PRタイトル

簡潔で内容を表すタイトルを付ける：

```
[Feature] 為替レート変更機能の追加
[Fix] CSVパースエラーの修正
[Docs] READMEの更新
```

#### PR説明

以下を含める：

- 変更内容の説明
- 関連Issue番号（`Fixes #123`）
- テスト方法
- スクリーンショット（UI変更の場合）

### 15.4 コードレビュー

#### レビュー観点

- [ ] TypeScriptの型定義は適切か
- [ ] テストは追加されているか
- [ ] パフォーマンスへの影響はないか
- [ ] セキュリティリスクはないか
- [ ] アクセシビリティは考慮されているか
- [ ] ドキュメントは更新されているか

---

## 16. トラブルシューティング

### 16.1 よくある問題

#### CSVファイルが読み込めない

**症状**: "CSVファイルの読み込みに失敗しました"エラー

**原因と対処法**

1. **ファイルが存在しない**
    - `public/data/`にCSVファイルを配置
    - ファイル名が`page.tsx`の`fetch()`と一致しているか確認

2. **エンコーディング問題**
    - CSVファイルがShift-JISであることを確認
    - UTF-8の場合は`TextDecoder`の引数を変更

3. **パース失敗**
    - CSVフォーマットが正しいか確認
    - ヘッダー行が存在するか確認

#### ダークモードが保存されない

**症状**: ページリロード時にライトモードに戻る

**原因と対処法**

1. **localStorage無効**
    - ブラウザの設定でlocalStorageが有効か確認
    - プライベートブラウジングモードでは保存されない

2. **JavaScript実行前のちらつき**
    - 正常動作（Next.jsのクライアントサイド実行のため）
    - サーバーサイドレンダリング対応で改善可能

#### ビルドエラー

**症状**: `npm run build`が失敗する

**原因と対処法**

1. **依存関係の問題**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **型エラー**
    - `npm run lint`で型チェック
    - TypeScriptエラーを修正

3. **メモリ不足**
   ```bash
   NODE_OPTIONS=--max_old_space_size=4096 npm run build
   ```

### 16.2 デバッグ方法

#### 開発者ツールの活用

1. **Reactコンポーネント**: React Developer Tools拡張機能
2. **ネットワーク**: Network タブでCSV読み込みを確認
3. **コンソール**: console.logでデバッグ情報を出力

#### ローカルデバッグ

```typescript
// デバッグ用のログ出力
console.log('CSV Data:', rawData);
console.log('Calculated Data:', data);
console.log('Exchange Rate:', usdToJpyRate);
```

---

## 17. 用語集

| 用語        | 説明                                     |
|-----------|----------------------------------------|
| 配当金       | 株式投資で企業から受け取る利益分配金                     |
| 税引き後配当金   | 源泉徴収税を差し引いた後の配当金額                      |
| 為替レート     | 通貨間の交換比率（本アプリではUSD/JPY）                |
| Shift-JIS | 日本語文字エンコーディングの一種                       |
| CSP       | Content Security Policy（セキュリティポリシー）    |
| SSR       | Server-Side Rendering（サーバーサイドレンダリング）   |
| CSR       | Client-Side Rendering（クライアントサイドレンダリング） |

---

## 18. 参考資料

### 18.1 公式ドキュメント

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Recharts Documentation](https://recharts.org/)
- [PapaParse Documentation](https://www.papaparse.com/docs)

### 18.2 関連ドキュメント

- `README.md`: プロジェクト概要とセットアップ手順
- `doc/improvements.md`: 改善提案リスト
- `doc/test-code-organization.md`: テストコード構成

### 18.3 外部リソース

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## 19. 変更履歴

| 日付         | バージョン | 変更内容                                                                                                                                                                                                                                                                        | 作成者            |
|------------|-------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| 2026-02-05 | 1.0.0 | 初版作成                                                                                                                                                                                                                                                                        | GitHub Copilot |
| 2026-02-07 | 2.0.0 | v0.10.0対応: 累計配当グラフページ追加、ポートフォリオページ追加、新コンポーネント追加（YearSelector, DividendPieChart, DividendTable）、カスタムフック・ライブラリ関数の追加、テストカバレッジ拡充                                                                                                                                                | GitHub Copilot |
| 2026-02-12 | 3.0.0 | v0.19.0対応: 配当目標管理ページ（/goals）追加、設定ページ（/settings）追加、新コンポーネント追加（GoalSettingsForm, YearlyGoalProgressBar, GoalAchievementTable, LoadingState）、ExchangeRateContext追加、新ライブラリ追加（goalCalculator, goalStorage, formatYAxisValue, exchangeRate）、テストカバレッジ拡充、ドキュメント全面更新 | GitHub Copilot |

---

## 20. 付録

### 20.1 設定ファイル一覧

#### `next.config.ts`

Next.jsの設定ファイル。現在はデフォルト設定を使用。

#### `tsconfig.json`

TypeScriptコンパイラの設定ファイル。

**主要設定**

- `strict: true`: 厳格な型チェック有効
- `jsx: "preserve"`: JSXをそのまま保持（Next.jsが処理）
- `moduleResolution: "bundler"`: バンドラー向けのモジュール解決

#### `tailwind.config.ts`

Tailwind CSSの設定ファイル。

**主要設定**

- `darkMode: 'class'`: クラスベースのダークモード
- `content`: スキャン対象ファイルパス

#### `eslint.config.mjs`

ESLintの設定ファイル。

**主要ルール**

- Next.js推奨設定を継承
- React Hooksルール有効

#### `jest.config.mjs`

Jestの設定ファイル。

**主要設定**

- `testEnvironment: 'jsdom'`: ブラウザ環境をシミュレート
- `setupFilesAfterEnv`: `@testing-library/jest-dom`をセットアップ

### 20.2 サンプルCSVデータ

```csv
入金日,商品,口座,銘柄コード,銘柄,受取通貨,単価[円/現地通貨],数量[株/口],配当・分配金合計(税引前)[円/現地通貨],税額合計[円/現地通貨],受取金額[円/現地通貨]
2026/02/06,米国株式,旧NISA,BLV,VA L-TERM BOND,USドル,0.27745,11,3.05,0,2.74
2026/02/06,米国株式,旧NISA,VCLT,VA L-TERM CORPBD,USドル,0.3456,33,11.40,0,10.26
2026/01/30,投資信託,特定,,ブラジル株式ツインαファンド,円,5.00,3683,2,0,2
```

---

## お問い合わせ

このドキュメントに関する質問や改善提案は、GitHubのIssueでお知らせください。

- **Repository**: https://github.com/TakuyaFukumura/divichart-next-js-app
- **Issues**: https://github.com/TakuyaFukumura/divichart-next-js-app/issues
