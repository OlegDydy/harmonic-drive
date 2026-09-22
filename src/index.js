document.addEventListener(
  "DOMContentLoaded",
  async () => {
    const { render, $effect } = await __jsx();
    const { locale, localesAvailable } = await __i18n();
    const App = await __app();

    const mountPoint = document.querySelector("#app");
    if (!mountPoint) throw new Error("Can not mount app");

    const LOCALE_STORE = 'locale';
    /** @returns {any} */
    const loadLocale = () => {
      const available = localesAvailable();
      const stored = localStorage.getItem(LOCALE_STORE);
      if (stored && available.includes(stored)) return stored;

      for (const lang of navigator.languages) {
        const [base] = lang.split('-');
        if (available.includes(base)) return base;
      }

      return locale();
    }
    locale(loadLocale());

    render(() => {
      $effect(() => {
        localStorage.setItem(LOCALE_STORE, locale())
      });
      return App({})
    }, mountPoint);
  },
  { once: true },
);
