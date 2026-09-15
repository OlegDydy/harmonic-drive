const __app_components_drawing = mod(async () => {
  const { jsx, $switch, $each, $state, $derived, $effect, unwrap } = await __jsx();
  const { buildHarmonicDrive, ballPositions } = await __app_harmonicDrive();
  const { animation, getProps, props, rpm } = await __app_store();
  const { alert, cog } = await __app_components_icons();
  const { Icon } = await __app_components_ui();
  const { roundTo } = await __utils();

  /** @type {FC<{ depended: Getter<HarmonicDriveDependentProps> }, Element>} */
  const Drawing = ({ depended }) => {
    const TURN = Math.PI * 2;

    const /** @type {Accessor<SVGCircleElement[]>} */ balls = $state([]);
    const /** @type {Accessor<SVGGElement | null>} */ waveGen = $state(null);
    const /** @type {Accessor<SVGGElement | null>} */ separator = $state(null);

    const drive = $derived(() =>
      !depended().error ? buildHarmonicDrive(getProps(), { points: 32, samples: 16, steps: 50 }) : null,
    );

    $effect(() => {
      balls().length = props.zBalls();
    });

    let phiRotor = 0;
    $effect(() => {
      if (!animation()) return;

      let prevTime = 0;
      let timer = 0;
      /** @param {number} nextTime */
      const renderFrame = (nextTime) => {
        const dt = (nextTime - prevTime) / 1000;
        prevTime = nextTime;

        phiRotor = (phiRotor + TURN * ((rpm() / 60) * dt)) % TURN;

        updateMovingParts();
        timer = requestAnimationFrame(renderFrame);
      };
      timer = requestAnimationFrame(renderFrame);
      prevTime = performance.now();

      return () => {
        cancelAnimationFrame(timer);
        phiRotor = 0;
        updateMovingParts();
      };
    });

    const updateMovingParts = () => {
      const _waveGen = waveGen(),
        _separator = separator();
      if (!_waveGen || !_separator || depended().error) return;

      const { zBalls, zWaves } = getProps();
      const reductionRatio = zWaves / zBalls;
      const phi = phiRotor * reductionRatio;

      const ballsPos = ballPositions(phi, zBalls, depended());
      const _balls = balls();
      for (let i = 0; i < _balls.length; ++i) {
        const pos = ballsPos[i];
        _balls[i].setAttribute("cx", "" + pos[0]);
        _balls[i].setAttribute("cy", "" + pos[1]);
      }
      if (phiRotor === 0) {
        unwrap(_waveGen).removeAttribute("transform");
        unwrap(_separator).removeAttribute("transform");
      } else {
        unwrap(_waveGen).setAttribute("transform", `rotate(${roundTo((-phiRotor / Math.PI) * 180, 6)})`);
        unwrap(_separator).setAttribute("transform", `rotate(${roundTo((phi / Math.PI) * 180, 6)})`);
      }
    };

    return jsx("section", {
      class: "canvas",
      $: [
        jsx("header", {
          class: "panel_head",
          "aria-hidden": true,
          $: [
            jsx("div", { class: "logo", $: [Icon({ icon: cog, size: 22 })] }),
            jsx("div", {
              $: [
                jsx("h1", { $: ["Генератор волнового редуктора"] }),
                jsx("p", { $: ["с промежуточными телами качения"] }),
              ],
            }),
          ],
        }),
        jsx("div", {
          class: "canvas_body",
          $: [
            jsx("svg", {
              class: "drawing",
              "stroke-width": "1.25",
              viewBox: () => {
                const size = 2 * (props.rOuter() + props.thickness() + 1);
                return `${-size / 2} ${-size / 2} ${size} ${size}`;
              },
              $: [
                jsx("g", {
                  class: "l-hard",
                  $: [
                    jsx("path", {
                      class: "l-center",
                      "vector-effect": "non-scaling-stroke",
                      d: () => {
                        const crossHairSize = 0.1 * depended().rDisk;
                        return `M-${crossHairSize},0 0 0V-${crossHairSize}M${crossHairSize} 0 0 0V${crossHairSize}`;
                      },
                    }),
                    jsx("path", {
                      "vector-effect": "non-scaling-stroke",
                      d: () => drive()?.hardWheel ?? "",
                    }),
                  ],
                }),
                jsx("g", {
                  class: "l-sep",
                  "bind:this": separator,
                  $: [
                    jsx("path", {
                      "vector-effect": "non-scaling-stroke",
                      d: () => drive()?.separator ?? "",
                    }),
                  ],
                }),
                jsx("g", {
                  class: "l-wave",
                  "bind:this": waveGen,
                  $: [
                    jsx("path", {
                      "vector-effect": "non-scaling-stroke",
                      d: () => drive()?.waveGenerator ?? "",
                    }),
                  ],
                }),
                jsx("g", {
                  class: "l-ball",
                  $: [
                    $each(
                      () => drive()?.balls || [],
                      (ball, i) =>
                        jsx("circle", {
                          "bind:this": (v) => (balls()[i] = v),
                          "vector-effect": "non-scaling-stroke",
                          cx: ball[0],
                          cy: ball[1],
                          r: depended().rBall,
                        }),
                    ),
                  ],
                }),
              ],
            }),
            jsx("ul", {
              class: "legend",
              $: [
                jsx("li", {
                  class: "legend_item",
                  $: [jsx("span", { class: "legend_marker", style: `background: var(--c-hard)` }), "Жёсткое колесо"],
                }),
                jsx("li", {
                  class: "legend_item",
                  $: [jsx("span", { class: "legend_marker", style: `background: var(--c-sep)` }), "Сепаратор"],
                }),
                jsx("li", {
                  class: "legend_item",
                  $: [jsx("span", { class: "legend_marker", style: `background: var(--c-wave)` }), "Волнообразователь"],
                }),
                jsx("li", {
                  class: "legend_item",
                  $: [jsx("span", { class: "legend_marker", style: `background: var(--c-ball)` }), "Тела качения"],
                }),
              ],
            }),
            $switch([
              [
                () => depended().error,
                () => [
                  jsx("div", {
                    class: "canvas_error",
                    $: [
                      Icon({ icon: alert, size: 40 }),
                      jsx("strong", { $: ["Невозможно построить"] }),
                      jsx("span", {
                        $: [
                          "Редуктор с заданными параметрами геометрически не существует — проверьте геометрию и базовую характеристику.",
                        ],
                      }),
                    ],
                  }),
                ],
              ],
            ]),
          ],
        }),
      ],
    });
  };

  return Drawing;
});
