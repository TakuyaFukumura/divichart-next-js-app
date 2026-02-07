import {useEffect, useState} from 'react';
import {CSVRow} from '@/types/dividend';
import {loadCSV} from '@/lib/csvLoader';

/**
 * 配当金データの読み込み状態を管理するカスタムフック
 * 
 * @param csvFilePath - CSVファイルのパス（デフォルト: '/data/dividendlist_20260205.csv'）
 * @returns 配当金データ、ローディング状態、エラー情報
 * 
 * @remarks
 * - CSVファイルは初回マウント時のみ読み込まれる
 * - CSVファイルはShift-JISエンコーディングで保存されている想定
 * - エラーが発生した場合、エラーメッセージが返される
 */
export function useDividendData(csvFilePath: string = '/data/dividendlist_20260205.csv') {
    const [data, setData] = useState<CSVRow[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const csvData = await loadCSV(csvFilePath);
                setData(csvData);
            } catch (err) {
                setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // CSVは初回マウント時のみ読み込む
    }, [csvFilePath]);

    return {data, loading, error};
}
