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

| ツール | バージョン | 用途 |
|--------|-----------|------|
| Jest | 30.2.0 | テストランナー・アサーション |
| React Testing Library | 16.3.2 | Reactコンポーネントテスト |
| @testing-library/jest-dom | 6.9.1 | DOM要素のカスタムマッチャー |
| ts-jest | 29.4.6 | TypeScriptトランスパイル |
| jest-environment-jsdom | 30.2.0 | ブラウザ環境のシミュレーション |

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
  page.tsx             |       0 |        0 |       0 |       0 | 3-266             
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
  - `page.tsx`: メインロジックが未テスト（3-266行目）

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
- 264行のコアビジネスロジックが未テスト
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

#### 1. E2E（エンドツーエンド）テストの不在

**現状**: ユニットテストのみ存在

**リスク**:
- ユーザーフロー全体の動作保証なし
- コンポーネント間の統合問題を検出できない
- 実際のブラウザでの動作検証不可

#### 2. ビジュアルリグレッションテストの不在

**現状**: UIの見た目の変化を検出する仕組みがない

**リスク**:
- 意図しないスタイル変更の見逃し
- ダークモード対応の視覚的検証不足

### 3.3. 優先度：低

#### 1. パフォーマンステストの不在

**現状**: 大規模データでのパフォーマンス未検証

**リスク**:
- 大量データ処理時のパフォーマンス劣化未検出

#### 2. モバイル端末でのテスト不足

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

#### 1. E2Eテストの導入

**推奨ツール**: Playwright

**理由**:
- Next.jsの公式ドキュメントで推奨
- 優れたTypeScriptサポート
- 複数ブラウザ対応
- 高速で信頼性が高い

**導入手順**:
1. Playwrightのインストール
   ```bash
   npm install -D @playwright/test
   npx playwright install
   ```

2. 設定ファイル作成（`playwright.config.ts`）
   ```typescript
   import { defineConfig } from '@playwright/test';
   
   export default defineConfig({
     testDir: './e2e',
     use: {
       baseURL: 'http://localhost:3000',
     },
     webServer: {
       command: 'npm run dev',
       port: 3000,
       reuseExistingServer: !process.env.CI,
     },
   });
   ```

3. E2Eテストディレクトリ作成
   ```
   e2e/
   └── app.spec.ts
   ```

**テストすべきユーザーフロー**:
1. **基本フロー**
   - ページ読み込み
   - CSVデータの表示確認
   - グラフの表示確認
   - テーブルの表示確認

2. **インタラクションフロー**
   - グラフタイプの切り替え
   - 為替レートの変更
   - ダークモードの切り替え

3. **エラーフロー**
   - CSVファイルが存在しない場合のエラー表示

**実装例**:
```typescript
// e2e/app.spec.ts
import { test, expect } from '@playwright/test';

test('配当金グラフが正しく表示される', async ({ page }) => {
  await page.goto('/');
  
  // ローディングが完了するまで待機
  await expect(page.getByText('読み込み中...')).toBeHidden();
  
  // グラフが表示されることを確認
  await expect(page.getByText('配当金グラフ')).toBeVisible();
  
  // テーブルが表示されることを確認
  await expect(page.getByRole('table')).toBeVisible();
});

test('グラフタイプを切り替えられる', async ({ page }) => {
  await page.goto('/');
  
  // 折れ線グラフボタンをクリック
  await page.getByRole('button', { name: '折れ線グラフ' }).click();
  
  // グラフが切り替わったことを確認（実装依存）
  // 例: await expect(page.locator('.recharts-line')).toBeVisible();
});

test('ダークモードの切り替え', async ({ page }) => {
  await page.goto('/');
  
  // ダークモードボタンをクリック
  await page.getByRole('button', { name: /ライトモード|ダークモード/ }).click();
  
  // ダークモードが適用されたことを確認
  await expect(page.locator('html')).toHaveClass(/dark/);
});
```

**CI/CD統合**:
`.github/workflows/ci.yml` に追加:
```yaml
- name: Playwright Tests
  run: npx playwright test
  
- name: Upload Playwright Report
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```

#### 2. カバレッジ目標の設定

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

