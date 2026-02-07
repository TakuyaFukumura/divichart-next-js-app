# リファクタリング計画書

## 📋 概要

本ドキュメントは、divichart-next-js-app のコードベース全体を分析し、リファクタリングが必要な箇所を特定したものです。各項目について、現状の問題点、推奨される改善方法、および期待される効果を記載しています。

## 📊 調査結果サマリー

- **調査日**: 2026年2月7日
- **分析対象ファイル数**: 17ファイル (TypeScript/TSX)
- **総コード行数**: 約1,709行
- **検出された重複パターン**: 8件
- **推奨リファクタリング項目**: 8件

## 🎯 リファクタリングの目的

1. **コードの重複削減** (DRY原則の適用)
2. **保守性の向上** (変更時の影響範囲の縮小)
3. **テスタビリティの向上** (単体テストの容易化)
4. **一貫性の確保** (UIとロジックの統一)
5. **可読性の向上** (コードの理解しやすさ)

---

## 🔴 優先度: 高 (Critical)

### 1. 為替レート設定の重複削除

#### 📍 問題箇所

以下の3ファイルで全く同じコードが繰り返されています:

- `src/app/page.tsx` (19-25行目)
- `src/app/cumulative/page.tsx` (8-14行目)
- `src/app/portfolio/page.tsx` (12-17行目)

#### ❌ 現状のコード

```typescript
const DEFAULT_USD_TO_JPY_RATE = 150;
const envRate = process.env.NEXT_PUBLIC_USD_TO_JPY_RATE
    ? Number(process.env.NEXT_PUBLIC_USD_TO_JPY_RATE)
    : NaN;
const USD_TO_JPY_RATE = !isNaN(envRate) && envRate > 0 ? envRate : DEFAULT_USD_TO_JPY_RATE;
```

#### ✅ 推奨される改善案

**新規ファイル作成**: `src/lib/exchangeRate.ts`

```typescript
/**
 * 為替レート設定モジュール
 * 
 * 環境変数から為替レートを取得し、未設定の場合はデフォルト値を返します。
 */

/** デフォルトの為替レート（1ドル=150円） */
export const DEFAULT_USD_TO_JPY_RATE = 150;

/**
 * USドルから日本円への為替レートを取得
 * 
 * @returns 為替レート（1ドル = n円）
 * 
 * @remarks
 * - 環境変数 NEXT_PUBLIC_USD_TO_JPY_RATE から取得
 * - 環境変数が未設定または無効な場合はデフォルト値(150円)を使用
 * - 負の値やNaNの場合もデフォルト値を使用
 */
export function getUsdToJpyRate(): number {
    const envRate = process.env.NEXT_PUBLIC_USD_TO_JPY_RATE;
    
    if (!envRate) {
        return DEFAULT_USD_TO_JPY_RATE;
    }
    
    const rate = Number(envRate);
    
    if (isNaN(rate) || rate <= 0) {
        return DEFAULT_USD_TO_JPY_RATE;
    }
    
    return rate;
}
```

**各ページでの使用例**:

```typescript
import { getUsdToJpyRate } from '@/lib/exchangeRate';

// Before: 5行のコード
// After: 1行のコード
const USD_TO_JPY_RATE = getUsdToJpyRate();
```

#### 📈 期待される効果

- **コード削減**: 約12行 (4行 × 3ファイル)
- **保守性**: 為替レート取得ロジックの変更が1箇所で完結
- **テスタビリティ**: 為替レート取得ロジックを単体テスト可能
- **バグ防止**: ロジックの不整合によるバグを防止

#### ⏱️ 想定工数

- 実装: 30分
- テスト: 15分
- **合計**: 45分

---

### 2. 配当金集計ロジックの共通化

#### 📍 問題箇所

配当金の集計処理が以下の2ファイルで重複しています:

- `src/app/page.tsx` (56-93行目) - `calculateDividendData` 関数
- `src/app/cumulative/page.tsx` (45-89行目) - `calculateCumulativeDividendData` 関数

#### ❌ 現状の問題

両ファイルで以下の処理が重複:
1. CSVデータのループ処理
2. 日付から年の抽出
3. 金額文字列のパース (カンマ除去、"-"の処理)
4. USドル→円の換算
5. 年別の集計

#### ✅ 推奨される改善案

**`src/lib/dividendCalculator.ts` に以下の関数を追加**:

