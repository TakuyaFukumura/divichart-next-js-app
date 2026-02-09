# テーブルデザイン統一化仕様書

## 1. 概要

本ドキュメントでは、divichart-next-js-appアプリケーションにおける3つの画面（年別配当、累計配当、ポートフォリオ）のテーブルデザインを分析し、統一されたデザインを提案します。

### 目的

- 年別配当と累計配当画面のテーブルデザインは共通であるが、ポートフォリオ画面のテーブルデザインが異なっているため統一する
- より良いテーブルデザインを検討し、ユーザビリティとメンテナンス性を向上させる

## 2. 現状分析

### 2.1 年別配当画面（/）

![年別配当テーブル](https://github.com/user-attachments/assets/4cb65a99-c5b3-4c13-a718-32ce2089138e)

#### テーブル構造
- **列数**: 3列
- **列**: 年、税引後配当合計[円]、月平均配当[円]
- **データ配置**: すべて右寄せ

#### デザイン特徴
```tsx
// ヘッダー
className="bg-gray-100 dark:bg-gray-700"
className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"

// ボディ
className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"

// セル
className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-right"
```

**特徴**:
- シンプルな3列構成
- すべてのセルが右寄せ
- ホバー時のハイライト効果あり
- テーブル外枠なし（行間の区切り線のみ）
- フッター行なし

### 2.2 累計配当画面（/cumulative）

![累計配当テーブル](https://github.com/user-attachments/assets/714994cd-7d87-4b44-bd05-8a892a48ddd8)

#### テーブル構造
- **列数**: 3列
- **列**: 年、税引後年間配当[円]、税引後累計配当[円]
- **データ配置**: すべて右寄せ

#### デザイン特徴
```tsx
// ヘッダー
className="bg-gray-100 dark:bg-gray-700"
className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"

// ボディ
className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
className="hover:bg-gray-50 dark:hover:bg-gray-700"

// セル
className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100"

// 外枠
className="border border-gray-200 dark:border-gray-700"
```

**特徴**:
- 年別配当とほぼ同じデザイン
- テーブル外枠あり（border）
- 累計配当額のセルはfont-semiboldで強調
- フッター行なし

### 2.3 ポートフォリオ画面（/portfolio）

![ポートフォリオテーブル](https://github.com/user-attachments/assets/0428201a-0dc0-43e7-b866-19f4b4de2a03)

#### テーブル構造
- **列数**: 4列
- **列**: 銘柄コード、銘柄名、配当金額[円]、割合[%]
- **データ配置**: 混在（コード・名前は左寄せ、金額・割合は右寄せ）

#### デザイン特徴
```tsx
// ヘッダー
className="bg-gray-100 dark:bg-gray-700"
className="px-6 py-3 text-left/text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"

// ボディ - ストライプパターン
getRowBgClass関数により交互の背景色:
- 偶数行: "bg-white dark:bg-gray-800"
- 奇数行: "bg-gray-50 dark:bg-gray-700"
- 「その他」行: "bg-gray-50 dark:bg-gray-700" (固定)

// ホバー効果
className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"

// セル
className="px-6 py-4 whitespace-nowrap text-sm"
// 金額・割合: font-mono（等幅フォント）

// フッター
className="bg-gray-100 dark:bg-gray-700"
// 合計行あり（colSpan=2で2列結合）

// 外枠
className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow"
```

**特徴**:
- 4列構成
- 左寄せ（テキスト）と右寄せ（数値）の混在
- **ストライプパターン**（交互の背景色）
- **フッター行あり**（合計表示）
- 金額と割合に等幅フォント使用
- テーブルコンテナに角丸とシャドウ
- 「その他」行に特別なスタイル（italic、固定背景色）
- ホバー時は青系の色（bg-blue-50）

## 3. デザイン相違点の整理

### 3.1 共通点

| 要素 | 年別配当 | 累計配当 | ポートフォリオ |
|------|---------|---------|---------------|
| ヘッダー背景色 | ✓ | ✓ | ✓ |
| ダークモード対応 | ✓ | ✓ | ✓ |
| ホバー効果 | ✓ | ✓ | ✓ |
| 行区切り線 | ✓ | ✓ | ✓ |
| パディング | ✓ | ✓ | ✓ |

### 3.2 相違点

| 要素 | 年別配当 | 累計配当 | ポートフォリオ |
|------|---------|---------|---------------|
| **テーブル外枠** | なし | あり | コンテナに角丸+シャドウ |
| **ストライプ** | なし | なし | **あり** |
| **フッター行** | なし | なし | **あり（合計）** |
| **テキスト配置** | 全て右寄せ | 全て右寄せ | **混在** |
| **フォント** | 通常 | 通常 | 数値は**等幅** |
| **ホバー色** | gray系 | gray系 | **blue系** |
| **特別行スタイル** | なし | 累計列のみbold | **「その他」行にitalic** |
| **列数** | 3列 | 3列 | **4列** |

## 4. 統一デザイン提案

### 4.1 提案A：ポートフォリオデザインを基準に統一

**方針**: ポートフォリオ画面の洗練されたデザインを基準として、他の画面にも適用する

#### メリット
- ✅ 視覚的に見やすい（ストライプパターン）
- ✅ 合計行により情報が完結
- ✅ 角丸とシャドウでモダンな印象
- ✅ 等幅フォントで数値の桁が揃いやすい

#### デメリット
- ⚠️ シンプルな3列テーブルには過剰な装飾になる可能性
- ⚠️ 合計行が必要ない画面もある（年別・累計は集計値のため）

#### 適用イメージ

**年別配当画面**:
```tsx
// フッター追加
<tfoot className="bg-gray-100 dark:bg-gray-700">
  <tr>
    <td className="px-6 py-4 text-sm font-bold">合計</td>
    <td className="px-6 py-4 text-sm font-bold text-right font-mono">
      ¥{totalAmount.toLocaleString()}
    </td>
    <td className="px-6 py-4 text-sm font-bold text-right font-mono">
      ¥{averageAmount.toLocaleString()}
    </td>
  </tr>
</tfoot>

// ストライプパターン追加
{data.map((row, index) => (
  <tr 
    key={row.year}
    className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'} hover:bg-blue-50 dark:hover:bg-gray-700`}
  >
    ...
  </tr>
))}

