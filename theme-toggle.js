{
    const THEME_PREFERENCE_STORAGE_KEY = 'ichikaThemePreference';
    const THEMES = {
        LIGHT: 'light',
        DARK: 'dark'
    };

    const initialTheme = getStoredThemePreference();
    applyTheme(initialTheme);

    document.addEventListener('DOMContentLoaded', () => {
        const themeToggleElement = document.getElementById('theme-toggle');
        if (!themeToggleElement) {
            return;
        }

        themeToggleElement.checked = initialTheme === THEMES.DARK;

        themeToggleElement.addEventListener('change', (event) => {
            const nextTheme = event.target.checked ? THEMES.DARK : THEMES.LIGHT;
            applyTheme(nextTheme);
            localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, nextTheme);
        });
    });

    /**
     * localStorage に保存されているテーマを返します。
     * @returns {'light' | 'dark'}
     */
    function getStoredThemePreference() {
        const stored = localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY);
        return stored === THEMES.DARK ? THEMES.DARK : THEMES.LIGHT;
    }

    /**
     * HTML の data-bs-theme 属性を更新します。
     * @param {'light' | 'dark'} theme
     * @returns {void}
     */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme);
    }
};
