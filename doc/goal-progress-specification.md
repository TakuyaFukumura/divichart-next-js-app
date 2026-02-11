# 目標設定とプログレスバー画面 仕様書

## ドキュメント概要

このドキュメントでは、配当金の目標設定と達成度を可視化するプログレスバー画面の仕様を定義します。
ユーザーが配当収入の目標を設定し、年別の達成状況を視覚的に確認できる機能を提供します。

## 作成日

2026年2月11日

---

## 1. 機能概要

### 1.1 目的

- 配当金の目標設定によりユーザーのモチベーションを向上させる
- 年別の目標達成度を可視化し、投資の進捗を把握しやすくする
- 目標と実績の比較により、投資計画の見直しに役立てる

### 1.2 主要機能

1. **目標金額の設定**
   - 月平均配当目標金額を設定可能
   - デフォルト値: 月平均30,000円（年間360,000円）
   - localStorageに保存し、設定を永続化

2. **年別達成度の可視化**
   - 各年度の目標達成率をプログレスバーで表示
   - 縦軸: 年度（降順：最新年が上）
   - 横軸: 達成率（0%〜100%以上）

3. **達成状況の詳細表示**
   - 実際の配当金額
   - 目標金額
   - 達成率（パーセンテージ）
   - 目標との差額

---

## 2. 画面設計

### 2.1 URL構成

```
/goals
```

既存の画面構成に追加：
- `/` - 年別配当グラフ
- `/cumulative` - 累計配当グラフ
- `/portfolio` - 配当ポートフォリオ
- `/settings` - 設定画面
- `/goals` - 目標達成度（新規追加）

### 2.2 画面レイアウト

#### 2.2.1 ヘッダー部分

```
┌─────────────────────────────────────────────────────┐
│ 配当目標達成度                                        │
│                                                     │
│ [目標設定] ボタン                                    │
└─────────────────────────────────────────────────────┘
```

#### 2.2.2 目標設定エリア

```
┌─────────────────────────────────────────────────────┐
│ 月平均配当目標                                        │
│ ┌─────────────────────┐                            │
│ │ ¥30,000             │ [保存] ボタン               │
│ └─────────────────────┘                            │
│                                                     │
│ ※ 年間目標: ¥360,000                                │
└─────────────────────────────────────────────────────┘
```

#### 2.2.3 プログレスバー表示エリア

