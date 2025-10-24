type Theme = 'light' | 'dark' | 'system';
export declare const useTheme: () => {
    theme: Theme;
    resolvedTheme: "light" | "dark";
    isDark: boolean;
    isLight: boolean;
    isSystem: boolean;
    setTheme: import("react").Dispatch<import("react").SetStateAction<Theme>>;
    setLightTheme: () => void;
    setDarkTheme: () => void;
    setSystemTheme: () => void;
    toggleTheme: () => void;
};
export {};
