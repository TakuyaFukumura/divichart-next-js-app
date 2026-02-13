# divichart-next-js-app

配当金データを可視化するNext.jsアプリケーションです。

## 技術スタック

- **Next.js 16.1.6** - React フレームワーク（App Routerを使用）
- **React 19.2.4** - ユーザーインターフェース構築
- **TypeScript** - 型安全性
- **Tailwind CSS 4** - スタイリング
- **Recharts** - グラフ描画ライブラリ
- **PapaParse** - CSV解析
- **ESLint** - コード品質管理

## 機能

- 配当金データのCSVファイル読み込み
- 年別配当金の集計と表示
- 棒グラフ・折れ線グラフでのデータ可視化
- ダークモード対応
- レスポンシブデザイン

## 変更履歴

プロジェクトの変更履歴は [CHANGELOG.md](./CHANGELOG.md) を参照してください。

## 始め方

### 前提条件

- Node.js 20.x以上
- npm、yarn、またはpnpm

### インストール

1. リポジトリをクローン：
    ```bash
    git clone https://github.com/TakuyaFukumura/divichart-next-js-app.git
    ```
    ```bash
    cd divichart-next-js-app
    ```

2. 依存関係をインストール：
    ```bash
    npm install
    ```
   または
    ```bash
    yarn install
    ```
   または
    ```bash
    pnpm install
    ```

### 開発サーバーの起動

```bash
npm run dev
```

または

```bash
yarn dev
```

または

```bash
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて
アプリケーションを確認してください。

### ビルドと本番デプロイ

本番用にアプリケーションをビルドする：

```bash
npm run build
```

```bash
npm start
```

または

```bash
yarn build
```

```bash
yarn start
```

または

```bash
pnpm build
```

```bash
pnpm start
```

## プロジェクト構造

```
├── public/
│   └── data/                # CSVデータファイル
│       └── dividendlist_20260205.csv
├── src/
│   ├── app/
│   │   ├── components/      # Reactコンポーネント
│   │   │   ├── DarkModeProvider.tsx  # ダークモードProvider
│   │   │   └── Header.tsx   # ヘッダーコンポーネント
│   │   ├── globals.css      # グローバルスタイル
│   │   ├── layout.tsx       # アプリケーションレイアウト
│   │   └── page.tsx         # メインページ（配当金グラフ表示）
│   └── config/              # 設定ファイル
│       ├── app.config.ts    # アプリケーション基本設定
│       ├── chart.config.ts  # グラフ表示設定
│       ├── storage.config.ts # localStorageキー管理
│       ├── constants.ts     # アプリケーション定数
│       └── index.ts         # 統合エクスポート
├── .env.example             # 環境変数の例示ファイル
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 環境変数

アプリケーションの動作は環境変数でカスタマイズできます。`.env.example`をコピーして`.env.local`を作成してください。

### 利用可能な環境変数

#### 為替レート設定
```bash
NEXT_PUBLIC_USD_TO_JPY_RATE=150
```
USD → JPY の為替レートを設定します。未設定の場合はデフォルト値（150円）が使用されます。

#### CSVファイルパス設定
```bash
NEXT_PUBLIC_CSV_FILE_PATH=/data/dividendlist_20260205.csv
```
配当データのCSVファイルパスを設定します。パスは`public`ディレクトリからの相対パスで指定します。

#### 目標配当金設定
```bash
NEXT_PUBLIC_DEFAULT_MONTHLY_TARGET=30000
```
デフォルトの月次配当金目標を設定します（円）。未設定の場合はデフォルト値（30,000円）が使用されます。

### 環境変数の使用例

1. `.env.example`を`.env.local`にコピー：
   ```bash
   cp .env.example .env.local
   ```

2. `.env.local`を編集して必要な値を設定

3. 開発サーバーを再起動

**注意**: 
- `NEXT_PUBLIC_`プレフィックス付きの変数はクライアント側で使用可能です
- `.env.local`ファイルは`.gitignore`に含まれており、リポジトリにコミットされません
- 本番環境では環境変数を直接設定してください

## データ形式

配当金データはCSV形式（Shift-JIS）で提供されます。

### 必須カラム

- **入金日**: YYYY/MM/DD形式
- **受取通貨**: 通貨コード（例: USドル、円）
- **受取金額[円/現地通貨]**: 配当金額（税引き後）

### 為替レート

- USドル建ての配当金は設定された為替レートで円換算されます
- デフォルトは1ドル=150円
- 環境変数`NEXT_PUBLIC_USD_TO_JPY_RATE`で変更可能

## 開発

### テスト

このプロジェクトはJestを使用したテストが設定されています。

#### テストの実行

```bash
npm test
```

または

```bash
yarn test
```

または

```bash
pnpm test
```

#### テストの監視モード

```bash
npm run test:watch
```

#### カバレッジレポートの生成

```bash
npm run test:coverage
```

#### テストファイルの構成

- `__tests__/src/app/components/DarkModeProvider.test.tsx`: ダークモードProvider のテスト
- `__tests__/src/app/components/Header.test.tsx`: ヘッダーコンポーネントのテスト

#### テストの特徴

- **Reactコンポーネントテスト**: React Testing Library を使用したコンポーネントのレンダリングとインタラクションのテスト
- **モッキング**: localStorage や外部依存関係のモック
- **カバレッジ**: コードカバレッジの測定と報告

### リンティング

```bash
npm run lint
```

または

```bash
yarn lint
```

または

```bash
pnpm lint
```

### 型チェック

TypeScriptの型チェックは、ビルド時またはIDEで自動的に実行されます。

## CI/CD

このプロジェクトはGitHub Actionsを使用した継続的インテグレーション（CI）を設定しています。

### 自動テスト

以下の条件でCIが実行されます：

- `main`ブランチへのプッシュ時
- プルリクエストの作成・更新時

CIでは以下のチェックが行われます：

- ESLintによる静的解析
- TypeScriptの型チェック
- Jestを使用したユニットテストとインテグレーションテスト
- アプリケーションのビルド検証
- Node.js 20.x での動作確認

## 自動依存関係更新（Dependabot）

このプロジェクトでは、依存関係の安全性と最新化のために[Dependabot](https://docs.github.com/ja/code-security/dependabot)
を利用しています。

- GitHub Actionsおよびnpmパッケージの依存関係は**月次（月曜日 09:00 JST）**で自動チェック・更新されます。
- 更新内容は自動でプルリクエストとして作成されます。
- 詳細な設定は `.github/dependabot.yml` を参照してください。

## トラブルシューティング

### CSVファイルの読み込みエラー

- `public/data/` フォルダに配当金CSVファイルが配置されていることを確認してください
- CSVファイルのエンコーディングがShift-JISであることを確認してください

### ポート競合

デフォルトのポート3000が使用中の場合：

```bash
npm run dev -- --port 3001
```