```typescript
/**
 * CSVデータから年別配当金を集計
 * 
 * @param csvData - CSVファイルから読み込んだ配当データ
 * @param exchangeRate - USドル→円の為替レート
 * @returns 年をキー、配当金合計を値とするMap
 * 
 * @remarks
 * - USドル建て配当は為替レートで円換算
 * - 金額が"-"の場合は0として扱う
 * - 無効なデータはスキップ
 */
export function aggregateDividendsByYear(
    csvData: CSVRow[],
    exchangeRate: number
): Map<string, number> {
    const yearlyDividends = new Map<string, number>();
    
    for (const row of csvData) {
        const year = extractYear(row['入金日']);
        if (!year) continue;
        
        const amount = parseAndConvertAmount(row, exchangeRate);
        if (isNaN(amount)) continue;
        
        const current = yearlyDividends.get(year) ?? 0;
        yearlyDividends.set(year, current + amount);
    }
    
    return yearlyDividends;
}

/**
 * 日付文字列から年を抽出
 * 
 * @param dateStr - YYYY/MM/DD形式の日付文字列
 * @returns 年（YYYY形式）、抽出失敗時はnull
 */
function extractYear(dateStr: string | undefined): string | null {
    if (!dateStr) return null;
    const year = dateStr.split('/')[0];
    return year && year.length === 4 ? year : null;
}

/**
 * 配当金額をパースし、必要に応じて円換算
 * 
 * @param row - CSVデータ行
 * @param exchangeRate - USドル→円の為替レート
 * @returns 円換算された金額、パース失敗時はNaN
 */
function parseAndConvertAmount(row: CSVRow, exchangeRate: number): number {
    const amountStr = row['受取金額[円/現地通貨]'];
    const currency = row['受取通貨'];
    
    if (!amountStr) return NaN;
    
    // "-"は0として扱う（税額表示用）
    const amount = amountStr === '-' 
        ? 0 
        : parseFloat(amountStr.replace(/,/g, ''));
    
    if (isNaN(amount)) return NaN;
    
    // USドルの場合は円換算
    return currency === 'USドル' ? amount * exchangeRate : amount;
}

/**
 * 年別配当金データをグラフ用に整形
 * 
 * @param yearlyDividends - 年別配当金のMap
 * @returns グラフ表示用の配当金データ配列（年でソート済み）
 */
export function formatYearlyDividendData(
    yearlyDividends: Map<string, number>
): DividendData[] {
    return Array.from(yearlyDividends.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([year, amount]) => ({
            year: `${year}年`,
            totalDividend: Math.round(amount),
        }));
}

/**
 * 累計配当金データをグラフ用に整形
 * 
 * @param yearlyDividends - 年別配当金のMap
 * @returns グラフ表示用の累計配当金データ配列（年でソート済み）
 */
export function formatCumulativeDividendData(
    yearlyDividends: Map<string, number>
): CumulativeDividendData[] {
    const sortedEntries = Array.from(yearlyDividends.entries())
        .sort((a, b) => a[0].localeCompare(b[0]));
    
    let cumulative = 0;
    return sortedEntries.map(([year, yearlyAmount]) => {
        cumulative += yearlyAmount;
        return {
            year: `${year}年`,
            yearlyDividend: Math.round(yearlyAmount),
            cumulativeDividend: Math.round(cumulative),
        };
    });
}
```

**ページでの使用例**:

```typescript
// src/app/page.tsx
const calculateDividendData = useCallback((csvData: CSVRow[], exchangeRate: number) => {
    const yearlyDividends = aggregateDividendsByYear(csvData, exchangeRate);
    return formatYearlyDividendData(yearlyDividends);
}, []);

// src/app/cumulative/page.tsx
const calculateCumulativeDividendData = useCallback((csvData: CSVRow[], exchangeRate: number) => {
    const yearlyDividends = aggregateDividendsByYear(csvData, exchangeRate);
    return formatCumulativeDividendData(yearlyDividends);
}, []);
```

#### 📈 期待される効果

- **コード削減**: 約60行 (重複ロジックの統合)
- **保守性**: 配当金計算ロジックの変更が1箇所で完結
- **テスタビリティ**: 各関数を個別にテスト可能
- **バグ防止**: 計算ロジックの不整合によるバグを防止
- **可読性**: 関数が小さく分割され、責務が明確

#### ⏱️ 想定工数

- 実装: 1.5時間
- テスト: 30分
- リファクタリング: 30分
- **合計**: 2.5時間

