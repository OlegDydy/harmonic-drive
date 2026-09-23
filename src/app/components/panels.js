const __app_components_panels = mod.sync(() => {
  const { jsx, $state, $derived, $effect, $text } = __jsx();
  const t = __i18n();
  const { props, getProps, animation, rpm } = __app_store();
  const { Entry, SwitchItem, Icon } = __app_components_ui();
  const { download: downloadIcon, info } = __app_components_icons();
  const { calcDependentProperties } = __app_harmonicDrive();
  const { gcd, fmt } = __utils();
  const { renderDxf, MIME: dxfMime } = __app_exports_dxf();
  const renderSvg = __app_exports_svg();

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
        jsx("h2", { class: "card_title", $: [$text(t.statsTitle)] }),
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
                jsx("div", { class: "stat_label", $: [$text(t.statsGearRatio)] }),
              ],
            }),
            jsx("div", {
              class: "stat",
              $: [
                jsx("div", { class: "stat_value", $: [$text(() => fmt(depended().zHard))] }),
                jsx("div", { class: "stat_label", $: [$text(t.statsWaves)] }),
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
        jsx("h2", { class: "card_title", $: [$text(t.geomTitle)] }),
        jsx("div", {
          class: "fields",
          $: [
            Entry({ value: props.zBalls, type: "number", label: t.geomBodies, min: 1 }),
            Entry({ value: props.zWaves, type: "number", label: t.geomWaves, min: 1 }),
            Entry({ value: props.thickness, type: "number", label: t.geomThickness, min: 0, step: 0.01 }),
            Entry({ value: props.sepOffset, type: "number", label: t.geomSpacer, min: 0, step: 0.01 }),
            Entry({
              value: props.rOuter,
              type: "number",
              label: t.geomOuterRadius,
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
        jsx("h2", { class: "card_title", $: [$text(t.baseTitle)] }),
        jsx("div", {
          class: "base-list",
          $: [
            SwitchItem({
              key: "rIn",
              option: props.baseProp,
              label: t.baseInnerRadius,
              value: props.baseValue,
              readonlyValue: () => depended().rIn,
              step: 0.01,
              max: props.rOuter,
            }),
            SwitchItem({
              key: "e",
              option: props.baseProp,
              label: t.baseEccentricity,
              value: props.baseValue,
              readonlyValue: () => depended().e,
              step: 0.01,
            }),
            SwitchItem({
              key: "rBall",
              option: props.baseProp,
              label: t.baseRadius,
              value: props.baseValue,
              readonlyValue: () => depended().rBall,
              step: 0.01,
            }),
            SwitchItem({
              key: "hSep",
              option: props.baseProp,
              label: t.baseSpacer,
              value: props.baseValue,
              readonlyValue: () => depended().hSep,
              step: 0.01,
            }),
          ],
        }),
        jsx("p", {
          class: "hint",
          $: [Icon({ icon: info, size: "1rem" }), $text(t.baseHint)],
        }),
      ],
    });
  };

  const AnimationCard = () => {
    return jsx("section", {
      class: "card",
      $: [
        jsx("h2", { class: "card_title", $: [$text(t.animTitle)] }),
        jsx("div", {
          class: "row-between",
          $: [
            jsx("span", { class: "switch_label", $: [$text(t.animToggle)] }),
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
            jsx("span", { class: "rpm_unit", $: [$text(t.animRPM)] }),
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
        jsx("h2", { class: "card_title", $: [$text(t.exportTitle)] }),
        jsx("label", {
          class: "field",
          $: [
            jsx("span", { class: "field_label", $: [$text(t.exportApprox)] }),
            jsx("select", {
              class: "select",
              "bind:value": outputStyle,
              $: [
                jsx("option", { value: "polyline", $: [$text(t.exportApproxLines)] }),
                jsx("option", { value: "bezier", $: [$text(t.exportApproxSplines)] }),
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
              $: [Icon({ icon: downloadIcon }), jsx("span", { $: [$text(t.exportSvg)] })],
            }),
            jsx("button", {
              type: "button",
              class: "btn",
              disabled: () => (depended().error ? true : undefined),
              onclick: () => download(dxfFile()),
              $: [Icon({ icon: downloadIcon }), jsx("span", { $: [$text(t.exportDxf)] })],
            }),
          ],
        }),
      ],
    });
  };

  return { ParamsCard, Geometry, BaseProperty, AnimationCard, ExportCard };
});