```
┌─────────────────────────────────────────────────────┐
│ 年別達成状況                                          │
│                                                     │
│ 2026年  [████████████░░░░░░] 75%                   │
│         実績: ¥270,000 / 目標: ¥360,000            │
│         差額: -¥90,000                              │
│                                                     │
│ 2025年  [████████████████████] 120%                │
│         実績: ¥432,000 / 目標: ¥360,000            │
│         差額: +¥72,000                              │
│                                                     │
│ 2024年  [████████░░░░░░░░░░░░] 45%                │
│         実績: ¥162,000 / 目標: ¥360,000            │
│         差額: -¥198,000                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### 2.2.4 サマリー表示エリア

```
┌─────────────────────────────────────────────────────┐
│ 達成状況サマリー                                      │
│ ┌─────────────────┐ ┌─────────────────┐           │
│ │ 目標達成年数     │ │ 平均達成率       │           │
│ │ 1年 / 3年       │ │ 80.0%            │           │
│ └─────────────────┘ └─────────────────┘           │
│                                                     │
│ ┌─────────────────┐ ┌─────────────────┐           │
│ │ 最高達成率       │ │ 最低達成率       │           │
│ │ 120% (2025年)   │ │ 45% (2024年)     │           │
│ └─────────────────┘ └─────────────────┘           │
└─────────────────────────────────────────────────────┘
```

#### 2.2.5 年別詳細テーブル

```
┌────────────────────────────────────────────────────────────┐
│ 年別詳細                                                    │
├──────┬──────────┬──────────┬──────────┬──────────┤
│ 年   │ 実績[円] │ 目標[円] │ 達成率   │ 差額[円] │
├──────┼──────────┼──────────┼──────────┼──────────┤
│ 2026 │ 270,000  │ 360,000  │   75%    │ -90,000  │
│ 2025 │ 432,000  │ 360,000  │  120%    │ +72,000  │
│ 2024 │ 162,000  │ 360,000  │   45%    │-198,000  │
└──────┴──────────┴──────────┴──────────┴──────────┘
```

### 2.3 UI/UXの詳細

#### 2.3.1 プログレスバーのデザイン

- **未達成時（0% 〜 99%）**
  - 背景色: グレー（`bg-gray-200 dark:bg-gray-700`）
  - プログレス色: 青色（`bg-blue-500`）
  - テキスト色: 赤色（`text-red-600 dark:text-red-400`）

- **達成時（100% 〜 119%）**
  - 背景色: グレー（`bg-gray-200 dark:bg-gray-700`）
  - プログレス色: 緑色（`bg-green-500`）
  - テキスト色: 緑色（`text-green-600 dark:text-green-400`）

- **大幅達成時（120%以上）**
  - 背景色: グレー（`bg-gray-200 dark:bg-gray-700`）
  - プログレス色: 金色（`bg-yellow-500`）
  - テキスト色: 黄色（`text-yellow-600 dark:text-yellow-400`）

#### 2.3.2 目標設定フォーム

- 入力形式: 数値入力フィールド
- 最小値: 1,000円
- 最大値: 10,000,000円
- ステップ: 1,000円
- デフォルト値: 30,000円
- バリデーション:
  - 必須入力
  - 正の整数のみ
  - 範囲チェック

#### 2.3.3 レスポンシブデザイン

- **デスクトップ（1024px以上）**
  - プログレスバーの幅: 最大600px
  - サマリーカード: 2列配置
  - テーブル: 全カラム表示

- **タブレット（768px〜1023px）**
  - プログレスバーの幅: コンテナ幅の90%
  - サマリーカード: 2列配置
  - テーブル: 全カラム表示（スクロール可）

- **モバイル（767px以下）**
  - プログレスバーの幅: コンテナ幅の100%
  - サマリーカード: 1列配置
  - テーブル: 横スクロール

#### 2.3.4 ダークモード対応

すべての要素でダークモードに対応：
- 背景色: `dark:bg-gray-800`, `dark:bg-gray-900`
- テキスト色: `dark:text-gray-200`, `dark:text-gray-300`
- ボーダー: `dark:border-gray-700`
- プログレスバー背景: `dark:bg-gray-700`

---

## 3. データ構造

### 3.1 型定義

```typescript
/**
 * 目標設定の型定義
 */
export type GoalSettings = {
  /** 月平均配当目標金額 [円] */
  monthlyTargetAmount: number;
};

/**
 * 年別目標達成データの型定義
 */
export type YearlyGoalAchievement = {
  /** 対象年 */
  year: number;
  /** 実際の年間配当金 [円] */
  actualAmount: number;
  /** 目標金額（年間） [円] */
  targetAmount: number;
  /** 達成率 [%] */
  achievementRate: number;
  /** 差額 [円] (正の値: 超過達成, 負の値: 未達成) */
  difference: number;
};

/**
 * 目標達成サマリーの型定義
 */
export type GoalAchievementSummary = {
  /** 目標達成年数 */
  achievedYearsCount: number;
  /** 総年数 */
  totalYearsCount: number;
  /** 平均達成率 [%] */
  averageAchievementRate: number;
  /** 最高達成率 [%] */
  maxAchievementRate: number;
  /** 最高達成率の年 */
  maxAchievementYear: number;
  /** 最低達成率 [%] */
  minAchievementRate: number;
  /** 最低達成率の年 */
  minAchievementYear: number;
};
```

### 3.2 LocalStorageキー

```typescript
// 目標設定の保存キー
const GOAL_SETTINGS_STORAGE_KEY = 'divichart_goal_settings';

// デフォルト値
const DEFAULT_MONTHLY_TARGET = 30000; // 円
```

### 3.3 データフロー

```
┌──────────────┐
│ CSVデータ    │
│ (rawData)    │
└──────┬───────┘
       │
       │ useDividendData()
       ▼
