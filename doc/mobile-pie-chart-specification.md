# 配当ポートフォリオ画面 円グラフ モバイル対応仕様書

## 1. ドキュメント情報

- **作成日**: 2026年2月7日
- **ドキュメント種別**: 機能改善仕様書
- **対象機能**: 配当ポートフォリオ画面の円グラフ表示
- **対象読者**: 開発者、レビュアー、プロジェクト関係者
- **関連ドキュメント**: 
  - [developer-specification.md](./developer-specification.md)
  - [stock-code-display-specification.md](./stock-code-display-specification.md)

---

## 2. 概要

### 2.1 目的

配当ポートフォリオ画面（`/portfolio`）の円グラフをスマートフォンで表示した際に、グラフが画面に適切に収まらず見づらくなっている問題を解決し、モバイルデバイスでの視認性とユーザビリティを向上させる。

### 2.2 背景

- 現在の円グラフは固定サイズ（`outerRadius={140}`）で表示されている
- スマートフォンの小さな画面では、グラフが画面幅に対して大きすぎる、または小さすぎる可能性がある
- 円グラフ内のラベル表示（銘柄名と割合）が重なったり、はみ出したりする可能性がある
- 凡例（Legend）の表示がモバイル画面では見づらい可能性がある
- ResponsiveContainerを使用しているが、内部の円グラフサイズは固定されている

### 2.3 対象範囲

- **対象画面**: 配当ポートフォリオ画面（`/portfolio`）
- **対象コンポーネント**: `DividendPieChart.tsx`
- **対象デバイス**: モバイル（画面幅 ～639px）、タブレット（画面幅 640px～1023px）

---

## 3. 現状分析

### 3.1 現在の実装

#### コンポーネント構造

```tsx
// DividendPieChart.tsx の主要構造
<div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
    <ResponsiveContainer width="100%" height={400}>
        <PieChart>
            <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={140}  // ← 固定サイズ
                fill="#8884d8"
                dataKey="value"
            >
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
        </PieChart>
    </ResponsiveContainer>
</div>
```

#### 主要な設定値

| 項目 | 現在の値 | 説明 |
|------|---------|------|
| コンテナ高さ | 400px | ResponsiveContainerの固定高さ |
| 円グラフ半径 | 140px | outerRadiusで固定 |
| パディング | p-6（24px） | 親コンテナのパディング |
| ラベル表示閾値 | 3% | 3%未満の割合はラベルを非表示 |

### 3.2 問題点の詳細

#### 問題1: 円グラフのサイズが画面に対して不適切

**デスクトップ（1024px以上）**
- コンテナ幅が広いため、円グラフ（半径140px = 直径280px）が小さく見える可能性がある
- 余白が多く、スペースを有効活用できていない

**タブレット（640px～1023px）**
- 比較的適切なサイズで表示される

**スマートフォン（320px～639px）**
- 例: iPhone SE（幅375px） - パディングを除くと実効幅は約327px
- 円グラフの直径280pxに左右のパディング48pxを加えると328pxとなり、画面幅ぎりぎり
- 円グラフが画面に収まりきらない、または余裕がない

#### 問題2: ラベル表示の問題

**現在のラベルロジック**
```tsx
const renderLabel = (entry) => {
    if (entry.percentage < 3) {
        return null;  // 3%未満は非表示
    }
    // ... 銘柄名と割合を表示
    return (
        <text className="text-xs font-medium">
            {`${entry.name} ${entry.percentage.toFixed(1)}%`}
        </text>
    );
};
```

**問題点**
- スマートフォンでは円グラフが小さくなるため、ラベルがさらに密集する
- 長い銘柄名（例: "ブラジル株式ツインαファンド"）がはみ出す可能性がある
- `text-xs`（12px）のフォントサイズが小さすぎて読みにくい可能性がある
- 複数のラベルが重なって表示される可能性がある

#### 問題3: 凡例（Legend）の表示問題

**現在の実装**
- Rechartsのデフォルト凡例を使用（`<Legend />`）
- 凡例の配置やスタイルの制御が不十分
- モバイルでは凡例が縦に長くなり、スクロールが必要になる可能性がある

