/**
 * 配当金関連の型定義
 * 
 * このファイルは配当金データの型定義を提供します。
 * グラフやテーブル表示、計算処理で使用されます。
 */

/**
 * CSVファイルの行データ型定義
 * 配当金リストのCSVファイルから読み込まれるデータの形式
 */
export type CSVRow = {
    /** 入金日（YYYY/MM/DD形式） */
    '入金日': string;
    /** 商品名（例: "米国株式"） */
    '商品': string;
    /** 口座名（例: "旧NISA"） */
    '口座': string;
    /** 銘柄コード */
    '銘柄コード': string;
    /** 銘柄名 */
    '銘柄': string;
    /** 受取通貨（例: "円", "USドル"） */
    '受取通貨': string;
    /** 単価[円/現地通貨] */
    '単価[円/現地通貨]': string;
    /** 数量[株/口] */
    '数量[株/口]': string;
    /** 配当・分配金合計（税引前）[円/現地通貨] */
    '配当・分配金合計（税引前）[円/現地通貨]': string;
    /** 税額合計[円/現地通貨] */
    '税額合計[円/現地通貨]': string;
    /** 受取金額（税引き後）[円/現地通貨] */
    '受取金額[円/現地通貨]': string;
};

/**
 * 銘柄別配当データ
 */
export type StockDividend = {
    /** 銘柄名 */
    stockName: string;
    /** 配当金額（税引き後）[円] */
    amount: number;
    /** 配当割合 [%] */
    percentage: number;
    /** 色コード（円グラフ用） */
    color?: string;
};

/**
 * 年度別配当ポートフォリオデータ
 */
export type YearlyPortfolio = {
    /** 対象年 */
    year: number;
    /** 銘柄別配当データ（降順ソート済み） */
    stocks: StockDividend[];
    /** 年間配当金合計 [円] */
    totalAmount: number;
};

/**
 * 配当金データの型定義
 * グラフ表示に使用される年別配当金の集計データ
 */
export type DividendData = {
    /** 表示用の年（例: "2024年"） */
    year: string;
    /** 年間配当金合計（税引き後）[円] */
    totalDividend: number;
};