┌──────────────┐
│年別配当金集計│
│(為替換算済み)│
└──────┬───────┘
       │
       │ aggregateDividendsByYear()
       ▼
┌──────────────────────┐        ┌──────────────┐
│ 年別配当金データ      │        │ 目標設定     │
│ Map<string, number>  │◄───────┤ localStorage │
└──────┬───────────────┘        └──────────────┘
       │
       │ calculateGoalAchievements()
       ▼
┌────────────────────────┐
│ YearlyGoalAchievement[]│
└────────┬───────────────┘
         │
         ├─► プログレスバー表示
         ├─► サマリー計算・表示
         └─► 詳細テーブル表示
```

---

## 4. 機能詳細仕様

### 4.1 目標設定機能

#### 4.1.1 デフォルト値の適用

アプリケーション初回起動時、または目標未設定時：
- 月平均配当目標: 30,000円
- 年間配当目標: 360,000円（月平均 × 12）

#### 4.1.2 目標の保存

```typescript
/**
 * 目標設定を保存
 * @param monthlyTarget - 月平均配当目標金額 [円]
 */
function saveGoalSettings(monthlyTarget: number): void {
  const settings: GoalSettings = {
    monthlyTargetAmount: monthlyTarget,
  };
  localStorage.setItem(
    GOAL_SETTINGS_STORAGE_KEY,
    JSON.stringify(settings)
  );
}
```

#### 4.1.3 目標の読み込み

```typescript
/**
 * 目標設定を読み込み
 * @returns 目標設定（未設定の場合はデフォルト値）
 */
function loadGoalSettings(): GoalSettings {
  try {
    const stored = localStorage.getItem(GOAL_SETTINGS_STORAGE_KEY);
    if (stored) {
      const settings = JSON.parse(stored) as GoalSettings;
      return settings;
    }
  } catch (error) {
    console.error('Failed to load goal settings:', error);
  }
  
  // デフォルト値を返す
  return {
    monthlyTargetAmount: DEFAULT_MONTHLY_TARGET,
  };
}
```

### 4.2 達成度計算機能

#### 4.2.1 年別達成度の計算

```typescript
/**
 * 年別の目標達成データを計算
 * @param yearlyDividends - 年別配当金のMap
 * @param monthlyTarget - 月平均配当目標金額 [円]
 * @returns 年別目標達成データの配列
 */
function calculateGoalAchievements(
  yearlyDividends: Map<string, number>,
  monthlyTarget: number
): YearlyGoalAchievement[] {
  const yearlyTarget = monthlyTarget * 12;
  
  return Array.from(yearlyDividends.entries())
    .map(([yearStr, actualAmount]) => {
      const year = parseInt(yearStr, 10);
      const roundedActual = Math.round(actualAmount);
      const difference = roundedActual - yearlyTarget;
      const achievementRate = yearlyTarget === 0 
        ? 0 
        : (roundedActual / yearlyTarget) * 100;
      
      return {
        year,
        actualAmount: roundedActual,
        targetAmount: yearlyTarget,
        achievementRate: Math.round(achievementRate * 10) / 10, // 小数点第1位まで
        difference,
      };
    })
    .sort((a, b) => b.year - a.year); // 降順（最新年が先頭）
}
```

#### 4.2.2 サマリーの計算

```typescript
/**
 * 目標達成サマリーを計算
 * @param achievements - 年別目標達成データの配列
 * @returns 目標達成サマリー
 */