// コンテナに角丸とシャドウ
<div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
  <table>...</table>
</div>
```

### 4.2 提案B：シンプルデザインで統一

**方針**: 年別配当・累計配当のシンプルなデザインを基準とし、ポートフォリオもシンプル化

#### メリット
- ✅ 統一感が高い
- ✅ メンテナンスが容易
- ✅ パフォーマンスへの影響が少ない
- ✅ 情報に集中しやすい

#### デメリット
- ⚠️ ポートフォリオの合計行が失われる
- ⚠️ 視覚的な区別がつきにくい（特に長いテーブル）
- ⚠️ 「その他」行の特別扱いが失われる

#### 適用イメージ

**ポートフォリオ画面**:
```tsx
// ストライプパターン削除
{data.map((row) => (
  <tr 
    key={`${row.stockCode}-${row.stockName}`}
    className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
  >
    ...
  </tr>
))}

// フッター削除または簡略化
// 「その他」行の特別スタイル削除
```

### 4.3 提案C：ハイブリッドデザイン（推奨）

**方針**: 各画面の特性を活かしつつ、共通の基準を設ける

#### 基本ルール

1. **共通スタイル要素**
   - ヘッダー: `bg-gray-100 dark:bg-gray-700`
   - パディング: `px-6 py-3` (ヘッダー), `px-6 py-4` (セル)
   - ホバー効果: `hover:bg-gray-50 dark:hover:bg-gray-700`（統一）
   - テーブル外枠: すべて`border border-gray-200 dark:border-gray-700`を追加
   - コンテナ: `overflow-x-auto` のみ（シャドウ・角丸は任意）

2. **数値表示の標準化**
   - すべての金額・数値に等幅フォント(`font-mono`)を適用
   - 右寄せ統一
   - 3桁区切りカンマ表示

3. **画面別カスタマイズ**
   
   | 要素 | 年別配当 | 累計配当 | ポートフォリオ |
   |------|---------|---------|---------------|
   | ストライプ | なし | なし | **あり** |
   | フッター | なし | なし | **あり** |
   | 角丸+シャドウ | なし | なし | **あり** |
   | 特別行スタイル | なし | 累計列bold | 「その他」italic |

#### メリット
- ✅ 各画面の特性を維持
- ✅ 共通部分で統一感を確保
- ✅ ポートフォリオの情報密度に対応（ストライプで見やすさ維持）
- ✅ シンプルな画面は過剰装飾を避ける

#### デメリット
- ⚠️ 完全統一ではないため、多少の差異は残る

#### 適用イメージ

**年別配当画面の変更点**:
```tsx
// 1. テーブル外枠を追加
<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">

// 2. 等幅フォントを追加
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-right font-mono">
  ¥{row.totalDividend.toLocaleString()}
</td>
```

**累計配当画面の変更点**:
```tsx
// 1. 等幅フォントを追加
<td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100 font-mono">
  ¥{item.yearlyDividend.toLocaleString()}