#### 問題4: ツールチップの表示問題

**現在の実装**
- カスタムツールチップを実装している
- デスクトップではホバーで表示されるが、モバイルではタップ操作となる
- タップ操作時の挙動が最適化されていない可能性がある

### 3.3 使用しているTailwindブレークポイント

Tailwind CSSのデフォルトブレークポイント:

| プレフィックス | 最小幅 | 説明 |
|------------|--------|------|
| （なし） | 0px | モバイルファースト（デフォルト） |
| `sm:` | 640px | 小型タブレット以上 |
| `md:` | 768px | タブレット以上 |
| `lg:` | 1024px | デスクトップ以上 |
| `xl:` | 1280px | 大型デスクトップ以上 |
| `2xl:` | 1536px | 超大型デスクトップ以上 |

---

## 4. 要件定義

### 4.1 機能要件

#### FR-1: レスポンシブな円グラフサイズ

- **要件**: 画面サイズに応じて円グラフの半径を動的に調整する
- **優先度**: 必須
- **詳細**:
  - スマートフォン（640px未満）: 小さめの半径（例: 80～100px）
  - タブレット（640px～1023px）: 中程度の半径（例: 120～140px）
  - デスクトップ（1024px以上）: 大きめの半径（例: 140～160px）

#### FR-2: コンテナ高さの最適化

- **要件**: 画面サイズに応じてコンテナの高さを調整する
- **優先度**: 必須
- **詳細**:
  - スマートフォン: 350px程度
  - タブレット: 400px程度
  - デスクトップ: 450px程度

#### FR-3: ラベル表示の改善

- **要件**: モバイル環境でのラベル表示を最適化する
- **優先度**: 高
- **詳細**:
  - スマートフォンではラベルの表示閾値を引き上げる（例: 5%以上のみ表示）
  - 長い銘柄名を省略表示する
  - または、スマートフォンではラベルを完全に非表示にし、凡例とツールチップのみで対応する

#### FR-4: 凡例の配置最適化

- **要件**: 画面サイズに応じて凡例の配置を変更する
- **優先度**: 中
- **詳細**:
  - デスクトップ: 右側または下側に配置
  - スマートフォン: 下側に配置、または凡例を折りたたみ可能にする
  - 凡例の項目が多い場合の表示方法を最適化する

#### FR-5: タッチ操作の最適化

- **要件**: モバイルデバイスでのタッチ操作に対応する
- **優先度**: 中
- **詳細**:
  - タップで各セグメントの詳細情報を表示
  - ツールチップの表示タイミングと位置を最適化
  - 誤タップを防ぐため、タップ領域を適切に設定

### 4.2 非機能要件

#### NFR-1: パフォーマンス

- ページ読み込み時間に影響を与えない
- 画面サイズ変更時のリサイズ処理がスムーズ
- 不要な再レンダリングを避ける

#### NFR-2: アクセシビリティ

- グラフの情報をスクリーンリーダーが読み上げ可能にする
- キーボード操作でもグラフを操作可能にする
- 色覚異常のユーザーにも配慮したカラーパレット

#### NFR-3: ブラウザ互換性

- 主要なモバイルブラウザ（Safari, Chrome, Firefox）で動作確認
- iOS 15以上、Android 10以上をサポート

---

## 5. 提案する解決策

### 5.1 解決策の概要

以下の4つのアプローチを組み合わせて、モバイルでの円グラフ表示を最適化します。

1. **レスポンシブな円グラフサイズの実装**
2. **モバイル向けラベル表示の最適化**
3. **凡例の配置とスタイルの改善**
4. **コンテナサイズの調整**

### 5.2 実装案1: ウィンドウサイズに基づく動的半径

#### 実装方法

