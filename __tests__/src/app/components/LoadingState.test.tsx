import { render, screen } from '@testing-library/react';
import { LoadingScreen, ErrorScreen } from '@/app/components/LoadingState';

describe('LoadingState', () => {
    describe('LoadingScreen', () => {
        it('ローディングメッセージを表示する', () => {
            render(<LoadingScreen />);
            expect(screen.getByText('読み込み中...')).toBeInTheDocument();
        });

        it('スピナーを表示する', () => {
            const { container } = render(<LoadingScreen />);
            const spinner = container.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
        });

        it('正しいスタイルクラスが適用されている', () => {
            const { container } = render(<LoadingScreen />);
            const mainDiv = container.firstChild;
            expect(mainDiv).toHaveClass('flex', 'items-center', 'justify-center', 'min-h-screen');
        });
    });

    describe('ErrorScreen', () => {
        it('エラーメッセージを表示する', () => {
            const errorMessage = 'テストエラー';
            render(<ErrorScreen error={errorMessage} />);
            expect(screen.getByText(`エラー: ${errorMessage}`)).toBeInTheDocument();
        });

        it('異なるエラーメッセージを表示できる', () => {
            const { rerender } = render(<ErrorScreen error="エラー1" />);
            expect(screen.getByText('エラー: エラー1')).toBeInTheDocument();
            
            rerender(<ErrorScreen error="エラー2" />);
            expect(screen.getByText('エラー: エラー2')).toBeInTheDocument();
        });

        it('正しいスタイルクラスが適用されている', () => {
            const { container } = render(<ErrorScreen error="test" />);
            const mainDiv = container.firstChild;
            expect(mainDiv).toHaveClass('flex', 'items-center', 'justify-center', 'min-h-screen');
        });
    });
});
