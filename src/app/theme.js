const __app_theme = mod.sync(() => {
  const { $state } = __jsx();

  /** @type {Array<'system' | 'light' | 'dark'>} */
  const THEMES = ["system", "light", "dark"];
  const STORE_KEY = "theme";

  /** @returns {'system' | 'light' | 'dark'} */
  const loadTheme = () => {
    const stored = localStorage.getItem(STORE_KEY);
    return THEMES.includes(/** @type {any} */ (stored)) ? /** @type {any} */ (stored) : "system";
  };

  const theme = $state(/** @type {'system' | 'light' | 'dark'} */ (loadTheme()));

  const nextTheme = () => {
    const i = THEMES.indexOf(theme());
    theme(THEMES[(i + 1) % THEMES.length]);
  };

  /** @param {'system' | 'light' | 'dark'} t @returns {void} */
  const applyTheme = (t) => {
    document.documentElement.className = `theme__${t}`;
  };

  return { theme, nextTheme, applyTheme, loadTheme, THEMES, STORE_KEY };
});
