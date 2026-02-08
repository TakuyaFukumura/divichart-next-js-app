# 配当ポートフォリオ円グラフ 銘柄コード表示改善仕様書

## 1. ドキュメント情報

- **作成日**: 2026年2月8日
- **ドキュメント種別**: 機能改善仕様書
- **対象機能**: 配当ポートフォリオ画面の円グラフ表示
- **対象読者**: 開発者、レビュアー、プロジェクト関係者
- **関連ドキュメント**:
    - [developer-specification.md](./developer-specification.md)
    - [mobile-pie-chart-specification.md](./mobile-pie-chart-specification.md)

---

## 2. 概要

### 2.1 目的

配当ポートフォリオ画面（`/portfolio`）の円グラフで、銘柄名の代わりに銘柄コードを使用することで、表示の見やすさを改善する。

### 2.2 背景

- 現在の円グラフでは、銘柄名（例: "VA L-TERM BOND"）を表示に使用している
- 銘柄名は文字数が多く、円グラフのラベルや凡例で表示する際に以下の問題が発生している：
  - ラベルが長すぎて見づらい
  - ラベルが重なって読みにくい
  - 凡例が縦に長くなりすぎる
- 銘柄コード（例: "BLV"）を使用することで、より簡潔で見やすい表示が可能になる

### 2.3 対象範囲

- **対象画面**: 配当ポートフォリオ画面（`/portfolio`）
- **対象コンポーネント**: 
  - `DividendPieChart.tsx` - 円グラフコンポーネント
  - `DividendTable.tsx` - 配当テーブルコンポーネント（検討事項）
- **対象デバイス**: 全デバイス（デスクトップ、タブレット、スマートフォン）

---

## 3. 現状分析

### 3.1 現在の実装

#### データ構造

```typescript
// src/types/dividend.ts
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
```

#### 円グラフでの表示箇所

**DividendPieChart.tsx（59-64行目）**

```tsx
const chartData = data.map((item, index) => ({
    name: item.stockName,  // ← 現在は銘柄名を使用
    value: item.amount,
    percentage: item.percentage,
    fill: item.color || COLORS[index % COLORS.length],
}));
```

**カスタムラベルでの表示（111行目）**

```tsx
{`${entry.name} ${entry.percentage.toFixed(1)}%`}
```

**カスタムツールチップでの表示（31行目）**

```tsx
<p className="text-gray-800 dark:text-gray-200 font-semibold">
    {payload[0].name}
</p>
```

### 3.2 データ分析

#### CSVデータの銘柄コード列

CSVファイルには「銘柄コード」列が存在し、以下のようなデータが格納されている：

```csv
入金日,商品,口座,銘柄コード,銘柄,受取通貨,...
"2026/02/06","米国株式","旧NISA","BLV","VA L-TERM BOND","USドル",...
"2026/02/06","米国株式","旧NISA","VCLT","VA L-TERM CORPBD","USドル",...
```

#### 銘柄コードの特徴

- **形式**: 2～5文字程度の英数字（ティッカーシンボル）
- **例**: `BLV`, `VCLT`, `VOO`, `VTI`
- **メリット**:
  - 簡潔で一意性が高い
  - 国際的に認識されている標準形式
  - 文字数が少ないため表示スペースを節約できる

#### 銘柄コードが存在しないケース

- データソースによっては銘柄コードが空文字列の場合がある
- 「その他」カテゴリは銘柄コードなし（空文字列）として集約される

### 3.3 問題点の詳細

#### 問題1: 銘柄名の文字数が多すぎる

**具体例**

| 銘柄コード | 銘柄名 | 文字数 |
|------|-----|-----|
| BLV | VA L-TERM BOND | 14文字 |
| VCLT | VA L-TERM CORPBD | 16文字 |
| VOO | VANGUARD S&P 500 | 16文字 |

- 円グラフのラベルに表示すると、テキストが長くなり視認性が低下
- 凡例が縦に長くなり、画面スペースを圧迫

#### 問題2: ラベルの重なりや可読性の低下

- 文字数が多いため、3%以上の割合でもラベルが円グラフ内に収まらないことがある
- モバイル画面では特に顕著

#### 問題3: 国際的な標準からの乖離