</td>

// 2. ホバー色を統一（既に同じなので変更なし）
```

**ポートフォリオ画面の変更点**:
```tsx
// 1. ホバー色を統一（blue-50 → gray-50）
className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"

// 2. テーブル外枠をシンプルに（角丸・シャドウは維持）
<div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
```

## 5. アクセシビリティとUXの考慮事項

### 5.1 等幅フォントの採用理由

- 数値が桁揃えされ、視覚的に比較しやすい
- 特に金額表示で重要（¥記号の後の数字が整列）
- スクリーンリーダーにも影響しない

### 5.2 ホバー効果の統一

- すべての画面で`gray-50`に統一することで、予測可能なUI
- `blue-50`は強調されすぎる可能性があり、注意を引きすぎる

### 5.3 ストライプパターンの使い分け

- **使用する場合**: 多数の行がある場合（10行以上）
  - ポートフォリオ: ✓（上位10件 + その他 = 11行）
- **使用しない場合**: 行数が少ない場合（10行未満）
  - 年別配当: ✗（通常8行程度）
  - 累計配当: ✗（通常8行程度）

### 5.4 色のコントラスト

現在のカラースキームは十分なコントラストを確保:
- ライトモード: `text-gray-900` on `bg-white` (21:1)
- ダークモード: `text-gray-100` on `bg-gray-800` (14:1)

WCAG 2.1 AAA基準（7:1）を満たしている。

## 6. 実装の優先順位

### フェーズ1: 基本統一（必須）
1. すべてのテーブルに`border`を追加
2. 数値セルに`font-mono`を適用
3. ホバー色を`gray-50`に統一

### フェーズ2: 細部調整（推奨）
1. ポートフォリオのストライプパターンを維持
2. ポートフォリオのフッター行を維持
3. コードの共通化（DividendTableコンポーネントの拡張）

### フェーズ3: 将来的な改善（オプション）
1. テーブルコンポーネントの完全共通化
2. レスポンシブデザインの強化（モバイル対応）
3. ソート機能の追加
4. エクスポート機能の追加

## 7. 推奨デザイン案（最終提案）

**提案C：ハイブリッドデザイン**を推奨します。

### 理由

1. **各画面の特性を尊重**
   - 年別・累計配当: シンプルな集計データ → シンプルなデザイン
   - ポートフォリオ: 詳細な内訳データ → リッチなデザイン（ストライプ、フッター）

2. **統一感と柔軟性のバランス**
   - 共通要素（ヘッダー、パディング、フォント）で統一感
   - 画面特性に応じたカスタマイズで最適なUX

3. **実装コストとメンテナンス性**
   - 最小限の変更で統一感を実現
   - 各画面の特殊要件に柔軟に対応可能

4. **ユーザビリティ**
   - 各画面で最適な情報提示
   - 認知負荷を最小化

## 8. 実装時の注意事項

### 8.1 ダークモード対応

すべての変更でダークモードのクラスも同時に指定:
```tsx
className="border border-gray-200 dark:border-gray-700"
className="hover:bg-gray-50 dark:hover:bg-gray-700"
```

### 8.2 レスポンシブ対応

`overflow-x-auto`により、小さい画面でも横スクロール可能:
```tsx
<div className="overflow-x-auto">
  <table className="min-w-full">
```

### 8.3 パフォーマンス

- ストライプパターンはCSS（奇数・偶数セレクタ）ではなくJavaScriptで実装
- 理由: 条件付きスタイリング（「その他」行など）との整合性

### 8.4 テスト

デザイン変更後、以下をテスト:
- [ ] ライトモード表示
- [ ] ダークモード表示
- [ ] ホバー効果
- [ ] レスポンシブ表示（モバイル、タブレット）
- [ ] スクリーンリーダー対応

## 9. サンプルコード

### 9.1 共通テーブルスタイル定数

```tsx
// src/styles/tableStyles.ts
export const TABLE_STYLES = {
  // 共通スタイル
  container: 'overflow-x-auto',
  table: 'min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700',
  header: {
    row: 'bg-gray-100 dark:bg-gray-700',
    cell: 'px-6 py-3 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider',
    cellRight: 'px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider',
    cellLeft: 'px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider',
  },
  body: {
    row: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
    rowAlt: 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
    cell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300',
    cellRight: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-right font-mono',
    cellLeft: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-left',
  },
  footer: {
    row: 'bg-gray-100 dark:bg-gray-700',
    cell: 'px-6 py-4 text-sm font-bold text-gray-900 dark:text-gray-200',
    cellRight: 'px-6 py-4 text-sm font-bold text-gray-900 dark:text-gray-200 text-right font-mono',
  },
} as const;
```

### 9.2 年別配当画面の改善例

```tsx
import { TABLE_STYLES } from '@/styles/tableStyles';