---

### 3. ローディング・エラー画面コンポーネントの統一

#### 📍 問題箇所

以下の3ファイルで全く同じローディング・エラー画面が繰り返されています:

- `src/app/page.tsx` (104-124行目)
- `src/app/cumulative/page.tsx` (99-120行目)
- `src/app/portfolio/page.tsx` (85-106行目)

#### ❌ 現状のコード

各ページで約40行の重複したJSXコード

#### ✅ 推奨される改善案

**新規ファイル作成**: `src/app/components/LoadingState.tsx`

```typescript
'use client';

/**
 * ローディング画面コンポーネント
 * 
 * データ読み込み中に表示される共通のローディング画面
 */
export function LoadingScreen() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">読み込み中...</span>
            </div>
        </div>
    );
}

/**
 * エラー画面コンポーネント
 * 
 * @param props - コンポーネントのプロパティ
 * @param props.error - 表示するエラーメッセージ
 */
export function ErrorScreen({ error }: { error: string }) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                エラー: {error}
            </div>
        </div>
    );
}
```

**ページでの使用例**:

```typescript
import { LoadingScreen, ErrorScreen } from '@/app/components/LoadingState';

// Before: 約20行
if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen ...">
            ...
        </div>
    );
}

// After: 1行
if (loading) return <LoadingScreen />;
if (error) return <ErrorScreen error={error} />;
```

#### 📈 期待される効果

- **コード削減**: 約60行 (20行 × 3ファイル → 30行の共通コンポーネント)
- **UI一貫性**: 全ページで同じローディング体験
- **デザイン変更**: 1箇所の修正で全ページに反映
- **保守性**: ローディング状態の管理が容易

#### ⏱️ 想定工数

- 実装: 30分
- リファクタリング: 30分
- **合計**: 1時間

---

## 🟡 優先度: 中 (Medium)

### 4. ページレイアウトコンポーネントの共通化

#### 📍 問題箇所

全ページで同じレイアウト構造が繰り返されています:

- `src/app/page.tsx`
- `src/app/cumulative/page.tsx`
- `src/app/portfolio/page.tsx`

#### ❌ 現状のコード

```typescript
<div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
    <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                {/* ページタイトル */}
            </h1>
            {/* ページコンテンツ */}
        </div>
    </div>
</div>
```

#### ✅ 推奨される改善案

**新規ファイル作成**: `src/app/components/PageLayout.tsx`

```typescript
'use client';

import React from 'react';

/**
 * ページレイアウトコンポーネント
 * 
 * 全ページで共通のレイアウト構造を提供します。
 * 
 * @param props - コンポーネントのプロパティ
 * @param props.title - ページタイトル
 * @param props.children - ページコンテンツ
 */
export function PageLayout({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                    <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                        {title}
                    </h1>
                    {children}
                </div>
            </div>
        </div>
    );
}
```

**ページでの使用例**:

```typescript
// Before: 約10行
<div className="min-h-screen ...">
    <div className="max-w-6xl mx-auto">
        <div className="bg-white ...">
            <h1>年別配当グラフ</h1>
            {/* content */}
        </div>
    </div>
</div>

// After: 3行
<PageLayout title="年別配当グラフ">
    {/* content */}
</PageLayout>
```

#### 📈 期待される効果

- **コード削減**: 約30行
- **デザイン統一**: 全ページで一貫したレイアウト
- **保守性**: レイアウト変更が1箇所で完結
- **可読性**: ページコンポーネントがコンテンツに集中

#### ⏱️ 想定工数

- 実装: 45分
- リファクタリング: 45分
- **合計**: 1.5時間

---

### 5. 為替レート入力コンポーネントの共通化

#### 📍 問題箇所

為替レート入力UIが以下の2ファイルで重複:

- `src/app/page.tsx` (162-191行目)
- `src/app/cumulative/page.tsx` (131-160行目)

#### ✅ 推奨される改善案

**新規ファイル作成**: `src/app/components/ExchangeRateInput.tsx`