- 金融業界では銘柄コード（ティッカーシンボル）での表示が一般的
- 銘柄名での表示は、専門的な投資分析ツールとしての使いやすさを損なう

---

## 4. 提案する改善案

### 4.1 基本方針

1. **円グラフとツールチップでは銘柄コードを優先的に使用する**
   - 銘柄コードが存在する場合: 銘柄コードを表示
   - 銘柄コードが存在しない場合: 銘柄名を表示

2. **ツールチップでは詳細情報を提供する**
   - 銘柄コード（または銘柄名）
   - 銘柄名（銘柄コードを表示した場合のみ）
   - 金額
   - 割合

3. **凡例（Legend）の表示を改善する**
   - 銘柄コードを表示
   - 必要に応じて銘柄名も括弧書きで表示（オプション）

### 4.2 実装詳細

#### 4.2.1 データ変換ロジックの修正

**変更対象**: `DividendPieChart.tsx`（59-64行目）

**変更前**

```tsx
const chartData = data.map((item, index) => ({
    name: item.stockName,
    value: item.amount,
    percentage: item.percentage,
    fill: item.color || COLORS[index % COLORS.length],
}));
```

**変更後**

```tsx
const chartData = data.map((item, index) => ({
    // 銘柄コードが存在する場合は銘柄コード、なければ銘柄名を使用
    name: item.stockCode || item.stockName,
    // ツールチップで詳細情報を表示するために、両方の情報を保持
    stockCode: item.stockCode,
    stockName: item.stockName,
    value: item.amount,
    percentage: item.percentage,
    fill: item.color || COLORS[index % COLORS.length],
}));
```

#### 4.2.2 カスタムツールチップの改善

**変更対象**: `CustomTooltip`コンポーネント（25-43行目）

**変更前**

```tsx
interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        payload: { percentage: number };
    }>;
}

export const CustomTooltip = ({active, payload}: CustomTooltipProps) => {
    if (active && payload?.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
                <p className="text-gray-800 dark:text-gray-200 font-semibold">
                    {payload[0].name}
                </p>
                <p className="text-blue-600 dark:text-blue-400">
                    金額: ¥{payload[0].value.toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                    割合: {payload[0].payload.percentage.toFixed(1)}%
                </p>
            </div>
        );
    }
    return null;
};
```

**変更後**

```tsx
interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        payload: {
            percentage: number;
            stockCode: string;
            stockName: string;
        };
    }>;
}

export const CustomTooltip = ({active, payload}: CustomTooltipProps) => {
    if (active && payload?.length) {
        const data = payload[0];
        const { stockCode, stockName } = data.payload;
        
        // 銘柄コードが存在する場合は、銘柄コードと銘柄名の両方を表示
        // 銘柄コードが存在しない場合は、銘柄名のみを表示
        const displayTitle = stockCode 
            ? `${stockCode} - ${stockName}`
            : stockName;
        
        return (
            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
                <p className="text-gray-800 dark:text-gray-200 font-semibold">
                    {displayTitle}
                </p>
                <p className="text-blue-600 dark:text-blue-400">
                    金額: ¥{data.value.toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                    割合: {data.payload.percentage.toFixed(1)}%
                </p>
            </div>
        );
    }
    return null;
};
```

#### 4.2.3 カスタムラベルの変更

**変更対象**: `renderLabel`関数（111行目）

**変更前**

```tsx
{`${entry.name} ${entry.percentage.toFixed(1)}%`}
```

**変更後**

```tsx
{`${entry.name} ${entry.percentage.toFixed(1)}%`}
```

※ `entry.name`は既に銘柄コード（または銘柄名）を含むため、変更不要

### 4.3 表示例の比較

#### 変更前

**円グラフラベル**
```
VA L-TERM BOND 15.2%
VA L-TERM CORPBD 12.8%
```

**ツールチップ**
```
VA L-TERM BOND
金額: ¥45,600
割合: 15.2%
```

**凡例**
```
■ VA L-TERM BOND
■ VA L-TERM CORPBD
■ VANGUARD S&P 500
```

#### 変更後

**円グラフラベル**
```
BLV 15.2%
VCLT 12.8%
```

**ツールチップ**
```
BLV - VA L-TERM BOND
金額: ¥45,600
割合: 15.2%
```

