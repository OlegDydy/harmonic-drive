const __app = mod.sync(() => {
  const { jsx, $text, $switch, $derived } = __jsx();
  const { appTitle, appSubtitle } = __i18n();
  const { calcDependentProperties } = __app_harmonicDrive();
  const { getProps } = __app_store();
  const { ParamsCard, Geometry, BaseProperty, AnimationCard, ExportCard } = __app_components_panels();
  const Drawing = __app_components_drawing();
  const { Icon } = __app_components_ui();
  const { Controls } = __app_components_controls();
  const { alert, cog } = __app_components_icons();

  /** @type {FC} */
  const App = () => {
    const depended = $derived(() => calcDependentProperties(getProps()));

    return [
      jsx("aside", {
        class: "panel",
        $: [
          jsx("header", {
            class: "panel_head",
            $: [
              jsx("div", { class: "logo", $: [Icon({ icon: cog, size: 22 })] }),
              jsx("div", {
                class: "panel_head_info",
                $: [jsx("h1", { $: [$text(appTitle)] }), jsx("p", { $: [$text(appSubtitle)] })],
              }),
              Controls(),
            ],
          }),
          jsx("div", {
            class: "panel-scroll",
            $: [
              $switch([
                [
                  () => depended().error,
                  () => [
                    jsx("div", {
                      class: "error",
                      $: [Icon({ icon: alert, size: "1rem" }), jsx("span", { $: [$text(() => depended().error)] })],
                    }),
                  ],
                ],
              ]),
              ParamsCard({ depended }),
              Geometry(),
              BaseProperty({ depended }),
              AnimationCard(),
              ExportCard({ depended }),
            ],
          }),
        ],
      }),
      Drawing({ depended }),
    ];
  };

  return App;
});
