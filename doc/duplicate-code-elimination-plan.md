# 重複コード解消計画書

## 📋 概要

本ドキュメントは、divichart-next-js-app プロジェクトにおける重複コードを特定し、解消するための実装計画を記載したものです。既存の[リファクタリング計画書](./refactoring-plan.md)を参考に、重複コードの解消に主眼を置いて実装を進めます。

## 🎯 目的

1. **DRY原則の適用**: 同じコードの繰り返しを排除する
2. **保守性の向上**: 変更時の影響範囲を最小化する
3. **バグ防止**: ロジックの不整合によるバグを防止する
4. **テスタビリティの向上**: 単体テストが可能な小さな関数に分割する

## 📊 重複コード分析結果

### 調査概要

- **調査日**: 2026年2月9日
- **分析対象**: src/app/page.tsx, src/app/cumulative/page.tsx, src/app/portfolio/page.tsx
- **検出された重複**: 5つの主要なパターン

### 重複パターンの詳細

#### 1. 為替レート設定 (最優先)

**重複箇所**: 
- `src/app/page.tsx` (20-26行目)
- `src/app/cumulative/page.tsx` (9-15行目)
- `src/app/portfolio/page.tsx` (12-17行目)

**重複コード**:
```typescript
const DEFAULT_USD_TO_JPY_RATE = 150;
const envRate = process.env.NEXT_PUBLIC_USD_TO_JPY_RATE
    ? Number(process.env.NEXT_PUBLIC_USD_TO_JPY_RATE)
    : NaN;
const USD_TO_JPY_RATE = !isNaN(envRate) && envRate > 0 ? envRate : DEFAULT_USD_TO_JPY_RATE;
```

**影響**: 各ファイルで6行 × 3ファイル = 18行の重複

#### 2. ローディング画面 (高優先度)

**重複箇所**:
- `src/app/page.tsx` (104-114行目)
- `src/app/cumulative/page.tsx` (100-109行目)
- `src/app/portfolio/page.tsx` (85-94行目)

**重複コード**:
```typescript
if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">読み込み中...</span>
            </div>
        </div>
    );
}
```

**影響**: 各ファイルで11行 × 3ファイル = 33行の重複

#### 3. エラー画面 (高優先度)

**重複箇所**:
- `src/app/page.tsx` (116-125行目)
- `src/app/cumulative/page.tsx` (112-120行目)
- `src/app/portfolio/page.tsx` (97-106行目)

**重複コード**:
```typescript
if (error) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                エラー: {error}
            </div>
        </div>
    );
}
```

**影響**: 各ファイルで10行 × 3ファイル = 30行の重複

#### 4. 配当金集計ロジック (高優先度)

**重複箇所**:
- `src/app/page.tsx` (57-94行目) - `calculateDividendData` 関数
- `src/app/cumulative/page.tsx` (46-90行目) - `calculateCumulativeDividendData` 関数

**重複する処理**:
- CSVデータのループ処理
- 日付から年の抽出 (`dateStr.split('/')[0]`)
- 金額文字列のパース (カンマ除去、"-"の処理)
- USドル→円の換算
- 年別の集計

**影響**: 約70行の重複ロジック

#### 5. 為替レート入力UI (中優先度)

**重複箇所**:
- `src/app/page.tsx` (163-192行目)
- `src/app/cumulative/page.tsx` (132-161行目)

**重複コード**:
```typescript
<div className="mb-6">
    <label htmlFor="usd-jpy-rate"
           className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        為替レート（1ドル = 円）
    </label>
    <div className="flex items-center gap-4">
        <input
            id="usd-jpy-rate"
            type="number"
            min="1"
            step="0.01"
            value={inputValue}
            onChange={(e) => { /* ... */ }}
            onBlur={() => { /* ... */ }}
            className="..."
        />
        <span className="text-gray-600 dark:text-gray-400">円</span>
    </div>
</div>
```

**影響**: 各ファイルで30行 × 2ファイル = 60行の重複

## 🔧 実装計画

### フェーズ1: 為替レート設定の統一 (最優先)

#### 1.1 新規ファイル作成

**ファイル**: `src/lib/exchangeRate.ts`

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

#### 1.2 テストファイル作成

**ファイル**: `__tests__/src/lib/exchangeRate.test.ts`

