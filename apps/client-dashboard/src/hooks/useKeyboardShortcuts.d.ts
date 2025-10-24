interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    action: () => void;
    description: string;
    category: 'navigation' | 'actions' | 'system';
}
export declare const useKeyboardShortcuts: () => {
    shortcuts: KeyboardShortcut[];
    navigationShortcuts: KeyboardShortcut[];
    actionShortcuts: KeyboardShortcut[];
    systemShortcuts: KeyboardShortcut[];
    showHelp: () => void;
};
export {};
