# デザイン統一仕様書

## 1. 目的

本仕様書では、divichart-next-js-appアプリケーション全体のデザインに統一感を持たせるための方針と具体的な実装ガイドラインを定義します。

## 2. 現状の問題点分析

### 2.1 グラフ背景の不統一

現在、各画面のグラフ背景デザインに以下の差異が存在します：

| 画面 | グラフ背景クラス | 問題点 |
|------|-----------------|--------|
| ホーム（年別配当） | `bg-gray-50 dark:bg-gray-900` | 統一されている |
| 累計配当 | グラフ背景なし | 他の画面と異なり、背景ラッパーが存在しない |
| ポートフォリオ（円グラフ） | `bg-gray-50 dark:bg-gray-900` | 統一されている |

**問題**：累計配当ページでは`ResponsiveContainer`が直接使用されており、背景スタイルが適用されていません。

### 2.2 テーブルデザインの差異

テーブルの実装において、以下の差異が見られます：

| 要素 | ホーム/累計配当 | ポートフォリオ |
|------|----------------|---------------|
| テーブルラッパー | `overflow-x-auto`のみ | `overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow` |
| ストライプ行 | なし | あり（奇数行・偶数行で背景色が交互） |
| ホバー効果 | ホーム：なし<br>累計：`hover:bg-gray-50` | `hover:bg-blue-50 dark:hover:bg-gray-700` |
| ボーダー | なし | `border border-gray-200 dark:border-gray-700` |

**問題**：テーブルの視覚的な統一感が欠けており、ユーザビリティに影響を与える可能性があります。

### 2.3 カードコンテナの統一性

各ページの主要コンテンツを囲むカードデザインは概ね統一されています：
- クラス: `bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8`
- 問題なし

### 2.4 入力フィールドのスタイル

為替レート入力フィールドのスタイルは統一されています：
- クラス: `px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500`
- 問題なし

## 3. デザイントークン定義

### 3.1 カラーパレット

アプリケーション全体で使用するカラーパレットを定義します。

#### 3.1.1 基本カラー

| 用途 | ライトモード | ダークモード | Tailwind CSS |
|------|-------------|-------------|--------------|
| 背景（ページ） | `#f9fafb` - `#eef2ff` | `#111827` - `#1f2937` | `from-blue-50 to-indigo-100` / `dark:from-gray-900 dark:to-gray-800` |
| 背景（カード） | `#ffffff` | `#1f2937` | `bg-white` / `dark:bg-gray-800` |
| 背景（グラフ） | `#f9fafb` | `#030712` | `bg-gray-50` / `dark:bg-gray-900` |
| テキスト（主） | `#1f2937` | `#f3f4f6` | `text-gray-800` / `dark:text-gray-200` |
| テキスト（副） | `#6b7280` | `#9ca3af` | `text-gray-600` / `dark:text-gray-400` |
| ボーダー | `#e5e7eb` | `#374151` | `border-gray-200` / `dark:border-gray-700` |

#### 3.1.2 アクセントカラー

| 用途 | カラーコード | Tailwind CSS |
|------|-------------|--------------|
| プライマリ（グラフ、リンク） | `#3b82f6` | `blue-600` |
| プライマリ（ホバー） | `#2563eb` | `blue-700` |
| 成功 | `#10b981` | `green-500` |
| エラー | `#ef4444` | `red-500` |

#### 3.1.3 グラフカラーパレット

円グラフで使用するカラーパレット：

```javascript
const COLORS = [
    '#0088FE', // 青
    '#00C49F', // 緑青
    '#FFBB28', // 黄
    '#FF8042', // オレンジ
    '#8884D8', // 紫
    '#82CA9D', // 緑
    '#FFC658', // 黄橙
    '#FF6B6B', // 赤
    '#4ECDC4', // 青緑
    '#45B7D1', // 水色
];
```

### 3.2 スペーシング

| 用途 | サイズ | Tailwind CSS |
|------|-------|--------------|
| コンテナパディング | 32px | `p-8` |
| セクション間マージン | 32px | `mt-8` / `mb-8` |
| 要素間マージン（中） | 24px | `mt-6` / `mb-6` |
| 要素間マージン（小） | 16px | `mt-4` / `mb-4` |
| テーブルセル | 24px 16px | `px-6 py-4` |

### 3.3 角丸（Border Radius）

| 用途 | サイズ | Tailwind CSS |
|------|-------|--------------|
| カード | 16px | `rounded-2xl` |
| グラフコンテナ | 12px | `rounded-xl` |
| ボタン | 8px | `rounded-lg` |
| 入力フィールド | 8px | `rounded-lg` |

### 3.4 影（Shadow）