```tsx
'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { StockDividend } from '@/types/dividend';
import { useState, useEffect } from 'react';

export default function DividendPieChart({ data }: { data: StockDividend[] }) {
    // ウィンドウサイズを監視（初期値は固定値にして hydration mismatch を回避）
    const [windowWidth, setWindowWidth] = useState<number>(1024);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        // 初回に 1 回だけ実行してクライアントの実際の幅と同期する
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 画面サイズに応じた半径を計算
    const getResponsiveRadius = (width: number): number => {
        if (width < 640) {
            // スマートフォン: 小さめ
            return 80;
        } else if (width < 1024) {
            // タブレット: 中程度
            return 120;
        } else {
            // デスクトップ: 大きめ
            return 140;
        }
    };

    // 画面サイズに応じたコンテナ高さを計算
    const getResponsiveHeight = (width: number): number => {
        if (width < 640) {
            return 350;
        } else if (width < 1024) {
            return 400;
        } else {
            return 450;
        }
    };

    // 画面サイズに応じたラベル表示閾値を計算
    const getLabelThreshold = (width: number): number => {
        if (width < 640) {
            return 5; // スマートフォン: 5%以上のみ表示
        } else {
            return 3; // それ以外: 3%以上表示
        }
    };

    const outerRadius = getResponsiveRadius(windowWidth);
    const containerHeight = getResponsiveHeight(windowWidth);
    const labelThreshold = getLabelThreshold(windowWidth);

    // ... 残りのロジック
}
```

#### メリット
- 画面サイズに応じて自動的に最適なサイズが適用される
- リサイズ時にも対応できる
- 実装が比較的シンプル

#### デメリット
- useState と useEffect を使用するため、初回レンダリング時にずれが生じる可能性がある
- サーバーサイドレンダリング時にはデフォルト値が使用される
- リサイズイベントの処理が必要

### 5.3 実装案2: Tailwind CSS クラスベースのアプローチ

#### 実装方法

```tsx
export default function DividendPieChart({ data }: { data: StockDividend[] }) {
    // ... データ処理ロジック

    return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 sm:p-6">
            {/* モバイル用（640px未満） */}
            <div className="block sm:hidden">
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => renderLabel(entry, 5)} // 5%以上のみ
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                            layout="horizontal"
                            align="center"
                            verticalAlign="bottom"
                            wrapperStyle={{ fontSize: '12px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* タブレット用（640px～1023px） */}
            <div className="hidden sm:block lg:hidden">
                <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => renderLabel(entry, 3)}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* デスクトップ用（1024px以上） */}
            <div className="hidden lg:block">
                <ResponsiveContainer width="100%" height={450}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => renderLabel(entry, 3)}
                            outerRadius={140}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
```

#### メリット
- CSSのメディアクエリを使用するため、サーバーサイドレンダリング時も正しく表示される
- JavaScriptのイベントリスナーが不要
- Tailwindのユーティリティクラスを活用できる

#### デメリット
- コードの重複が発生する（同じPieChartを3回記述）
- メンテナンス性がやや低下する
- 3つのPieChartコンポーネントがすべてマウント/レンダリングされるため、CSSで非表示にしている分も含めてRechartsの計算やDOM生成が行われ、実行時コストおよびアクセシビリティ面（不要な要素が増える）の懸念がある
- バンドルサイズがわずかに増加する

### 5.4 実装案3: ウィンドウサイズ監視と設定オブジェクトによる動的サイズ（推奨）

#### 実装方法

