const __i18n = mod.sync(() => {
  const { $state } = __jsx();

  /**
   * @typedef {'ru' | 'en'} Locales
   * @typedef {Record<Locales, Lang>}
   * @typedef {object} Lang
   * @prop {Intl.PluralRules} _plural
   * @prop {string} appTitle
   * @prop {string} appSubtitle
   * @prop {string} statsTitle
   * @prop {string} statsGearRatio
   * @prop {string} statsWaves
   * @prop {string} geomTitle
   * @prop {string} geomBodies
   * @prop {string} geomWaves
   * @prop {string} geomThickness
   * @prop {string} geomSpacer
   * @prop {string} geomOuterRadius
   * @prop {string} baseTitle
   * @prop {string} baseHint
   * @prop {string} baseInnerRadius
   * @prop {string} baseEccentricity
   * @prop {string} baseRadius
   * @prop {string} baseSpacer
   * @prop {string} animTitle
   * @prop {string} animToggle
   * @prop {string} animRPM
   * @prop {string} exportTitle
   * @prop {string} exportApprox
   * @prop {string} exportApproxLines
   * @prop {string} exportApproxSplines
   * @prop {string} exportSvg
   * @prop {string} exportDxf
   * @prop {string} errUnknownBase
   * @prop {string} errImpossible
   * @prop {string} drawWheel
   * @prop {string} drawSpacer
   * @prop {string} drawWaveGen
   * @prop {string} drawBodies
   * @prop {string} drawError
   * @prop {string} drawErrorHint
   * @prop {string} switchLanguage
   * @prop {string} switchTheme
   * @prop {string} themeSystem
   * @prop {string} themeLight
   * @prop {string} themeDark
   */
  const DEFAULT_LOCALE = "en";
  const locale = $state(/** @type {Locales} */ (DEFAULT_LOCALE));

  /** @type {Record<Locales, Partial<Lang>> & { [DEFAULT_LOCALE]: Lang }} */
  const locales = {
    /** @type {Lang} */
    en: {
      _plural: new Intl.PluralRules("en-US"),
      appTitle: "Harmonic Gearing",
      appSubtitle: "with intermediate rolling bodies",
      statsTitle: "Parameters",
      statsGearRatio: "Gear ratio",
      statsWaves: "Hard wheel waves",
      geomTitle: "Geometry",
      geomBodies: "Rolling bodies",
      geomWaves: "Wave generator waves",
      geomThickness: "Hard wheel thickness",
      geomSpacer: "Spacer margin",
      geomOuterRadius: "Profile outer radius",
      baseTitle: "Base property",
      baseHint: "Other properties are recalculated based on the selected one.",
      baseInnerRadius: "Profile inner radius",
      baseEccentricity: "Eccentricity",
      baseRadius: "Body radius",
      baseSpacer: "Spacer thickness",
      animTitle: "Animation",
      animToggle: "Wave generator rotation",
      animRPM: "RPM",
      exportTitle: "Export",
      exportApprox: "Profile approximation",
      exportApproxLines: "With Lines",
      exportApproxSplines: "With Splines",
      exportSvg: "Save SVG",
      exportDxf: "Save DXF",
      errUnknownBase: "Unknown base property",
      errImpossible: "Drive with such parameters can not be constructed",
      drawError: "Invalid properties",
      drawErrorHint: "Drive with such parameters can not be constructed. Please check geometry and base property",
      drawWheel: "Hard wheel",
      drawSpacer: "Spacer",
      drawWaveGen: "Wave generator",
      drawBodies: "Rolling bodies",
      switchLanguage: "Switch language",
      switchTheme: "Switch theme",
      themeSystem: "System",
      themeLight: "Light",
      themeDark: "Dark",
    },
    ru: {
      _plural: new Intl.PluralRules("ru-RU"),
      appTitle: "Волновой редуктор",
      appSubtitle: "с промежуточными телами качения",
      statsTitle: "Параметры",
      statsGearRatio: "Передаточное отношение",
      statsWaves: "Волн жёсткого колеса",
      geomTitle: "Геометрия",
      geomBodies: "Тел качения",
      geomWaves: "Волн волнообразователя",
      geomThickness: "Толщина жёсткого колеса",
      geomSpacer: "Зазор сепаратора",
      geomOuterRadius: "Внешний радиус профиля",
      baseTitle: "Базовая характеристика",
      baseHint: "Остальные параметры пересчитываются из выбранного автоматически.",
      baseInnerRadius: "Внутренний радиус профиля",
      baseEccentricity: "Эксцентриситет",
      baseRadius: "Радиус тел качения",
      baseSpacer: "Толщина сепаратора",
      animTitle: "Анимация",
      animToggle: "Вращение волнообразователя",
      animRPM: "об/мин",
      exportTitle: "Экспорт",
      exportApprox: "Приближение профиля",
      exportApproxLines: "Прямыми",
      exportApproxSplines: "Сплайнами",
      exportSvg: "Сохранить SVG",
      exportDxf: "Сохранить DXF",
      errUnknownBase: "Неизвестная базовая характеристика",
      errImpossible: "Редуктор с заданными параметрами не может быть построен",
      drawError: "Невозможно построить",
      drawErrorHint:
        "Редуктор с заданными параметрами геометрически не существует — проверьте геометрию и базовую характеристику.",
      drawWheel: "Жёсткое колесо",
      drawSpacer: "Сепаратор",
      drawWaveGen: "Волнообразователь",
      drawBodies: "Тела качения",
      switchLanguage: "Переключить язык",
      switchTheme: "Переключить тему",
      themeSystem: "Системная",
      themeLight: "Светлая",
      themeDark: "Тёмная",
    },
  };
  const fallback = locales[DEFAULT_LOCALE];

  /** @template {Exclude<keyof Lang, '_plural'>} K @param {K} key @returns {() => Lang[K]} */
  const get = (key) => () => (locales[locale()] ?? fallback)[key] ?? fallback[key];

  return {
    locale,
    localesAvailable: () => /** @type {Locales[]} */ (Object.keys(locales)),
    appTitle: get("appTitle"),
    appSubtitle: get("appSubtitle"),
    statsTitle: get("statsTitle"),
    statsGearRatio: get("statsGearRatio"),
    statsWaves: get("statsWaves"),
    geomTitle: get("geomTitle"),
    geomBodies: get("geomBodies"),
    geomWaves: get("geomWaves"),
    geomThickness: get("geomThickness"),
    geomSpacer: get("geomSpacer"),
    geomOuterRadius: get("geomOuterRadius"),
    baseTitle: get("baseTitle"),
    baseHint: get("baseHint"),
    baseInnerRadius: get("baseInnerRadius"),
    baseEccentricity: get("baseEccentricity"),
    baseRadius: get("baseRadius"),
    baseSpacer: get("baseSpacer"),
    animTitle: get("animTitle"),
    animToggle: get("animToggle"),
    animRPM: get("animRPM"),
    exportTitle: get("exportTitle"),
    exportApprox: get("exportApprox"),
    exportApproxLines: get("exportApproxLines"),
    exportApproxSplines: get("exportApproxSplines"),
    exportSvg: get("exportSvg"),
    exportDxf: get("exportDxf"),
    errUnknownBase: get("errUnknownBase"),
    errImpossible: get("errImpossible"),
    drawError: get("drawError"),
    drawErrorHint: get("drawErrorHint"),
    drawWheel: get("drawWheel"),
    drawSpacer: get("drawSpacer"),
    drawWaveGen: get("drawWaveGen"),
    drawBodies: get("drawBodies"),
    switchLanguage: get("switchLanguage"),
    switchTheme: get("switchTheme"),
    themeSystem: get("themeSystem"),
    themeLight: get("themeLight"),
    themeDark: get("themeDark"),
  };
});
