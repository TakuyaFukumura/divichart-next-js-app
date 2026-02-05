# テストコード整備ドキュメント

## 1. 概要

本ドキュメントは、divichart-next-js-appプロジェクトにおけるテストコードの現状分析と、今後の整備方針をまとめたものです。

## 2. 現状分析

### 2.1. プロジェクト概要

- **フレームワーク**: Next.js 16.1.6 (App Router)
- **言語**: TypeScript
- **主要ライブラリ**:
    - React 19.2.4
    - Recharts (グラフ描画)
    - PapaParse (CSV解析)
    - Tailwind CSS 4 (スタイリング)

### 2.2. テストインフラストラクチャ

#### テストフレームワークとツール

| ツール                       | バージョン  | 用途                |
|---------------------------|--------|-------------------|
| Jest                      | 30.2.0 | テストランナー・アサーション    |
| React Testing Library     | 16.3.2 | Reactコンポーネントテスト   |
| @testing-library/jest-dom | 6.9.1  | DOM要素のカスタムマッチャー   |
| ts-jest                   | 29.4.6 | TypeScriptトランスパイル |
| jest-environment-jsdom    | 30.2.0 | ブラウザ環境のシミュレーション   |

#### テスト設定ファイル

1. **jest.config.mjs**
    - Next.js専用の設定を使用（`next/jest`）
    - テスト環境: jsdom（ブラウザDOM環境）
    - テストファイルパターン: `__tests__/**/*.(ts|tsx|js)` および `**/*.(test|spec).(ts|tsx|js)`
    - モジュールエイリアス: `@/*` → `src/*`
    - カバレッジ収集対象: `src/**/*.{ts,tsx}`, `lib/**/*.{ts,tsx}`
    - カバレッジ除外: 型定義ファイル、layout.tsx、globals.css

2. **jest.setup.js**
    - Testing Libraryの拡張マッチャー読み込み
    - グローバルモック設定:
        - TextEncoder/TextDecoder（Node.js環境用）
        - localStorage（ブラウザAPI）
        - fetch（HTTPリクエスト）

### 2.3. 現在のテストカバレッジ

```
-----------------------|---------|----------|---------|---------|-------------------
File                   | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------------|---------|----------|---------|---------|-------------------
All files              |   38.59 |       25 |    42.3 |   39.09 |                   
 app                   |       0 |        0 |       0 |       0 |                   
  page.tsx             |       0 |        0 |       0 |       0 | 3-294             
 app/components        |     100 |    93.75 |     100 |     100 |                   
  DarkModeProvider.tsx |     100 |       90 |     100 |     100 | 21                
  Header.tsx           |     100 |      100 |     100 |     100 |                   
-----------------------|---------|----------|---------|---------|-------------------
```

**分析結果**:

- **Components**: 優れたカバレッジ（100%）
    - `DarkModeProvider.tsx`: 完全にテスト済み
    - `Header.tsx`: 完全にテスト済み
- **Page Component**: テストが存在しない（0%カバレッジ）
    - `page.tsx`: メインロジックが未テスト（3-294行目）

### 2.4. 既存テストの品質分析

#### 2.4.1. DarkModeProvider.test.tsx

**テスト内容**:

- ✅ 初期状態のテスト（デフォルトテーマ、localStorage読み込み）
- ✅ テーマ切り替え機能（ライト↔ダーク）
- ✅ localStorage連携の検証
- ✅ カスタムフックのエラーハンドリング（Provider外での使用）
- ✅ 子コンポーネントのレンダリング

**強み**:

- 包括的なテストケース（初期化、状態管理、副作用）
- localStorageの適切なモック化
- React Contextパターンの正しいテスト
- エラーケースのテスト（useDarkMode hook without Provider）

**改善の余地**:

- なし（現状で十分な品質）

#### 2.4.2. Header.test.tsx

**テスト内容**:

- ✅ 基本的なレンダリング（タイトル、ナビゲーション、ボタン）
- ✅ ライトモード/ダークモードの表示切り替え
- ✅ テーマ切り替え機能のインタラクション
- ✅ アクセシビリティ（キーボード操作、aria属性）
- ✅ レスポンシブデザイン（CSSクラスの検証）
- ✅ CSSクラスの適用確認

**強み**:

- UIコンポーネントの全側面をカバー
- アクセシビリティへの配慮
- インタラクションの詳細なテスト
- レスポンシブ対応の検証

**改善の余地**:

- なし（現状で十分な品質）

### 2.5. ソースコード構成

