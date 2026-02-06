import Papa from 'papaparse';
import {CSVRow} from '@/types/dividend';

/**
 * CSVファイルを読み込み、パースする
 * 
 * @param filePath - CSVファイルのパス（publicディレクトリからの相対パス）
 * @returns CSVデータの配列
 * @throws CSVファイルの読み込みまたはパースに失敗した場合
 * 
 * @remarks
 * - CSVファイルはShift-JISエンコーディングで保存されている想定
 * - 空行はスキップされる
 * - ヘッダー行は自動的に認識される
 */
export async function loadCSV(filePath: string): Promise<CSVRow[]> {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`CSVファイルの読み込みに失敗しました: ${filePath}`);
        }

        // Shift-JISエンコーディングを処理するため、arrayBufferとして取得
        const arrayBuffer = await response.arrayBuffer();
        const decoder = new TextDecoder('shift-jis');
        const csvText = decoder.decode(arrayBuffer);

        return new Promise((resolve, reject) => {
            Papa.parse<CSVRow>(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    resolve(results.data);
                },
                error: (error: Error) => {
                    reject(error);
                },
            });
        });
    } catch (error) {
        throw new Error(
            error instanceof Error 
                ? error.message 
                : 'CSVファイルの読み込み中に予期しないエラーが発生しました'
        );
    }
}