```typescript
'use client';

/**
 * 為替レート入力コンポーネント
 * 
 * USドル→円の為替レートを入力するためのUIコンポーネント
 * 
 * @param props - コンポーネントのプロパティ
 * @param props.value - 現在の為替レート値
 * @param props.onChange - 値変更時のコールバック
 * 
 * @remarks
 * - 無効な入力値は自動的に修正される
 * - フォーカス喪失時に有効な値にリセット
 */
export function ExchangeRateInput({
    value,
    onChange,
}: {
    value: number;
    onChange: (rate: number) => void;
}) {
    const [inputValue, setInputValue] = React.useState(String(value));
    
    const handleChange = (newValue: string) => {
        setInputValue(newValue);
        
        const numValue = parseFloat(newValue);
        if (!isNaN(numValue) && numValue > 0) {
            onChange(numValue);
        }
    };
    
    const handleBlur = () => {
        // フォーカスが外れたときに、無効な入力を現在の有効な値にリセット
        setInputValue(String(value));
    };
    
    return (
        <div className="mb-6">
            <label 
                htmlFor="usd-jpy-rate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
                為替レート（1ドル = 円）
            </label>
            <div className="flex items-center gap-4">
                <input
                    id="usd-jpy-rate"
                    type="number"
                    min="1"
                    step="0.01"
                    value={inputValue}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={handleBlur}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-[150px]"
                />
                <span className="text-gray-600 dark:text-gray-400">円</span>
            </div>
        </div>
    );
}
```

**ページでの使用例**:

```typescript
// Before: 約30行のJSX + state管理

// After: 1行
<ExchangeRateInput 
    value={usdToJpyRate} 
    onChange={setUsdToJpyRate} 
/>
```

#### 📈 期待される効果

- **コード削減**: 約50行
- **再利用性**: 他のページでも簡単に使用可能
- **保守性**: 入力ロジックの変更が1箇所で完結
- **テスタビリティ**: コンポーネント単体でテスト可能

#### ⏱️ 想定工数

- 実装: 45分
- リファクタリング: 30分
- テスト: 15分
- **合計**: 1.5時間

---

### 6. CustomTooltipコンポーネントの共通化

#### 📍 問題箇所

カスタムツールチップが各ページ内で定義されています:

- `src/app/page.tsx` (135-151行目)
- `src/app/cumulative/page.tsx` (256-276行目)

#### ✅ 推奨される改善案

**新規ファイル作成**: `src/app/components/DividendTooltip.tsx`

```typescript
'use client';

/**
 * 年別配当金用カスタムツールチップ
 */
export function DividendTooltip({ 
    active, 
    payload 
}: {
    active?: boolean;
    payload?: Array<{ payload: { year: string }; value: number }>;
}) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }
    
    return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
            <p className="text-gray-800 dark:text-gray-200 font-semibold">
                {payload[0].payload.year}
            </p>
            <p className="text-blue-600 dark:text-blue-400">
                配当金: ¥{payload[0].value.toLocaleString()}
            </p>
        </div>
    );
}

/**
 * 累計配当金用カスタムツールチップ
 */
export function CumulativeDividendTooltip({ 
    active, 
    payload 
}: {
    active?: boolean;
    payload?: Array<{ 
        payload: { 
            year: string; 
            yearlyDividend: number 
        }; 
        value: number 
    }>;
}) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }
    
    return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
            <p className="text-gray-800 dark:text-gray-200 font-semibold">
                {payload[0].payload.year}
            </p>
            <p className="text-blue-600 dark:text-blue-400">
                年間配当金: ¥{payload[0].payload.yearlyDividend.toLocaleString()}
            </p>
            <p className="text-blue-600 dark:text-blue-400 font-semibold">
                累計配当金: ¥{payload[0].value.toLocaleString()}
            </p>
        </div>
    );
}
```

#### 📈 期待される効果

- **コード削減**: 約30行
- **保守性**: ツールチップデザインの変更が容易
- **再利用性**: 他のチャートでも使用可能

#### ⏱️ 想定工数

- 実装: 30分
- リファクタリング: 15分
- **合計**: 45分

---

## 🟢 優先度: 低 (Low)

### 7. 定数の統一管理

#### 📍 問題箇所

マジックナンバーやハードコードされた値が散在:

- `page.tsx` L237: `totalDividend / 12` (月平均計算)
- `DividendPieChart.tsx` L93: `3` (最小表示パーセンテージ)
- `dividendCalculator.ts` L112: `10` (表示する上位銘柄数)

#### ✅ 推奨される改善案

**新規ファイル作成**: `src/lib/constants.ts`