```
プロジェクトルート/
├── __tests__/              # テストファイル（srcのディレクトリ構造をミラーリング）
│   └── src/
│       └── app/
│           └── components/
│               ├── DarkModeProvider.test.tsx
│               └── Header.test.tsx
├── src/
│   └── app/
│       ├── components/     # Reactコンポーネント
│       │   ├── DarkModeProvider.tsx  # ダークモードのContext Provider
│       │   └── Header.tsx            # ヘッダーコンポーネント
│       ├── globals.css     # グローバルスタイル
│       ├── layout.tsx      # アプリケーションレイアウト
│       └── page.tsx        # メインページ（配当金グラフ表示）
├── public/
│   └── data/              # CSVデータファイル
│       └── dividendlist_20260205.csv
├── jest.config.mjs        # Jest設定
├── jest.setup.js          # Jestセットアップ
└── package.json
```

**ファイル数**: TypeScript/JavaScriptファイル合計9個（node_modules除く）

## 3. テストコード整備の課題

### 3.1. 優先度：高

#### 1. メインページ（page.tsx）のテストが存在しない

**影響範囲**:

- 292行（3-294行目）のコアビジネスロジックが未テスト
- CSV読み込み処理
- データ変換・集計ロジック
- グラフ描画ロジック
- 為替レート変換機能
- エラーハンドリング

**リスク**:

- ビジネスロジックのリグレッション検出不可
- データ変換バグの見逃し
- CSV形式変更への脆弱性

#### 2. layout.tsx のテストが存在しない

**影響範囲**:

- アプリケーション全体のレイアウト構造
- DarkModeProviderの統合

**リスク**:

- レイアウト変更時の影響範囲不明
- Provider統合の問題検出不可

### 3.2. 優先度：中

#### 1. モバイル端末でのテスト不足

**現状**: レスポンシブCSSクラスの検証のみ

**リスク**:

- 実機での動作未確認

## 4. テストコード整備の方針

### 4.1. 短期目標（1-2週間）

#### 1. page.tsx のユニットテスト作成

**テストすべき項目**:

1. **CSV読み込み処理**
    - ✓ 正常なCSVファイルの読み込み
    - ✓ Shift-JISエンコーディングの処理
    - ✓ ファイル読み込みエラーのハンドリング
    - ✓ パース処理のエラーハンドリング

2. **データ変換ロジック**
    - ✓ 年別集計の正確性
    - ✓ 為替レート変換の正確性（USD→JPY）
    - ✓ 無効なデータのフィルタリング
    - ✓ 空データの処理
    - ✓ カンマ区切り数値の処理
    - ✓ "-"表記（税額など）の処理

3. **UIインタラクション**
    - ✓ グラフタイプ切り替え（棒グラフ↔折れ線グラフ）
    - ✓ 為替レート入力と再計算
    - ✓ 無効な為替レート入力の処理
    - ✓ ローディング状態の表示
    - ✓ エラー状態の表示

4. **グラフ描画**
    - ✓ Recharts コンポーネントの正しいレンダリング
    - ✓ データがグラフに正しく反映される
    - ✓ カスタムツールチップの表示

5. **テーブル表示**
    - ✓ 年別データの表形式表示
    - ✓ 金額のフォーマット（カンマ区切り）

**実装方針**:

```typescript
// __tests__/src/app/page.test.tsx

describe('Home Page', () => {
  describe('CSV読み込み', () => {
    it('正常にCSVファイルを読み込む', async () => {
      // fetchをモック化して、CSVデータを返す
      // コンポーネントをレンダリング
      // データが正しく表示されることを確認
    });
    
    it('ファイル読み込みエラーを適切に処理する', async () => {
      // fetchをモック化してエラーを発生させる
      // エラーメッセージが表示されることを確認
    });
  });
  
  describe('データ変換', () => {
    it('年別に配当金を正しく集計する', () => {
      // calculateDividendData関数を直接テスト
      // または、コンポーネント経由でテスト
    });
    
    it('USD→JPY為替変換が正しく動作する', () => {
      // 為替レートを設定してデータを確認
    });
  });
  
  describe('UIインタラクション', () => {
    it('グラフタイプを切り替えられる', async () => {
      // ボタンをクリックして、グラフが切り替わることを確認
    });
    
    it('為替レートを変更できる', async () => {
      // 入力フィールドに値を入力
      // データが再計算されることを確認
    });
  });
});
```

**注意点**:

- `fetch` APIのモック化が必要
- `TextDecoder` のモック化（Shift-JIS対応）
- PapaParseのモック化を検討（または実際のライブラリを使用）
- Rechartsコンポーネントのレンダリングテスト（スナップショットテストも検討）