#### 3. テストの自動化とCIの強化

**現在のCI**:
- ✓ ESLint
- ✓ TypeScript型チェック（ビルド時）
- ✓ Jest単体テスト
- ✓ ビルド検証

**追加すべきCI項目**:
1. **E2Eテストの実行**（上記参照）
2. **カバレッジレポートのアップロード**
   - Codecovなどのサービス連携を検討
3. **パフォーマンス計測**
   - Lighthouse CI の導入を検討

### 4.3. 長期目標（3ヶ月以上）

#### 1. ビジュアルリグレッションテストの導入

**推奨ツール**: Playwright + Playwright Visual Comparisons

**実装方針**:
```typescript
// e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

test('ホームページのビジュアル', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('home-light-mode.png');
});

test('ダークモードのビジュアル', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /ライトモード/ }).click();
  await expect(page).toHaveScreenshot('home-dark-mode.png');
});
```

#### 2. パフォーマンステストの追加

**目的**:
- 大規模CSVファイルの処理性能確認
- レンダリングパフォーマンスの計測
- メモリリーク検出

**実装方針**:
1. **Jest Performance Tests**
   ```typescript
   describe('Performance Tests', () => {
     it('大量データの処理が1秒以内に完了する', () => {
       const startTime = performance.now();
       // 大量データでcalculateDividendDataを実行
       const endTime = performance.now();
       expect(endTime - startTime).toBeLessThan(1000);
     });
   });
   ```

2. **Lighthouse CI の統合**
   - パフォーマンススコアの計測
   - アクセシビリティスコアの計測
   - SEOスコアの計測

#### 3. テストデータ管理の改善

**現在の課題**:
- テストデータがテストコード内にハードコード
- 実データファイルへの依存

**改善方針**:
1. **テストフィクスチャの作成**
   ```
   __tests__/
   └── fixtures/
       └── sample-dividend.csv  # テスト用サンプルCSV
   ```

2. **テストデータジェネレータの作成**
   ```typescript
   // __tests__/helpers/dataGenerator.ts
   export function generateDividendData(options: {
     years: number;
     currency: 'JPY' | 'USD';
     amount: number;
   }): CSVRow[] {
     // テストデータを生成
   }
   ```

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
1. ⬜ E2Eテスト（Playwright）の導入
2. ⬜ カバレッジ目標80%達成
3. ⬜ CIパイプラインの強化

### 優先度3（3ヶ月以降）
1. ⬜ ビジュアルリグレッションテスト
2. ⬜ パフォーマンステスト
3. ⬜ テストデータ管理の改善

## 7. まとめ

### 7.1. 現状の評価

**強み**:
- ✅ 既存のコンポーネントテストは高品質
- ✅ テストインフラは整備済み（Jest + React Testing Library）
- ✅ CI/CDパイプラインが機能している
- ✅ TypeScript による型安全性

**課題**:
- ❌ メインロジック（page.tsx）のテストが不在
- ❌ 全体のカバレッジが低い（38.59%）
- ❌ E2Eテストが存在しない
- ❌ ビジュアルテストがない

### 7.2. 次のアクション

1. **今すぐ始めるべきこと**
   - `__tests__/src/app/page.test.tsx` の作成を開始
   - CSVデータのモック化戦略を決定
   - テストヘルパー関数の作成

2. **チーム全体で取り組むべきこと**
   - テストカバレッジ目標の合意形成
   - E2Eテスト導入のロードマップ作成
   - テストコードレビューの体制確立

3. **定期的に見直すべきこと**
   - カバレッジレポートの確認（週次）
   - テスト実行時間の監視（遅くなったら対策）
   - CI/CDパイプラインの改善点検討

### 7.3. 期待される効果

**短期的効果**:
- バグの早期発見
- リファクタリングの安全性向上
- コードレビューの効率化

**長期的効果**:
- 開発速度の向上
- プロダクト品質の安定化
- 新メンバーのオンボーディング容易化
- 技術的負債の削減

---

**ドキュメント作成日**: 2026年2月5日  
**最終更新日**: 2026年2月5日  
**作成者**: GitHub Copilot  
**バージョン**: 1.0.0