```typescript
/**
 * アプリケーション全体で使用する定数定義
 */

/** 1年あたりの月数 */
export const MONTHS_PER_YEAR = 12;

/** 配当金計算の小数点以下桁数 */
export const DIVIDEND_CALCULATION_DECIMALS = 2;

/** 円グラフでラベル表示する最小パーセンテージ（%） */
export const MIN_PERCENTAGE_FOR_LABEL = 3;

/** ポートフォリオで個別表示する上位銘柄数 */
export const TOP_STOCKS_COUNT = 10;

/** USドルの通貨表記 */
export const CURRENCY_USD = 'USドル';

/** 日本円の通貨表記 */
export const CURRENCY_JPY = '円';

/** 税額が記載されていない場合の文字列 */
export const AMOUNT_NOT_AVAILABLE = '-';

/** CSVファイルのデフォルトパス */
export const DEFAULT_CSV_PATH = '/data/dividendlist_20260205.csv';

/** チャート用カラーパレット */
export const CHART_COLORS = {
    primary: '#3b82f6',
    secondary: '#60a5fa',
    other: '#9ca3af',
} as const;
```

**使用例**:

```typescript
import { MONTHS_PER_YEAR, MIN_PERCENTAGE_FOR_LABEL } from '@/lib/constants';

// Before:
Math.floor(row.totalDividend / 12)

// After:
Math.floor(row.totalDividend / MONTHS_PER_YEAR)

// Before:
if (item.percentage >= 3) { ... }

// After:
if (item.percentage >= MIN_PERCENTAGE_FOR_LABEL) { ... }
```

#### 📈 期待される効果

- **可読性**: マジックナンバーの意味が明確
- **保守性**: 定数変更が1箇所で完結
- **再利用性**: 同じ値を複数箇所で使用可能

#### ⏱️ 想定工数

- 実装: 30分
- リファクタリング: 45分
- **合計**: 1.25時間

---

### 8. 型定義の拡充

#### 📍 問題箇所

`src/types/dividend.ts` に追加すべき型定義

#### ✅ 推奨される改善案

```typescript
/**
 * 年別配当金の集計結果
 */
export type YearlyDividendMap = Map<string, number>;

/**
 * ローディング状態
 */
export type LoadingState = {
    /** ローディング中フラグ */
    isLoading: boolean;
    /** エラーメッセージ（エラーがない場合はnull） */
    error: string | null;
};

/**
 * 為替レート設定
 */
export type ExchangeRateConfig = {
    /** デフォルトレート */
    defaultRate: number;
    /** 環境変数名 */
    envVariable: string;
};

/**
 * チャートツールチップのペイロード型
 */
export type TooltipPayload<T> = {
    payload: T;
    value: number;
};
```

#### 📈 期待される効果

- **型安全性**: より厳密な型チェック
- **可読性**: 型定義により意図が明確
- **保守性**: 型変更の影響範囲を把握しやすい

#### ⏱️ 想定工数

- 実装: 30分
- リファクタリング: 30分
- **合計**: 1時間

---

## 📊 リファクタリング実施計画

### フェーズ1: 重複コードの削除（優先度: 高）

| # | タスク | 工数 | 期待効果 |
|---|--------|------|---------|
| 1 | 為替レート設定の統一 | 45分 | バグ防止、保守性↑ |
| 2 | 配当金集計ロジックの共通化 | 2.5時間 | テスタビリティ↑、保守性↑ |
| 3 | ローディング/エラー画面の統一 | 1時間 | UI一貫性、保守性↑ |

**小計**: 約4時間

### フェーズ2: コンポーネント化（優先度: 中）

| # | タスク | 工数 | 期待効果 |
|---|--------|------|---------|
| 4 | ページレイアウトの共通化 | 1.5時間 | コード削減、保守性↑ |
| 5 | 為替レート入力の共通化 | 1.5時間 | 再利用性↑、保守性↑ |
| 6 | カスタムツールチップの共通化 | 45分 | 保守性↑ |

**小計**: 約3.75時間

### フェーズ3: コード品質向上（優先度: 低）

| # | タスク | 工数 | 期待効果 |
|---|--------|------|---------|
| 7 | 定数の統一管理 | 1.25時間 | 可読性↑、保守性↑ |
| 8 | 型定義の拡充 | 1時間 | 型安全性↑ |

**小計**: 約2.25時間

### 総工数見積もり

- **全フェーズ合計**: 約10時間
- **推奨実施期間**: 2-3日
- **影響を受けるファイル数**: 約15ファイル

---

## ✅ リファクタリング後の期待される成果