```typescript
import { getUsdToJpyRate, DEFAULT_USD_TO_JPY_RATE } from '@/lib/exchangeRate';

describe('exchangeRate', () => {
    const originalEnv = process.env.NEXT_PUBLIC_USD_TO_JPY_RATE;

    afterEach(() => {
        process.env.NEXT_PUBLIC_USD_TO_JPY_RATE = originalEnv;
    });

    it('環境変数が設定されていない場合はデフォルト値を返す', () => {
        delete process.env.NEXT_PUBLIC_USD_TO_JPY_RATE;
        expect(getUsdToJpyRate()).toBe(DEFAULT_USD_TO_JPY_RATE);
    });

    it('環境変数が有効な値の場合はその値を返す', () => {
        process.env.NEXT_PUBLIC_USD_TO_JPY_RATE = '160';
        expect(getUsdToJpyRate()).toBe(160);
    });

    it('環境変数が負の値の場合はデフォルト値を返す', () => {
        process.env.NEXT_PUBLIC_USD_TO_JPY_RATE = '-10';
        expect(getUsdToJpyRate()).toBe(DEFAULT_USD_TO_JPY_RATE);
    });

    it('環境変数が0の場合はデフォルト値を返す', () => {
        process.env.NEXT_PUBLIC_USD_TO_JPY_RATE = '0';
        expect(getUsdToJpyRate()).toBe(DEFAULT_USD_TO_JPY_RATE);
    });

    it('環境変数が数値でない場合はデフォルト値を返す', () => {
        process.env.NEXT_PUBLIC_USD_TO_JPY_RATE = 'invalid';
        expect(getUsdToJpyRate()).toBe(DEFAULT_USD_TO_JPY_RATE);
    });
});
```

#### 1.3 既存ファイルの修正

**対象ファイル**:
- `src/app/page.tsx`
- `src/app/cumulative/page.tsx`
- `src/app/portfolio/page.tsx`

**変更内容**:
```typescript
// Before (削除)
const DEFAULT_USD_TO_JPY_RATE = 150;
const envRate = process.env.NEXT_PUBLIC_USD_TO_JPY_RATE
    ? Number(process.env.NEXT_PUBLIC_USD_TO_JPY_RATE)
    : NaN;
const USD_TO_JPY_RATE = !isNaN(envRate) && envRate > 0 ? envRate : DEFAULT_USD_TO_JPY_RATE;

// After (追加)
import { getUsdToJpyRate } from '@/lib/exchangeRate';
const USD_TO_JPY_RATE = getUsdToJpyRate();
```

**期待効果**:
- コード削減: 18行 → 2行 (16行削減)
- 保守性: 為替レート取得ロジックの変更が1箇所で完結
- テスタビリティ: 単体テスト可能

---

### フェーズ2: ローディング・エラー画面の統一 (高優先度)

#### 2.1 新規ファイル作成

**ファイル**: `src/app/components/LoadingState.tsx`

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

#### 2.2 テストファイル作成

**ファイル**: `__tests__/src/app/components/LoadingState.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { LoadingScreen, ErrorScreen } from '@/app/components/LoadingState';

describe('LoadingState', () => {
    describe('LoadingScreen', () => {
        it('ローディングメッセージを表示する', () => {
            render(<LoadingScreen />);
            expect(screen.getByText('読み込み中...')).toBeInTheDocument();
        });

        it('スピナーを表示する', () => {
            const { container } = render(<LoadingScreen />);
            const spinner = container.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
        });
    });

    describe('ErrorScreen', () => {
        it('エラーメッセージを表示する', () => {
            const errorMessage = 'テストエラー';
            render(<ErrorScreen error={errorMessage} />);
            expect(screen.getByText(`エラー: ${errorMessage}`)).toBeInTheDocument();
        });
    });
});
```

#### 2.3 既存ファイルの修正

**対象ファイル**:
- `src/app/page.tsx`
- `src/app/cumulative/page.tsx`
- `src/app/portfolio/page.tsx`

**変更内容**:
```typescript
// import追加
import { LoadingScreen, ErrorScreen } from '@/app/components/LoadingState';

// Before (削除)
if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen ...">
            <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">読み込み中...</span>
            </div>
        </div>
    );
}

if (error) {
    return (
        <div className="flex items-center justify-center min-h-screen ...">
            <div className="text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                エラー: {error}
            </div>
        </div>
    );
}

// After (追加)
if (loading) return <LoadingScreen />;
if (error) return <ErrorScreen error={error} />;
```

**期待効果**:
- コード削減: 63行 → 約30行 (33行削減)
- UI一貫性: 全ページで同じローディング体験
- 保守性: ローディング状態の管理が容易

---

### フェーズ3: 配当金集計ロジックの共通化 (高優先度)

#### 3.1 既存ファイルの拡張

**ファイル**: `src/lib/dividendCalculator.ts`

