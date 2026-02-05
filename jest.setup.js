/**
 * Jest用のセットアップファイル
 * Jestテストランナーのグローバル設定とモックを定義する
 * 
 * @remarks
 * - @testing-library/jest-domをインポートしてDOM操作用のマッチャーを提供
 * - TextEncoder/TextDecoderをグローバルに設定（Node.js環境用）
 * - localStorageをモック化してテスト実行時の永続化処理を制御
 * - fetchをモック化してネットワークリクエストをテストで制御可能にする
 */

// Jest用のセットアップファイル
import '@testing-library/jest-dom'
import {TextDecoder, TextEncoder} from 'util'

// mock用のグローバル設定
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

/**
 * localStorageのモック実装
 * テスト実行時にlocalStorageの動作をシミュレートする
 */
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}
global.localStorage = localStorageMock

/**
 * fetchのモック実装
 * テスト時のHTTPリクエストをモック化する
 * 各テストファイルで必要に応じて実装を上書きして使用する
 */
global.fetch = jest.fn()