**凡例**
```
■ BLV
■ VCLT
■ VOO
```

### 4.4 エッジケースの処理

#### ケース1: 銘柄コードが空文字列の場合

**データ例**
```typescript
{
    stockCode: "",
    stockName: "その他",
    amount: 12000,
    percentage: 5.2
}
```

**表示**
- 円グラフラベル: `その他 5.2%`
- ツールチップ: `その他`（銘柄名のみ）
- 凡例: `その他`

#### ケース2: 銘柄コードと銘柄名が同じ場合

**データ例**
```typescript
{
    stockCode: "AAPL",
    stockName: "AAPL",
    amount: 50000,
    percentage: 10.5
}
```

**表示**
- 円グラフラベル: `AAPL 10.5%`
- ツールチップ: `AAPL - AAPL`（重複するが問題なし）
- 凡例: `AAPL`

---

## 5. 実装計画

### 5.1 実装範囲

#### フェーズ1: 円グラフコンポーネントの修正（必須）

- [x] `DividendPieChart.tsx`の修正
  - [x] データ変換ロジックの更新
  - [x] カスタムツールチップの改善
  - [x] 型定義の更新

#### フェーズ2: テストの追加・修正（必須）

- [ ] 単体テストの追加
  - [ ] 銘柄コードが存在する場合のテスト
  - [ ] 銘柄コードが存在しない場合のテスト
  - [ ] ツールチップの表示内容テスト

#### フェーズ3: 動作確認（必須）

- [ ] ブラウザでの表示確認
  - [ ] デスクトップ画面
  - [ ] タブレット画面
  - [ ] モバイル画面
- [ ] スクリーンショットの取得

### 5.2 実装手順

1. **事前準備**
   - 現状のコードをバックアップ（Gitで管理されているため不要）
   - 既存のテストを実行して現状を確認

2. **コード修正**
   - `DividendPieChart.tsx`のデータ変換ロジックを修正
   - `CustomTooltip`コンポーネントを修正
   - 型定義を更新

3. **テスト実装**
   - `__tests__/src/app/components/DividendPieChart.test.tsx`を作成または修正
   - 銘柄コード表示のテストケースを追加

4. **動作確認**
   - ローカル開発サーバーで動作確認
   - 各画面サイズでの表示確認

5. **ドキュメント更新**
   - README.mdの更新（必要に応じて）
   - この仕様書の更新（実装後の振り返り）

### 5.3 変更ファイル一覧

| ファイルパス | 変更種別 | 変更内容 |
|--------|------|------|
| `src/app/components/DividendPieChart.tsx` | 修正 | データ変換とツールチップの改善 |
| `__tests__/src/app/components/DividendPieChart.test.tsx` | 新規/修正 | 単体テストの追加 |
| `doc/stock-code-display-specification.md` | 新規 | この仕様書 |

---

## 6. テスト計画

### 6.1 単体テスト

#### テストケース1: 銘柄コードが存在する場合

**テストデータ**
```typescript
const testData: StockDividend[] = [
    {
        stockCode: 'BLV',
        stockName: 'VA L-TERM BOND',
        amount: 50000,
        percentage: 25.0,
    },
];
```

**検証項目**
- [ ] 円グラフに「BLV」が表示される
- [ ] 銘柄名「VA L-TERM BOND」は円グラフのラベルには表示されない
- [ ] ツールチップに「BLV - VA L-TERM BOND」が表示される

#### テストケース2: 銘柄コードが存在しない場合

**テストデータ**
```typescript
const testData: StockDividend[] = [
    {
        stockCode: '',
        stockName: 'その他',
        amount: 10000,
        percentage: 5.0,
    },
];
```

**検証項目**
- [ ] 円グラフに「その他」が表示される
- [ ] ツールチップに「その他」のみが表示される（銘柄コード部分がない）

#### テストケース3: 混在データ

**テストデータ**
```typescript
const testData: StockDividend[] = [
    {
        stockCode: 'BLV',
        stockName: 'VA L-TERM BOND',
        amount: 50000,
        percentage: 50.0,
    },
    {
        stockCode: '',
        stockName: 'その他',
        amount: 50000,
        percentage: 50.0,
    },
];
```

