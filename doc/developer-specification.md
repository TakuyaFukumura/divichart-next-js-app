# 開発者向けアプリ仕様書

## 1. ドキュメント情報

- **作成日**: 2026年2月5日
- **対象バージョン**: v0.5.1
- **対象読者**: 開発者、システムアーキテクト、保守担当者

---

## 2. アプリケーション概要

### 2.1 目的

divichart-next-js-appは、証券会社から提供される配当金データ（CSV形式）を読み込み、年別の配当金推移を視覚化するWebアプリケーションです。投資家が配当金の受取履歴を一目で把握し、投資戦略の分析に役立てることを目的としています。

### 2.2 主要機能

1. **CSVデータ読み込み**
   - Shift-JISエンコーディングのCSVファイルを読み込み
   - 複数通貨（円、USドル等）の配当金データに対応

2. **データ集計・変換**
   - 入金日から年を抽出し、年別に配当金を集計
   - USドル建て配当を設定可能な為替レートで円換算
   - 税引き後配当金を表示

3. **データ可視化**
   - 年別配当金の棒グラフ表示
   - 年別配当金の折れ線グラフ表示
   - インタラクティブなツールチップ表示

4. **データ一覧表示**
   - 年別配当金を集計したテーブル表示
   - 配当金額を日本円でフォーマット表示

5. **設定機能**
   - ダークモード/ライトモードの切り替え
   - 為替レートのリアルタイム変更
   - グラフ種類（棒/折れ線）の切り替え

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
│  │  │  Layout (Header + DarkMode)        │  │  │
│  │  │  ┌──────────────────────────────┐  │  │  │
│  │  │  │  Page (メインページ)         │  │  │  │
│  │  │  │  - CSVローダー              │  │  │  │
│  │  │  │  - データ集計ロジック        │  │  │  │
│  │  │  │  - チャート表示             │  │  │  │
│  │  │  │  - テーブル表示             │  │  │  │
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

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| フレームワーク | Next.js | 16.1.6 | Reactベースのフルスタックフレームワーク |
| UIライブラリ | React | 19.2.4 | ユーザーインターフェース構築 |
| 言語 | TypeScript | 5.x | 型安全性の確保 |
| スタイリング | Tailwind CSS | 4.x | ユーティリティファーストCSS |
| チャート | Recharts | 3.7.0 | グラフ描画ライブラリ |
| CSV解析 | PapaParse | 5.5.3 | CSVパーサー |

#### 開発ツール

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| リンター | ESLint | 9.x | コード品質管理 |
| テスト | Jest | 30.2.0 | ユニット・インテグレーションテスト |
| テスト | React Testing Library | 16.3.2 | Reactコンポーネントテスト |
| ビルド | Next.js Turbopack | - | 高速ビルド |

#### CI/CD

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| CI | GitHub Actions | 自動テスト・ビルド |
| 依存関係管理 | Dependabot | セキュリティ更新 |

### 3.3 ディレクトリ構成

```
divichart-next-js-app/
├── .github/
│   ├── dependabot.yml          # Dependabot設定
│   └── workflows/
│       └── ci.yml              # CI/CDワークフロー
├── __tests__/                  # テストファイル（src構造をミラー）
│   └── src/
│       └── app/
│           └── components/
│               ├── DarkModeProvider.test.tsx
│               └── Header.test.tsx
├── doc/                        # ドキュメント
│   ├── developer-specification.md  # 本ドキュメント
│   ├── improvements.md         # 改善提案リスト
│   └── test-code-organization.md
├── public/                     # 静的ファイル
│   └── data/                   # CSVデータファイル
│       └── dividendlist_20260205.csv
├── src/
│   └── app/
│       ├── components/         # Reactコンポーネント
│       │   ├── DarkModeProvider.tsx
│       │   └── Header.tsx
│       ├── globals.css         # グローバルスタイル
│       ├── layout.tsx          # アプリケーションレイアウト
│       └── page.tsx            # メインページ
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

| カラム名 | データ型 | 必須 | 説明 | 例 |
|---------|---------|------|------|-----|
| 入金日 | string (YYYY/MM/DD) | ✓ | 配当金の入金日 | 2026/02/06 |
| 商品 | string | - | 商品種別 | 米国株式 |
| 口座 | string | - | 口座種別 | 旧NISA |
| 銘柄コード | string | - | 証券コード | BLV |
| 銘柄 | string | - | 銘柄名 | VA L-TERM BOND |
| 受取通貨 | string | ✓ | 通貨コード | USドル, 円 |
| 単価[円/現地通貨] | string | - | 1株あたり配当金 | 0.27745 |
| 数量[株/口] | string | - | 保有株数 | 11 |
| 配当・分配金合計（税引前）[円/現地通貨] | string | - | 税引前配当金額 | 3.05 |
| 税額合計[円/現地通貨] | string | - | 税額 | 0 |
| 受取金額[円/現地通貨] | string | ✓ | 税引き後配当金額 | 2.74 |

**特殊値の扱い**
- 税額が`-`の場合は0として扱う
- カンマ区切りの数値（例: `3,683`）は正常にパース可能

### 4.2 内部データ型

#### TypeScript型定義

```typescript
/**
 * CSVから読み込んだ1行分のデータ
 */
