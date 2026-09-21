const __app_components_panels = mod(async () => {
  const { jsx, $state, $derived, $effect, $text } = await __jsx();
  const { props, getProps, animation, rpm } = await __app_store();
  const { Entry, SwitchItem, Icon } = await __app_components_ui();
  const { download: downloadIcon, info } = await __app_components_icons();
  const { calcDependentProperties } = await __app_harmonicDrive();
  const { gcd, fmt } = await __utils();
  const { renderDxf, MIME: dxfMime } = await __app_exports_dxf();
  const renderSvg = await __app_exports_svg();

  /** @type {FC<{ depended: Getter<HarmonicDriveDependentProps> }>} */
  const ParamsCard = ({ depended }) => {
    const gearRatio = $derived(() => {
      const { zBalls, zWaves } = getProps();
      const common = gcd(zBalls, zWaves) || 1;
      return { num: zBalls / common, denom: zWaves / common, value: zBalls / zWaves };
    });

    return jsx("section", {
      class: "card",
      $: [
        jsx("h2", { class: "card_title", $: ["Параметры"] }),
        jsx("div", {
          class: "stats",
          $: [
            jsx("div", {
              class: "stat",
              $: [
                jsx("div", {
                  class: "stat_value",
                  $: [$text(() => `${fmt(gearRatio().num)} : ${fmt(gearRatio().denom)}`)],
                }),
                jsx("div", { class: "stat_label", $: ["Передаточное отношение"] }),
              ],
            }),
            jsx("div", {
              class: "stat",
              $: [
                jsx("div", { class: "stat_value", $: [$text(() => fmt(depended().zHard))] }),
                jsx("div", { class: "stat_label", $: ["Волн жёсткого колеса"] }),
              ],
            }),
          ],
        }),
      ],
    });
  };

  const Geometry = () => {
    return jsx("section", {
      class: "card",
      $: [
        jsx("h2", { class: "card_title", $: ["Геометрия"] }),
        jsx("div", {
          class: "fields",
          $: [
            Entry({ value: props.zBalls, type: "number", label: "Тел качения", min: 1 }),
            Entry({ value: props.zWaves, type: "number", label: "Волн волнообразователя", min: 1 }),
            Entry({ value: props.thickness, type: "number", label: "Толщина жёсткого колеса", min: 0, step: 0.01 }),
            Entry({ value: props.sepOffset, type: "number", label: "Отступ сепаратора", min: 0, step: 0.01 }),
            Entry({
              value: props.rOuter,
              type: "number",
              label: "Внешний радиус профиля",
              min: 0,
              step: 0.01,
              variant: "wide",
            }),
          ],
        }),
      ],
    });
  };

  /** @type {FC<{ depended: Getter<HarmonicDriveDependentProps> }>} */
  const BaseProperty = ({ depended }) => {
    let prevBase = props.baseProp();
    $effect(() => {
      const _props = getProps();
      _props.baseProp = prevBase;
      const prevDerived = calcDependentProperties(_props);
      prevBase = props.baseProp();

      switch (prevBase) {
        case "rBall":
          props.baseValue(prevDerived.rBall);
          break;
        case "rIn":
          props.baseValue(prevDerived.rIn);
          break;
        case "e":
          props.baseValue(prevDerived.e);
          break;
        case "hSep":
          props.baseValue(prevDerived.hSep);
          break;
      }
    });

    return jsx("section", {
      class: "card",
      $: [
        jsx("h2", { class: "card_title", $: ["Базовая характеристика"] }),
        jsx("div", {
          class: "base-list",
          $: [
            SwitchItem({
              key: "rIn",
              option: props.baseProp,
              label: "Внутренний радиус",
              value: props.baseValue,
              readonlyValue: () => depended().rIn,
              step: 0.01,
              max: props.rOuter,
            }),
            SwitchItem({
              key: "e",
              option: props.baseProp,
              label: "Эксцентриситет",
              value: props.baseValue,
              readonlyValue: () => depended().e,
              step: 0.01,
            }),
            SwitchItem({
              key: "rBall",
              option: props.baseProp,
              label: "Радиус тел качения",
              value: props.baseValue,
              readonlyValue: () => depended().rBall,
              step: 0.01,
            }),
            SwitchItem({
              key: "hSep",
              option: props.baseProp,
              label: "Толщина сепаратора",
              value: props.baseValue,
              readonlyValue: () => depended().hSep,
              step: 0.01,
            }),
          ],
        }),
        jsx("p", {
          class: "hint",
          $: [Icon({ icon: info, size: "1rem" }), "Остальные параметры пересчитываются из выбранного автоматически."],
        }),
      ],
    });
  };

  const AnimationCard = () => {
    return jsx("section", {
      class: "card",
      $: [
        jsx("h2", { class: "card_title", $: ["Анимация"] }),
        jsx("div", {
          class: "row-between",
          $: [
            jsx("span", { class: "switch_label", $: ["Вращение волнообразователя"] }),
            jsx("label", {
              class: "switch",
              $: [
                jsx("input", { type: "checkbox", class: "switch_input", "bind:value": animation }),
                jsx("span", { class: "switch_thumb" }),
              ],
            }),
          ],
        }),
        jsx("div", {
          class: "rpm",
          $: [
            jsx("input", { type: "range", min: 0, max: 300, class: "rpm_range", "bind:value": rpm }),
            jsx("input", { type: "number", min: 0, class: "input rpm_num", "bind:value": rpm }),
            jsx("span", { class: "rpm_unit", $: ["об/мин"] }),
          ],
        }),
      ],
    });
  };

  /** @type {FC<{ depended: Getter<HarmonicDriveDependentProps> }>} */
  const ExportCard = ({ depended }) => {
    const outputStyle = $state(/** @type {'polyline' | 'bezier'} */ ("polyline"));

    const svgFile = () =>
      new File([renderSvg(getProps(), "mm", outputStyle())], "harmonic-drive.svg", { type: "image/svg+xml" });

    const dxfFile = () => {
      return new File([renderDxf(getProps(), "mm", outputStyle())], "harmonic-drive.dxf", { type: dxfMime });
    };

    /** @param {File} file */
    const download = (file) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(file);
      a.download = file.name;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(a.href);
      a.remove();
    };

    return jsx("section", {
      class: "card",
      $: [
        jsx("h2", { class: "card_title", $: ["Экспорт"] }),
        jsx("label", {
          class: "field",
          $: [
            jsx("span", { class: "field_label", $: ["Приближение профиля"] }),
            jsx("select", {
              class: "select",
              "bind:value": outputStyle,
              $: [
                jsx("option", { value: "polyline", $: ["Прямыми"] }),
                jsx("option", { value: "bezier", $: ["Сплайнами"] }),
              ],
            }),
          ],
        }),
        jsx("div", {
          class: "actions",
          $: [
            jsx("button", {
              type: "button",
              class: "btn",
              disabled: () => (depended().error ? true : undefined),
              onclick: () => download(svgFile()),
              $: [Icon({ icon: downloadIcon }), jsx("span", { $: ["Сохранить SVG"] })],
            }),
            jsx("button", {
              type: "button",
              class: "btn",
              disabled: () => (depended().error ? true : undefined),
              onclick: () => download(dxfFile()),
              $: [Icon({ icon: downloadIcon }), jsx("span", { $: ["Сохранить DXF"] })],
            }),
          ],
        }),
      ],
    });
  };

  return { ParamsCard, Geometry, BaseProperty, AnimationCard, ExportCard };
});