```tsx
'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { StockDividend } from '@/types/dividend';
import { useEffect, useState } from 'react';

export default function DividendPieChart({ data }: { data: StockDividend[] }) {
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const checkDevice = () => {
            setIsMobile(window.innerWidth < 640);
            setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    // デバイスに応じた設定
    const chartConfig = {
        outerRadius: isMobile ? 80 : isTablet ? 120 : 140,
        height: isMobile ? 350 : isTablet ? 400 : 450,
        labelThreshold: isMobile ? 5 : 3,
        labelFontSize: isMobile ? 'text-[10px]' : 'text-xs',
        showLabels: !isMobile, // モバイルではラベルを非表示にする選択肢も
    };

    // ... データ処理ロジック

    const renderLabel = (entry: {
        name?: string;
        percentage?: number;
        cx?: number;
        cy?: number;
        midAngle?: number;
        innerRadius?: number;
        outerRadius?: number;
    }) => {
        // 必要なプロパティの確認
        if (
            !entry.name ||
            entry.percentage === undefined ||
            entry.cx === undefined ||
            entry.cy === undefined ||
            entry.midAngle === undefined ||
            entry.innerRadius === undefined ||
            entry.outerRadius === undefined
        ) {
            return null;
        }

        if (!chartConfig.showLabels) return null;
        if (entry.percentage < chartConfig.labelThreshold) return null;

        // 各セグメントの角度に基づいて座標を計算
        const RADIAN = Math.PI / 180;
        const radius = entry.innerRadius + (entry.outerRadius - entry.innerRadius) * 0.5;
        const x = entry.cx + radius * Math.cos(-entry.midAngle * RADIAN);
        const y = entry.cy + radius * Math.sin(-entry.midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > entry.cx ? 'start' : 'end'}
                dominantBaseline="central"
                className={chartConfig.labelFontSize}
            >
                {`${entry.name} ${entry.percentage.toFixed(1)}%`}
            </text>
        );
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 md:p-6">
            <ResponsiveContainer width="100%" height={chartConfig.height}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderLabel}
                        outerRadius={chartConfig.outerRadius}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        layout={isMobile ? "horizontal" : "vertical"}
                        align={isMobile ? "center" : "right"}
                        verticalAlign={isMobile ? "bottom" : "middle"}
                        wrapperStyle={{ 
                            fontSize: isMobile ? '11px' : '14px',
                            paddingTop: isMobile ? '10px' : '0',
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
```

#### メリット
- コードの重複を最小限に抑えられる
- デバイスごとの設定を一元管理できる
- 柔軟な調整が可能

#### デメリット
- useStateとuseEffectを使用する必要がある
- 初回レンダリング時にちらつきが発生する可能性がある

### 5.5 ラベル表示の改善案

#### 案A: モバイルではラベルを非表示

```tsx
const renderLabel = (entry: any) => {
    // モバイルではラベルを完全に非表示
    if (isMobile) return null;
    
    // その他のデバイスでは既存のロジック
    if (entry.percentage < 3) return null;
    // ... ラベル描画
};
```

**メリット**: シンプルで確実、重なりの問題がなくなる  
**デメリット**: モバイルユーザーは凡例またはツールチップに頼る必要がある

#### 案B: モバイルでは割合のみ表示

```tsx
const renderLabel = (entry: any) => {
    if (entry.percentage < (isMobile ? 5 : 3)) return null;
    
    // モバイルでは割合のみ、デスクトップでは銘柄名も表示
    const labelText = isMobile 
        ? `${entry.percentage.toFixed(1)}%`
        : `${entry.name} ${entry.percentage.toFixed(1)}%`;
    
    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor={x > entry.cx ? 'start' : 'end'}
            dominantBaseline="central"
            className={isMobile ? "text-[10px] font-bold" : "text-xs font-medium"}
        >
            {labelText}
        </text>
    );
};
```

**メリット**: モバイルでも基本的な情報は表示される  
**デメリット**: 銘柄の特定には凡例を参照する必要がある

#### 案C: モバイルでは銘柄名を短縮

```tsx
const shortenName = (name: string, maxLength: number = 6): string => {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
};

const renderLabel = (entry: any) => {
    if (entry.percentage < (isMobile ? 5 : 3)) return null;
    
    const displayName = isMobile ? shortenName(entry.name) : entry.name;
    
    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor={x > entry.cx ? 'start' : 'end'}
            dominantBaseline="central"
            className={isMobile ? "text-[10px] font-medium" : "text-xs font-medium"}
        >
            {`${displayName} ${entry.percentage.toFixed(1)}%`}
        </text>
    );
};
```

**メリット**: 銘柄の識別が可能  
**デメリット**: 省略により正確な銘柄名がわからなくなる

### 5.6 凡例の改善案

#### 現在の凡例の問題点

- 10件の銘柄がある場合、凡例が縦に長くなる
- モバイルでは画面の大部分を凡例が占有する可能性がある

#### 改善案

