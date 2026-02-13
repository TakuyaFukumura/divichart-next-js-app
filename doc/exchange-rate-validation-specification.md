# 為替レート入力バリデーション改善仕様書

## ドキュメント概要

このドキュメントでは、為替レート入力機能のバリデーション改善について、現状分析と改善仕様を定義します。

## 作成日

2026年2月12日

---

## 目次

1. [現状分析](#現状分析)
2. [問題点の詳細](#問題点の詳細)
3. [改善提案](#改善提案)
4. [技術仕様](#技術仕様)
5. [実装計画](#実装計画)
6. [テスト計画](#テスト計画)
7. [今後の展望](#今後の展望)

---

## 現状分析

### 現在の実装状況

**対象ファイル**: `/src/app/settings/page.tsx`

#### 現在のバリデーション機能

1. **入力値の型チェック**
   - `type="number"` による数値入力の制限
   - `min="0.01"` によるHTML5の最小値設定
   - `step="0.01"` による小数点第2位までの入力

2. **JavaScriptバリデーション**
   ```typescript
   // 空文字列または数値でない場合のチェック
   if (value === '' || isNaN(numValue)) {
       setError('数値を入力してください');
       return;
   }
   
   // 正の数値チェック
   if (numValue <= 0) {
       setError('正の数値を入力してください');
       return;
   }
   ```

3. **エラー表示**
   - エラーメッセージの表示（赤文字）
   - 入力フィールドの枠線を赤色に変更
   - エラー時にフォーカスアウトで値をリセット

4. **即座の反映**
   - 有効な値を入力すると即座にグローバルステートを更新
   - 全ページにリアルタイムで反映

### 良い点

✅ **基本的なバリデーションが実装されている**
- 数値のみの入力制限
- 正の数値チェック
- エラーメッセージの表示

✅ **ユーザーフレンドリーな設計**
- 無効な値でも入力自体は可能（入力中の体験を損なわない）
- フォーカスアウト時の自動リセット機能

✅ **アクセシビリティ対応**
- `aria-invalid` 属性の適切な使用
- `aria-describedby` によるエラーメッセージとの関連付け

---

## 問題点の詳細

### 1. 入力値の範囲制限がない

**問題**:
- 現在は `0.01` 以上であれば、どんな大きな数値も入力可能
- 例: `1`, `10000`, `999999` などの非現実的な値が入力できる

**影響**:
- 誤入力による誤った配当金計算
- アプリケーションの信頼性低下
- ユーザーが間違いに気づきにくい

**現実的な為替レート範囲**:
- 過去の為替レート（1990年〜2026年）:
  - 最小: 約75円（2011年）
  - 最大: 約160円（1990年）
- 想定される将来的な範囲:
  - **許容範囲: 50円〜300円**
  - この範囲外はエラーとして入力を受け付けない

### 2. 視覚的なフィードバックが限定的

**問題**:
- エラー時の表示は赤文字と赤枠のみ
- 入力中の状態が不明瞭
- 有効な範囲の案内が不足

**影響**:
- ユーザーがどの値が適切かわかりにくい
- エラーメッセージだけでは情報が不足
- 初心者ユーザーにとって使いづらい

### 3. 頻繁な再計算による処理負荷

**問題**:
- 入力のたびに即座に `setUsdToJpyRate()` を実行
- 配当金データの再計算が頻繁に実行される
- 大量のデータがある場合、パフォーマンス問題の可能性

**影響**:
- 入力中のラグやちらつき
- 不必要な計算処理
- バッテリー消費の増加（モバイルデバイス）

### 4. 最小値設定の不整合

**問題**:
- HTML属性: `min="0.01"`
- JavaScript検証: `if (numValue <= 0)`
- この2つが微妙に異なる基準を持つ

**影響**:
- コードの一貫性の欠如
- 将来のメンテナンス性の低下

---

## 改善提案

### 提案1: 入力値の範囲制限（必須）

#### 概要
為替レートの入力範囲を **50円〜300円** に制限し、範囲外の値はエラーとして受け付けないようにします。

#### 実装内容

1. **範囲定数の定義**
   ```typescript
   const MIN_USD_TO_JPY_RATE = 50;
   const MAX_USD_TO_JPY_RATE = 300;
   ```

2. **バリデーションロジックの追加**
   ```typescript
   if (numValue < MIN_USD_TO_JPY_RATE || numValue > MAX_USD_TO_JPY_RATE) {
       setError(`為替レートは${MIN_USD_TO_JPY_RATE}円〜${MAX_USD_TO_JPY_RATE}円の範囲で入力してください`);
       return;
   }
   ```

3. **HTML属性の更新**
   ```tsx
   <input
       type="number"
       min={MIN_USD_TO_JPY_RATE}
       max={MAX_USD_TO_JPY_RATE}
       step="0.01"
       // ...
   />
   ```

#### 期待される効果
- 非現実的な値の入力を防止
- ユーザーに適切な範囲を明示
- データの整合性向上

### 提案2: 視覚的フィードバックの強化（必須）

#### 概要
入力状態に応じた視覚的なフィードバックを強化し、ユーザーエクスペリエンスを向上させます。

#### 実装内容

1. **範囲ガイドの追加**
   ```tsx
   <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
       入力可能範囲: {MIN_USD_TO_JPY_RATE}円 〜 {MAX_USD_TO_JPY_RATE}円
   </div>
   ```

2. **エラー表示の分類**
   - **エラー（赤）**: 無効な値（数値でない、範囲外）
   - **将来的な拡張（オプション）**:
     - 範囲を拡張した際の段階的な警告（例: 50円未満または300円超の場合に警告を表示しつつ入力を許可）
     - 成功（緑）: 通常の有効な値の明示的な表示

3. **入力中の状態表示**
   ```tsx
   {isEditing && !error && (
       <p className="text-xs text-blue-500 dark:text-blue-400">
           入力中...
       </p>
   )}
   ```

4. **インタラクティブなヘルプ**
   - ツールチップまたは情報アイコンで詳細説明を表示
   - 推奨値の例を表示（例: 現在の実勢レート）

#### 期待される効果
- ユーザーが適切な値を入力しやすくなる
- エラーの原因が明確になる
- アプリの使いやすさが向上

### 提案3: デバウンス処理の追加（必須）

#### 概要
入力中の頻繁な再計算を防ぐため、デバウンス処理を導入します。

#### 実装内容

1. **デバウンスの実装**
   ```typescript
   import {useCallback, useRef} from 'react';
   
   const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
   const DEBOUNCE_DELAY = 500; // 500ミリ秒
   
   const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
       const value = e.target.value;
       setInputValue(value);
       setError('');
       setIsEditing(true);
       
       // 即座のバリデーションは維持
       const numValue = parseFloat(value);
       if (value === '' || isNaN(numValue)) {
           setError('数値を入力してください');
           return;
       }
       
       if (numValue < MIN_USD_TO_JPY_RATE || numValue > MAX_USD_TO_JPY_RATE) {
           setError(`為替レートは${MIN_USD_TO_JPY_RATE}円〜${MAX_USD_TO_JPY_RATE}円の範囲で入力してください`);
           return;
       }
       
       // デバウンス処理でステート更新を遅延
       if (debounceTimeoutRef.current) {
           clearTimeout(debounceTimeoutRef.current);
       }
       
       debounceTimeoutRef.current = setTimeout(() => {
           setUsdToJpyRate(numValue);
       }, DEBOUNCE_DELAY);
   };
   ```

2. **クリーンアップ処理**
   ```typescript
   useEffect(() => {
       return () => {
           if (debounceTimeoutRef.current) {
               clearTimeout(debounceTimeoutRef.current);
           }
       };
   }, []);
   ```

#### 期待される効果
- 入力中のパフォーマンス向上
- サーバー側への不要なリクエスト削減（将来的なAPI連携を考慮）
- バッテリー消費の削減
- より滑らかなユーザー体験

### 提案4: 共通定数の抽出（推奨）

#### 概要
為替レート関連の定数を一箇所にまとめ、メンテナンス性を向上させます。

#### 実装内容

1. **定数ファイルの作成**
   ```typescript
   // /src/lib/exchangeRate.ts に追加
   
   /** デフォルトの為替レート（1ドル=150円） */
   export const DEFAULT_USD_TO_JPY_RATE = 150;
   
   /** 為替レートの最小値 */
   export const MIN_USD_TO_JPY_RATE = 50;
   
   /** 為替レートの最大値 */
   export const MAX_USD_TO_JPY_RATE = 300;
   
   /** 為替レート入力のデバウンス遅延（ミリ秒） */
   export const EXCHANGE_RATE_DEBOUNCE_DELAY = 500;
   ```

2. **各ファイルでのインポート**
   ```typescript
   import {
       DEFAULT_USD_TO_JPY_RATE,
       MIN_USD_TO_JPY_RATE,
       MAX_USD_TO_JPY_RATE,
       EXCHANGE_RATE_DEBOUNCE_DELAY
   } from '@/lib/exchangeRate';
   ```

#### 期待される効果
- コードの一貫性向上
- 将来的な変更が容易
- 定数の再利用性向上

---

## 技術仕様

### 定数定義

| 定数名 | 値 | 説明 |
| ------ | --- | ---- |
| `MIN_USD_TO_JPY_RATE` | 50 | 為替レートの最小値（円） |
| `MAX_USD_TO_JPY_RATE` | 300 | 為替レートの最大値（円） |
| `DEFAULT_USD_TO_JPY_RATE` | 150 | デフォルトの為替レート（円） |
| `EXCHANGE_RATE_DEBOUNCE_DELAY` | 500 | デバウンス遅延時間（ミリ秒） |

### バリデーションルール

#### ルール1: 数値型チェック
- **条件**: 入力値が数値に変換可能であること
- **エラーメッセージ**: "数値を入力してください"

#### ルール2: 範囲チェック
- **条件**: `MIN_USD_TO_JPY_RATE <= 値 <= MAX_USD_TO_JPY_RATE`
- **エラーメッセージ**: "為替レートは50円〜300円の範囲で入力してください"

#### ルール3: 即座の表示更新
- バリデーションエラーは即座に表示
- 有効な値の場合、デバウンス後にグローバルステートを更新

### UIコンポーネント仕様

#### 入力フィールド

```tsx
<input
    id="usd-jpy-rate"
    type="number"
    min={MIN_USD_TO_JPY_RATE}
    max={MAX_USD_TO_JPY_RATE}
    step="0.01"
    value={inputValue}
    onChange={handleInputChange}
    onBlur={handleBlur}
    className={`... ${
        error
            ? 'border-red-500 dark:border-red-500'
            : 'border-gray-300 dark:border-gray-600'
    }`}
    aria-invalid={error ? 'true' : 'false'}
    aria-describedby={error ? 'rate-error' : 'rate-guide'}
/>
```

#### エラー表示

```tsx
{error && (
    <p id="rate-error" className="text-sm text-red-600 dark:text-red-400 mt-2">
        {error}
    </p>
)}
```

#### ガイド表示

```tsx
<p id="rate-guide" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
    入力可能範囲: {MIN_USD_TO_JPY_RATE}円 〜 {MAX_USD_TO_JPY_RATE}円
</p>
```

### データフロー

```
ユーザー入力
    ↓
handleInputChange
    ↓
バリデーション（即座）
    ├─ エラー → エラー表示、ステート更新なし
    └─ 有効 → デバウンス処理
              ↓
         500ms待機
              ↓
      setUsdToJpyRate（グローバルステート更新）
              ↓
       localStorage保存
              ↓
     全ページに反映（配当金再計算）
```

---

## 実装計画

### フェーズ1: 定数の定義と抽出（所要時間: 30分）

**タスク**:
1. `/src/lib/exchangeRate.ts` に定数を追加
   - `MIN_USD_TO_JPY_RATE`
   - `MAX_USD_TO_JPY_RATE`
   - `EXCHANGE_RATE_DEBOUNCE_DELAY`
2. 既存の `DEFAULT_USD_TO_JPY_RATE` との整合性確認

**成果物**:
- 更新された `/src/lib/exchangeRate.ts`

### フェーズ2: バリデーションロジックの実装（所要時間: 1時間）

**タスク**:
1. `/src/app/settings/page.tsx` の更新
   - 定数のインポート
   - 範囲チェックロジックの追加
   - エラーメッセージの更新
2. HTML属性の更新
   - `min` 属性を `MIN_USD_TO_JPY_RATE` に変更
   - `max` 属性を `MAX_USD_TO_JPY_RATE` に追加

**成果物**:
- 更新された `/src/app/settings/page.tsx`

### フェーズ3: 視覚的フィードバックの追加（所要時間: 1時間）

**タスク**:
1. ガイドテキストの追加
2. エラー表示の改善
3. アクセシビリティ属性の確認と更新

**成果物**:
- UI改善された設定ページ

### フェーズ4: デバウンス処理の実装（所要時間: 1時間）

**タスク**:
1. `useRef` フックの追加
2. デバウンスロジックの実装
3. クリーンアップ処理の追加
4. 既存のバリデーション動作との統合

**成果物**:
- パフォーマンスが向上した入力処理

### フェーズ5: テストとドキュメント（所要時間: 1.5時間）

**タスク**:
1. ユニットテストの作成・更新
2. 手動テストの実施
3. ドキュメントの更新（このファイル）
4. コードレビュー準備

**成果物**:
- テストファイル
- 更新されたドキュメント

**総所要時間**: 約5時間

---

## テスト計画

### ユニットテスト

**テストファイル**: `__tests__/src/app/settings/page.test.tsx`

#### テストケース1: 範囲内の有効な値

```typescript
test('範囲内の有効な値が受け入れられる', async () => {
    const {getByLabelText} = render(<SettingsPage />);
    const input = getByLabelText('為替レート（1ドル = 円）');
    
    fireEvent.change(input, {target: {value: '150'}});
    
    await waitFor(() => {
        expect(screen.queryByText(/為替レートは/)).not.toBeInTheDocument();
    });
});
```

#### テストケース2: 最小値未満のエラー

```typescript
test('最小値未満の値でエラーが表示される', () => {
    const {getByLabelText, getByText} = render(<SettingsPage />);
    const input = getByLabelText('為替レート（1ドル = 円）');
    
    fireEvent.change(input, {target: {value: '40'}});
    
    expect(getByText('為替レートは50円〜300円の範囲で入力してください')).toBeInTheDocument();
});
```

#### テストケース3: 最大値超過のエラー

```typescript
test('最大値超過の値でエラーが表示される', () => {
    const {getByLabelText, getByText} = render(<SettingsPage />);
    const input = getByLabelText('為替レート（1ドル = 円）');
    
    fireEvent.change(input, {target: {value: '350'}});
    
    expect(getByText('為替レートは50円〜300円の範囲で入力してください')).toBeInTheDocument();
});
```

#### テストケース4: デバウンス動作

```typescript
test('デバウンス処理が正しく動作する', async () => {
    jest.useFakeTimers();
    const {getByLabelText} = render(<SettingsPage />);
    const input = getByLabelText('為替レート（1ドル = 円）');
    
    fireEvent.change(input, {target: {value: '140'}});
    fireEvent.change(input, {target: {value: '145'}});
    fireEvent.change(input, {target: {value: '150'}});
    
    // 500ms経過前は更新されない
    expect(mockSetUsdToJpyRate).not.toHaveBeenCalled();
    
    // 500ms経過後に最後の値で更新される
    jest.advanceTimersByTime(500);
    expect(mockSetUsdToJpyRate).toHaveBeenCalledWith(150);
    expect(mockSetUsdToJpyRate).toHaveBeenCalledTimes(1);
    
    jest.useRealTimers();
});
```

#### テストケース5: 境界値テスト

```typescript
test('境界値が正しく処理される', () => {
    const {getByLabelText} = render(<SettingsPage />);
    const input = getByLabelText('為替レート（1ドル = 円）');
    
    // 最小値ちょうど
    fireEvent.change(input, {target: {value: '50'}});
    expect(screen.queryByText(/為替レートは/)).not.toBeInTheDocument();
    
    // 最大値ちょうど
    fireEvent.change(input, {target: {value: '300'}});
    expect(screen.queryByText(/為替レートは/)).not.toBeInTheDocument();
    
    // 最小値-1
    fireEvent.change(input, {target: {value: '49.99'}});
    expect(screen.getByText(/為替レートは/)).toBeInTheDocument();
    
    // 最大値+1
    fireEvent.change(input, {target: {value: '300.01'}});
    expect(screen.getByText(/為替レートは/)).toBeInTheDocument();
});
```

### 手動テスト

#### テストシナリオ1: 基本的な入力操作

1. `/settings` ページにアクセス
2. 為替レート入力フィールドに「150」を入力
3. ✅ エラーが表示されないこと
4. ✅ 500ms後にホームページで値が反映されること

#### テストシナリオ2: 範囲外の値の入力

1. 為替レート入力フィールドに「40」を入力
2. ✅ エラーメッセージが表示されること
3. ✅ 入力フィールドの枠が赤色になること
4. ✅ グローバルステートが更新されないこと

#### テストシナリオ3: 連続入力時のデバウンス

1. 為替レート入力フィールドに素早く「1」「4」「0」を入力
2. ✅ 入力中はエラーが表示されること（「1」「14」の段階）
3. ✅ 「140」入力後、エラーが消えること
4. ✅ 500ms後に一度だけステートが更新されること

#### テストシナリオ4: ダークモード

1. ダークモードに切り替え
2. エラー状態で入力
3. ✅ エラーメッセージとガイドが視認できること
4. ✅ 入力フィールドのスタイルが適切であること

#### テストシナリオ5: アクセシビリティ

1. スクリーンリーダーモードで操作
2. ✅ エラーメッセージが読み上げられること
3. ✅ `aria-invalid` 属性が適切に設定されること
4. ✅ `aria-describedby` でガイドテキストが関連付けられること

---

## 今後の展望

### 短期的な改善（次のイテレーション）

#### 1. リアルタイム為替レート取得機能

**概要**: 
外部APIから現在の実勢レートを取得し、参考値として表示する機能。

**実装案**:
- 為替レートAPIの選定（例: ExchangeRate-API, Open Exchange Rates）
- 「現在のレートを取得」ボタンの追加
- キャッシュ機構の実装（1日1回の更新）

**メリット**:
- ユーザーが手動で調べる手間が省ける
- より正確な配当金計算が可能

#### 2. 入力履歴の保存

**概要**:
過去に入力した為替レートの履歴を保存し、素早く切り替えられる機能。

**実装案**:
- localStorage に履歴を配列で保存（最大10件）
- ドロップダウンメニューで選択可能
- 日付とメモを付けられる

**メリット**:
- 複数のシナリオ分析が容易
- 過去の設定を簡単に再現できる

#### 3. 為替レートのプリセット機能

**概要**:
よく使う為替レート（保守的、中立、楽観的など）をプリセットとして保存。

**実装案**:
- 「保守的（140円）」「中立（150円）」「楽観的（160円）」などのプリセット
- ユーザーがカスタムプリセットを追加可能
- 名前と値を設定

**メリット**:
- ワンクリックで切り替え可能
- 複数パターンの比較が容易

### 中期的な改善

#### 1. 為替レート変動の影響分析

**概要**:
為替レートが変動した場合の配当収入への影響を視覚化。

**実装案**:
- スライダーで為替レートを調整
- リアルタイムで影響を確認
- ±10%、±20%のシナリオ比較

**メリット**:
- 為替リスクの理解向上
- シナリオプランニングの支援

#### 2. 通知機能

**概要**:
設定した為替レートから大きく乖離した場合に通知。

**実装案**:
- 目標レート範囲の設定
- ブラウザ通知の使用
- ローカルでの定期チェック

**メリット**:
- タイムリーな情報の取得
- 為替変動への対応が素早くなる

### 長期的な改善

#### 1. 複数通貨対応

**概要**:
USD以外の通貨（EUR、GBPなど）にも対応。

**実装案**:
- 通貨ごとの為替レート設定
- 通貨変換の自動化
- 通貨ごとの配当金集計

**メリット**:
- グローバルなポートフォリオに対応
- より柔軟なデータ管理

#### 2. AI による為替レート予測

**概要**:
機械学習モデルを使用した為替レート予測機能。

**実装案**:
- 過去データの学習
- 短期予測（1週間〜1ヶ月）
- 信頼区間の表示

**メリット**:
- 将来の配当収入の見積もり精度向上
- データドリブンな意思決定

---

## 参考資料

### 関連ドキュメント

- [doc/feature-addition-consideration.md](./feature-addition-consideration.md) - 機能追加検討
- [doc/developer-specification.md](./developer-specification.md) - 開発者向け仕様書
- [README.md](../README.md) - プロジェクト概要

### 外部リソース

- [React Hook Form - Validation](https://react-hook-form.com/get-started#Applyvalidation)
- [lodash.debounce - npm](https://www.npmjs.com/package/lodash.debounce)
- [ARIA: aria-invalid - MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-invalid)
- [為替レートの歴史データ](https://www.xe.com/ja/currency-charts/)

### UIデザイン参考

- [Material Design - Text fields](https://material.io/components/text-fields)
- [Tailwind UI - Form layouts](https://tailwindui.com/components/application-ui/forms/form-layouts)

---

## 変更履歴

- 2026年2月12日: 初版作成
  - 現状分析の実施
  - 問題点の洗い出し
  - 改善提案の策定
  - 技術仕様の定義
  - 実装計画の作成
  - テスト計画の作成
  - 今後の展望の追加

---

## まとめ

この仕様書では、為替レート入力機能のバリデーション改善について、以下の3つの主要な改善を提案しました：

1. **入力値の範囲制限（50円〜300円）**
   - 非現実的な値の入力を防止
   - データの整合性向上

2. **視覚的フィードバックの強化**
   - ガイドテキストの追加
   - エラー表示の改善
   - ユーザビリティの向上

3. **デバウンス処理の追加（500ms）**
   - 頻繁な再計算の防止
   - パフォーマンスの向上
   - より滑らかなユーザー体験

これらの改善により、以下の効果が期待されます：

- ✅ **ユーザーエクスペリエンスの向上**: 明確なガイドとエラーメッセージ
- ✅ **データ品質の向上**: 不適切な値の入力防止
- ✅ **パフォーマンスの向上**: デバウンスによる不要な処理の削減
- ✅ **メンテナンス性の向上**: 定数の一元管理

総実装時間は約5時間を見込んでおり、段階的な実装により、各フェーズでの動作確認を行いながら進めることができます。

実装の際は、既存のコードベースとの整合性を保ちつつ、段階的にリリースすることで、リスクを最小限に抑えることが重要です。

<!-- 日本語でレビューして下さい -->