<div className={TABLE_STYLES.container}>
  <table className={TABLE_STYLES.table}>
    <thead className={TABLE_STYLES.header.row}>
      <tr>
        <th className={TABLE_STYLES.header.cellRight}>年</th>
        <th className={TABLE_STYLES.header.cellRight}>税引後配当合計[円]</th>
        <th className={TABLE_STYLES.header.cellRight}>月平均配当[円]</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {data.map((row) => (
        <tr key={row.year} className={TABLE_STYLES.body.row}>
          <td className={TABLE_STYLES.body.cell + ' text-right'}>
            {row.year}
          </td>
          <td className={TABLE_STYLES.body.cellRight}>
            ¥{row.totalDividend.toLocaleString()}
          </td>
          <td className={TABLE_STYLES.body.cellRight}>
            ¥{Math.floor(row.totalDividend / 12).toLocaleString()}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### 9.3 ポートフォリオ画面の改善例

```tsx
import { TABLE_STYLES } from '@/styles/tableStyles';

// ストライプパターン判定関数（改善版）
const getRowClassName = (row: StockDividend, index: number) => {
  if (row.stockName === 'その他') {
    return TABLE_STYLES.body.rowAlt; // 特別行
  }
  return index % 2 === 0 ? TABLE_STYLES.body.row : TABLE_STYLES.body.rowAlt;
};

<div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
  <table className={TABLE_STYLES.table}>
    <thead className={TABLE_STYLES.header.row}>
      <tr>
        <th className={TABLE_STYLES.header.cellLeft}>銘柄コード</th>
        <th className={TABLE_STYLES.header.cellLeft}>銘柄名</th>
        <th className={TABLE_STYLES.header.cellRight}>配当金額[円]</th>
        <th className={TABLE_STYLES.header.cellRight}>割合[%]</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {data.map((row, index) => (
        <tr key={`${row.stockCode}-${row.stockName}`} className={getRowClassName(row, index)}>
          <td className={TABLE_STYLES.body.cellLeft + (row.stockName === 'その他' ? ' italic' : '')}>
            {row.stockCode || '-'}
          </td>
          <td className={TABLE_STYLES.body.cellLeft + (row.stockName === 'その他' ? ' italic font-medium' : '')}>
            {row.stockName}
          </td>
          <td className={TABLE_STYLES.body.cellRight}>
            ¥{row.amount.toLocaleString()}
          </td>
          <td className={TABLE_STYLES.body.cellRight}>
            {row.percentage.toFixed(1)}%
          </td>
        </tr>
      ))}
    </tbody>
    <tfoot className={TABLE_STYLES.footer.row}>
      <tr>
        <td className={TABLE_STYLES.footer.cell} colSpan={2}>合計</td>
        <td className={TABLE_STYLES.footer.cellRight}>
          ¥{data.reduce((sum, row) => sum + row.amount, 0).toLocaleString()}
        </td>
        <td className={TABLE_STYLES.footer.cellRight}>
          {data.reduce((sum, row) => sum + row.percentage, 0).toFixed(1)}%
        </td>
      </tr>
    </tfoot>
  </table>
</div>
```

## 10. まとめ

### 統一方針

**提案C：ハイブリッドデザイン**を採用し、以下の方針で統一します：

1. **共通基準の設定**
   - テーブル外枠: すべてborder追加
   - 数値フォント: すべて等幅フォント
   - ホバー色: すべてgray-50系に統一

2. **画面特性の尊重**
   - ポートフォリオ: ストライプ・フッター・角丸シャドウを維持
   - 年別・累計: シンプルなデザインを維持

3. **段階的実装**
   - フェーズ1: 基本統一（必須）
   - フェーズ2: 細部調整（推奨）
   - フェーズ3: 将来的な改善（オプション）

### 期待される効果

- **統一感の向上**: 共通要素により一貫したUI/UX
- **メンテナンス性の向上**: スタイル定数の共通化
- **ユーザビリティの向上**: 各画面に最適化されたデザイン
- **アクセシビリティの維持**: WCAG基準を満たすコントラスト

### 次のステップ

1. 本仕様書のレビューと承認
2. 実装タスクの作成
3. フェーズ1の実装と検証
4. フェーズ2以降の計画

---

**作成日**: 2026-02-09  
**バージョン**: 1.0  
**作成者**: GitHub Copilot
