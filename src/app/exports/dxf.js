/**
 * @typedef {{ type: 'circle'; cx: number; cy: number; r: number }} PartCircle
 * @typedef {{ type: 'polyline'; points: Vec2Like[]; closed: boolean }} PartPolyline
 * @typedef {{ type: 'spline'; points: Vec2Like[]; closed: boolean }} PartSpline
 * @typedef {{ type: 'arc'; c: Vec2Like; r: number; start: number; end: number; }} PartArc
 * @typedef {PartCircle | PartPolyline | PartSpline | PartArc} Part
 */
const __app_exports_dxf = mod.sync(() => {
  const t = __i18n();
  const { Vec2 } = __utils_glMatrix();
  const { buildHarmonicDrive, calcDependentProperties } = __app_harmonicDrive();

  const { atan2, abs, sqrt, max } = Math;

  /**
   * @typedef {[ x: number, y: number, z: number ]} Vec3Like;
   * @typedef {object} Layer
   * @prop {string} name
   * @prop {string} color format: `#hhhhhh`
   * @prop {Part[]} parts
   */

  const MIME = "application/dxf";
  const Rad2Deg = 180 / Math.PI;

  /** @param {string} hex @return {Vec3Like} */
  function hexToRgb(hex) {
    const m = /^#?([0-9a-fA-F]{6})$/i.exec(hex.trim());
    if (!m) throw new Error(`Некорректный цвет: "${hex}", ожидался #hhhhhh`);
    const v = parseInt(m[1], 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }

  // prettier-ignore
  const ACI = new Map(Object.entries({
    "000000": 0,   "FF0000": 1,   "FFFF00": 2,   "00FF00": 3,   "00FFFF": 4,   "0000FF": 5,   "FF00FF": 6,
    "FFFFFF": 7,   "414141": 8,   "808080": 9,   "FFAAAA": 11,  "BD0000": 12,  "BD7E7E": 13,  "810000": 14,
    "815656": 15,  "680000": 16,  "684545": 17,  "4F0000": 18,  "4F3535": 19,  "FF3F00": 20,  "FFBFAA": 21,
    "BD2E00": 22,  "BD8D7E": 23,  "811F00": 24,  "816056": 25,  "681900": 26,  "684E45": 27,  "4F1300": 28,
    "4F3B35": 29,  "FF7F00": 30,  "FFD4AA": 31,  "BD5E00": 32,  "BD9D7E": 33,  "814000": 34,  "816B56": 35,
    "683400": 36,  "685645": 37,  "4F2700": 38,  "4F4235": 39,  "FFBF00": 40,  "FFEAAA": 41,  "BD8D00": 42,
    "BDAD7E": 43,  "816000": 44,  "817656": 45,  "684E00": 46,  "685F45": 47,  "4F3B00": 48,  "4F4935": 49,
    "FFFFAA": 51,  "BDBD00": 52,  "BDBD7E": 53,  "818100": 54,  "818156": 55,  "686800": 56,  "686845": 57,
    "4F4F00": 58,  "4F4F35": 59,  "BFFF00": 60,  "EAFFAA": 61,  "8DBD00": 62,  "ADBD7E": 63,  "608100": 64,
    "768156": 65,  "4E6800": 66,  "5F6845": 67,  "3B4F00": 68,  "494F35": 69,  "7FFF00": 70,  "D4FFAA": 71,
    "5EBD00": 72,  "9DBD7E": 73,  "408100": 74,  "6B8156": 75,  "346800": 76,  "566845": 77,  "274F00": 78,
    "424F35": 79,  "3FFF00": 80,  "BFFFAA": 81,  "2EBD00": 82,  "8DBD7E": 83,  "1F8100": 84,  "608156": 85,
    "196800": 86,  "4E6845": 87,  "134F00": 88,  "3B4F35": 89,  "AAFFAA": 91,  "00BD00": 92,  "7EBD7E": 93,
    "008100": 94,  "568156": 95,  "006800": 96,  "456845": 97,  "004F00": 98,  "354F35": 99,  "00FF3F": 100,
    "AAFFBF": 101, "00BD2E": 102, "7EBD8D": 103, "00811F": 104, "568160": 105, "006819": 106, "45684E": 107,
    "004F13": 108, "354F3B": 109, "00FF7F": 110, "AAFFD4": 111, "00BD5E": 112, "7EBD9D": 113, "008140": 114,
    "56816B": 115, "006834": 116, "456856": 117, "004F27": 118, "354F42": 119, "00FFBF": 120, "AAFFEA": 121,
    "00BD8D": 122, "7EBDAD": 123, "008160": 124, "568176": 125, "00684E": 126, "45685F": 127, "004F3B": 128,
    "354F49": 129, "AAFFFF": 131, "00BDBD": 132, "7EBDBD": 133, "008181": 134, "568181": 135, "006868": 136,
    "456868": 137, "004F4F": 138, "354F4F": 139, "00BFFF": 140, "AAEAFF": 141, "008DBD": 142, "7EADBD": 143,
    "006081": 144, "567681": 145, "004E68": 146, "455F68": 147, "003B4F": 148, "35494F": 149, "007FFF": 150,
    "AAD4FF": 151, "005EBD": 152, "7E9DBD": 153, "004081": 154, "566B81": 155, "003468": 156, "455668": 157,
    "00274F": 158, "35424F": 159, "003FFF": 160, "AABFFF": 161, "002EBD": 162, "7E8DBD": 163, "001F81": 164,
    "566081": 165, "001968": 166, "454E68": 167, "00134F": 168, "353B4F": 169, "AAAAFF": 171, "0000BD": 172,
    "7E7EBD": 173, "000081": 174, "565681": 175, "000068": 176, "454568": 177, "00004F": 178, "35354F": 179,
    "3F00FF": 180, "BFAAFF": 181, "2E00BD": 182, "8D7EBD": 183, "1F0081": 184, "605681": 185, "190068": 186,
    "4E4568": 187, "13004F": 188, "3B354F": 189, "7F00FF": 190, "D4AAFF": 191, "5E00BD": 192, "9D7EBD": 193,
    "400081": 194, "6B5681": 195, "340068": 196, "564568": 197, "27004F": 198, "42354F": 199, "BF00FF": 200,
    "EAAAFF": 201, "8D00BD": 202, "AD7EBD": 203, "600081": 204, "765681": 205, "4E0068": 206, "5F4568": 207,
    "3B004F": 208, "49354F": 209, "FFAAFF": 211, "BD00BD": 212, "BD7EBD": 213, "810081": 214, "815681": 215,
    "680068": 216, "684568": 217, "4F004F": 218, "4F354F": 219, "FF00BF": 220, "FFAAEA": 221, "BD008D": 222,
    "BD7EAD": 223, "810060": 224, "815676": 225, "68004E": 226, "68455F": 227, "4F003B": 228, "4F3549": 229,
    "FF007F": 230, "FFAAD4": 231, "BD005E": 232, "BD7E9D": 233, "810040": 234, "81566B": 235, "680034": 236,
    "684556": 237, "4F0027": 238, "4F3542": 239, "FF003F": 240, "FFAABF": 241, "BD002E": 242, "BD7E8D": 243,
    "81001F": 244, "815660": 245, "680019": 246, "68454E": 247, "4F0013": 248, "4F353B": 249, "333333": 250,
    "505050": 251, "696969": 252, "828282": 253, "BEBEBE": 254,
  }).map(([color, id]) => [hexToRgb(color), id]));

  /** @param {string} hex @returns {number} */
  const toAci = (hex) => {
    const [r, g, b] = hexToRgb(hex);
    let best = 7,
      bestDist = Infinity;

    for (const [[cr, cg, cb], idx] of ACI) {
      const d = Math.hypot(r - cr, g - cg, b - cb);
      if (d < bestDist) {
        best = idx;
        bestDist = d;
      }
    }
    return best;
  };

  /** Сборка пар «кода группы / значения». */
  class Dxf {
    /** @param {boolean} flipY */
    constructor(flipY = false) {
      this.flipY = flipY;
    }
    /** @type {string[]} */ #lines = [];
    /** @param {number} code @param {string | number} value */
    g(code, value) {
      if (code == 20 && this.flipY) value = -value;
      if (code == 10 || code == 20) value = Math.round(+value * 1.0e6) * 1.0e-6;
      this.#lines.push(String(code), fmt(value));
      return this;
    }

    /** @param {string} name @param {(w: this) => void} cb */
    section(name, cb) {
      cb(this.g(0, "SECTION").g(2, name));
      this.g(0, "ENDSEC");
    }

    /** @param {string} name @param {(w: this) => void} cb */
    table(name, cb) {
      cb(this.g(0, "TABLE").g(2, name));
      this.g(0, "ENDTAB");
    }

    toString() {
      return this.#lines.join("\r\n") + "\r\n";
    }
  }

  /** @param {string | number} value */
  const fmt = (value) => {
    if (typeof value === "string") return value;
    if (!Number.isFinite(value)) throw new Error(`Incorrect value: ${value}`);
    return String(value === 0 ? 0 : value);
  };

  /** @param {Vec2Like} a @param {Vec2Like} b */
  const samePoint = (a, b) => a === b || (a[0] === b[0] && a[1] === b[1]);

  /** @param {Dxf} w @param {string} layer @param {Extract<Part, { type: 'circle' }>} p  */
  const circle = (w, layer, p) => {
    if (!(p.r > 0)) return; // вырожденный круг — пропускаем
    w.g(0, "CIRCLE").g(8, layer).g(10, p.cx).g(20, p.cy).g(40, p.r);
  };

  /** @param {Dxf} w @param {string} layer @param {Extract<Part, { type: 'polyline' }>} p  */
  const lwPolyline = (w, layer, p) => {
    let pts = p.points;
    // если закрывающая точка дублирует первую — убираем дубль
    if (p.closed && pts.length > 1 && samePoint(pts[0], pts[pts.length - 1])) {
      pts = pts.slice(0, -1);
    }
    if (pts.length < 2) return;
    w.g(0, "LWPOLYLINE")
      .g(8, layer)
      .g(90, pts.length)
      .g(70, p.closed ? 1 : 0);
    for (const pt of pts) {
      w.g(10, pt[0]).g(20, pt[1]);
    }
  };

  /** @param {Dxf} dxf @param {string} layer @param {Extract<Part, { type: 'polyline' }>} p  */
  const polyline = (dxf, layer, p) => {
    let pts = p.points;
    if (pts.length < 2) return;
    if (p.closed && samePoint(pts[0], pts[pts.length - 1])) {
      pts = pts.slice(0, -1); // замыкающий отрезок нарисует флаг closed
    }
    dxf
      .g(0, "POLYLINE")
      .g(8, layer)
      .g(70, p.closed ? 1 : 0) // бит 0 — замкнутая
      .g(66, 0); // 2D-вершины, z = 0
    for (const p of pts) {
      dxf.g(0, "VERTEX").g(10, p[0]).g(20, p[1]);
    }
    dxf.g(0, "SEQEND");
  };

  /** @param {Dxf} w @param {string} layer @param {Extract<Part, { type: 'spline' }>} p  */
  const spline = (w, layer, p) => {
    let pts = p.points;
    // цепочка из n кубических сегментов ⇒ 3n+1 точка
    if (pts.length > 0 && (pts.length - 1) % 3 !== 0) {
      throw new Error(`Spline: ожидается 3n+1 точка, получено ${pts.length}`);
    }
    if (pts.length < 4) return; // n = 0 — рисовать нечего
    if (p.closed && !samePoint(pts[0], pts[pts.length - 1])) {
      const last = pts[pts.length - 1];
      pts = [...pts, last, last, pts[0]];
    }
    const n = (pts.length - 1) / 3;

    // Для замкнутых кривых договорённость парсера: последняя точка
    // совпадает с первой; B-сплайн замыкается автоматически, flag не нужен.
    w.g(0, "SPLINE")
      .g(8, layer)
      .g(70, 8) // флаги сущности
      .g(71, 3) // степень
      .g(72, (n + 1) * 3 + 2) // кол-во узлов
      .g(73, pts.length) // кол-во контрольных точек
      .g(74, 0); // без fit-данных
    for (const pt of pts) {
      w.g(10, pt[0]).g(20, pt[1]);
    }

    // Вектор узлов: [0,0,0,0, 1,1,1, 2,2,2, ..., (n-1),(n-1),(n-1), n,n,n,n].
    // Тройные узлы на границах сегментов ⇒ цепочка кубических Безье
    // воспроизводится ТОЧНО; без узлов читатель предположит равномерный
    // B-сплайн и «сгладит» кривую, не проходящую через опорные точки.
    w.g(40, 0);
    for (let i = 0; i <= n; i++) {
      w.g(40, i).g(40, i).g(40, i);
    }
    w.g(40, n);
  };

  /** @param {Dxf} w @param {string} layer @param {Extract<Part, { type: 'arc' }>} p  */
  const arc = (w, layer, p) => {
    if (!(p.r > 0)) return; // вырожденный круг — пропускаем
    w.g(0, "ARC").g(8, layer).g(10, p.c[0]).g(20, p.c[1]).g(40, p.r).g(50, p.start).g(51, p.end);
  };

  /** Some units for drawings */
  const DXFUnitMap = {
    none: 0,
    in: 1,
    ft: 2,
    mm: 4,
    cm: 5,
    m: 6,
  };

  /** @param {Layer[]} layers @param {keyof typeof DXFUnitMap} unit @returns {string} */
  const exportDxf = (layers, unit = "mm") => {
    const w = new Dxf();

    // Проверки
    const /** @type {Set<string>} */ seen = new Set();
    for (const l of layers) {
      if (typeof l.name !== "string" || l.name === "") {
        throw new Error("Layer name can not be empty");
      }
      if (seen.has(l.name)) throw new Error(`Layer duplication: "${l.name}"`);
      seen.add(l.name);
      toAci(l.color); // валидация цвета сразу
    }

    // HEADER
    w.section("HEADER", (w) =>
      w
        .g(9, "$ACADVER")
        .g(1, "AC1015")
        .g(9, "$INSUNITS")
        .g(70, DXFUnitMap[unit] || DXFUnitMap.none),
    );

    // TABLES: слои + минимальный viewport
    w.section("TABLES", (w) => {
      w.table("LAYER", (w) => {
        w.g(70, layers.length);
        for (const l of layers) {
          w.g(0, "LAYER").g(2, l.name).g(70, 0).g(62, toAci(l.color)).g(6, "Continuous");
        }
      });
      w.table("VPORT", (w) => {
        w.g(70, 1);
        w.g(0, "VPORT")
          .g(2, "*Active")
          .g(70, 0)
          .g(10, 0) // lower-left
          .g(20, 0) // lower-left
          .g(11, 1) // upper-right
          .g(21, 1); // upper-right
      });
    });

    // BLOCKS
    w.section("BLOCKS", () => {
      for (const name of ["*Model_Space", "*Paper_Space"]) {
        w.g(0, "BLOCK")
          .g(8, "0")
          .g(2, name)
          .g(70, 0)
          .g(10, 0) // base point
          .g(20, 0) // base point
          .g(30, 0) // base point
          .g(11, 0)
          .g(21, 0)
          .g(31, 0)
          .g(0, "ENDBLK");
      }
    });

    // ENTITIES
    w.section("ENTITIES", () => {
      for (const l of layers) {
        for (const p of l.parts) {
          if (p.type === "circle") circle(w, l.name, p);
          else if (p.type === "polyline") lwPolyline(w, l.name, p);
          else if (p.type === "arc") arc(w, l.name, p);
          else spline(w, l.name, p);
        }
      }
    });

    w.g(0, "EOF");
    return w.toString();
  };

  /** @param {string} path @returns {Part[]} */
  const parsePath = (path) => {
    const lexer = /([MmAaCcLlZz])|([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)/g;
    const bit = /[01]/g;
    let last = 0;
    const /** @type {Vec2Like} */ cursor = [0, 0];
    const /** @type {Vec2Like} */ start = [0, 0];
    /** @param {RegExp} matcher */
    const read = (matcher) => {
      matcher.lastIndex = last;
      const result = matcher.exec(path);
      last = result ? matcher.lastIndex : path.length;
      return result;
    };

    /** @type {Part[]} */
    const result = [];
    let /** @type {Part | null} */ lastPart = null;

    const ensurePoly = () => {
      if (lastPart?.type !== "polyline") {
        lastPart = { type: "polyline", points: [Vec2.copy([0, 0], cursor)], closed: false };
        result.push(lastPart);
      }
      return lastPart;
    };

    const ensureSpline = () => {
      if (lastPart?.type !== "spline") {
        lastPart = { type: "spline", points: [Vec2.copy([0, 0], cursor)], closed: false };
        result.push(lastPart);
      }
      return lastPart;
    };

    /** @param {Readonly<Vec2Like>} to */
    const ensureArc = (r, largeArc, cw, to) => {
      const halfDist = 0.5 * Vec2.dist(cursor, to);
      r = max(r, halfDist);
      const c = Vec2.lerp([0, 0], cursor, to, 0.5);
      const norm = Vec2.sub([0, 0], to, c);
      Vec2.set(norm, -norm[1], norm[0]);
      if (largeArc == cw) Vec2.neg(norm, norm);

      const h = sqrt(max(0, r * r - halfDist * halfDist));
      Vec2.scaleAndAdd(c, c, norm, h / halfDist);

      Vec2.sub(norm, cursor, c);
      let start = atan2(norm[1], norm[0]) * Rad2Deg;

      Vec2.sub(norm, to, c);
      let end = atan2(norm[1], norm[0]) * Rad2Deg;

      if (!cw && end < start) {
        if (abs(abs(end - start) - 180) < 1e-6) end = start + 180;
        else [start, end] = [end, start];
      }

      lastPart = { type: "arc", c, r, start, end };
      result.push(lastPart);
      return to;
    };

    /** @param {string} [x] @returns {Vec2Like} */
    const readPoint = (x) => {
      if (!x) {
        x = read(lexer)?.[2];
        if (!x) throw new Error("coord x");
      }
      const y = read(lexer)?.[2];
      if (!y) throw new Error("coord y");

      return [+x, +y];
    };

    let mode = "M";
    while (last < path.length) {
      const m = read(lexer);
      if (!m) break;

      if (m[1]) {
        mode = m[1];
        if (
          (mode == "Z" || mode == "z") &&
          (Math.abs(start[0] - cursor[0]) > 1.0e-6 || Math.abs(start[1] - cursor[1]) > 1.0e-6)
        ) {
          lastPart = ensurePoly();
          Vec2.copy(cursor, start);
          lastPart.points.push(Vec2.copy([0, 0], cursor));
          lastPart = null;
        }
      } else {
        switch (mode) {
          case "M":
            mode = "L";
            lastPart = null;
            Vec2.copy(cursor, readPoint(m[2]));
            Vec2.copy(start, cursor);
            break;
          case "m":
            mode = "l";
            lastPart = null;
            Vec2.add(cursor, cursor, readPoint(m[2]));
            Vec2.copy(start, cursor);
            break;
          case "L":
            lastPart = ensurePoly();
            Vec2.copy(cursor, readPoint(m[2]));
            lastPart.points.push(Vec2.copy([0, 0], cursor));
            break;
          case "l":
            lastPart = ensurePoly();
            Vec2.add(cursor, cursor, readPoint(m[2]));
            lastPart.points.push(Vec2.copy([0, 0], cursor));
            break;
          case "C":
            lastPart = ensureSpline();
            lastPart.points.push(readPoint(m[2]));
            lastPart.points.push(readPoint());
            Vec2.copy(cursor, readPoint());
            lastPart.points.push(Vec2.copy([0, 0], cursor));
            break;
          case "c":
            lastPart = ensureSpline();
            lastPart.points.push(Vec2.add([0, 0], cursor, readPoint(m[2])));
            lastPart.points.push(Vec2.add([0, 0], cursor, readPoint()));
            Vec2.add(cursor, cursor, readPoint());
            lastPart.points.push(Vec2.copy([0, 0], cursor));
            break;
          case "a":
            readPoint(); // ry + rotation
            Vec2.copy(
              cursor,
              ensureArc(+m[2], read(bit)?.[0] == "1", read(bit)?.[0] == "1", Vec2.add([0, 0], cursor, readPoint())),
            );
            break;
          case "A":
            readPoint(); // ry + rotation
            Vec2.copy(
              cursor,
              ensureArc(+m[2], read(bit)?.[0] == "1", read(bit)?.[0] == "1", Vec2.copy([0, 0], readPoint())),
            );
            break;
        }
      }
    }

    return result;
  };

  /** @param {HarmonicDriveProps} props @param {keyof typeof DXFUnitMap} unit @param {"bezier" | "polyline"} style */
  const renderDxf = (props, unit = "mm", style = "polyline") => {
    const derived = calcDependentProperties(props);
    const drive = buildHarmonicDrive(props, { points: 128, samples: 64, steps: style == "bezier" ? 50 : 0 });

    return exportDxf(
      [
        {
          name: t.drawWheel(),
          color: "#0000ff",
          parts: parsePath(drive.hardWheel),
        },
        {
          name: t.drawSpacer(),
          color: "#ff0000",
          parts: parsePath(drive.separator),
        },
        {
          name: t.drawWaveGen(),
          color: "#ff00ff",
          parts: parsePath(drive.waveGenerator),
        },
        {
          name: t.drawBodies(),
          color: "#000080",
          parts: drive.balls.map(([cx, cy]) => ({ type: "circle", cx, cy, r: derived.rBall })),
        },
      ],
      unit,
    );
  };

  return { renderDxf, exportDxf, MIME };
});
