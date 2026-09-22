const __app = mod(async () => {
  const { jsx, $text, $switch, $derived } = await __jsx();
  const { appTitle, appSubtitle } = __i18n();
  const { calcDependentProperties } = await __app_harmonicDrive();
  const { getProps } = await __app_store();
  const { ParamsCard, Geometry, BaseProperty, AnimationCard, ExportCard } = await __app_components_panels();
  const Drawing = await __app_components_drawing();
  const { Icon } = await __app_components_ui();
  const { alert, cog } = await __app_components_icons();

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
                $: [jsx("h1", { $: [$text(appTitle)] }), jsx("p", { $: [$text(appSubtitle)] })],
              }),
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
