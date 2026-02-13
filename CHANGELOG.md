# Changelog

このプロジェクトのすべての重要な変更は、このファイルに記録されます。

このフォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に基づいており、
このプロジェクトは [Semantic Versioning](https://semver.org/lang/ja/spec/v2.0.0.html) に準拠しています。

## [Unreleased]

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

[Unreleased]: https://github.com/TakuyaFukumura/divichart-next-js-app/compare/v0.23.0...HEAD
[0.23.0]: https://github.com/TakuyaFukumura/divichart-next-js-app/compare/v0.22.0...v0.23.0
[0.22.0]: https://github.com/TakuyaFukumura/divichart-next-js-app/compare/v0.21.0...v0.22.0
[0.21.0]: https://github.com/TakuyaFukumura/divichart-next-js-app/compare/v0.20.0...v0.21.0

