/**
 * YearSelector コンポーネントのテスト
 */

import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import YearSelector from '@/app/components/YearSelector';
import '@testing-library/jest-dom';

describe('YearSelector', () => {
    const mockOnYearChange = jest.fn();

    beforeEach(() => {
        mockOnYearChange.mockClear();
    });

    describe('基本的なレンダリング', () => {
        it('現在の年が表示される', () => {
            render(
                <YearSelector
                    currentYear={2026}
                    availableYears={[2024, 2025, 2026]}
                    onYearChangeAction={mockOnYearChange}
                />
            );

            expect(screen.getByText('2026年')).toBeInTheDocument();
        });

        it('前年ボタンが表示される', () => {
            render(
                <YearSelector
                    currentYear={2026}
                    availableYears={[2024, 2025, 2026]}
                    onYearChangeAction={mockOnYearChange}
                />
            );

            expect(screen.getByText('< 前年')).toBeInTheDocument();
        });

        it('次年ボタンが表示される', () => {
            render(
                <YearSelector
                    currentYear={2026}
                    availableYears={[2024, 2025, 2026]}
                    onYearChangeAction={mockOnYearChange}
                />
            );

            expect(screen.getByText('次年 >')).toBeInTheDocument();
        });
    });

    describe('ボタンの有効/無効状態', () => {
        it('最初の年の場合、前年ボタンが無効化される', () => {
            render(
                <YearSelector
                    currentYear={2024}
                    availableYears={[2024, 2025, 2026]}
                    onYearChangeAction={mockOnYearChange}
                />
            );

            const prevButton = screen.getByText('< 前年').closest('button');
            expect(prevButton).toBeDisabled();
        });

        it('最後の年の場合、次年ボタンが無効化される', () => {
            render(
                <YearSelector
                    currentYear={2026}
                    availableYears={[2024, 2025, 2026]}
                    onYearChangeAction={mockOnYearChange}
                />
            );

            const nextButton = screen.getByText('次年 >').closest('button');
            expect(nextButton).toBeDisabled();
        });

        it('中間の年の場合、両方のボタンが有効', () => {
            render(
                <YearSelector
                    currentYear={2025}
                    availableYears={[2024, 2025, 2026]}
                    onYearChangeAction={mockOnYearChange}
                />
            );

            const prevButton = screen.getByText('< 前年').closest('button');
            const nextButton = screen.getByText('次年 >').closest('button');

            expect(prevButton).not.toBeDisabled();
            expect(nextButton).not.toBeDisabled();
        });
    });

    describe('年度変更機能', () => {
        it('前年ボタンをクリックすると前年に変更される', () => {
            render(
                <YearSelector
                    currentYear={2025}
                    availableYears={[2024, 2025, 2026]}
                    onYearChangeAction={mockOnYearChange}
                />
            );

            const prevButton = screen.getByText('< 前年').closest('button');
            if (prevButton) {
                fireEvent.click(prevButton);
            }

            expect(mockOnYearChange).toHaveBeenCalledWith(2024);
            expect(mockOnYearChange).toHaveBeenCalledTimes(1);
        });

        it('次年ボタンをクリックすると次年に変更される', () => {
            render(
                <YearSelector
                    currentYear={2025}
                    availableYears={[2024, 2025, 2026]}
                    onYearChangeAction={mockOnYearChange}
                />
            );

            const nextButton = screen.getByText('次年 >').closest('button');
            if (nextButton) {
                fireEvent.click(nextButton);
            }

            expect(mockOnYearChange).toHaveBeenCalledWith(2026);
            expect(mockOnYearChange).toHaveBeenCalledTimes(1);
        });

        it('無効な前年ボタンをクリックしても変更されない', () => {
            render(
                <YearSelector
                    currentYear={2024}
                    availableYears={[2024, 2025, 2026]}
                    onYearChangeAction={mockOnYearChange}
                />
            );

            const prevButton = screen.getByText('< 前年').closest('button');
            if (prevButton) {
                fireEvent.click(prevButton);
            }

            expect(mockOnYearChange).not.toHaveBeenCalled();
        });

        it('無効な次年ボタンをクリックしても変更されない', () => {
            render(
                <YearSelector
                    currentYear={2026}
                    availableYears={[2024, 2025, 2026]}
                    onYearChangeAction={mockOnYearChange}
                />
            );

            const nextButton = screen.getByText('次年 >').closest('button');
            if (nextButton) {
                fireEvent.click(nextButton);
            }

            expect(mockOnYearChange).not.toHaveBeenCalled();
        });
    });

    describe('エッジケース', () => {
        it('年が1つしかない場合、両方のボタンが無効化される', () => {
            render(
                <YearSelector
                    currentYear={2026}
                    availableYears={[2026]}
                    onYearChangeAction={mockOnYearChange}
                />
            );

            const prevButton = screen.getByText('< 前年').closest('button');
            const nextButton = screen.getByText('次年 >').closest('button');

            expect(prevButton).toBeDisabled();
            expect(nextButton).toBeDisabled();
        });
    });
});