#### 2. layout.tsx のテスト作成

**テストすべき項目**:

- ✓ DarkModeProviderが正しく子コンポーネントをラップする
- ✓ メタデータが正しく設定される（title, description）
- ✓ Headerコンポーネントの統合

**実装方針**:

```typescript
// __tests__/src/app/layout.test.tsx

describe('RootLayout', () => {
  it('DarkModeProviderで子コンポーネントをラップする', () => {
    // layoutをレンダリング
    // Providerの存在を確認
  });
  
  it('Headerコンポーネントが表示される', () => {
    // layoutをレンダリング
    // Headerが存在することを確認
  });
});
```

**注意点**:

- Next.jsのApp Routerのlayoutコンポーネントのテストは通常のコンポーネントテストと同様
- メタデータのテストは、Next.js特有の機能のため、統合テストで確認する方が適切

### 4.2. 中期目標（1-2ヶ月）

#### 1. カバレッジ目標の設定

**現在のカバレッジ**: 38.59%

**目標カバレッジ**: 80%以上

**段階的な目標**:

- フェーズ1（短期）: 60%（page.tsxのテスト追加後）
- フェーズ2（中期）: 80%（全コンポーネントのテスト完成後）

**jest.config.mjs に追加**:

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 80,
    lines: 80,
    statements: 80,
  },
},
```

#### 2. テストの自動化とCIの強化

**現在のCI**:

- ✓ ESLint
- ✓ TypeScript型チェック（ビルド時）
- ✓ Jest単体テスト
- ✓ ビルド検証

**追加すべきCI項目**:

1. **カバレッジレポートのアップロード**
    - Codecovなどのサービス連携を検討

## 5. テストベストプラクティス

### 5.1. コンポーネントテスト

1. **ユーザー視点でテストを書く**
    - `getByRole`, `getByLabelText` などのセマンティッククエリを優先
    - `getByTestId` は最後の手段

2. **アクセシビリティを意識**
    - キーボード操作のテスト
    - スクリーンリーダー対応の確認

3. **実装詳細に依存しない**
    - 内部状態ではなく、ユーザーが見る結果をテスト
    - CSSクラス名への依存を最小限に

### 5.2. テスト構造

1. **AAA（Arrange-Act-Assert）パターン**
   ```typescript
   it('テストケース', () => {
     // Arrange: テストの準備
     const { container } = render(<Component />);
     
     // Act: 操作を実行
     fireEvent.click(screen.getByRole('button'));
     
     // Assert: 結果を検証
     expect(screen.getByText('期待される結果')).toBeInTheDocument();
   });
   ```

2. **describeブロックで論理的にグループ化**
    - コンポーネント名 → 機能 → 具体的なケース

3. **テストケースは独立させる**
    - 各テストは他のテストに依存しない
    - 必要に応じて `beforeEach` でリセット

### 5.3. モック化の指針

1. **外部依存のモック化**
    - fetch API
    - localStorage
    - Date/時刻

2. **モック化すべきでないもの**
    - テスト対象のコンポーネント自体
    - 単純なユーティリティ関数

3. **モックの実装は現実的に**
    - 実際のAPIレスポンスに近い形式

### 5.4. テストの保守性

1. **ヘルパー関数の活用**
   ```typescript
   // __tests__/helpers/renderWithProviders.tsx
   export function renderWithProviders(ui: ReactElement) {
     return render(
       <DarkModeProvider>
         {ui}
       </DarkModeProvider>
     );
   }
   ```

2. **共通のモック設定を再利用**
   ```typescript
   // __tests__/helpers/mockFetch.ts
   export function mockFetchCSV(data: string) {
     global.fetch = jest.fn(() =>
       Promise.resolve({
         ok: true,
         arrayBuffer: () => Promise.resolve(new TextEncoder().encode(data).buffer),
       })
     ) as jest.Mock;
   }
   ```

3. **テストのドキュメント化**
    - テストケースの説明は日本語で明確に
    - 複雑なロジックにはコメントを追加

## 6. 実装の優先順位

### 優先度1（即座に実施）

1. ✅ page.tsx のユニットテスト作成
2. ✅ layout.tsx のテスト作成
3. ✅ カバレッジを60%以上に引き上げ

### 優先度2（1-2ヶ月以内）

1. ⬜ カバレッジ目標80%達成
2. ⬜ CIパイプラインの強化

### 優先度3（3ヶ月以降）

1. ⬜ テストデータ管理の改善
