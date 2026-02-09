/**
 * CustomTooltip コンポーネントのテスト
 */

import React from 'react';
import {render, screen} from '@testing-library/react';
import {CustomTooltip} from '@/app/components/DividendPieChart';

describe('CustomTooltip', () => {
    describe('銘柄コードが存在する場合', () => {
        it('銘柄コードと銘柄名が「-」で結合されて表示される', () => {
            const props = {
                active: true,
                payload: [
                    {
                        name: 'BLV',
                        value: 50000,
                        payload: {
                            percentage: 25.0,
                            stockCode: 'BLV',
                            stockName: 'VA L-TERM BOND',
                        },
                    },
                ],
            };

            render(<CustomTooltip {...props} />);

            // 銘柄コード - 銘柄名 の形式で表示されることを確認
            expect(screen.getByText('BLV - VA L-TERM BOND')).toBeInTheDocument();
            expect(screen.getByText('金額: ¥50,000')).toBeInTheDocument();
            expect(screen.getByText('割合: 25.0%')).toBeInTheDocument();
        });
    });

    describe('銘柄コードが存在しない場合', () => {
        it('銘柄名のみが表示される', () => {
            const props = {
                active: true,
                payload: [
                    {
                        name: 'その他',
                        value: 10000,
                        payload: {
                            percentage: 5.0,
                            stockCode: '',
                            stockName: 'その他',
                        },
                    },
                ],
            };

            render(<CustomTooltip {...props} />);

            // 銘柄名のみが表示されることを確認
            expect(screen.getByText('その他')).toBeInTheDocument();
            expect(screen.getByText('金額: ¥10,000')).toBeInTheDocument();
            expect(screen.getByText('割合: 5.0%')).toBeInTheDocument();
            
            // 「-」が含まれていないことを確認
            expect(screen.queryByText(/-/)).not.toBeInTheDocument();
        });
    });

    describe('非アクティブ状態', () => {
        it('active=falseの場合、何も表示されない', () => {
            const props = {
                active: false,
                payload: [
                    {
                        name: 'BLV',
                        value: 50000,
                        payload: {
                            percentage: 25.0,
                            stockCode: 'BLV',
                            stockName: 'VA L-TERM BOND',
                        },
                    },
                ],
            };

            const {container} = render(<CustomTooltip {...props} />);

            // 何もレンダリングされないことを確認
            expect(container.firstChild).toBeNull();
        });

        it('payloadが空の場合、何も表示されない', () => {
            const props = {
                active: true,
                payload: [],
            };

            const {container} = render(<CustomTooltip {...props} />);

            // 何もレンダリングされないことを確認
            expect(container.firstChild).toBeNull();
        });
    });
});
