const __app_components_controls = mod(async () => {
  const { jsx, $text, $switch } = await __jsx();
  const t = __i18n();
  const { theme, nextTheme } = __app_theme();
  const { Icon } = await __app_components_ui();
  const { monitor, sun, moon } = await __app_components_icons();

  /** @typedef {ReturnType<(typeof t)['localesAvailable']>[0]} Locales */

  const cycleLocale = () => {
    const available = t.localesAvailable();
    const i = available.indexOf(t.locale());
    t.locale(/** @type {Locales} */ (available[(i + 1) % available.length]));
  };

  /** @type {Record<Locales, string>} */
  const flags = {
    en: '🇺🇸️',
    ru: '🇷🇺️',
  };

  const themeName = () =>
    theme() === "light" ? t.themeLight() : theme() === "dark" ? t.themeDark() : t.themeSystem();

  const Controls = () =>
    jsx("div", {
      class: "controls",
      $: [
        jsx("button", {
          type: "button",
          class: "controls_btn",
          title: t.switchLanguage,
          "aria-label": t.switchLanguage,
          onclick: cycleLocale,
          $: [jsx("span", { $: [$text(() => flags[t.locale()])] })],
        }),
        jsx("button", {
          type: "button",
          class: "controls_btn",
          title: () => `${t.switchTheme()}: ${themeName()}`,
          "aria-label": () => `${t.switchTheme()}: ${themeName()}`,
          onclick: nextTheme,
          $: [
            $switch(
              [
                [() => theme() === "light", () => Icon({ icon: sun, size: 16 })],
                [() => theme() === "dark", () => Icon({ icon: moon, size: 16 })],
              ],
              () => Icon({ icon: monitor, size: 16 }),
            ),
          ],
        }),
      ],
    });

  return { Controls };
});