| 用途 | Tailwind CSS |
|------|--------------|
| カード | `shadow-lg` |
| テーブルラッパー | `shadow` |
| ツールチップ | `shadow-lg` |

## 4. コンポーネント別デザイン仕様

### 4.1 グラフコンテナ

#### 4.1.1 標準仕様

すべてのグラフ（棒グラフ、折れ線グラフ、円グラフ）で使用する共通の背景コンテナ。

```jsx
<div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
    <ResponsiveContainer width="100%" height={400}>
        {/* グラフコンポーネント */}
    </ResponsiveContainer>
</div>
```

**適用箇所**：
- ✅ ホーム（年別配当）- 棒グラフ
- ❌ 累計配当 - 折れ線グラフ（未適用）
- ✅ ポートフォリオ - 円グラフ

#### 4.1.2 グラフの共通設定

##### CartesianGrid（棒グラフ・折れ線グラフ）

```jsx
<CartesianGrid 
    strokeDasharray="3 3" 
    stroke="#e5e7eb" 
    className="dark:stroke-gray-600" 
/>
```

##### 軸（XAxis/YAxis）

```jsx
<XAxis 
    dataKey="year"
    className="fill-gray-500 dark:fill-gray-400"
/>
<YAxis 
    className="fill-gray-500 dark:fill-gray-400"
/>
```

##### ツールチップ

すべてのグラフで統一されたツールチップスタイルを使用：

```jsx
<div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
    <p className="text-gray-800 dark:text-gray-200 font-semibold">{title}</p>
    <p className="text-blue-600 dark:text-blue-400">{content}</p>
</div>
```

### 4.2 テーブルデザイン

#### 4.2.1 標準仕様

すべてのテーブルで使用する統一されたデザイン。

```jsx
<div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    列名
                </th>
            </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    データ
                </td>
            </tr>
        </tbody>
    </table>
</div>
```

#### 4.2.2 推奨事項

1. **ホバー効果**：すべての行にホバー効果を追加
   - クラス: `hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`

2. **ストライプ行**（オプション）：
   - 多くのデータ行がある場合に視認性向上のため使用可能
   - 実装例：
   ```jsx
   className={`${
       index % 2 === 0
           ? 'bg-white dark:bg-gray-800'
           : 'bg-gray-50 dark:bg-gray-700'
   } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
   ```

3. **数値の右揃え**：
   - 金額や割合などの数値列は`text-right`を使用
   - フォント: `font-mono`を推奨（数値の桁揃え）

4. **テーブルフッター**（合計行がある場合）：
   ```jsx
   <tfoot className="bg-gray-100 dark:bg-gray-700">
       <tr>
           <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-gray-200">
               合計
           </td>
       </tr>
   </tfoot>
   ```

### 4.3 ボタン

#### 4.3.1 プライマリボタン

```jsx
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
    ボタンテキスト
</button>
```

#### 4.3.2 無効化ボタン

```jsx
<button 
    disabled
    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed"
>
    ボタンテキスト
</button>
```

#### 4.3.3 セカンダリボタン

```jsx
<button className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors">
    ボタンテキスト
</button>
```

### 4.4 入力フィールド

#### 4.4.1 テキスト/数値入力

```jsx
<input 
    type="text"
    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
/>
```

### 4.5 ローディング状態

```jsx
<div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600 dark:text-gray-400">読み込み中...</span>
</div>
```

### 4.6 エラー表示

```jsx
<div className="text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
    エラー: {errorMessage}
</div>
```

## 5. レイアウト仕様

### 5.1 ページレイアウト

```jsx
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
    <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            {/* ページコンテンツ */}
        </div>
    </div>
</div>
```

### 5.2 最大幅の統一

- メインコンテンツコンテナ: `max-w-6xl`
- ヘッダー: `max-w-7xl`

### 5.3 レスポンシブデザイン

- パディング: `p-8`（デスクトップ）/ `p-4`（モバイル）- 必要に応じて調整
- グラフの高さ: 原則400px（ResponsiveContainerで自動調整）

## 6. タイポグラフィ

### 6.1 見出し

| レベル | 用途 | Tailwind CSS |
|-------|------|--------------|
| H1 | ページタイトル | `text-4xl font-bold text-gray-800 dark:text-gray-200` |
| H2 | セクションタイトル | `text-xl font-semibold text-gray-800 dark:text-gray-200` |

### 6.2 本文

| 用途 | Tailwind CSS |
|------|--------------|
| 通常テキスト | `text-gray-900 dark:text-gray-300` |
| 補足テキスト | `text-sm text-gray-500 dark:text-gray-400` |
| ラベル | `text-sm font-medium text-gray-700 dark:text-gray-300` |

## 7. 実装ガイドライン

### 7.1 修正が必要な箇所

#### 7.1.1 累計配当ページ（src/app/cumulative/page.tsx）

**問題点**：
- グラフがコンテナで囲まれていない（他のページと一貫性がない）

**修正内容**：
```jsx
// 修正前
<div className="mb-8">
    <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
            {/* ... */}
        </LineChart>
    </ResponsiveContainer>
