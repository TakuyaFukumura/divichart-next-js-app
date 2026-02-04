'use client';

import {createContext, useContext, useEffect, useState, ReactNode, useMemo} from 'react';

type Theme = 'light' | 'dark';

interface DarkModeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDark: boolean;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({children}: { readonly children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // ブラウザ環境のみlocalStorageにアクセス
        if (globalThis.window !== undefined) {
            const savedTheme = localStorage.getItem('theme') as Theme;
            if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
                setTheme(savedTheme);
            }
        }
    }, []);

    useEffect(() => {
        const updateTheme = () => {
            const isDarkMode = theme === 'dark';
            setIsDark(isDarkMode);

            // HTMLタグにdarkクラスを追加/削除
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        updateTheme();
    }, [theme]);

    const handleSetTheme = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const value = useMemo(() => ({theme, setTheme: handleSetTheme, isDark}), [theme, isDark]);

    return (
        <DarkModeContext.Provider value={value}>
            {children}
        </DarkModeContext.Provider>
    );
}

export function useDarkMode() {
    const context = useContext(DarkModeContext);
    if (context === undefined) {
        throw new Error('useDarkMode must be used within a DarkModeProvider');
    }
    return context;
}
