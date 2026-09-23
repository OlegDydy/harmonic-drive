const __app_exports_svg = mod.sync(() => {
  const { jsx, xmlDocument } = __jsx();
  const t = __i18n();
  const { buildHarmonicDrive, ballPositions, calcDependentProperties } = __app_harmonicDrive();

  /** @param {HarmonicDriveProps} props @param {'bezier'|'polyline'} style */
  const renderSvg = (props, unit = "mm", style = "polyline") => {
    const xml = xmlDocument("http://www.w3.org/2000/svg", "svg", (svg) => {
      const derived = calcDependentProperties(props);
      const offset = props.thickness + 1;
      const size = 2 * (props.rOuter + offset);
      const drive = buildHarmonicDrive(props, { points: 64, samples: 32, steps: style == "bezier" ? 100 : 0 });
      const balls = ballPositions(0, props.zBalls, derived);
      const { e, rBall, rDisk } = derived;
      const crossHairSize = 0.1 * rDisk;

      const description =
        "Geometry:\n\n" +
        "```json\n" +
        `${JSON.stringify(props, null, "  ")}\n` +
        "```\n" +
        "Evaluated props:\n\n" +
        "```json\n" +
        `${JSON.stringify(derived, null, "  ")}\n` +
        "```";

      jsx(svg, {
        id: "drawing",
        version: "1.1",
        baseProfile: "full",
        "xmlns:inkscape": "http://www.inkscape.org/namespaces/inkscape",
        "xmlns:rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "xmlns:cc": "http://creativecommons.org/ns#",
        "xmlns:dc": "http://purl.org/dc/elements/1.1/",
        fill: "none",
        width: `${size}${unit}`,
        height: `${size}${unit}`,
        viewBox: `${-0.5 * size} ${-0.5 * size} ${size} ${size}`,
      });

      jsx(svg, {
        $: [
          jsx("metadata", {
            id: "metadata",
            $: [
              jsx("rdf:RDF", {
                $: [
                  "cc:Work",
                  {
                    "rdf:about": "",
                    $: [jsx("dc:description", { $: [description] })],
                  },
                ],
              }),
            ],
          }),
          jsx("g", {
            id: "layer-hard_wheel",
            "inkscape:groupmode": "layer",
            "inkscape:label": t.drawWheel(),
            stroke: "#00f",
            $: [
              jsx("path", {
                id: "center",
                d: `M-${crossHairSize},0 0 0V-${crossHairSize}M${crossHairSize} 0 0 0V${crossHairSize}`,
              }),
              jsx("path", { id: "hard_wheel", d: drive.hardWheel }),
            ],
          }),
          jsx("g", {
            id: "layer-separator",
            "inkscape:groupmode": "layer",
            "inkscape:label": t.drawSpacer(),
            stroke: "#f00",
            $: [jsx("path", { id: "separator", d: drive.separator })],
          }),
          jsx("g", {
            id: "layer-wave_gen",
            "inkscape:groupmode": "layer",
            "inkscape:label": t.drawWaveGen(),
            stroke: "#f0f",
            $: [
              jsx("path", {
                id: "wave_gen",
                style: `transform-origin: 0 0`,
                // @fixme This is only true for an even number of waves and a single wave.
                // For odd variants it depends on the center of the BBox.
                "inkscape:transform-center-x": -e,
                d: drive.waveGenerator,
              }),
            ],
          }),
          jsx("g", {
            id: "layer-balls",
            "inkscape:groupmode": "layer",
            "inkscape:label": t.drawBodies(),
            stroke: "#008",
            $: balls.map((point) =>
              jsx("circle", {
                cx: point[0],
                cy: point[1],
                r: rBall,
              }),
            ),
          }),
        ],
      });
    });

    return new XMLSerializer().serializeToString(xml.children[0]);
  };

  return renderSvg;
});
