/**
 * Header コンポーネントのテスト
 *
 * このテストファイルは、src/app/components/Header.tsxの機能をテストします。
 * ダークモード/ライトモードの切り替えボタン、ハンバーガーメニュー、ヘッダーの表示をテストしています。
 */

import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {DarkModeProvider} from '@/app/components/DarkModeProvider';
import Header from '../../../../src/app/components/Header';
import '@testing-library/jest-dom';

describe('Header', () => {
    const renderWithProvider = (initialTheme?: 'light' | 'dark') => {
        if (initialTheme) {
            window.localStorage.getItem = jest.fn(() => initialTheme);
        }

        return render(
            <DarkModeProvider>
                <Header/>
            </DarkModeProvider>
        );
    };

    describe('基本的なレンダリング', () => {
        it('ヘッダータイトルが表示される', () => {
            renderWithProvider();

            const titles = screen.getAllByText('divichart');
            expect(titles.length).toBeGreaterThan(0);
            expect(titles[0]).toBeInTheDocument();
        });

        it('ナビゲーションリンクが表示される', () => {
            renderWithProvider();

            // デスクトップナビゲーション
            const yearLink = screen.getByRole('link', {name: '年別配当'});
            expect(yearLink).toBeInTheDocument();

            const cumulativeLink = screen.getByRole('link', {name: '累計配当'});
            expect(cumulativeLink).toBeInTheDocument();

            const portfolioLink = screen.getByRole('link', {name: 'ポートフォリオ'});
            expect(portfolioLink).toBeInTheDocument();

            const settingsLinks = screen.getAllByRole('link', {name: /設定/});
            expect(settingsLinks.length).toBeGreaterThan(0);
        });

        it('年別配当リンクが正しいhrefを持つ', () => {
            renderWithProvider();

            const link = screen.getByText('年別配当').closest('a');
            expect(link).toHaveAttribute('href', '/');
        });

        it('ポートフォリオリンクが正しいhrefを持つ', () => {
            renderWithProvider();

            const link = screen.getByText('ポートフォリオ').closest('a');
            expect(link).toHaveAttribute('href', '/portfolio');
        });

        it('累計配当リンクが正しいhrefを持つ', () => {
            renderWithProvider();

            const link = screen.getByText('累計配当').closest('a');
            expect(link).toHaveAttribute('href', '/cumulative');
        });

        it('設定リンクが正しいhrefを持つ', () => {
            renderWithProvider();

            const link = screen.getAllByText(/⚙️ 設定/)[0].closest('a');
            expect(link).toHaveAttribute('href', '/settings');
        });

        it('ヘッダーのHTML構造が正しい', () => {
            renderWithProvider();

            const header = screen.getByRole('banner');
            expect(header).toBeInTheDocument();
            expect(header.tagName).toBe('HEADER');
        });

        it('テーマ切り替えボタンが表示される', () => {
            renderWithProvider();

            const button = screen.getByTitle(/現在:/);
            expect(button).toBeInTheDocument();
        });
    });

    describe('ライトモード', () => {
        it('ライトモード時に太陽アイコンが表示される', () => {
            renderWithProvider('light');

            expect(screen.getByText('☀️')).toBeInTheDocument();
        });

        it('ライトモード時のラベルが表示される', () => {
            renderWithProvider('light');

            expect(screen.getByText('ライトモード')).toBeInTheDocument();
        });

        it('ボタンのtitle属性が正しく設定される', () => {
            renderWithProvider('light');

            const button = screen.getByTitle(/現在:/);
            expect(button).toHaveAttribute('title', '現在: ライトモード');
        });
    });

    describe('ダークモード', () => {
        it('ダークモード時に月アイコンが表示される', () => {
            window.localStorage.setItem('theme', 'dark');
            renderWithProvider();

            expect(screen.getByText('🌙')).toBeInTheDocument();
        });

        it('ダークモード時のラベルが表示される', () => {
            window.localStorage.setItem('theme', 'dark');
            renderWithProvider();

            expect(screen.getByText('ダークモード')).toBeInTheDocument();
        });

        it('ボタンのtitle属性が正しく設定される', () => {
            renderWithProvider('dark');

            const button = screen.getByTitle(/現在:/);
            expect(button).toHaveAttribute('title', '現在: ダークモード');
        });
    });

    describe('テーマ切り替え機能', () => {
        it('ライトモードからダークモードに切り替わる', () => {
            window.localStorage.setItem('theme', 'light');
            renderWithProvider();

            // 初期状態の確認
            expect(screen.getByText('☀️')).toBeInTheDocument();
            expect(screen.getByText('ライトモード')).toBeInTheDocument();

            // ボタンをクリック
            const button = screen.getByTitle(/現在:/);
            fireEvent.click(button);

            // ダークモードに変更されたことを確認
            expect(screen.getByText('🌙')).toBeInTheDocument();
            expect(screen.getByText('ダークモード')).toBeInTheDocument();
        });

        it('ダークモードからライトモードに切り替わる', () => {
            renderWithProvider('dark');

            // 初期状態の確認
            expect(screen.getByText('🌙')).toBeInTheDocument();
            expect(screen.getByText('ダークモード')).toBeInTheDocument();

            // ボタンをクリック
            const button = screen.getByTitle(/現在:/);
            fireEvent.click(button);

            // ライトモードに変更されたことを確認
            expect(screen.getByText('☀️')).toBeInTheDocument();
            expect(screen.getByText('ライトモード')).toBeInTheDocument();
        });

        it('複数回のクリックで正しく切り替わる', () => {
            renderWithProvider('light');

            const button = screen.getByTitle(/現在:/);

            // ライトモード → ダークモード
            fireEvent.click(button);
            expect(screen.getByText('🌙')).toBeInTheDocument();

            // ダークモード → ライトモード
            fireEvent.click(button);
            expect(screen.getByText('☀️')).toBeInTheDocument();

            // ライトモード → ダークモード
            fireEvent.click(button);
            expect(screen.getByText('🌙')).toBeInTheDocument();
        });
    });

    describe('ボタンのアクセシビリティ', () => {
        it('ボタンがキーボードでアクセス可能', () => {
            renderWithProvider();

            const button = screen.getByTitle(/現在:/);
            expect(button).toBeInTheDocument();

            // タブキーでフォーカス可能かを確認
            button.focus();
            expect(button).toHaveFocus();
        });

        it('適切なaria属性が設定されている', () => {
            renderWithProvider();

            const button = screen.getByTitle(/現在:/);

            // title属性による説明があることを確認
            expect(button).toHaveAttribute('title');
            expect(button.getAttribute('title')).toContain('現在:');
        });
    });

    describe('レスポンシブデザイン', () => {
        beforeEach(() => {
            window.localStorage.setItem('theme', 'light');
            renderWithProvider();
        });

        it('テキストラベルが適切なクラスで制御されている', () => {
            // 'hidden sm:inline' クラスでモバイルでは非表示になることを想定
            const textLabel = screen.getByText('ライトモード');
            expect(textLabel).toHaveClass('hidden', 'sm:inline');
        });

        it('アイコンが常に表示される', () => {

            const icon = screen.getByText('☀️');
            expect(icon).toBeInTheDocument();
        });

        it('デスクトップナビゲーションに適切なレスポンシブクラスが適用される', () => {
            const desktopNav = screen.getAllByRole('navigation')[0];
            expect(desktopNav).toHaveClass('hidden', 'md:flex');
        });
    });

    describe('ハンバーガーメニュー', () => {
        beforeEach(() => {
            renderWithProvider();
        });

        it('ハンバーガーメニューボタンが表示される', () => {
            const hamburgerButton = screen.getByLabelText('メニューを開く');
            expect(hamburgerButton).toBeInTheDocument();
        });

        it('ハンバーガーメニューボタンにモバイル専用クラスが適用される', () => {
            const hamburgerButton = screen.getByLabelText('メニューを開く');
            expect(hamburgerButton).toHaveClass('md:hidden');
        });

        it('ハンバーガーメニューボタンをクリックするとメニューが開く', () => {
            const hamburgerButton = screen.getByLabelText('メニューを開く');
            fireEvent.click(hamburgerButton);

            // メニューパネルが表示される（translate-x-0クラスが適用される）
            const mobileMenu = screen.getByRole('navigation', {name: 'メインメニュー'});
            expect(mobileMenu).toHaveClass('translate-x-0');
        });

        it('メニューが開いているときオーバーレイが表示される', () => {
            const hamburgerButton = screen.getByLabelText('メニューを開く');
            fireEvent.click(hamburgerButton);

            // オーバーレイが表示される
            const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50');
            expect(overlay).toBeInTheDocument();
        });

        it('オーバーレイをクリックするとメニューが閉じる', () => {
            const hamburgerButton = screen.getByLabelText('メニューを開く');
            fireEvent.click(hamburgerButton);

            // オーバーレイをクリック
            const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50');
            fireEvent.click(overlay!);

            // メニューパネルが閉じる（-translate-x-fullクラスが適用される）
            const mobileMenu = screen.getByRole('navigation', {name: 'メインメニュー'});
            expect(mobileMenu).toHaveClass('-translate-x-full');
        });

        it('閉じるボタンをクリックするとメニューが閉じる', () => {
            const hamburgerButton = screen.getByLabelText('メニューを開く');
            fireEvent.click(hamburgerButton);

            // 閉じるボタンをクリック
            const closeButton = screen.getByLabelText('メニューを閉じる');
            fireEvent.click(closeButton);

            // メニューパネルが閉じる
            const mobileMenu = screen.getByRole('navigation', {name: 'メインメニュー'});
            expect(mobileMenu).toHaveClass('-translate-x-full');
        });

        it('ESCキーを押すとメニューが閉じる', () => {
            const hamburgerButton = screen.getByLabelText('メニューを開く');
            fireEvent.click(hamburgerButton);

            // ESCキーを押す
            fireEvent.keyDown(document, {key: 'Escape'});

            // メニューパネルが閉じる
            const mobileMenu = screen.getByRole('navigation', {name: 'メインメニュー'});
            expect(mobileMenu).toHaveClass('-translate-x-full');
        });

        it('メニュー項目をクリックするとメニューが閉じる', () => {
            const hamburgerButton = screen.getByLabelText('メニューを開く');
            fireEvent.click(hamburgerButton);

            // メニュー項目をクリック
            const menuItem = screen.getByText('📊 年別配当');
            fireEvent.click(menuItem);

            // メニューパネルが閉じる
            const mobileMenu = screen.getByRole('navigation', {name: 'メインメニュー'});
            expect(mobileMenu).toHaveClass('-translate-x-full');
        });

        it('モバイルメニュー内にすべてのナビゲーションリンクが表示される', () => {
            const hamburgerButton = screen.getByLabelText('メニューを開く');
            fireEvent.click(hamburgerButton);

            // モバイルメニュー内のリンクを確認
            const mobileMenu = screen.getByRole('navigation', {name: 'メインメニュー'});
            const links = mobileMenu.querySelectorAll('a');
            expect(links.length).toBe(4);

            expect(screen.getAllByText('📊 年別配当').length).toBeGreaterThan(0);
            expect(screen.getAllByText('📈 累計配当').length).toBeGreaterThan(0);
            expect(screen.getAllByText('💼 ポートフォリオ').length).toBeGreaterThan(0);
            expect(screen.getAllByText('⚙️ 設定').length).toBeGreaterThan(0);
        });

        it('aria-expanded属性が正しく設定される', () => {
            const hamburgerButton = screen.getByLabelText('メニューを開く');

            // 閉じている状態
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');

            // 開く
            fireEvent.click(hamburgerButton);
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');

            // 閉じる
            const closeButton = screen.getByLabelText('メニューを閉じる');
            fireEvent.click(closeButton);
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
        });

        it('aria-controls属性が正しく設定される', () => {
            const hamburgerButton = screen.getByLabelText('メニューを開く');
            expect(hamburgerButton).toHaveAttribute('aria-controls', 'mobile-menu');

            const mobileMenu = screen.getByRole('navigation', {name: 'メインメニュー'});
            expect(mobileMenu).toHaveAttribute('id', 'mobile-menu');
        });
    });

    describe('レスポンシブデザイン', () => {
        beforeEach(() => {
            window.localStorage.setItem('theme', 'light');
            renderWithProvider();
        });

        it('テキストラベルが適切なクラスで制御されている', () => {
            // 'hidden sm:inline' クラスでモバイルでは非表示になることを想定
            const textLabel = screen.getByText('ライトモード');
            expect(textLabel).toHaveClass('hidden', 'sm:inline');
        });

        it('アイコンが常に表示される', () => {

            const icon = screen.getByText('☀️');
            expect(icon).toBeInTheDocument();
        });
    });

    describe('CSS クラスの適用', () => {
        it('ヘッダーに適切なスタイルクラスが適用される', () => {
            renderWithProvider();

            const header = screen.getByRole('banner');
            expect(header).toHaveClass('bg-white/80', 'dark:bg-gray-800/80');
        });

        it('ボタンに適切なスタイルクラスが適用される', () => {
            renderWithProvider();

            const button = screen.getByTitle(/現在:/);
            expect(button).toHaveClass('flex', 'items-center', 'gap-2');
        });
    });
});