**検証項目**
- [ ] 銘柄コードがある銘柄は「BLV」として表示される
- [ ] 銘柄コードがない銘柄は「その他」として表示される
- [ ] 両方の凡例が正しく表示される

### 6.2 統合テスト

#### テストシナリオ1: ポートフォリオページの表示

**前提条件**
- CSVデータが正常に読み込まれている
- 銘柄コードと銘柄名の両方が存在するデータが含まれている

**操作手順**
1. `/portfolio`ページにアクセス
2. 円グラフが表示されることを確認
3. 円グラフのラベルを確認
4. 円グラフのセグメントにマウスオーバー
5. ツールチップの内容を確認
6. 凡例の表示を確認

**期待結果**
- [ ] 円グラフのラベルに銘柄コードが表示される
- [ ] ツールチップに「銘柄コード - 銘柄名」形式で表示される
- [ ] 凡例に銘柄コードが表示される

#### テストシナリオ2: レスポンシブ表示

**前提条件**
- 上記のテストシナリオ1が完了している

**操作手順**
1. ブラウザの開発者ツールを開く
2. デバイスモードに切り替え
3. 以下の画面サイズで表示を確認：
   - デスクトップ（1920x1080）
   - タブレット（768x1024）
   - スマートフォン（375x667）

**期待結果**
- [ ] すべての画面サイズで銘柄コードが正しく表示される
- [ ] ラベルが重ならない、または適切に省略される
- [ ] ツールチップが正常に機能する

### 6.3 ビジュアルテスト

#### チェック項目

- [ ] 円グラフのラベルが読みやすい
- [ ] ツールチップの情報が適切に配置されている
- [ ] 凡例が見やすく整列されている
- [ ] ダークモードでも正しく表示される
- [ ] 色のコントラストが十分である

---

## 7. 期待される効果

### 7.1 ユーザー体験の改善

1. **視認性の向上**
   - 銘柄コードは3～5文字程度で簡潔
   - 円グラフ内のラベルが読みやすくなる
   - 凡例がコンパクトになり、画面スペースを有効活用できる

2. **専門性の向上**
   - 金融業界で標準的な銘柄コード表示により、投資家に親しみやすいUIとなる
   - プロフェッショナルな印象を与える

3. **情報密度の最適化**
   - 一目で多くの銘柄情報を把握できる
   - ツールチップで詳細情報も確認できるため、情報の不足感がない

### 7.2 技術的メリット

1. **保守性の向上**
   - データ構造を変更せずに表示ロジックのみを変更
   - 既存のコンポーネント設計を活かせる

2. **拡張性の維持**
   - 銘柄コードが存在しない場合のフォールバック処理により、柔軟性を保つ
   - 将来的な機能追加（銘柄コードでの検索など）が容易

---

## 8. リスクと対策

### 8.1 リスク

#### リスク1: 銘柄コードに慣れていないユーザー

**影響度**: 中
**発生確率**: 中

**説明**
- 一般的な個人投資家の中には、銘柄コードよりも銘柄名の方が馴染みがある人もいる

**対策**
- ツールチップで銘柄名も表示することで、両方の情報を提供
- 必要に応じて、設定画面で表示形式を切り替える機能を将来的に追加（オプション）

#### リスク2: 銘柄コードが存在しないデータ

**影響度**: 低
**発生確率**: 低

**説明**
- CSVデータの銘柄コード列が空の場合がある

**対策**
- 銘柄コードが存在しない場合は、銘柄名を表示するフォールバック処理を実装予定
- 「その他」カテゴリも銘柄名として正しく表示される

#### リスク3: 銘柄コードの重複

**影響度**: 低
**発生確率**: 極低

**説明**
- 異なる市場で同じ銘柄コードが使用される可能性（例: 米国と日本で同じコード）

**対策**
- 現在のデータソース（CSVファイル）では、市場が明確に分離されているため問題なし
- 将来的に複数市場を統合する場合は、市場コードを含めた表示を検討

### 8.2 対策の優先度

| リスク | 優先度 | 対策状況 |
|------|------|------|
| 銘柄コードに慣れていないユーザー | 高 | 実装済み（ツールチップで両方表示） |
| 銘柄コードが存在しないデータ | 高 | 実装済み（フォールバック処理） |
| 銘柄コードの重複 | 低 | 監視継続（現時点では対策不要） |