### 定量的効果

- **コード削減**: 約200行 (現在1,709行 → 約1,500行)
- **重複コード削減**: 8箇所 → 0箇所
- **ファイル数増加**: +5ファイル (共通コンポーネント/ユーティリティ)
- **平均関数サイズ**: 約30% 削減
- **テストカバレッジ**: 新規ユーティリティ関数のテスト追加

### 定性的効果

1. **保守性の向上**
   - 変更時の影響範囲が明確
   - バグ修正が1箇所で完結
   - 新機能追加が容易

2. **テスタビリティの向上**
   - 小さな関数単位でテスト可能
   - モックが容易
   - テストコードの可読性向上

3. **可読性の向上**
   - 関数名で処理内容が理解可能
   - コンポーネントの責務が明確
   - マジックナンバーの排除

4. **チーム開発の効率化**
   - コードレビューが容易
   - 新メンバーのオンボーディングが簡単
   - 一貫したコーディングスタイル

---

## 🚨 リファクタリング時の注意事項

### 1. 既存機能の保持

- **すべての既存テストがパスすること**を確認
- UIの見た目や動作に変更がないこと
- パフォーマンスの劣化がないこと

### 2. 段階的な実施

- 1つのリファクタリングごとにコミット
- テストを実行して正常動作を確認
- 問題があれば即座にロールバック可能な状態を保つ

### 3. テストの追加

- 新規作成した関数/コンポーネントにテストを追加
- 既存のテストが不足している場合は追加

### 4. ドキュメントの更新

- JSDocコメントの追加/更新
- README.mdのプロジェクト構造を更新
- この計画書に実施結果を記録

---

## 📝 リファクタリング実施チェックリスト

### 事前準備

- [ ] 現在のコードベースのバックアップ
- [ ] すべてのテストがパスすることを確認
- [ ] リントエラーがないことを確認
- [ ] ビルドが成功することを確認

### フェーズ1: 重複コードの削除

- [ ] `src/lib/exchangeRate.ts` 作成
- [ ] 為替レート取得ロジックを統一
- [ ] `src/lib/dividendCalculator.ts` 拡張
- [ ] 配当金集計関数の追加
- [ ] `src/app/components/LoadingState.tsx` 作成
- [ ] ローディング/エラー画面の共通化
- [ ] テスト実行・確認

### フェーズ2: コンポーネント化

- [ ] `src/app/components/PageLayout.tsx` 作成
- [ ] ページレイアウトの共通化
- [ ] `src/app/components/ExchangeRateInput.tsx` 作成
- [ ] 為替レート入力の共通化
- [ ] `src/app/components/DividendTooltip.tsx` 作成
- [ ] カスタムツールチップの共通化
- [ ] テスト実行・確認

### フェーズ3: コード品質向上

- [ ] `src/lib/constants.ts` 作成
- [ ] マジックナンバーの定数化
- [ ] `src/types/dividend.ts` 拡張
- [ ] 新しい型定義の追加
- [ ] テスト実行・確認

### 最終確認

- [ ] すべてのテストがパスすることを確認
- [ ] リントエラーがないことを確認
- [ ] ビルドが成功することを確認
- [ ] 実際にアプリを起動して動作確認
- [ ] パフォーマンスの確認
- [ ] ドキュメントの更新

---

## 🔄 継続的改善のための推奨事項

リファクタリング後も以下の点に注意してコード品質を維持します:

1. **コードレビュー時のチェック項目**
   - 重複コードの混入チェック
   - 共通化可能なロジックの検討
   - マジックナンバーの使用チェック

2. **定期的な見直し**
   - 3ヶ月ごとにコードベースのレビュー
   - 新しいリファクタリング機会の発見
   - 技術的負債の管理

3. **テストカバレッジの向上**
   - 新規コードは常にテストを追加
   - カバレッジ目標: 80%以上を維持

4. **ドキュメントの継続的更新**
   - コード変更時は必ずドキュメントも更新
   - アーキテクチャ図の作成と更新

---

## 📚 参考資料

- [Martin Fowler - Refactoring](https://refactoring.com/)
- [React Clean Code](https://github.com/ryanmcdermott/clean-code-javascript)
- [TypeScript Best Practices](https://typescript-cheatsheets.vercel.app/)

---

**作成日**: 2026年2月7日  
**最終更新**: 2026年2月7日  
**作成者**: GitHub Copilot
