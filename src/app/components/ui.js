const __app_components_ui = mod(async () => {
  const { jsx, $switch, $text, get } = await __jsx();
  const { fmt, cn } = await __utils();

  /**
   * @template T @typedef {object} FieldProps
   * @prop {Accessor<T>} value
   * @prop {MaybeGetter<string>} [label]
   * @prop {string} [type]
   * @prop {MaybeGetter<number>} [min]
   * @prop {MaybeGetter<number>} [max]
   * @prop {MaybeGetter<number>} [step]
   * @prop {'wide'} [variant]
   */

  /** @template [T=any] @param {FieldProps<T>} props */
  const Entry = ({ value, type, label, min, max, step, variant }) =>
    jsx("label", {
      class: cn("field", variant && "_wide"),
      $: [
        $switch([[() => get(label), () => jsx("span", { class: "field_label", $: [label] })]]),
        jsx("input", {
          class: "input",
          type: type,
          "bind:value": value,
          min,
          max,
          step,
        }),
      ],
    });

  /** @type {FC<{ icon: string; thickness?: MaybeGetter<number>; size?: MaybeGetter<string | number>; }>} */
  const Icon = ({ icon, thickness = 2, size = "1em" }) =>
    jsx("svg", {
      class: "icon",
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": thickness,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      $: [jsx("path", { d: icon })],
    });

  /** @template {string} T @param {{ key: T; option: Accessor<T>; label: MaybeGetter<string>; value: Accessor<number>; readonlyValue: Getter<number>; max?: MaybeGetter<number>; min?: MaybeGetter<number>; step?: MaybeGetter<number>; }} props */
  const SwitchItem = ({ key, option, label, value, readonlyValue, min, max, step }) =>
    jsx("label", {
      class: cn("base-list_row", () => get(option) == key && "_active"),
      $: [
        jsx("input", {
          type: "radio",
          name: "baseProperty",
          class: "base-list_radio",
          value: key,
          "bind:group": option,
        }),
        jsx("span", { class: "base-list_marker" }),
        jsx("span", { class: "base-list_label", $: [$text(label)] }),
        $switch(
          [
            [
              () => get(option) == key,
              () => [
                jsx("input", {
                  type: "number",
                  class: "input base-list_input",
                  min,
                  max,
                  step,
                  "bind:value": value,
                }),
              ],
            ],
          ],
          () => [jsx("span", { class: "base-list_value", $: [$text(() => fmt(readonlyValue()))] })],
        ),
      ],
    });

  return { Entry, Icon, SwitchItem };
});
