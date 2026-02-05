/**
 * RootLayout コンポーネントのテスト
 *
 * このテストファイルは、src/app/layout.tsxの機能をテストします。
 * アプリケーション全体のレイアウト構造、DarkModeProviderの統合、Headerコンポーネントの統合をテストしています。
 */

import React from 'react';
import {render, screen} from '@testing-library/react';
import RootLayout from '@/app/layout';
import '@testing-library/jest-dom';

// DarkModeProviderのモック
jest.mock('@/app/components/DarkModeProvider', () => ({
    DarkModeProvider: ({children}: { children: React.ReactNode }) => (
        <div data-testid="dark-mode-provider">{children}</div>
    ),
}));

// Headerコンポーネントのモック
jest.mock('@/app/components/Header', () => {
    return function Header() {
        return <header data-testid="header">Header</header>;
    };
});

describe('RootLayout', () => {
    describe('基本構造', () => {
        it('レイアウトコンポーネントがレンダリングされる', () => {
            const {container} = render(
                <RootLayout>
                    <div data-testid="test-content">Test Content</div>
                </RootLayout>
            );

            expect(container).toBeInTheDocument();
            expect(screen.getByTestId('test-content')).toBeInTheDocument();
        });

        it('子コンポーネントが正常に表示される', () => {
            render(
                <RootLayout>
                    <div data-testid="child-element">Child Content</div>
                </RootLayout>
            );

            expect(screen.getByTestId('child-element')).toBeInTheDocument();
            expect(screen.getByText('Child Content')).toBeInTheDocument();
        });
    });

    describe('DarkModeProviderの統合', () => {
        it('DarkModeProviderで子コンポーネントをラップする', () => {
            render(
                <RootLayout>
                    <div data-testid="child-content">Test Content</div>
                </RootLayout>
            );

            expect(screen.getByTestId('dark-mode-provider')).toBeInTheDocument();
        });

        it('DarkModeProviderが子コンポーネントを含む', () => {
            render(
                <RootLayout>
                    <div data-testid="child-content">Test Content</div>
                </RootLayout>
            );

            const provider = screen.getByTestId('dark-mode-provider');
            const childContent = screen.getByTestId('child-content');
            
            expect(provider).toContainElement(childContent);
        });
    });

    describe('Headerコンポーネントの統合', () => {
        it('Headerコンポーネントが表示される', () => {
            render(
                <RootLayout>
                    <div>Test Content</div>
                </RootLayout>
            );

            expect(screen.getByTestId('header')).toBeInTheDocument();
        });

        it('HeaderがDarkModeProvider内にレンダリングされる', () => {
            render(
                <RootLayout>
                    <div>Test Content</div>
                </RootLayout>
            );

            const provider = screen.getByTestId('dark-mode-provider');
            const header = screen.getByTestId('header');
            
            expect(provider).toContainElement(header);
        });
    });

    describe('子コンポーネントのレンダリング', () => {
        it('渡された子コンポーネントがレンダリングされる', () => {
            render(
                <RootLayout>
                    <div data-testid="test-child">Test Child Component</div>
                </RootLayout>
            );

            expect(screen.getByTestId('test-child')).toBeInTheDocument();
            expect(screen.getByText('Test Child Component')).toBeInTheDocument();
        });

        it('複数の子コンポーネントがレンダリングされる', () => {
            render(
                <RootLayout>
                    <>
                        <div data-testid="child-1">Child 1</div>
                        <div data-testid="child-2">Child 2</div>
                        <div data-testid="child-3">Child 3</div>
                    </>
                </RootLayout>
            );

            expect(screen.getByTestId('child-1')).toBeInTheDocument();
            expect(screen.getByTestId('child-2')).toBeInTheDocument();
            expect(screen.getByTestId('child-3')).toBeInTheDocument();
        });

        it('子コンポーネントがHeaderの後にレンダリングされる', () => {
            const {container} = render(
                <RootLayout>
                    <div data-testid="test-child">Test Child</div>
                </RootLayout>
            );

            const provider = screen.getByTestId('dark-mode-provider');
            const children = Array.from(provider.children);
            
            // 最初の子要素がHeader、2番目が子コンポーネント
            expect(children[0]).toBe(screen.getByTestId('header'));
            expect(children[1]).toBe(screen.getByTestId('test-child'));
        });
    });

    describe('コンポーネントの階層構造', () => {
        it('正しいネスト構造でレンダリングされる', () => {
            render(
                <RootLayout>
                    <div data-testid="page-content">Page Content</div>
                </RootLayout>
            );

            const provider = screen.getByTestId('dark-mode-provider');
            const header = screen.getByTestId('header');
            const content = screen.getByTestId('page-content');

            // DarkModeProviderがHeaderと子コンポーネントの両方を含む
            expect(provider).toContainElement(header);
            expect(provider).toContainElement(content);
        });
    });
});
