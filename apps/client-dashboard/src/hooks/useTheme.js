import { useState, useEffect } from 'react';
export const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        // Get theme from localStorage or default to system
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'system';
    });
    const [resolvedTheme, setResolvedTheme] = useState('light');
    useEffect(() => {
        const updateResolvedTheme = () => {
            if (theme === 'system') {
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setResolvedTheme(systemPrefersDark ? 'dark' : 'light');
            }
            else {
                setResolvedTheme(theme);
            }
        };
        updateResolvedTheme();
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                updateResolvedTheme();
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);
    useEffect(() => {
        // Apply theme to document
        const root = document.documentElement;
        if (resolvedTheme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        }
        else {
            root.classList.add('light');
            root.classList.remove('dark');
        }
        // Store theme preference
        localStorage.setItem('theme', theme);
    }, [theme, resolvedTheme]);
    const setLightTheme = () => setTheme('light');
    const setDarkTheme = () => setTheme('dark');
    const setSystemTheme = () => setTheme('system');
    const toggleTheme = () => {
        setTheme(prev => {
            if (prev === 'light')
                return 'dark';
            if (prev === 'dark')
                return 'system';
            return 'light';
        });
    };
    const isDark = resolvedTheme === 'dark';
    const isLight = resolvedTheme === 'light';
    const isSystem = theme === 'system';
    return {
        theme,
        resolvedTheme,
        isDark,
        isLight,
        isSystem,
        setTheme,
        setLightTheme,
        setDarkTheme,
        setSystemTheme,
        toggleTheme,
    };
};
