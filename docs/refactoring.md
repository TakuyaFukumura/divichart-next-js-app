# リファクタリング検討資料

## 📋 このドキュメントについて

本ドキュメントは、divichart-next-js-app のコードベース全体を分析し、リファクタリングの実施判断と具体的な計画をまとめたものです。

**作成日**: 2026年2月7日  
**最終更新**: 2026年2月12日  
**ステータス**: レビュー待ち

---

## 目次

1. [調査結果サマリー](#調査結果サマリー)
2. [リファクタリングの必要性と判断](#リファクタリングの必要性と判断)
3. [詳細な実施計画](#詳細な実施計画)
4. [意思決定ガイド](#意思決定ガイド)
5. [実施チェックリスト](#実施チェックリスト)

---

## 調査結果サマリー

### 📊 調査概要

- **調査日**: 2026年2月7日
- **分析対象ファイル数**: 17ファイル (TypeScript/TSX)
- **総コード行数**: 約1,709行
- **検出された重複パターン**: 8件
- **推奨リファクタリング項目**: 8件

### 現状評価

| 項目        | 評価        | 詳細                     |
|-----------|-----------|------------------------|
| **コード品質** | 🟢 良好     | ESLint・TypeScriptエラーなし |
| **テスト**   | 🟢 良好     | 107個すべてパス              |
| **ビルド**   | 🟢 良好     | エラーなし                  |
| **重複コード** | 🟡 改善余地あり | 8箇所の重複を検出              |
| **保守性**   | 🟡 改善余地あり | 共通化可能な箇所が複数            |

### 🎯 リファクタリングの目的

1. **コードの重複削減** (DRY原則の適用)
2. **保守性の向上** (変更時の影響範囲の縮小)
3. **テスタビリティの向上** (単体テストの容易化)
4. **一貫性の確保** (UIとロジックの統一)
5. **可読性の向上** (コードの理解しやすさ)

---

## リファクタリングの必要性と判断

### 結論

**現時点でのコードベースは機能的には問題ありませんが、将来の保守性とスケーラビリティの観点からリファクタリングを推奨します。
** ✅

### 必要性の根拠

1. **技術的負債の蓄積防止**
    - 現時点では管理可能な範囲
    - 早期対応により将来的なコスト削減

2. **コスト対効果が高い**
    - 約10時間の投資で長期的な保守性向上
    - チーム開発の効率化

3. **リスクが低い**
    - テストカバレッジがある
    - 既存機能への影響が限定的
    - 段階的実施が可能

4. **将来の拡張に備える**
    - 新機能追加が容易になる
    - スケーラビリティの向上

### 期待される改善効果

#### 定量的効果

| 指標      | 現状     | 改善後     | 削減率  |
|---------|--------|---------|------|
| 総コード行数  | 1,709行 | 約1,500行 | 約12% |
| 重複コード箇所 | 8箇所    | 0箇所     | 100% |
| 平均関数サイズ | -      | 30%削減   | 30%  |

#### 定性的効果

- ✅ **保守性の向上**: 変更時の影響範囲が明確、バグ修正が1箇所で完結
- ✅ **テスタビリティの向上**: 単体テスト可能な構造、小さな関数単位でテスト可能
- ✅ **可読性の向上**: 関数名で処理内容が理解可能、マジックナンバーの排除
- ✅ **チーム開発の効率化**: コードレビューが容易、新メンバーのオンボーディングが簡単

### ⏱️ 総工数見積もり

| フェーズ   | 内容               | 工数               |
|--------|------------------|------------------|
| フェーズ1  | 重複コードの削除（優先度: 高） | 約4時間             |
| フェーズ2  | コンポーネント化（優先度: 中） | 約3.75時間          |
| フェーズ3  | コード品質向上（優先度: 低）  | 約2.25時間          |
| **合計** |                  | **約10時間 (2-3日)** |

### 💰 コスト分析

#### リファクタリング実施のコスト

```
初期投資: 約10時間
効果が出始めるまで: 即時
投資回収期間: 約1-2ヶ月
```

#### リファクタリング未実施のコスト

```
現在: 0時間
6ヶ月後: 追加保守コスト +20%
1年後: 追加保守コスト +50%
2年後: 大規模リファクタリング必要 (約40-60時間)
```

---

## 詳細な実施計画

### 🔴 フェーズ1: 重複コードの削除（優先度: 高）

**想定工数**: 約4時間

#### 1. 為替レート設定の重複削除

**工数**: 45分

##### 📍 問題箇所

以下の3ファイルで全く同じコードが繰り返されています:

- `src/app/page.tsx` (19-25行目)
- `src/app/cumulative/page.tsx` (8-14行目)
- `src/app/portfolio/page.tsx` (12-17行目)

##### ❌ 現状のコード

```typescript
const DEFAULT_USD_TO_JPY_RATE = 150;
const envRate = process.env.NEXT_PUBLIC_USD_TO_JPY_RATE
    ? Number(process.env.NEXT_PUBLIC_USD_TO_JPY_RATE)
    : NaN;
const USD_TO_JPY_RATE = !isNaN(envRate) && envRate > 0 ? envRate : DEFAULT_USD_TO_JPY_RATE;
```

##### ✅ 推奨される改善案

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

const USD_TO_JPY_RATE = getUsdToJpyRate();
```

##### 📈 期待される効果

- **コード削減**: 約12行 (4行 × 3ファイル)
- **保守性**: 為替レート取得ロジックの変更が1箇所で完結
- **テスタビリティ**: 為替レート取得ロジックを単体テスト可能
- **バグ防止**: ロジックの不整合によるバグを防止

---

#### 2. 配当金集計ロジックの共通化

**工数**: 2.5時間

##### 📍 問題箇所

配当金の集計処理が以下の2ファイルで重複しています:

- `src/app/page.tsx` (56-93行目) - `calculateDividendData` 関数
- `src/app/cumulative/page.tsx` (45-89行目) - `calculateCumulativeDividendData` 関数

##### ❌ 現状の問題

両ファイルで以下の処理が重複:

1. CSVデータのループ処理
2. 日付から年の抽出
3. 金額文字列のパース (カンマ除去、"-"の処理)
4. USドル→円の換算
5. 年別の集計

##### ✅ 推奨される改善案

**`src/lib/dividendCalculator.ts` に以下の関数を追加**:

```typescript
/**
 * CSVデータから年別配当金を集計
 * 
 * @param csvData - CSVファイルから読み込んだ配当データ
 * @param exchangeRate - USドル→円の為替レート
 * @returns 年をキー、配当金合計を値とするMap
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
 * 年別配当金データをグラフ用に整形
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

##### 📈 期待される効果

- **コード削減**: 約60行 (重複ロジックの統合)
- **保守性**: 配当金計算ロジックの変更が1箇所で完結
- **テスタビリティ**: 各関数を個別にテスト可能
- **バグ防止**: 計算ロジックの不整合によるバグを防止
- **可読性**: 関数が小さく分割され、責務が明確

---

#### 3. ローディング・エラー画面コンポーネントの統一

**工数**: 1時間

##### 📍 問題箇所

以下の3ファイルで全く同じローディング・エラー画面が繰り返されています:

- `src/app/page.tsx` (104-124行目)
- `src/app/cumulative/page.tsx` (99-120行目)
- `src/app/portfolio/page.tsx` (85-106行目)

##### ✅ 推奨される改善案

**新規ファイル作成**: `src/app/components/LoadingState.tsx`

```typescript
'use client';

/**
 * ローディング画面コンポーネント
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

##### 📈 期待される効果

- **コード削減**: 約60行 (20行 × 3ファイル → 30行の共通コンポーネント)
- **UI一貫性**: 全ページで同じローディング体験
- **デザイン変更**: 1箇所の修正で全ページに反映
- **保守性**: ローディング状態の管理が容易

---

### 🟡 フェーズ2: コンポーネント化（優先度: 中）

**想定工数**: 約3.75時間

#### 4. ページレイアウトコンポーネントの共通化

**工数**: 1.5時間

##### ✅ 推奨される改善案

**新規ファイル作成**: `src/app/components/PageLayout.tsx`

```typescript
'use client';

/**
 * ページレイアウトコンポーネント
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

##### 📈 期待される効果

- **コード削減**: 約30行
- **デザイン統一**: 全ページで一貫したレイアウト
- **保守性**: レイアウト変更が1箇所で完結

---

#### 5. 為替レート入力コンポーネントの共通化

**工数**: 1.5時間

##### ✅ 推奨される改善案

**新規ファイル作成**: `src/app/components/ExchangeRateInput.tsx`

```typescript
'use client';

/**
 * 為替レート入力コンポーネント
 */
export function ExchangeRateInput({
    value,
    onChange,
}: {
    value: number;
    onChange: (rate: number) => void;
}) {
    // 実装詳細は省略
}
```

##### 📈 期待される効果

- **コード削減**: 約50行
- **再利用性**: 他のページでも簡単に使用可能
- **保守性**: 入力ロジックの変更が1箇所で完結

---

#### 6. CustomTooltipコンポーネントの共通化

**工数**: 45分

##### ✅ 推奨される改善案

**新規ファイル作成**: `src/app/components/DividendTooltip.tsx`

カスタムツールチップを共通コンポーネント化

##### 📈 期待される効果

- **コード削減**: 約30行
- **保守性**: ツールチップデザインの変更が容易
- **再利用性**: 他のチャートでも使用可能

---

### 🟢 フェーズ3: コード品質向上（優先度: 低）

**想定工数**: 約2.25時間

#### 7. 定数の統一管理

**工数**: 1.25時間

##### ✅ 推奨される改善案

**新規ファイル作成**: `src/lib/constants.ts`

```typescript
/**
 * アプリケーション全体で使用する定数定義
 */

/** 1年あたりの月数 */
export const MONTHS_PER_YEAR = 12;

/** 円グラフでラベル表示する最小パーセンテージ（%） */
export const MIN_PERCENTAGE_FOR_LABEL = 3;

/** ポートフォリオで個別表示する上位銘柄数 */
export const TOP_STOCKS_COUNT = 10;

// その他の定数
```

##### 📈 期待される効果

- **可読性**: マジックナンバーの意味が明確
- **保守性**: 定数変更が1箇所で完結

---

#### 8. 型定義の拡充

**工数**: 1時間

`src/types/dividend.ts` に追加すべき型定義を追加し、型安全性を向上

---

## 意思決定ガイド

### ⚡ クイック判断ガイド

時間がない場合の簡易判断:

### 🟢 YES - 実施推奨

新機能追加予定またはチーム拡大予定がある

### 🟡 MAYBE - 段階的実施検討

リソースに余裕があり、保守性を向上させたい

### 🔴 NO - 延期

緊急タスクがあり、現状で問題を感じていない

### 📊 意思決定マトリックス

#### シナリオ別推奨アクション

| 状況          | リファクタリング   | 理由            |
|-------------|------------|---------------|
| 新機能追加の予定がある | ✅ **強く推奨** | 追加前にベースを整えるべき |
| チーム規模が拡大予定  | ✅ **強く推奨** | コードの理解しやすさが重要 |
| 保守フェーズに入る   | ✅ 推奨       | 保守コスト削減のため    |
| 緊急の機能追加がある  | ⚠️ 延期検討    | まず機能追加を優先     |
| リソースが限られている | ⚠️ 段階的実施   | フェーズ1のみでも効果あり |
| プロジェクト終了予定  | ❌ 不要       | 投資対効果が低い      |

### 🎯 推奨判断基準

#### YES (実施推奨) の場合

以下の**いずれか1つ**に該当する場合は実施を推奨:

- [ ] 今後6ヶ月以内に新機能追加の予定がある
- [ ] チームメンバーが増える予定がある
- [ ] 保守フェーズに移行する予定がある
- [ ] コードの重複に起因する問題が発生している
- [ ] テストカバレッジを向上させたい
- [ ] 開発速度を向上させたい

#### NO (延期検討) の場合

以下の**すべて**に該当する場合は延期を検討:

- [ ] 緊急度の高い機能追加がある
- [ ] リソースが極めて限られている
- [ ] プロジェクトが近日中に終了予定
- [ ] 現状で特に問題を感じていない

### 実施方針の選択

#### オプションA: 全面実施

- 10時間を投資して全項目を実施
- 2-3日で完了
- 最大限の効果

#### オプションB: 段階的実施

- フェーズ1 (4時間) のみ実施
- 効果を確認してから次のステップを判断
- リスク最小化

#### オプションC: 延期

- 現状維持
- コーディング規約で対応
- 定期的な見直しを実施

---

## 実施チェックリスト

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
- 実施結果の記録

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

## 🚀 次のアクション

### 即座に実施可能

以下の項目は即座に着手可能です：

1. ✅ **為替レート設定の統一** (45分)
    - 最も効果が高く、リスクが低い
    - 他の改善の基盤となる

2. ✅ **ローディング画面の共通化** (1時間)
    - UIの一貫性向上
    - 実装が簡単

### 実施する場合

1. このIssueにコメントで承認
2. 実施スケジュールを決定
3. 新しいIssueまたはブランチを作成
4. フェーズ1から順次実施

### 実施しない場合

1. このIssueにコメントで理由を記録
2. 代替案 (コーディング規約など) を検討
3. 次回見直し時期を設定 (3ヶ月後など)

### 判断を保留する場合

1. 追加で必要な情報を特定
2. 関係者とのミーティングを設定
3. 期限を設けて再検討

---

## 📚 参考資料

- [Martin Fowler - Refactoring](https://refactoring.com/)
- [React Clean Code](https://github.com/ryanmcdermott/clean-code-javascript)
- [TypeScript Best Practices](https://typescript-cheatsheets.vercel.app/)

---

## 📌 まとめ

### リファクタリングの必要性: ✅ あり

現在のコードベースは以下の理由により、リファクタリングを推奨します：

1. **コードの重複が複数箇所に存在** → 保守性の低下リスク
2. **工数対効果が高い** → 約10時間で大幅な改善
3. **リスクが低い** → テストとビルドが正常に機能
4. **将来の拡張性向上** → 新機能追加の基盤作り

### 推奨実施プラン

**段階的アプローチ** を推奨します：

1. **優先度: 高**の項目から着手 (フェーズ1: 約4時間)
2. 実施後に効果を確認し、フェーズ2以降を検討
3. 各フェーズ完了後にテスト・ビルドを確認
4. 全フェーズ実施で約10時間 (2-3日)

このリファクタリングにより、コードの保守性、テスタビリティ、可読性が大幅に向上し、将来の開発効率が改善されることが期待されます。