type CSVRow = {
    '入金日': string;              // YYYY/MM/DD形式
    '受取通貨': string;            // 通貨コード
    '受取金額[円/現地通貨]': string;  // 配当金額（税引き後）
};

/**
 * グラフ・テーブル表示用の年別集計データ
 */
type DividendData = {
    year: string;          // "YYYY年"形式（例: "2026年"）
    totalDividend: number; // 年間配当金合計（円換算後、整数）
};
```

#### データ変換フロー

```
CSVファイル (Shift-JIS)
    ↓ TextDecoder('shift-jis')
UTF-8テキスト
    ↓ PapaParse
CSVRow[]
    ↓ calculateDividendData()
    ├─ 入金日から年を抽出
    ├─ 通貨に応じて為替換算
    └─ 年別に集計
DividendData[]
    ↓
グラフ・テーブルに表示
```

---

## 5. コンポーネント仕様

### 5.1 ページコンポーネント

#### `src/app/page.tsx` - メインページ

**責務**
- CSVデータの読み込みとパース
- 年別配当金の集計
- グラフとテーブルの表示
- 為替レート変更処理
- グラフ種類切り替え処理

**主要な状態**

| 状態変数 | 型 | 初期値 | 説明 |
|---------|-----|--------|------|
| data | DividendData[] | [] | 年別集計データ |
| loading | boolean | true | 読み込み状態 |
| error | string \| null | null | エラーメッセージ |
| chartType | 'line' \| 'bar' | 'bar' | グラフ種類 |
| usdToJpyRate | number | 150 | 為替レート（1ドル=円） |
| inputValue | string | "150" | 為替レート入力値 |
| rawData | CSVRow[] | [] | パース済みCSVデータ |

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

1. **初期化** (useEffect)
   - CSVファイルをfetchでHTTP取得
   - Shift-JISからUTF-8にデコード
   - PapaParseでCSVをパース
   - rawDataに保存

2. **データ集計** (useEffect)
   - rawDataと為替レートが変更されたら再計算
   - calculateDividendData()を呼び出し
   - 年別に配当金を集計（USドルは為替換算）
   - 年でソートしてdataに保存

3. **レンダリング**
   - loading中: スピナー表示
   - error発生時: エラーメッセージ表示
   - 成功時: グラフと設定UI、テーブルを表示

**UIコンポーネント構成**

```
Page
├── グラフ種類選択ボタン（棒/折れ線）
├── 為替レート入力フィールド
├── グラフ表示エリア
│   ├── BarChart (chartType === 'bar')
│   └── LineChart (chartType === 'line')
└── 年別配当金テーブル
```

### 5.2 レイアウトコンポーネント

#### `src/app/layout.tsx` - ルートレイアウト

**責務**
- アプリケーション全体のレイアウト構造
- メタデータの設定
- グローバルスタイルの適用
- DarkModeProviderの配置

**構成**
```tsx
<html lang="ja">
  <body>
    <DarkModeProvider>
      <Header />
      {children}
    </DarkModeProvider>
  </body>
</html>
```

### 5.3 UIコンポーネント

#### `src/app/components/Header.tsx` - ヘッダー

**責務**
- アプリケーションタイトルの表示
- ダークモード切り替えボタンの提供
- ナビゲーションメニューの表示

**主要機能**
- `useDarkMode()`フックでテーマ情報を取得
- テーマに応じたアイコン表示（☀️/🌙）
- ボタンクリックでテーマ切り替え

**Props**: なし

**スタイル特性**
- スティッキーヘッダー（`sticky top-0`）
- ガラスモルフィズム（`backdrop-blur-sm`）
- ダークモード対応

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

---

## 6. 状態管理

### 6.1 状態管理の方針

本アプリケーションでは、状態管理ライブラリ（Redux, Zustand等）を使用せず、React標準のフックとContext APIで状態を管理しています。

### 6.2 ローカル状態（useState）

各コンポーネント内でのみ使用する状態は`useState`で管理します。

**使用例**
- CSVデータ（`page.tsx`）
- グラフ種類（`page.tsx`）
- 為替レート（`page.tsx`）
- ローディング状態（`page.tsx`）

### 6.3 グローバル状態（Context API）

複数コンポーネント間で共有する状態は`Context API`で管理します。

**現在の使用例**
- ダークモードのテーマ状態（`DarkModeProvider`）

### 6.4 サーバー状態

現在、サーバー状態の管理は行っていません。CSVファイルは静的ファイルとして配信され、クライアントで1度読み込んだらキャッシュせず、ページリロード時に再取得されます。

---

## 7. データフロー

### 7.1 CSVデータ読み込みフロー

```
[ユーザーがページアクセス]
    ↓