**追加する関数**:

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
): Array<{ year: string; totalDividend: number }> {
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
): Array<{ year: string; yearlyDividend: number; cumulativeDividend: number }> {
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

#### 3.2 テストファイルの拡張

**ファイル**: `__tests__/src/lib/dividendCalculator.test.ts`

```typescript
// 既存のテストに追加
describe('aggregateDividendsByYear', () => {
    it('年別に配当金を集計する', () => {
        const csvData = [
            { '入金日': '2024/01/15', '受取通貨': '円', '受取金額[円/現地通貨]': '1000' },
            { '入金日': '2024/06/15', '受取通貨': '円', '受取金額[円/現地通貨]': '2000' },
            { '入金日': '2025/01/15', '受取通貨': '円', '受取金額[円/現地通貨]': '1500' },
        ];
        
        const result = aggregateDividendsByYear(csvData, 150);
        
        expect(result.get('2024')).toBe(3000);
        expect(result.get('2025')).toBe(1500);
    });

    it('USドルを円に換算する', () => {
        const csvData = [
            { '入金日': '2024/01/15', '受取通貨': 'USドル', '受取金額[円/現地通貨]': '10' },
        ];
        
        const result = aggregateDividendsByYear(csvData, 150);
        
        expect(result.get('2024')).toBe(1500);
    });

    it('"-"を0として扱う', () => {
        const csvData = [
            { '入金日': '2024/01/15', '受取通貨': '円', '受取金額[円/現地通貨]': '-' },
        ];
        
        const result = aggregateDividendsByYear(csvData, 150);
        
        expect(result.get('2024')).toBe(0);
    });
});

describe('formatYearlyDividendData', () => {
    it('Mapを配列に変換し年でソートする', () => {
        const map = new Map([
            ['2025', 2000],
            ['2023', 1000],
            ['2024', 1500],
        ]);
        
        const result = formatYearlyDividendData(map);
        
        expect(result).toEqual([
            { year: '2023年', totalDividend: 1000 },
            { year: '2024年', totalDividend: 1500 },
            { year: '2025年', totalDividend: 2000 },
        ]);
    });
});

describe('formatCumulativeDividendData', () => {
    it('累計配当金を計算する', () => {
        const map = new Map([
            ['2023', 1000],
            ['2024', 1500],
            ['2025', 2000],
        ]);
        
        const result = formatCumulativeDividendData(map);
        
        expect(result).toEqual([
            { year: '2023年', yearlyDividend: 1000, cumulativeDividend: 1000 },
            { year: '2024年', yearlyDividend: 1500, cumulativeDividend: 2500 },
            { year: '2025年', yearlyDividend: 2000, cumulativeDividend: 4500 },
        ]);
    });
});
```

#### 3.3 既存ファイルの修正

**ファイル**: `src/app/page.tsx`

```typescript
// import追加
import { aggregateDividendsByYear, formatYearlyDividendData } from '@/lib/dividendCalculator';

// Before (削除: 57-94行目の calculateDividendData 関数全体)

// After (簡潔化)
const calculateDividendData = useCallback((csvData: CSVRow[], exchangeRate: number): DividendData[] => {
    const yearlyDividends = aggregateDividendsByYear(csvData, exchangeRate);
    return formatYearlyDividendData(yearlyDividends);
}, []);
```

**ファイル**: `src/app/cumulative/page.tsx`

```typescript
// import追加
import { aggregateDividendsByYear, formatCumulativeDividendData } from '@/lib/dividendCalculator';

// Before (削除: 46-90行目の calculateCumulativeDividendData 関数全体)

// After (簡潔化)
const calculateCumulativeDividendData = useCallback((csvData: CSVRow[], exchangeRate: number): CumulativeDividendData[] => {
    const yearlyDividends = aggregateDividendsByYear(csvData, exchangeRate);
    return formatCumulativeDividendData(yearlyDividends);
}, []);
```

**期待効果**:
- コード削減: 約70行の重複ロジック削減
- 保守性: 配当金計算ロジックの変更が1箇所で完結
- テスタビリティ: 各関数を個別にテスト可能
- バグ防止: 計算ロジックの不整合によるバグを防止

---

## 📅 実装スケジュール

### タイムライン

| フェーズ | タスク | 所要時間 | 累計 |
|---------|--------|---------|------|
| フェーズ1 | 為替レート設定の統一 | 1時間 | 1時間 |
| フェーズ2 | ローディング・エラー画面の統一 | 1時間 | 2時間 |
| フェーズ3 | 配当金集計ロジックの共通化 | 2時間 | 4時間 |
| テスト | 全体テスト・動作確認 | 1時間 | 5時間 |
| **合計** | | **5時間** | |

### マイルストーン

- ✅ M0: 計画書作成完了
- ⬜ M1: フェーズ1完了 (為替レート設定の統一)
- ⬜ M2: フェーズ2完了 (ローディング・エラー画面の統一)
- ⬜ M3: フェーズ3完了 (配当金集計ロジックの共通化)
- ⬜ M4: 全テストパス・動作確認完了
- ⬜ M5: コードレビュー・マージ完了

---

## ✅ 実装チェックリスト

### 事前準備
- [x] 既存コードの分析完了
- [x] 重複パターンの特定完了
- [x] 実装計画書の作成完了
- [ ] すべてのテストがパスすることを確認
- [ ] リントエラーがないことを確認

### フェーズ1: 為替レート設定の統一
- [ ] `src/lib/exchangeRate.ts` 作成
- [ ] `__tests__/src/lib/exchangeRate.test.ts` 作成
- [ ] テスト実行・パス確認
- [ ] `src/app/page.tsx` 修正
- [ ] `src/app/cumulative/page.tsx` 修正
- [ ] `src/app/portfolio/page.tsx` 修正
- [ ] 全ページの動作確認
- [ ] コミット・プッシュ

### フェーズ2: ローディング・エラー画面の統一
- [ ] `src/app/components/LoadingState.tsx` 作成
- [ ] `__tests__/src/app/components/LoadingState.test.tsx` 作成
- [ ] テスト実行・パス確認
- [ ] `src/app/page.tsx` 修正
- [ ] `src/app/cumulative/page.tsx` 修正
- [ ] `src/app/portfolio/page.tsx` 修正
- [ ] 全ページのローディング・エラー表示確認
- [ ] コミット・プッシュ

### フェーズ3: 配当金集計ロジックの共通化
- [ ] `src/lib/dividendCalculator.ts` に関数追加
- [ ] `__tests__/src/lib/dividendCalculator.test.ts` にテスト追加
- [ ] テスト実行・パス確認
- [ ] `src/app/page.tsx` の `calculateDividendData` 簡潔化
- [ ] `src/app/cumulative/page.tsx` の `calculateCumulativeDividendData` 簡潔化
- [ ] 両ページのグラフ・表示確認
- [ ] コミット・プッシュ

### 最終確認
- [ ] すべてのテストがパスすることを確認
- [ ] `npm run lint` 実行・エラーなし確認
- [ ] `npm run build` 実行・成功確認
- [ ] 開発サーバーで全ページの動作確認
- [ ] コードレビュー実施
- [ ] セキュリティチェック実施
- [ ] ドキュメント更新

---

## 📊 期待される効果

### 定量的効果

| 項目 | Before | After | 削減 |
|------|--------|-------|------|
| 為替レート設定 | 18行 | 2行 | 16行 (89%削減) |
| ローディング・エラー画面 | 63行 | 30行 | 33行 (52%削減) |
| 配当金集計ロジック | 70行重複 | 共通関数化 | 70行削減 |
| **合計** | **151行の重複** | **共通化済み** | **119行削減** |

### 定性的効果

1. **保守性の向上**
   - ロジック変更時の影響範囲が最小化
   - バグ修正が1箇所で完結
   - コードの意図が明確

2. **テスタビリティの向上**
   - 小さな関数単位でテスト可能
   - モックが容易
   - テストカバレッジの向上

3. **可読性の向上**
   - 関数名で処理内容が理解可能
   - ページコンポーネントがシンプルに
   - 責務が明確

4. **バグ防止**
   - ロジックの不整合によるバグを防止
   - 計算ミスのリスク低減
   - 一貫性の確保

---

## 🚨 注意事項

### 実装時の注意点

1. **既存機能の保持**
   - すべての既存テストがパスすること
   - UIの見た目や動作に変更がないこと
   - パフォーマンスの劣化がないこと

2. **段階的な実施**
   - 1つのフェーズごとにコミット
   - テストを実行して正常動作を確認
   - 問題があれば即座にロールバック可能

3. **テストの追加**
   - 新規作成した関数にテストを追加
   - 既存のテストが不足している場合は追加
   - カバレッジが下がらないこと

4. **ファイル末尾の改行**
   - すべての新規・修正ファイルの末尾に改行を追加
   - `.editorconfig` の設定に従う

### ロールバック計画

各フェーズで問題が発生した場合:
1. 該当コミットを特定
2. `git revert` でロールバック
3. 問題を分析し、修正案を検討
4. 再度実装

---

## 📚 参考資料

- [リファクタリング計画書](./refactoring-plan.md) - 全体的なリファクタリング計画
- [リファクタリング検討 - 意思決定ガイド](./refactoring-decision-guide.md) - 実施判断の基準
- [開発者向け仕様書](./developer-specification.md) - プロジェクトの技術仕様

---

**作成日**: 2026年2月9日  
**最終更新**: 2026年2月9日  
**ステータス**: 実装準備完了  
**作成者**: GitHub Copilot