function calculateGoalSummary(
  achievements: YearlyGoalAchievement[]
): GoalAchievementSummary | null {
  if (achievements.length === 0) {
    return null;
  }
  
  const achievedYearsCount = achievements.filter(
    a => a.achievementRate >= 100
  ).length;
  
  const totalYearsCount = achievements.length;
  
  const averageAchievementRate = 
    achievements.reduce((sum, a) => sum + a.achievementRate, 0) / 
    totalYearsCount;
  
  const sortedByRate = [...achievements].sort(
    (a, b) => b.achievementRate - a.achievementRate
  );
  
  const maxAchievement = sortedByRate[0];
  const minAchievement = sortedByRate[sortedByRate.length - 1];
  
  return {
    achievedYearsCount,
    totalYearsCount,
    averageAchievementRate: Math.round(averageAchievementRate * 10) / 10,
    maxAchievementRate: maxAchievement.achievementRate,
    maxAchievementYear: maxAchievement.year,
    minAchievementRate: minAchievement.achievementRate,
    minAchievementYear: minAchievement.year,
  };
}
```

### 4.3 プログレスバー表示機能

#### 4.3.1 プログレスバーコンポーネント

```tsx
/**
 * 年別目標達成プログレスバーコンポーネント
 */
function YearlyGoalProgressBar({ achievement }: { achievement: YearlyGoalAchievement }) {
  // 達成率に応じた色を決定
  const getProgressColor = (rate: number): string => {
    if (rate >= 120) return 'bg-yellow-500';
    if (rate >= 100) return 'bg-green-500';
    return 'bg-blue-500';
  };
  
  const getTextColor = (rate: number): string => {
    if (rate >= 120) return 'text-yellow-600 dark:text-yellow-400';
    if (rate >= 100) return 'text-green-600 dark:text-green-400';
    return 'text-red-600 dark:text-red-400';
  };
  
  const progressWidth = Math.min(achievement.achievementRate, 100);
  const progressColor = getProgressColor(achievement.achievementRate);
  const textColor = getTextColor(achievement.achievementRate);
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {achievement.year}年
        </span>
        <span className={`text-lg font-bold ${textColor}`}>
          {achievement.achievementRate.toFixed(1)}%
        </span>
      </div>
      
      {/* プログレスバー */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
        <div
          className={`h-full ${progressColor} transition-all duration-500 ease-out flex items-center justify-end pr-3`}
          style={{ width: `${progressWidth}%` }}
        >
          {progressWidth > 15 && (
            <span className="text-white text-sm font-semibold">
              {achievement.achievementRate.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      
      {/* 詳細情報 */}
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex justify-between">
          <span>実績: ¥{achievement.actualAmount.toLocaleString()}</span>
          <span>目標: ¥{achievement.targetAmount.toLocaleString()}</span>
        </div>
        <div className="mt-1">
          <span className={achievement.difference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
            差額: {achievement.difference >= 0 ? '+' : ''}¥{achievement.difference.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. 技術的考慮事項

### 5.1 パフォーマンス

- **データ計算の最適化**
  - `useMemo`を使用して年別達成度データをメモ化
  - 為替レートや目標金額が変更されたときのみ再計算

```typescript
const achievements = useMemo(() => {
  if (rawData.length === 0) return [];
  const yearlyDividends = aggregateDividendsByYear(rawData, usdToJpyRate);
  return calculateGoalAchievements(yearlyDividends, goalSettings.monthlyTargetAmount);
}, [rawData, usdToJpyRate, goalSettings.monthlyTargetAmount]);
```

- **レンダリングの最適化**
  - プログレスバーのアニメーションはCSS transitionを使用
  - 大量の年データがある場合は仮想スクロールを検討

### 5.2 データ整合性

- **目標設定のバリデーション**
  - 入力値の型チェック
  - 範囲チェック（最小: 1,000円、最大: 10,000,000円）
  - 不正な値の場合はデフォルト値を使用

- **LocalStorageのエラーハンドリング**
  - JSON.parseの例外処理
  - localStorageが無効な環境への対応
  - データ破損時のフォールバック

### 5.3 ユーザビリティ

- **フィードバックの提供**
  - 目標保存時に成功メッセージを表示
  - バリデーションエラー時にエラーメッセージを表示
  - プログレスバーのアニメーションで視覚的フィードバック

- **アクセシビリティ**
  - プログレスバーにaria-valuenow、aria-valuemin、aria-valuemaxを設定
  - カラーだけでなくテキストでも達成状況を表示
  - キーボード操作でフォーム入力が可能

### 5.4 拡張性

将来的に以下の機能拡張を考慮した設計：

1. **複数の目標設定**
   - 短期目標（1年）、中期目標（3年）、長期目標（5年）
   - 目標タイプの追加が容易な設計

2. **目標の履歴管理**
   - 過去の目標変更履歴を保存
   - 目標変更のトレンド分析

3. **通知機能**
   - 目標達成時の通知
   - 未達成が続く場合のアラート

4. **比較機能**
   - 前年同期比との比較
   - 目標トレンドの可視化

---

## 6. 実装計画

### 6.1 実装の優先順位

#### フェーズ1: 基本機能（優先度: 高）

1. **型定義の追加**
   - `src/types/dividend.ts`に新しい型を追加
   - GoalSettings、YearlyGoalAchievement、GoalAchievementSummary

2. **計算ロジックの実装**
   - `src/lib/goalCalculator.ts`を新規作成
   - 目標達成度の計算関数を実装

3. **LocalStorage管理**
   - `src/lib/goalStorage.ts`を新規作成
   - 目標設定の保存・読み込み関数を実装

4. **画面実装**
   - `src/app/goals/page.tsx`を新規作成
   - 基本的なレイアウトとプログレスバー表示

#### フェーズ2: UI改善（優先度: 中）

5. **コンポーネント分割**
   - `src/app/components/GoalSettingsForm.tsx`
   - `src/app/components/YearlyGoalProgressBar.tsx`
   - `src/app/components/GoalAchievementSummary.tsx`
   - `src/app/components/GoalAchievementTable.tsx`

6. **スタイリングの強化**
   - プログレスバーのアニメーション
   - レスポンシブデザインの最適化

#### フェーズ3: テスト・ドキュメント（優先度: 中）

7. **テストの追加**
   - `__tests__/src/lib/goalCalculator.test.ts`
   - `__tests__/src/lib/goalStorage.test.ts`
   - `__tests__/src/app/goals/page.test.tsx`

8. **ドキュメント更新**
   - README.mdの機能一覧に追加
   - copilot-instructions.mdの更新

### 6.2 推定工数

| 項目 | 工数（時間） | 備考 |
|------|-------------|------|
| 型定義 | 0.5 | シンプルな型定義のみ |
| 計算ロジック | 2.0 | 達成度計算、サマリー計算 |
| LocalStorage管理 | 1.5 | 保存・読み込み・バリデーション |
| 画面実装（基本） | 3.0 | レイアウト、プログレスバー |
| コンポーネント分割 | 2.0 | 再利用可能なコンポーネント化 |
| スタイリング | 1.5 | ダークモード、レスポンシブ |
| テスト実装 | 3.0 | ユニットテスト、統合テスト |
| ドキュメント更新 | 0.5 | README、instructions更新 |
| **合計** | **14.0時間** | |

### 6.3 ファイル構成

実装時に作成・変更するファイル一覧：

```
新規作成:
  src/app/goals/
    └── page.tsx                          # 目標達成度ページ
  src/app/components/
    ├── GoalSettingsForm.tsx              # 目標設定フォーム
    ├── YearlyGoalProgressBar.tsx         # プログレスバー
    ├── GoalAchievementSummary.tsx        # サマリー表示
    └── GoalAchievementTable.tsx          # 詳細テーブル
  src/lib/
    ├── goalCalculator.ts                 # 目標達成度計算
    └── goalStorage.ts                    # LocalStorage管理
  __tests__/src/lib/
    ├── goalCalculator.test.ts            # 計算ロジックのテスト
    └── goalStorage.test.ts               # ストレージのテスト
  __tests__/src/app/goals/
    └── page.test.tsx                     # ページのテスト

変更:
  src/types/dividend.ts                   # 型定義の追加
  src/app/components/Header.tsx           # ナビゲーションリンク追加
  README.md                               # 機能説明の追加
  .github/copilot-instructions.md         # 開発ガイドの更新
```

---

## 7. テスト計画

### 7.1 ユニットテスト

#### 7.1.1 計算ロジックのテスト

```typescript
describe('goalCalculator', () => {
  describe('calculateGoalAchievements', () => {
    it('正しく達成度を計算できる', () => {
      const yearlyDividends = new Map([
        ['2024', 180000],
        ['2025', 360000],
        ['2026', 540000],
      ]);
      const monthlyTarget = 30000;
      
      const result = calculateGoalAchievements(yearlyDividends, monthlyTarget);
      
      expect(result).toHaveLength(3);
      expect(result[0].year).toBe(2026);
      expect(result[0].achievementRate).toBe(150.0);
      expect(result[1].achievementRate).toBe(100.0);
      expect(result[2].achievementRate).toBe(50.0);
    });
    
    it('目標が0の場合は達成率0%を返す', () => {
      const yearlyDividends = new Map([['2024', 100000]]);
      const result = calculateGoalAchievements(yearlyDividends, 0);
      expect(result[0].achievementRate).toBe(0);
    });
  });
  
  describe('calculateGoalSummary', () => {
    it('サマリーを正しく計算できる', () => {
      const achievements: YearlyGoalAchievement[] = [
        { year: 2024, actualAmount: 180000, targetAmount: 360000, achievementRate: 50.0, difference: -180000 },
        { year: 2025, actualAmount: 360000, targetAmount: 360000, achievementRate: 100.0, difference: 0 },
        { year: 2026, actualAmount: 540000, targetAmount: 360000, achievementRate: 150.0, difference: 180000 },
      ];
      
      const summary = calculateGoalSummary(achievements);
      
      expect(summary?.achievedYearsCount).toBe(2);
      expect(summary?.totalYearsCount).toBe(3);
      expect(summary?.averageAchievementRate).toBe(100.0);
      expect(summary?.maxAchievementRate).toBe(150.0);
      expect(summary?.minAchievementRate).toBe(50.0);
    });
  });
});
```

#### 7.1.2 LocalStorageのテスト

```typescript
describe('goalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  describe('saveGoalSettings', () => {
    it('目標設定を保存できる', () => {
      saveGoalSettings(50000);
      const stored = localStorage.getItem(GOAL_SETTINGS_STORAGE_KEY);
      expect(stored).not.toBeNull();
      const settings = JSON.parse(stored!);
      expect(settings.monthlyTargetAmount).toBe(50000);
    });
  });
  
  describe('loadGoalSettings', () => {
    it('保存された目標設定を読み込める', () => {
      localStorage.setItem(
        GOAL_SETTINGS_STORAGE_KEY,
        JSON.stringify({ monthlyTargetAmount: 50000 })
      );
      const settings = loadGoalSettings();
      expect(settings.monthlyTargetAmount).toBe(50000);
    });
    
    it('未保存の場合はデフォルト値を返す', () => {
      const settings = loadGoalSettings();
      expect(settings.monthlyTargetAmount).toBe(30000);
    });
  });
});
```

### 7.2 統合テスト

#### 7.2.1 ページのレンダリングテスト

```typescript
describe('GoalsPage', () => {
  it('目標達成度ページが正しくレンダリングされる', async () => {
    render(<GoalsPage />);
    
    expect(screen.getByText('配当目標達成度')).toBeInTheDocument();
    expect(screen.getByText('月平均配当目標')).toBeInTheDocument();
    expect(screen.getByText('年別達成状況')).toBeInTheDocument();
  });
  
  it('プログレスバーが表示される', async () => {
    render(<GoalsPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});
```

### 7.3 E2Eテスト（将来的に実施）

- 目標設定フォームの入力と保存
- プログレスバーの表示確認
- ダークモード切り替え時の表示確認
- レスポンシブデザインの確認

---

## 8. セキュリティ・プライバシー考慮事項

### 8.1 データ保存

- **LocalStorageの使用**
  - 目標設定はブラウザのlocalStorageに保存
  - サーバーには送信されないため、プライバシーが保護される
  - ブラウザのストレージをクリアすると設定が失われる点を注意書きで明示

### 8.2 入力バリデーション

- **XSS対策**
  - 数値入力のみを受け付ける
  - テキスト入力は含まないため、XSSリスクは低い
  - Reactの自動エスケープ機能を活用

### 8.3 エラーハンドリング

- **LocalStorageの制限**
  - ストレージ容量制限への対処
  - プライベートモードでの動作確認
  - エラー時のユーザーへの適切な通知

---

## 9. 今後の拡張案

### 9.1 短期的な拡張（3ヶ月以内）

1. **月別目標設定**
   - 年間目標に加えて月別目標を設定可能に
   - 月別の達成度を可視化

2. **目標変更履歴**
   - 目標の変更履歴を記録
   - 過去の目標と現在の目標を比較

3. **目標達成通知**
   - 目標達成時にブラウザ通知
   - 未達成が続く場合のアラート

### 9.2 中期的な拡張（6ヶ月以内）

4. **複数目標の設定**
   - 短期・中期・長期目標の設定
   - 目標タイプ別の達成度表示

5. **予測機能**
   - 過去のトレンドから将来の達成度を予測
   - 目標達成までに必要な期間を計算

6. **CSV/PDFエクスポート**
   - 目標達成レポートのエクスポート機能
   - グラフの画像保存

### 9.3 長期的な拡張（1年以内）

7. **目標のクラウド同期**
   - 複数デバイス間での目標設定の同期
   - バックアップ・リストア機能

8. **ソーシャル機能**
   - 目標達成度の共有（オプトイン）
   - コミュニティ平均との比較

9. **AIによる目標提案**
   - ポートフォリオから適切な目標を提案
   - 達成可能性の分析

---

## 10. 参考資料

### 10.1 内部ドキュメント

- [doc/feature-addition-consideration.md](./feature-addition-consideration.md) - 機能追加検討
- [doc/developer-specification.md](./developer-specification.md) - 開発者向け仕様書
- [README.md](../README.md) - プロジェクト概要

### 10.2 関連技術

- [Recharts Documentation](https://recharts.org/) - グラフライブラリ
- [Tailwind CSS Documentation](https://tailwindcss.com/) - CSSフレームワーク
- [Next.js Documentation](https://nextjs.org/docs) - フレームワーク
- [Web Storage API](https://developer.mozilla.org/ja/docs/Web/API/Web_Storage_API) - localStorage

### 10.3 UIデザイン参考

- プログレスバーのベストプラクティス
- アクセシビリティガイドライン（WCAG 2.1）
- レスポンシブデザインパターン

---

## 11. まとめ

この仕様書では、配当金の目標設定と達成度を可視化するプログレスバー画面の詳細仕様を定義しました。

### 11.1 主要な設計方針

1. **シンプルさ**
   - デフォルト値（月平均3万円）の提供により、即座に使い始められる
   - 直感的なプログレスバーによる視覚化

2. **拡張性**
   - 将来的な機能追加を考慮した型定義とデータ構造
   - コンポーネントベースの設計による再利用性

3. **プライバシー**
   - LocalStorageを使用したクライアントサイド保存
   - サーバーへのデータ送信なし

4. **一貫性**
   - 既存の画面デザインとの統一感
   - ダークモード対応

### 11.2 実装時の注意点

- 既存のコード品質を維持する
- 適切なテストカバレッジを確保する
- アクセシビリティを考慮する
- パフォーマンスに配慮する

### 11.3 次のステップ

1. この仕様書のレビューとフィードバック収集
2. 必要に応じて仕様の調整
3. 実装計画の確定
4. 実装開始

---

## 12. 変更履歴

| 日付 | バージョン | 変更内容 | 作成者 |
|------|-----------|---------|--------|
| 2026-02-11 | 1.0 | 初版作成 | GitHub Copilot |

---

## 13. 承認

| 役割 | 氏名 | 承認日 | 署名 |
|------|------|--------|------|
| 作成者 | GitHub Copilot | 2026-02-11 | - |
| レビュー担当 | - | - | - |
| 承認者 | - | - | - |

---

**この仕様書は実装前の検討資料として作成されました。実装時にはこの仕様書に基づいて開発を進めますが、必要に応じて柔軟に調整することができます。**