[page.tsx マウント]
    ↓
[useEffect: CSVデータ読み込み]
    ↓
[fetch('/data/dividendlist_20260205.csv')]
    ↓
[arrayBuffer取得]
    ↓
[TextDecoder('shift-jis')でデコード]
    ↓
[PapaParse.parse()]
    ↓
[setRawData(results.data)]
    ↓
[useEffect: データ集計]
    ↓
[calculateDividendData(rawData, usdToJpyRate)]
    ↓
[setData(chartData)]
    ↓
[グラフ・テーブル描画]
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
[calculateDividendData(rawData, usdToJpyRate)]
    ↓
[setData(chartData)]
    ↓
[グラフ・テーブル再描画]
```

### 7.3 ダークモード切り替えフロー

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

| 変数名 | 型 | デフォルト値 | 説明 | 必須 |
|--------|-----|-------------|------|------|
| NEXT_PUBLIC_USD_TO_JPY_RATE | number | 150 | 初期為替レート（1ドル=円） | ✗ |

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
    └── app/
        └── components/
            ├── DarkModeProvider.test.tsx
            └── Header.test.tsx
```

**命名規則**
- テストファイル: `{ComponentName}.test.tsx`
- ソースコードの構造をミラーする

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

| カテゴリ | 目標カバレッジ | 現状 |
|---------|---------------|------|
| Statements | 80%以上 | 要測定 |
| Branches | 70%以上 | 要測定 |
| Functions | 80%以上 | 要測定 |
| Lines | 80%以上 | 要測定 |

**未テストの領域**
- `src/app/page.tsx` (メインページ)
- `src/app/layout.tsx` (レイアウト)

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

| 指標 | 目標値 | 説明 |
|------|--------|------|
| FCP (First Contentful Paint) | < 1.8秒 | 最初のコンテンツ描画 |
| LCP (Largest Contentful Paint) | < 2.5秒 | 最大コンテンツ描画 |
| TTI (Time to Interactive) | < 3.8秒 | インタラクション可能になるまで |
| CLS (Cumulative Layout Shift) | < 0.1 | レイアウトシフト累積 |

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

| 用語 | 説明 |
|------|------|
| 配当金 | 株式投資で企業から受け取る利益分配金 |
| 税引き後配当金 | 源泉徴収税を差し引いた後の配当金額 |
| 為替レート | 通貨間の交換比率（本アプリではUSD/JPY） |
| Shift-JIS | 日本語文字エンコーディングの一種 |
| CSP | Content Security Policy（セキュリティポリシー） |
| SSR | Server-Side Rendering（サーバーサイドレンダリング） |
| CSR | Client-Side Rendering（クライアントサイドレンダリング） |

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

| 日付 | バージョン | 変更内容 | 作成者 |
|------|-----------|---------|--------|
| 2026-02-05 | 1.0.0 | 初版作成 | GitHub Copilot |

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
入金日,商品,口座,銘柄コード,銘柄,受取通貨,単価[円/現地通貨],数量[株/口],配当・分配金合計（税引前）[円/現地通貨],税額合計[円/現地通貨],受取金額[円/現地通貨]
2026/02/06,米国株式,旧NISA,BLV,VA L-TERM BOND,USドル,0.27745,11,3.05,0,2.74
2026/02/06,米国株式,旧NISA,VCLT,VA L-TERM CORPBD,USドル,0.3456,33,11.40,0,10.26
2026/01/30,投資信託,特定,,ブラジル株式ツインαファンド,円,5.00,3683,2,0,2
```

---

## お問い合わせ

このドキュメントに関する質問や改善提案は、GitHubのIssueでお知らせください。

- **Repository**: https://github.com/TakuyaFukumura/divichart-next-js-app
- **Issues**: https://github.com/TakuyaFukumura/divichart-next-js-app/issues