```tsx
<Legend 
    layout={isMobile ? "horizontal" : "vertical"}
    align={isMobile ? "center" : "right"}
    verticalAlign={isMobile ? "bottom" : "middle"}
    wrapperStyle={{ 
        fontSize: isMobile ? '11px' : '14px',
        paddingTop: isMobile ? '10px' : '0',
        maxHeight: isMobile ? '120px' : 'none',
        overflowY: isMobile ? 'auto' : 'visible',
    }}
    iconSize={isMobile ? 10 : 14}
/>
```

**改善点**:
- モバイルでは水平レイアウトに変更
- フォントサイズとアイコンサイズを調整
- 必要に応じてスクロール可能にする

---

## 6. 推奨実装アプローチ

### 6.1 推奨案: 実装案3（window サイズ監視 + 設定オブジェクト）+ ラベル改善案A

#### 理由

1. **コードの保守性**: 設定を一元管理でき、将来の変更が容易
2. **パフォーマンス**: 不要な再描画を最小限に抑えられる
3. **ユーザビリティ**: モバイルでラベルを非表示にすることで、グラフがすっきりし見やすくなる
4. **実装のシンプルさ**: 複雑な条件分岐を避けられる

### 6.2 段階的な実装手順

#### フェーズ1: 基本的なレスポンシブ対応（必須）

1. デバイス検知ロジックの実装
2. 画面サイズに応じた円グラフの半径調整
3. コンテナ高さの調整
4. パディングの調整

**目標**: 円グラフが各デバイスで適切なサイズで表示される

#### フェーズ2: ラベルと凡例の最適化（高優先度）

1. モバイルでのラベル表示ロジックの変更
2. 凡例のレイアウト調整
3. フォントサイズの最適化

**目標**: モバイルでの視認性が大幅に向上する

#### フェーズ3: タッチ操作の最適化（中優先度）

1. タップ領域の調整
2. ツールチップの表示タイミング調整
3. アクセシビリティの向上

**目標**: モバイルでの操作性が向上する

#### フェーズ4: パフォーマンス最適化（低優先度）

1. 不要な再レンダリングの削減
2. debounceの実装（リサイズイベント用）
3. メモ化の活用

**目標**: スムーズなユーザー体験の提供

### 6.3 実装時の注意点

#### SSR（サーバーサイドレンダリング）への対応

```tsx
// windowオブジェクトへの安全なアクセス
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
        const checkDevice = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }
}, []);
```

#### リサイズイベントのパフォーマンス最適化

```tsx
// 自作のdebounce関数（lodashを使わない場合）
const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

useEffect(() => {
    const handleResize = debounce(() => {
        setIsMobile(window.innerWidth < 640);
        setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    }, 200); // 200ms のデバウンス

    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
    };
}, []);
```

**注記**: 上記は追加依存なしで実装する場合の例です。もし lodash を導入する場合は `import { debounce } from 'lodash'` を使用できますが、バンドルサイズへの影響を考慮してください。

---

## 7. テスト計画

### 7.1 テストデバイス

#### 実機テスト

| デバイス | 画面サイズ | OS | ブラウザ |
|---------|----------|-----|---------|
| iPhone SE | 375 x 667 | iOS 17 | Safari |
| iPhone 14 | 390 x 844 | iOS 17 | Safari, Chrome |
| iPhone 14 Pro Max | 430 x 932 | iOS 17 | Safari |
| iPad Air | 820 x 1180 | iPadOS 17 | Safari |
| Galaxy S21 | 360 x 800 | Android 13 | Chrome |
| Pixel 7 | 412 x 915 | Android 14 | Chrome |

#### ブラウザ開発ツール

- Chrome DevTools のデバイスモード
- Firefox Responsive Design Mode
- Safari の responsive design mode

### 7.2 テストケース

#### TC-1: 円グラフサイズの確認

| テストID | デバイス | 期待結果 |
|---------|---------|---------|
| TC-1-1 | スマートフォン | 円グラフが画面に収まり、適切な余白がある |
| TC-1-2 | タブレット | 円グラフが適切なサイズで表示される |
| TC-1-3 | デスクトップ | 円グラフが大きく表示され、スペースを有効活用している |

#### TC-2: ラベル表示の確認