</div>

// 修正後
<div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-8">
    <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
            {/* ... */}
        </LineChart>
    </ResponsiveContainer>
</div>
```

#### 7.1.2 ホームページ（src/app/page.tsx）

**問題点**：
- テーブルにホバー効果がない

**修正内容**：
```jsx
// 修正前
<tr key={row.year}>

// 修正後
<tr key={row.year} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
```

#### 7.1.3 累計配当ページのテーブル（src/app/cumulative/page.tsx）

**問題点**：
- テーブルラッパーにborderがない（統一性のため追加すべきか検討）

**推奨修正**（オプション）：
```jsx
// 現状
<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">

// この形式でborderが既に適用されている - 問題なし
```

### 7.2 新規コンポーネント作成時のチェックリスト

新しいコンポーネントを作成する際は、以下を確認してください：

- [ ] カラーパレットは定義された色を使用しているか
- [ ] ダークモード対応がされているか（`dark:`プレフィックス）
- [ ] スペーシングは統一された値を使用しているか
- [ ] グラフには適切な背景コンテナが適用されているか
- [ ] テーブルにはホバー効果があるか
- [ ] ツールチップのスタイルは統一されているか
- [ ] ローディング/エラー状態は標準デザインを使用しているか

### 7.3 コンポーネント設計の原則

1. **再利用性**：共通のデザインパターンはコンポーネント化する
2. **一貫性**：同じ要素は常に同じスタイルを使用する
3. **アクセシビリティ**：適切なARIAラベルとキーボード操作を考慮
4. **レスポンシブ**：モバイルファーストで設計し、大画面に対応

### 7.4 Tailwind CSS使用のベストプラクティス

1. **ユーティリティファーストアプローチ**：
   - 可能な限りTailwindユーティリティクラスを使用
   - カスタムCSSは最小限に抑える

2. **ダークモードの考慮**：
   - すべての色関連クラスに`dark:`バリアントを追加
   - 変数（CSS Custom Properties）でテーマカラーを管理

3. **クラス名の順序**：
   - レイアウト → スペーシング → 色 → タイポグラフィ → その他の順で記述
   - 例: `flex items-center gap-4 p-4 bg-white text-gray-900 rounded-lg shadow`

4. **条件付きクラス**：
   - 複雑な条件は変数に抽出
   - テンプレートリテラルで読みやすく記述

## 8. 実装スケジュール（提案）

本仕様書に基づいた実装は、以下のフェーズで進めることを推奨します：

### Phase 1: 緊急度が高い修正（即座に実施可能）
- [ ] 累計配当ページのグラフ背景コンテナ追加
- [ ] ホームページのテーブルホバー効果追加

### Phase 2: デザイントークンの整備
- [ ] 共通デザイントークンをCSSカスタムプロパティとして定義
- [ ] グラフ用の共通コンポーネント作成（ChartContainer）
- [ ] テーブル用の共通コンポーネント作成（DataTable）

### Phase 3: コンポーネントのリファクタリング
- [ ] 既存コンポーネントを共通コンポーネントに移行
- [ ] スタイルの最終調整と統一性の検証

### Phase 4: ドキュメントとテスト
- [ ] スタイルガイドの更新
- [ ] ビジュアルリグレッションテストの追加
- [ ] アクセシビリティ監査

## 9. 付録

### 9.1 参考リソース

- [Tailwind CSS公式ドキュメント](https://tailwindcss.com/docs)
- [Recharts公式ドキュメント](https://recharts.org/)
- [Next.js App Routerドキュメント](https://nextjs.org/docs/app)

### 9.2 変更履歴

| 日付 | バージョン | 変更内容 | 作成者 |
|------|-----------|---------|--------|
| 2026-02-07 | 1.0.0 | 初版作成 | GitHub Copilot |

### 9.3 レビューと更新

本仕様書は、デザインシステムの進化に合わせて定期的に更新されるべきです。
- 四半期ごとにレビューを実施
- 新機能追加時は本仕様書への影響を評価
- チームメンバーからのフィードバックを積極的に取り入れる

---

**注意事項**：
- 本仕様書は現状分析に基づいて作成されています
- 実装前に関係者と仕様内容を確認し、承認を得てください
- 既存の機能に影響を与えないよう、段階的に実装することを推奨します
