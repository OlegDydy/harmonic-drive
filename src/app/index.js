const __app = mod(async () => {
  const { jsx, $switch, $state, $derived, $effect } = await __jsx();
  const { ballPositions, buildHarmonicDrive, calcDependentProperties } = await __app_harmonicDrive();
  const renderSvg = await __app_exports_svg();
  const { renderDxf, MIME: dxfMime } = await __app_exports_dxf();
  const { props } = await __app_store();
  const { gcd, roundTo, $ } = await __utils();

  const TURN = Math.PI * 2;

  // Used as effect container to "spice-up" existing elements with reactivity
  const /** @type {FC} */ App = () => {
      const outputStyle = $state(/** @type {'polyline' | 'bezier'} */ ("bezier"));

      const dependedProps = $derived(() => calcDependentProperties(getProps()));
      // const divider = $derived(() => gcd(props.zBalls(), props.zWaves()));

      /** @returns {HarmonicDriveProps} */
      const getProps = () => ({
        thickness: props.thickness(),
        zBalls: props.zBalls(),
        zWaves: props.zWaves(),
        rOuter: props.rOuter(),
        sepOffset: props.sepOffset(),
        baseProp: props.baseProp(),
        baseValue: props.baseValue(),
      });

      // UI targets
      const /** @type {HTMLElement} */ outError = $("#out_error");
      const /** @type {HTMLElement} */ outGearRatioNum = $("#out_gearRatioNum");
      const /** @type {HTMLElement} */ outGearRatioDenom = $("#out_gearRatioDenom");
      const /** @type {HTMLElement} */ outGearRatio = $("#out_gearRatio");
      const /** @type {HTMLElement} */ outRInner = $("#out_rInner");
      const /** @type {HTMLElement} */ outE = $("#out_e");
      const /** @type {HTMLElement} */ outRBall = $("#out_rBall");
      const /** @type {HTMLElement} */ outHSep = $("#out_hSep");
      const /** @type {HTMLElement} */ outZHard = $("#out_zHard");

      // SVG targets
      const /** @type {SVGPathElement} */ svgDrawing = $("#drawing");
      const /** @type {SVGPathElement} */ svgCenter = $("#center");
      const /** @type {SVGPathElement} */ svgHardWheel = $("#hard-wheel");
      const /** @type {SVGPathElement} */ svgSeparator = $("#separator");
      const /** @type {SVGPathElement} */ svgWaveGen = $("#wave-gen");
      const /** @type {SVGPathElement} */ svgBalls = $("#layer_balls");
      const /** @type {SVGCircleElement[]} */ balls = [];

      jsx(outError, {
        "data-test": () => dependedProps().error,
        $: [$switch([[() => dependedProps().error, () => [dependedProps().error]]])],
      });
      // jsx(outGearRatioNum, { $: [$text(() => props.zBalls() / divider())] });

      //#region Rendering
      const rpm = $state(60);
      let phiRotor = 0;

      const animation = $state(false);

      const updateMovingParts = () => {
        const { zBalls, zWaves } = getProps();
        const reductionRatio = zWaves / zBalls;
        const phi = phiRotor * reductionRatio;

        const ballsPos = ballPositions(phi, zBalls, dependedProps());
        for (let i = 0; i < balls.length; ++i) {
          const ball = balls[i];
          const pos = ballsPos[i];
          jsx(ball, { cx: "" + pos[0], cy: "" + pos[1] });
        }
        if (phiRotor === 0) {
          svgWaveGen.removeAttribute("transform");
          svgSeparator.removeAttribute("transform");
        } else {
          jsx(svgWaveGen, { transform: `rotate(${roundTo((-phiRotor / Math.PI) * 180, 6)})` });
          jsx(svgSeparator, { transform: `rotate(${roundTo((phi / Math.PI) * 180, 6)})` });
        }
      };

      $effect(() => {
        if (!animation()) return;

        let prevTime = 0;
        /** @param {number} nextTime */
        const render = (nextTime) => {
          const dt = (nextTime - prevTime) / 1000;
          prevTime = nextTime;

          phiRotor = (phiRotor + TURN * ((rpm() / 60) * dt)) % TURN;

          updateMovingParts();
          timer = requestAnimationFrame(render);
        };
        let timer = requestAnimationFrame(render);
        prevTime = performance.now();

        return () => {
          cancelAnimationFrame(timer);
          phiRotor = 0;
          updateMovingParts();
        };
      });

      $effect(() => {
        const props = getProps();
        const { zBalls, zWaves, thickness, rOuter } = props;
        const { rIn, e, rBall, hSep, rDisk, zHard, error } = dependedProps();
        const crossHairSize = 0.1 * rDisk;

        const common = gcd(zBalls, zWaves);
        outGearRatioNum.innerText = (zBalls / common).toString();
        outGearRatioDenom.innerText = (zWaves / common).toString();
        outGearRatio.innerText = "" + roundTo(zBalls / zWaves, 6);
        outRInner.innerText = "" + roundTo(rIn, 6);
        outE.innerText = "" + roundTo(e, 6);
        outRBall.innerText = "" + roundTo(rBall, 6);
        outHSep.innerText = "" + roundTo(hSep, 6);
        outZHard.innerText = "" + zHard;

        const offset = thickness + 1;
        const size = 2 * (rOuter + offset);
        if (!error) {
          // outError.innerHTML = "";
          const drive = buildHarmonicDrive(props, { points: 64, samples: 32, steps: 50 });

          jsx(svgDrawing, {
            viewBox: `-${rOuter + offset} -${rOuter + offset} ${size} ${size}`,
            width: `${size}px`,
            height: `${size}px`,
          });
          jsx(svgCenter, { d: `M-${crossHairSize},0 0 0V-${crossHairSize}M${crossHairSize} 0 0 0V${crossHairSize}` });
          jsx(svgHardWheel, { d: drive.hardWheel });
          jsx(svgSeparator, { d: drive.separator });
          jsx(svgWaveGen, { d: drive.waveGenerator });

          if (zBalls < balls.length) {
            for (let i = zBalls; i < balls.length; ++i) {
              balls[i].remove();
            }
          }
          balls.length = zBalls;
          for (let i = 0; i < zBalls; ++i) {
            const ballPos = drive.balls[i];
            let ball = balls[i];
            if (!ball) {
              ball = jsx("circle", { "vector-effect": "non-scaling-stroke" });
              balls[i] = ball;
              svgBalls.appendChild(ball);
            }
            jsx(ball, {
              cx: ballPos[0].toString(),
              cy: ballPos[1].toString(),
              r: rBall.toString(),
            });
          }

          svgBalls.style.removeProperty("display");
          updateMovingParts();
        } else {
          // outError.innerText = error;
          jsx(svgHardWheel, { d: "" });
          jsx(svgSeparator, { d: "" });
          jsx(svgWaveGen, { d: "" });
          svgBalls.style.display = "none";
        }
      });
      //#endregion

      //#region Inputs
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

      jsx($("button#save-svg"), { onclick: () => download(svgFile()) });
      jsx($("button#save-dxf"), { onclick: () => download(dxfFile()) });

      for (const selector of Array.from(document.querySelectorAll('input[name="baseProperty"]'))) {
        jsx(selector, { "bind:group": props.baseProp });
      }
      jsx($("#in_animation"), { "bind:value": animation });
      jsx($("#in_rpm"), { "bind:value": rpm });
      jsx($("#in_outputStyle"), { "bind:value": outputStyle });
      jsx($("#in_zBalls"), { "bind:value": props.zBalls });
      jsx($("#in_zWaves"), { "bind:value": props.zWaves });
      jsx($("#in_thickness"), { "bind:value": props.thickness });
      jsx($("#in_sepOffset"), { "bind:value": props.sepOffset });
      jsx($("#in_rOuter"), { "bind:value": props.rOuter });

      jsx($("#in_rBall"), { "bind:value": props.baseValue });
      jsx($("#in_rInner"), { "bind:value": props.baseValue });
      jsx($("#in_e"), { "bind:value": props.baseValue });
      jsx($("#in_hSep"), { "bind:value": props.baseValue });

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

      jsx($("#in_rInner"), { max: props.rOuter });
      //#endregion

      return "";
    };

  return App;
});