| テストID | デバイス | 期待結果 |
|---------|---------|---------|
| TC-2-1 | スマートフォン | ラベルが表示されない、または最小限の表示 |
| TC-2-2 | タブレット | 3%以上の割合でラベルが表示される |
| TC-2-3 | デスクトップ | 3%以上の割合でラベルが表示される |
| TC-2-4 | 全デバイス | ラベルが重ならず読みやすい |

#### TC-3: 凡例表示の確認

| テストID | デバイス | 期待結果 |
|---------|---------|---------|
| TC-3-1 | スマートフォン | 凡例が水平レイアウトで下部に表示される |
| TC-3-2 | タブレット | 凡例が適切に配置される |
| TC-3-3 | デスクトップ | 凡例が垂直レイアウトで右側に表示される |
| TC-3-4 | 全デバイス | 凡例の文字が読みやすいサイズ |

#### TC-4: インタラクティブ操作の確認

| テストID | デバイス | 操作 | 期待結果 |
|---------|---------|------|---------|
| TC-4-1 | スマートフォン | セグメントをタップ | ツールチップが表示される |
| TC-4-2 | タブレット | セグメントをタップ/ホバー | ツールチップが適切に表示される |
| TC-4-3 | デスクトップ | セグメントをホバー | ツールチップが表示される |
| TC-4-4 | 全デバイス | ツールチップの内容 | 銘柄名、金額、割合が正しく表示される |

#### TC-5: リサイズ動作の確認

| テストID | 操作 | 期待結果 |
|---------|------|---------|
| TC-5-1 | ブラウザウィンドウを縮小 | 円グラフがスムーズに縮小される |
| TC-5-2 | ブラウザウィンドウを拡大 | 円グラフがスムーズに拡大される |
| TC-5-3 | 画面向きを回転（モバイル） | 円グラフが新しいサイズに適応する |

#### TC-6: パフォーマンステスト

| テストID | 測定項目 | 期待値 |
|---------|---------|--------|
| TC-6-1 | 初回レンダリング時間 | 200ms以内 |
| TC-6-2 | リサイズ時の応答性 | ラグなし |
| TC-6-3 | メモリ使用量 | 変更前と同等 |

### 7.3 ユニットテスト

```tsx
// __tests__/src/app/components/DividendPieChart.test.tsx

import { render, screen, act } from '@testing-library/react';
import DividendPieChart from '@/app/components/DividendPieChart';

describe('DividendPieChart - Responsive Design', () => {
    const mockData = [
        { stockName: '株A', amount: 50000, percentage: 50, color: '#0088FE' },
        { stockName: '株B', amount: 30000, percentage: 30, color: '#00C49F' },
        { stockName: '株C', amount: 20000, percentage: 20, color: '#FFBB28' },
    ];

    test('モバイルサイズでレンダリングされる', () => {
        // innerWidthを書き換え可能にする
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 375,
        });

        render(<DividendPieChart data={mockData} />);
        
        // リサイズイベントを発火
        act(() => {
            window.dispatchEvent(new Event('resize'));
        });

        // グラフが表示されることを確認
        expect(screen.queryByText('表示する配当データがありません')).not.toBeInTheDocument();
    });

    test('データがない場合、適切なメッセージが表示される', () => {
        render(<DividendPieChart data={[]} />);
        expect(screen.getByText('表示する配当データがありません')).toBeInTheDocument();
    });
});
```

**注記**: jsdom では `window.innerWidth` が読み取り専用のため、`Object.defineProperty` で書き換え可能にする必要があります。また、resize イベントは render 後に `act()` でラップして発火させることで、useEffect の処理が確実に実行されます。

---

## 8. 実装後の確認項目

### 8.1 視覚的確認

- [ ] スマートフォンで円グラフが画面に収まっている
- [ ] タブレットで円グラフが適切なサイズで表示されている
- [ ] デスクトップで円グラフが十分な大きさで表示されている
- [ ] ダークモードでも適切に表示される
- [ ] 凡例が読みやすく配置されている
- [ ] ツールチップが正しく表示される

### 8.2 機能的確認