---

## 9. 実装後の検証項目

### 9.1 機能検証

- [ ] 銘柄コードが正しく表示される
- [ ] 銘柄コードが存在しない場合に銘柄名が表示される
- [ ] ツールチップに銘柄コードと銘柄名の両方が表示される
- [ ] 凡例に銘柄コードが表示される
- [ ] ダークモードでも正しく表示される

### 9.2 パフォーマンス検証

- [ ] 描画速度が遅延していない
- [ ] メモリリークが発生していない
- [ ] ブラウザコンソールにエラーが出ていない

### 9.3 互換性検証

- [ ] Chrome（最新版）で正常動作
- [ ] Firefox（最新版）で正常動作
- [ ] Safari（最新版）で正常動作
- [ ] Edge（最新版）で正常動作
- [ ] モバイルブラウザで正常動作

---

## 10. 今後の拡張可能性

### 10.1 短期的な拡張（1～3ヶ月）

1. **表示形式の切り替え機能**
   - ユーザー設定で「銘柄コード」「銘柄名」「両方」を選択可能に
   - LocalStorageで設定を保存

2. **銘柄コードのハイライト機能**
   - 特定の銘柄コードをクリックすると、その銘柄の詳細情報を表示
   - 履歴データのドリルダウン表示

### 10.2 中長期的な拡張（3～6ヶ月）

1. **銘柄コードでの検索機能**
   - 検索バーから銘柄コードで直接検索
   - オートコンプリート機能

2. **銘柄コードのリンク化**
   - 銘柄コードをクリックすると、外部サイト（Yahoo Financeなど）へのリンク
   - 最新の株価情報や企業情報を確認可能

3. **銘柄コードの国際化対応**
   - 米国株、日本株、その他の市場を識別
   - 市場コードと銘柄コードを組み合わせた表示（例: `US:BLV`, `JP:7203`）

---

## 11. 関連資料

### 11.1 参考ドキュメント

- [Recharts 公式ドキュメント - PieChart](https://recharts.org/en-US/api/PieChart)
- [GitHub Issue #XX](https://github.com/TakuyaFukumura/divichart-next-js-app/issues/XX) - 配当ポートフォリオ円グラフの表示改善

### 11.2 参考実装例

- Yahoo Finance - ポートフォリオ表示での銘柄コード使用
- Bloomberg Terminal - 銘柄コードを主軸とした情報表示
- Google Finance - 銘柄コードと銘柄名の併用表示

---

## 12. 承認と履歴

### 12.1 変更履歴

| 日付 | バージョン | 変更者 | 変更内容 |
|------|---------|------|------|
| 2026-02-08 | 1.0 | GitHub Copilot | 初版作成 |

### 12.2 承認

| 役割 | 氏名 | 承認日 | 署名 |
|------|------|------|------|
| 作成者 | GitHub Copilot | 2026-02-08 | - |
| レビュアー | - | - | - |
| 承認者 | - | - | - |

---

## 13. 付録

### 13.1 用語集

| 用語 | 説明 |
|------|------|
| 銘柄コード | 株式や投資信託などの金融商品を識別するための一意のコード（ティッカーシンボル） |
| 銘柄名 | 金融商品の正式名称または通称 |
| ティッカーシンボル | 米国市場で使用される銘柄コードの呼称 |
| フォールバック | 主要な処理が失敗した場合に実行される代替処理 |

### 13.2 技術スタック

| 項目 | 技術/ライブラリ | バージョン |
|------|------------|---------|
| フレームワーク | Next.js | 16.1.6 |
| UI ライブラリ | React | 19.2.4 |
| グラフライブラリ | Recharts | 最新 |
| 言語 | TypeScript | 最新 |
| スタイリング | Tailwind CSS | 4.x |

### 13.3 サンプルデータ

#### 変更前のデータ表示

```typescript
{
    name: "VA L-TERM BOND",
    value: 50000,
    percentage: 25.0
}
```

#### 変更後のデータ表示

```typescript
{
    name: "BLV",
    stockCode: "BLV",
    stockName: "VA L-TERM BOND",
    value: 50000,
    percentage: 25.0
}
```

---

**ドキュメント終了**
