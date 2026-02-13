# Changelog

このプロジェクトのすべての重要な変更は、このファイルに記録されます。

このフォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に基づいており、
このプロジェクトは [Semantic Versioning](https://semver.org/lang/ja/spec/v2.0.0.html) に準拠しています。

## [Unreleased]

## [0.24.0] - 2026-02-13

### Added
- 為替レート入力の範囲制限（50円〜300円）
  - 非現実的な値の入力を防止
  - 過去の為替レート実績（1990年〜2026年）を考慮した安全な範囲設定
- 為替レート入力のデバウンス処理（500ms）
  - 連続入力時の不要な再計算を防止
  - パフォーマンスの向上
- 入力可能範囲のガイドテキスト表示
  - ユーザーが適切な値を入力しやすくなる
- 為替レート関連の定数を `/src/lib/exchangeRate.ts` に追加
  - `MIN_USD_TO_JPY_RATE = 50`
  - `MAX_USD_TO_JPY_RATE = 300`
  - `EXCHANGE_RATE_DEBOUNCE_DELAY = 500`
- 範囲バリデーションのテストケース追加
  - 範囲外の値のエラー表示テスト
  - 境界値テスト（50円、300円、49.99円、300.01円）
  - デバウンス処理のテスト

### Changed
- `/src/app/settings/page.tsx` のバリデーションロジックを改善
  - 正の数値チェックから範囲チェックへ変更
  - デバウンス処理による遅延更新を実装
  - HTML属性（min/max）を更新
- 既存テストをデバウンス動作に対応

### Removed
- `doc/exchange-rate-validation-specification.md`: 実装完了により削除

## [0.23.0] - 2026-02-13

### Added
- 設定ファイルの集約（`src/config/`ディレクトリ）
  - `app.config.ts`: アプリケーション基本設定（為替レート、CSVパス、目標設定）
  - `chart.config.ts`: グラフ表示設定
  - `storage.config.ts`: localStorageキー管理とヘルパー関数
  - `constants.ts`: アプリケーション定数
  - `index.ts`: 統合エクスポート
- `.env.example`: 環境変数の例示ファイル
- 設定ファイルの包括的なテスト（54件の新しいテスト）

### Changed
- 既存のコードを新しい設定システムに移行
  - `src/lib/exchangeRate.ts`: 設定を`appConfig`から取得
  - `src/lib/goalStorage.ts`: 設定を`appConfig`と`storageKeys`から取得
  - `src/lib/formatYAxisValue.ts`: グラフ設定を`chartConfig`から取得
  - `src/hooks/useDividendData.ts`: CSVパスを`appConfig`から取得
  - `src/app/portfolio/page.tsx`: 設定を`appConfig`と`chartConfig`から取得
  - `src/app/components/GoalSettingsForm.tsx`: バリデーション定数を`appConfig`から取得
  - `src/app/components/DarkModeProvider.tsx`: localStorageヘルパーを使用
  - `src/app/contexts/ExchangeRateContext.tsx`: localStorageヘルパーを使用

### Removed
- `doc/config-consolidation-design.md`: 実装完了により削除

## [0.22.0] - 2026-02-13

### Changed
- モバイルビューのコンテンツ領域を最大化

## [0.21.0] - 2026-02-12

### Added
- 過去のバージョンからの変更内容

[Unreleased]: https://github.com/TakuyaFukumura/divichart-next-js-app/compare/v0.24.0...HEAD
[0.24.0]: https://github.com/TakuyaFukumura/divichart-next-js-app/compare/v0.23.0...v0.24.0
[0.23.0]: https://github.com/TakuyaFukumura/divichart-next-js-app/compare/v0.22.0...v0.23.0
[0.22.0]: https://github.com/TakuyaFukumura/divichart-next-js-app/compare/v0.21.0...v0.22.0
[0.21.0]: https://github.com/TakuyaFukumura/divichart-next-js-app/compare/v0.20.0...v0.21.0