- [ ] タップ/クリック操作が正常に動作する
- [ ] ブラウザウィンドウのリサイズに正しく対応する
- [ ] 画面向きの変更に対応する（モバイル）
- [ ] データの更新時に正しく再描画される

### 8.3 パフォーマンス確認

- [ ] 初回レンダリングが高速である
- [ ] リサイズ時にラグがない
- [ ] メモリリークがない
- [ ] 不要な再レンダリングが発生していない

### 8.4 アクセシビリティ確認

- [ ] キーボードでナビゲーション可能
- [ ] スクリーンリーダーで情報を読み上げ可能
- [ ] 色のコントラストが適切
- [ ] フォーカス状態が視覚的にわかりやすい

---

## 9. 今後の拡張性

### 9.1 将来的な改善案

#### 案1: タッチジェスチャーのサポート

- ピンチイン/アウトで円グラフのズーム
- スワイプで年度の切り替え

#### 案2: グラフタイプの切り替え

- モバイルでは円グラフの代わりに棒グラフを表示するオプション
- ユーザーが選択できるUI

#### 案3: 詳細情報の表示方法の改善

- セグメントをタップして詳細モーダルを表示
- 下部にスライドアップパネルで詳細情報を表示

#### 案4: オフラインサポート

- Service Workerを使用したキャッシング
- オフライン時でもデータを表示

### 9.2 A/Bテストの検討

実装後、以下の項目についてA/Bテストを検討：

1. **ラベル表示の有無**
   - A: モバイルでラベル非表示
   - B: モバイルでも割合のみ表示

2. **凡例の配置**
   - A: 下部に水平配置
   - B: グラフの下にグリッド配置

3. **円グラフのサイズ**
   - A: 小さめ（半径80px）
   - B: やや大きめ（半径100px）

---

## 10. まとめ

### 10.1 実装の優先順位

| 優先度 | 項目 | 理由 |
|-------|------|------|
| 高 | 円グラフサイズの最適化 | 最も重要な問題点であり、即座に効果が現れる |
| 高 | ラベル表示の改善 | 視認性に大きく影響する |
| 中 | 凡例のレイアウト調整 | ユーザビリティの向上につながる |
| 中 | コンテナ高さの調整 | 画面の有効活用につながる |
| 低 | タッチ操作の最適化 | 既存の機能でも一定の操作性がある |

### 10.2 期待される効果

1. **ユーザビリティの向上**
   - スマートフォンでの視認性が大幅に改善される
   - グラフの情報が把握しやすくなる

2. **モバイルファースト対応**
   - モバイルユーザーへの配慮が強化される
   - 現代的なWebアプリケーションとしての品質向上

3. **保守性の向上**
   - レスポンシブデザインのベストプラクティスを実装
   - 将来的な拡張が容易になる

### 10.3 実装時の注意事項

1. **段階的な実装を推奨**
   - 一度に全ての変更を行わず、フェーズごとに実装してテスト
   - ユーザーフィードバックを収集しながら改善

2. **既存機能の維持**
   - デスクトップでの表示品質を低下させない
   - データの正確性を保つ

3. **パフォーマンスの監視**
   - 実装後にパフォーマンス測定を実施
   - 必要に応じて最適化

---

## 11. 参考資料

### 11.1 関連ドキュメント

- [Recharts Documentation](https://recharts.org/en-US/api)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Next.js Performance Best Practices](https://nextjs.org/docs/app/building-your-application/optimizing)
- [MDN: CSS Media Queries](https://developer.mozilla.org/ja/docs/Web/CSS/Media_Queries/Using_media_queries)

### 11.2 類似事例

- [Chart.js Responsive Charts](https://www.chartjs.org/docs/latest/configuration/responsive.html)
- [D3.js Responsive SVG](https://observablehq.com/@d3/responsive-svg)

### 11.3 モバイルデザインのベストプラクティス

- タッチターゲットは最低44x44pxを推奨（Apple HIG）
- フォントサイズは最低11px以上（可読性の観点）
- コンテンツは画面幅の90%程度に収める（左右5%の余白）

---

**ドキュメントバージョン**: 1.0  
**最終更新日**: 2026年2月7日  
