//@ts-check

/** @template T @param {() => T} ctx @returns {() => T} */
function mod(ctx) {
  /** @type {T} */ let module;
  let initialized = false;
  return () => {
    if (!initialized) {
      module = ctx();
      initialized = true;
    }
    return module;
  };
}

/** @typedef {[x: number, y: number]} Vec2Like */
/** @typedef {[a: number, b: number, c: number, d: number, tx: number, ty: number]} Mat2dLike */
const __glMatrix = mod(() => {
  const Vec2 = {
    /** @param {number} x @param {number} y @returns {Vec2Like} */
    create: (x = 0, y = 0) => {
      return [x, y];
    },
    /** @param {Vec2Like} result @param {number} x @param {number} y */
    set: (result, x, y) => {
      result[0] = x;
      result[1] = y;
      return result;
    },
    /** @param {Vec2Like} dest @param {Readonly<Vec2Like>} src */
    copy: (dest, src) => {
      dest[0] = src[0];
      dest[1] = src[1];
      return dest;
    },
    /** @param {Vec2Like} result @param {Readonly<Vec2Like>} a */
    negate: (result, a) => {
      result[0] = -a[0];
      result[1] = -a[1];
      return result;
    },
    /** @param {Vec2Like} result @param {Readonly<Vec2Like>} a @param {Readonly<Vec2Like>} b */
    add: (result, a, b) => {
      result[0] = a[0] + b[0];
      result[1] = a[1] + b[1];
      return result;
    },
    /** @param {Vec2Like} result @param {Readonly<Vec2Like>} a @param {Readonly<Vec2Like>} b */
    sub: (result, a, b) => {
      result[0] = a[0] - b[0];
      result[1] = a[1] - b[1];
      return result;
    },
    /** @param {Vec2Like} result @param {Readonly<Vec2Like>} a @param {Readonly<Vec2Like>} b */
    mul: (result, a, b) => {
      result[0] = a[0] * b[0];
      result[1] = a[1] * b[1];
      return result;
    },
    /** @param {Vec2Like} result @param {Readonly<Vec2Like>} a @param {Readonly<Vec2Like>} b */
    div: (result, a, b) => {
      result[0] = a[0] / b[0];
      result[1] = a[1] / b[1];
      return result;
    },
    /** @param {Vec2Like} result @param {Readonly<Vec2Like>} a @param {number} factor */
    scale: (result, a, factor) => {
      result[0] = a[0] * factor;
      result[1] = a[1] * factor;
      return result;
    },
    /** @param {Vec2Like} result @param {Readonly<Vec2Like>} a @param {Readonly<Vec2Like>} b @param {number} factor */
    scaleAndAdd: (result, a, b, factor) => {
      result[0] = a[0] + b[0] * factor;
      result[1] = a[1] + b[1] * factor;
      return result;
    },
    /** @param {Readonly<Vec2Like>} a @param {Readonly<Vec2Like>} b */
    dot: (a, b) => {
      return a[0] * b[0] + a[1] * b[1];
    },
    /** @param {Readonly<Vec2Like>} a */
    squaredLength: (a) => {
      return a[0] * a[0] + a[1] * a[1];
    },
    /** @param {Readonly<Vec2Like>} a */
    mag: (a) => {
      return Math.hypot(a[0], a[1]);
    },
    /** @param {Readonly<Vec2Like>} a @param {Readonly<Vec2Like>} b */
    squaredDistance: (a, b) => {
      const dx = a[0] - b[0],
        dy = a[1] - b[1];
      return dx * dx + dy * dy;
    },
    /** @param {Readonly<Vec2Like>} a @param {Readonly<Vec2Like>} b */
    distance: (a, b) => {
      return Math.hypot(a[0] - b[0], a[1] - b[1]);
    },
    /** @param {Vec2Like} result @param {Readonly<Vec2Like>} a */
    normalize: (result, a) => {
      let factor = Math.hypot(a[0], a[1]);
      if (factor <= 0) {
        result[1] = result[0] = 0;
        return result;
      }

      result[0] = a[0] / factor;
      result[1] = a[1] / factor;
      return result;
    },
    /** @param {Vec2Like} result @param {Readonly<Vec2Like>} from @param {Readonly<Vec2Like>} to @param {number} t */
    lerp: (result, from, to, t) => {
      result[0] = from[0] + (to[0] - from[0]) * t;
      result[1] = from[1] + (to[1] - from[1]) * t;
      return result;
    },
    /** @param {Vec2Like} result @param {Readonly<Vec2Like>} a @param {Readonly<Mat2dLike>} m */
    transformMat2d: (result, a, m) => {
      const x = a[0];
      const y = a[1];
      result[0] = m[0] * x + m[2] * y + m[4];
      result[1] = m[1] * x + m[3] * y + m[5];
      return result;
    },
  };

  const Mat2d = {
    /** @param {Mat2dLike} result @param {Mat2dLike} values */
    set: (result, ...values) => {
      result[0] = values[0];
      result[1] = values[1];
      result[2] = values[2];
      result[3] = values[3];
      result[4] = values[4];
      result[5] = values[5];
      return result;
    },
    /** @param {Mat2dLike} result @param {Readonly<Mat2dLike>} a */
    copy: (result, a) => {
      result[0] = a[0];
      result[1] = a[1];
      result[2] = a[2];
      result[3] = a[3];
      result[4] = a[4];
      result[5] = a[5];
      return result;
    },
    /** @param {Mat2dLike} result */
    identity: (result) => {
      result[0] = 1;
      result[1] = 0;
      result[2] = 0;
      result[3] = 1;
      result[4] = 0;
      result[5] = 0;
      return result;
    },
    /** @param {Mat2dLike} result @param {Readonly<Mat2dLike>} a @param {Readonly<Mat2dLike>} b */
    add: (result, a, b) => {
      result[0] = a[0] + b[0];
      result[1] = a[1] + b[1];
      result[2] = a[2] + b[2];
      result[3] = a[3] + b[3];
      result[4] = a[4] + b[4];
      result[5] = a[5] + b[5];
      return result;
    },
    /** @param {Mat2dLike} result @param {Readonly<Mat2dLike>} a @param {Readonly<Mat2dLike>} b */
    sub: (result, a, b) => {
      result[0] = a[0] - b[0];
      result[1] = a[1] - b[1];
      result[2] = a[2] - b[2];
      result[3] = a[3] - b[3];
      result[4] = a[4] - b[4];
      result[5] = a[5] - b[5];
      return result;
    },
    /** @param {Mat2dLike} result @param {Readonly<Mat2dLike>} a @param {Readonly<Mat2dLike>} b */
    mul: (result, a, b) => {
      const [a11, a12, a21, a22, tx1, ty1] = a,
        [b11, b12, b21, b22, tx2, ty2] = b;
      result[0] = a11 * b11 + a21 * b12;
      result[1] = a12 * b11 + a22 * b12;
      result[2] = a11 * b21 + a21 * b22;
      result[3] = a12 * b21 + a22 * b22;
      result[4] = a11 * tx2 + a21 * ty2 + tx1;
      result[5] = a12 * tx2 + a22 * ty2 + ty1;
      return result;
    },
    /** @param {Mat2dLike} result @param {Vec2Like} t */
    fromTranslation: (result, t) => {
      // prettier-ignore
      return Mat2d.set(result,
				1, 0,
				0, 1,
				t[0], t[1]
			);
    },
    /** @param {Mat2dLike} result @param {number} rad */
    fromRotation: (result, rad) => {
      const s = Math.sin(rad);
      const c = Math.cos(rad);
      // prettier-ignore
      return Mat2d.set(result,
				c, s,
				-s, c,
				0, 0
			);
    },
    /** @param {Mat2dLike} result @param {Vec2Like} skew */
    fromSkew: (result, skew) => {
      // prettier-ignore
      return Mat2d.set(result,
				Math.cos(skew[0]), Math.sin(skew[1]),
				-Math.sin(skew[0]), Math.cos(skew[1]),
				0, 0
			);
    },
    /** @param {Mat2dLike} result @param {Vec2Like} s */
    fromScale: (result, s) => {
      // prettier-ignore
      return Mat2d.set(result,
				s[0], 0,
				0, s[1],
				0, 0
			);
    },
  };

  return { Vec2, Mat2d };
});

/** @typedef {[Vec2Like, Vec2Like, Vec2Like, Vec2Like]} Bezier */
/**
 * @typedef {object} AdjustProps
 * @prop {number} [adjustSteps=16] How many steps do to make curve as precise (300 gives a good accuracy for final rendering)
 * @prop {number} [samplingPoints=16] How many points to use to sample the curve fitting error
 * @prop {Vec2Like} [tangent1] Constraint of first handle
 * @prop {Vec2Like} [tangent2] Constraint of second handle
 */
const __approxBezier = mod(() => {
  const { Vec2 } = __glMatrix();

  /**
   * Cubic Bezier curve sampler on range
   *
   * @param {Readonly<Vec2Like>} p0 First point
   * @param {Readonly<Vec2Like>} p1 First control point
   * @param {Readonly<Vec2Like>} p2 Last control point
   * @param {Readonly<Vec2Like>} p3 Last point
   * @param {number} t Sampling point
   * @returns {Vec2Like} Resulting range iterator
   */
  const bezier = (p0, p1, p2, p3, t) => {
    const a0 = Vec2.lerp([0, 0], p0, p1, t);
    const a1 = Vec2.lerp([0, 0], p1, p2, t);
    const a2 = Vec2.lerp([0, 0], p2, p3, t);

    return Vec2.lerp(a0, Vec2.lerp(a0, a0, a1, t), Vec2.lerp(a1, a1, a2, t), t);
  };

  /** @param {number} a @param {number} b @param {number} t */
  const lerp = (a, b, t) => {
    return a + (b - a) * t;
  };

  /** @param {number} value @param {number} min @param {number} max */
  const clamp = (value, min, max) => {
    return value < min ? min : value > max ? max : value;
  };

  /** @typedef {{ readonly origin: Vec2Like, readonly prev: Line | null }} Line */

  /** @param {Vec2Like} point @param {Line} line */
  const lineDistance = (point, line) => {
    if (line.prev == null) return Vec2.distance(line.origin, point);

    const pa = Vec2.sub([0, 0], point, line.prev.origin);
    const ba = Vec2.sub([0, 0], line.origin, line.prev.origin);
    const h = clamp(Vec2.dot(pa, ba) / Vec2.squaredLength(ba), 0.0, 1.0);
    return Vec2.squaredLength(Vec2.scaleAndAdd(pa, pa, ba, -h));
  };

  /** @param {Line} line @param {Vec2Like} point  */
  const lineGradient = (point, line) => {
    if (line.prev == null) return Vec2.sub([0, 0], line.origin, point);

    const pa = Vec2.sub([0, 0], point, line.prev.origin);
    const ba = Vec2.sub([0, 0], line.origin, line.prev.origin);
    const h = clamp(Vec2.dot(pa, ba) / Vec2.squaredLength(ba), 0.0, 1.0);
    return Vec2.scaleAndAdd(pa, Vec2.negate(pa, pa), ba, h);
  };

  /**
   * Get gradient vector from distance field
   * @param {Vec2Like} pt @param {Line[]} field
   * @todo Replace brute force minimal distance evaluation with BVH
   */
  const getGradient = (pt, field) => {
    if (field.length === 0) return Vec2.create(0, 0);

    let nearest = field[0],
      minDist = lineDistance(pt, nearest);
    for (let i = 1; i < field.length; ++i) {
      const line = field[i],
        dist = lineDistance(pt, line);
      if (dist < minDist) {
        nearest = line;
        minDist = dist;
      }
    }
    return lineGradient(pt, nearest);
  };

  /**
   * Calculates adjusting forces for control points
   * @param {Bezier} curve @param {Line[]} field @param {number} samples
   * @returns {[f1: Vec2Like, f2: Vec2Like]}
   */
  const calculateForces = (curve, field, samples) => {
    const f1 = /** @type {Vec2Like} */ ([0, 0]),
      f2 = /** @type {Vec2Like} */ ([0, 0]);

    for (let t = 1.0 / samples, stop = 1.0, step = 1.0 / samples; t < stop; t += step) {
      const pt = bezier(curve[0], curve[1], curve[2], curve[3], t);
      const grad = getGradient(pt, field);

      const invT = 1.0 - t;
      Vec2.scaleAndAdd(f1, f1, grad, t * invT * invT);
      Vec2.scaleAndAdd(f2, f2, grad, t * t * invT);
    }
    Vec2.scale(f1, f1, 6.0 / samples);
    Vec2.scale(f2, f2, 6.0 / samples);

    return [f1, f2];
  };

  /** @param {Bezier} curve @param {Line[]} field @param {AdjustProps} param2 */
  const tryAdjustPoints = (curve, field, { adjustSteps = 16, samplingPoints = 16, tangent1, tangent2 } = {}) => {
    const base = lerp(10, 1, adjustSteps / 100);
    for (let i = adjustSteps; i--;) {
      const [f1, f2] = calculateForces(curve, field, samplingPoints);

      /** Scale-factor */
      const c = lerp(base, 1, (i + 1) / adjustSteps);
      if (tangent1) {
        /** Clamp vector direction: $\vec{f^{'}_1} = \vec{t_1} * \min(|\vec{f_1}|, c * \vec{t_1} \cdot \vec{f_1})$ */
        Vec2.scale(f1, tangent1, Math.min(Vec2.mag(f1), c * Vec2.dot(tangent1, f1)));
      }
      if (tangent2) {
        Vec2.scale(f2, tangent2, Math.min(Vec2.mag(f2), c * Vec2.dot(tangent2, f2)));
      }

      Vec2.add(curve[1], curve[1], f1);
      Vec2.add(curve[2], curve[2], f2);
    }
    return false;
  };

  /** @param {Vec2Like[]} points @param {AdjustProps} props */
  const approximate = (points, props) => {
    const end = points[points.length - 1];
    /** @type {Bezier} */
    const curve = [points[0], Vec2.lerp([0, 0], points[0], end, 1 / 3), Vec2.lerp([0, 0], points[0], end, 2 / 3), end];

    const { tangent1: t1, tangent2: t2 } = props;
    if (t1)
      /** $\vec{c_1} = \vec{c_0} + (\vec{t_1} \cdot (\vec{c_1} - \vec{c_0})) \vec{t_1}$ */
      Vec2.add(curve[1], curve[0], Vec2.scale(curve[1], t1, Vec2.dot(t1, Vec2.sub(curve[1], curve[1], curve[0]))));
    if (t2)
      Vec2.add(curve[2], curve[3], Vec2.scale(curve[2], t2, Vec2.dot(t2, Vec2.sub(curve[2], curve[2], curve[3]))));

    /** @type {Line[]} */
    const bvh = [];
    /** @type {Line} */
    let prev = { origin: points[0], prev: null };
    for (let i = 1; i < points.length; ++i) {
      /** @type {Line} */
      const next = { origin: points[i], prev };
      bvh.push(next);
      prev = next;
    }

    tryAdjustPoints(curve, bvh, props);
    return curve;
  };

  return { approximate };
});

/** @typedef {"rIn" | "e" | "rBall" | "hSep"} HarmonicBase */
/**
 * @typedef {object} HarmonicDriveProps
 * @prop {number} thickness Thickness of separator
 * @prop {number} zBalls Number of rolling elements
 * @prop {number} zWaves Number of waves
 * @prop {number} rOuter Outer radius of drive
 * @prop {number} sepPrecision Offset of separator
 * @prop {HarmonicBase} baseProp Name of base property
 * @prop {number} baseValue Value of base property
 */
/**
 * @typedef {object} HarmonicDriveDependentProps
 * @prop {number} rIn Inner profile radius
 * @prop {number} e Eccentricity
 * @prop {number} rBall Radius of rolling body (default)
 * @prop {number} hSep Thickness of separator
 * @prop {number} zHard Number of waves of outer wheel
 * @prop {number} rDisk Radius of wave generator
 * @prop {string | null} error
 */
const __harmonicDrive = mod(() => {
  const { Vec2, Mat2d } = __glMatrix();
  const { approximate } = __approxBezier();
  const { asin, atan2, sin, cos, sqrt, pow, PI } = Math;

  /** @param {HarmonicDriveProps} props @returns {HarmonicDriveDependentProps}  */
  const calcDependentProperties = (props) => {
    const { rOuter, sepPrecision, baseValue, baseProp } = props;
    /** Potentially this is also a property >= 1. This property works as smoothing factor for profile */
    const ballFromE = 2.5;
    const sepConst = ballFromE - 2 * sepPrecision;
    let rIn = 0,
      e = 0,
      rBall = 0,
      hSep = 0,
      /** @type {string | null} */ error = null;

    switch (baseProp) {
      case "rIn":
        rIn = baseValue;
        e = (rOuter - baseValue) / 2;
        rBall = (ballFromE * (rOuter - baseValue)) / 2;
        hSep = (sepConst * (rOuter - baseValue)) / 2;
        break;
      case "e":
        rIn = rOuter - baseValue * 2;
        e = baseValue;
        rBall = ballFromE * baseValue;
        hSep = sepConst * baseValue;
        break;
      case "rBall":
        rIn = rOuter - (baseValue / ballFromE) * 2;
        e = baseValue / ballFromE;
        rBall = baseValue;
        hSep = (sepConst * baseValue) / ballFromE;
        break;
      case "hSep":
        rIn = rOuter - (baseValue / sepConst) * 2;
        e = baseValue / sepConst;
        rBall = (ballFromE * baseValue) / sepConst;
        hSep = baseValue;
        break;
      default:
        error = "Неизвестная базовая характеристика";
    }

    const zHard = props.zBalls + props.zWaves;
    const rDisk = rIn + e - 2 * rBall;

    if (rIn < (1.03 * (2 * rBall)) / sin(PI / zHard)) {
      error = "Привод с заданными параметрами не может быть построен";
    }
    return { rIn, e, rBall, hSep, zHard, rDisk, error };
  };

  /**
   * Rolling element distance to center
   * @param {number} phi Polar angle
   * @param {number} z Number of waves
   * @param {number} rSq Squared radius (by default it is $(rBall + rDisk)^2$)
   * @param {number} e Eccentricity
   */
  const l = (phi, z, rSq, e) => e * cos(z * phi) + S(phi, z, rSq, e);

  /**
   * Angle to contact point of rolling element
   * @param {number} phi Polar angle
   * @param {number} z Number of waves
   * @param {number} rSq Squared radius (by default it is $(rBall + rDisk)^2$)
   * @param {number} e Eccentricity
   */
  const chi = (phi, z, rSq, e) => atan2(e * z * sin(z * phi), S(phi, z, rSq, e));

  /**
   * Basic wave profile in polar coordinates
   * @param {number} phi Polar angle
   * @param {number} z Number of waves
   * @param {number} rSq Squared radius (by default it is $(rBall + rDisk)^2$)
   * @param {number} e Eccentricity
   */
  const S = (phi, z, rSq, e) => sqrt(rSq - pow(e * sin(z * phi), 2));
  /** @typedef {'inner' | 'outer'} ProfileSide */

  /**
   * @param {number} phi
   * @param {number} z
   * @param {ProfileSide} side
   * @param {number} rBall
   * @param {number} rSq Squared radius (by default it is $(rBall + rDisk)^2$)
   * @param {number} e Eccentricity
   * @returns {Vec2Like}
   */
  const evalWavePoint = (phi, z, side, rBall, rSq, e) => {
    const dist = l(phi, z, rSq, e);
    const phase = phi + chi(phi, z, rSq, e);
    if (side === "outer") return [dist * cos(phi) + rBall * cos(phase), dist * sin(phi) + rBall * sin(phase)];
    return [dist * cos(phi) - rBall * cos(phase), dist * sin(phi) - rBall * sin(phase)];
  };

  /** @param {Vec2Like} result @param {Vec2Like} v */
  const rotateCCW = (result, v) => {
    const x = v[0];
    result[0] = -v[1];
    result[1] = x;
    return result;
  };

  /**
   * @param {number} waves
   * @param {number} pointsPerHalfWave
   * @param {HarmonicDriveDependentProps} props
   * @param {ProfileSide} [side="outer"]
   * @param {number} [approx=0]
   * @param {number} [samples=16]
   * @returns
   */
  const harmonicProfile = (waves, pointsPerHalfWave, props, side = "outer", approx = 0, samples = 16) => {
    const { rBall, rDisk, e } = props;
    const rSq = pow(rBall + rDisk, 2);
    const halfWaves = 2 * waves;
    const points = pointsPerHalfWave * halfWaves;

    let lastPoint = evalWavePoint(0, waves, side, rBall, rSq, e);
    const firstPoint = lastPoint;

    let path = `M${lastPoint[0]},${lastPoint[1]}`;
    if (approx) {
      const pathPts = [lastPoint];

      const tangent1 = Vec2.normalize([0, 0], lastPoint);
      rotateCCW(tangent1, tangent1);

      for (let i = 1; i <= pointsPerHalfWave; ++i) {
        lastPoint = evalWavePoint((i * 2 * PI) / points, waves, side, rBall, rSq, e);
        pathPts.push(lastPoint);
      }

      const tmp = Vec2.normalize([0, 0], lastPoint);
      rotateCCW(tmp, tmp);

      /** @type {Vec2Like[]} */
      const bez = approximate(pathPts, { adjustSteps: approx, samplingPoints: samples, tangent1, tangent2: tmp });
      bez.unshift(
        ...bez
          .map(([x, y]) => Vec2.create(x, -y))
          .reverse()
          .slice(0, -1),
      );

      path = `M${bez[0][0]},${bez[0][1]}C`;
      bez.shift();

      /** @type {Mat2dLike} */
      const rot = [1, 0, 0, 1, 0, 0];
      for (let i = 0; i < waves; ++i) {
        Mat2d.fromRotation(rot, (PI * 2 * i) / waves);
        path += " " + bez.map((pt) => Vec2.transformMat2d(tmp, pt, rot).join(",")).join(" ");
      }
    } else {
      for (let halfWave = 0; halfWave < halfWaves; ++halfWave) {
        const offset = halfWave * pointsPerHalfWave;
        const pathPts = [lastPoint];
        for (let i = 1; i <= pointsPerHalfWave; ++i) {
          lastPoint = evalWavePoint(((i + offset) * 2 * PI) / points, waves, side, rBall, rSq, e);
          pathPts.push(lastPoint);
        }
        if (halfWave + 1 >= halfWaves) {
          Vec2.copy(lastPoint, firstPoint);
        }
        path += ` ${pathPts.map(([x, y]) => `${x},${y}`).join(" ")}`;
      }
    }
    path += "Z";
    return path;
  };

  /**
   * @param {number} zBalls
   * @param {number} rDisk
   * @param {number} rBall
   * @param {number} hSep
   */
  const separatorProfile = (zBalls, rDisk, rBall, hSep) => {
    let path = "";
    const midR = rDisk + rBall;
    const outR = midR + 0.5 * hSep;
    const inR = midR - 0.5 * hSep;

    const outAngle = asin(rBall / outR);
    const inAngle = asin(rBall / inR);
    const large = Number(zBalls == 1);
    for (let i = 0; i < zBalls; ++i) {
      const alpha = (i / zBalls) * 2 * PI;
      const beta = ((i + 1) / zBalls) * 2 * PI;

      const leftOut = Vec2.create(outR * cos(alpha + outAngle), outR * sin(alpha + outAngle));
      const rightOut = Vec2.create(outR * cos(beta - outAngle), outR * sin(beta - outAngle));
      const leftIn = Vec2.create(inR * cos(alpha + inAngle), inR * sin(alpha + inAngle));
      const rightIn = Vec2.create(inR * cos(beta - inAngle), inR * sin(beta - inAngle));

      path +=
        `M${leftOut[0]},${leftOut[1]}A ${outR} ${outR} 0 ${large}1${rightOut[0]},${rightOut[1]}` +
        `L${rightIn[0]},${rightIn[1]}A ${inR} ${inR} 0 ${large}0${leftIn[0]},${leftIn[1]}Z`;
    }

    return path;
  };

  /**
   * @param {number} phi
   * @param {number} zBalls
   * @param {HarmonicDriveDependentProps} props
   */
  const ballPositions = (phi, zBalls, props) => {
    const { rBall, rDisk, e, zHard } = props;
    const rSq = pow(rBall + rDisk, 2);

    /** @type {Vec2Like[]} */
    const result = [];
    for (let i = 0; i < zBalls; ++i) {
      const phiBall = (PI * 2 * i) / zBalls + phi;
      const R = l(phiBall, zHard, rSq, e);
      result.push([R * cos(phiBall), R * sin(phiBall)]);
    }
    return result;
  };

  /**
   * @param {HarmonicDriveProps} props
   * @param {object} [approx]
   * @param {number} [approx.points] Points per half wave (for precise profile)
   * @param {number} [approx.samples] Sample points of approximation with curves
   * @param {number} [approx.steps] Steps of approximation with curves (<= 0 — no approximation)
   */
  const buildHarmonicDrive = (props, { steps = 0, samples = 16, points = 32 } = {}) => {
    const deps = calcDependentProperties(props);
    if (deps.error) {
      throw new Error(deps.error);
    }

    const { e, rDisk } = deps;

    const hardOuter = props.rOuter + props.thickness;
    const wheelProfile = harmonicProfile(deps.zHard, points, deps, "outer", steps, samples);
    const hardWheel = `M${hardOuter},0A 1 1 0 00${-hardOuter} 0A 1 1 0 00${hardOuter} 0z${wheelProfile}`;
    const waveGenerator =
      props.zWaves <= 1
        ? `M${e + rDisk},0a${rDisk} ${rDisk} 0 00${-2 * rDisk} 0 ${rDisk} ${rDisk} 0 00${2 * rDisk} 0z`
        : harmonicProfile(props.zWaves, points, deps, "inner", steps, samples);
    const separator = separatorProfile(props.zBalls, deps.rDisk, deps.rBall, deps.hSep);

    return { hardWheel, waveGenerator, separator, rBall: deps.rBall, balls: ballPositions(0, props.zBalls, deps) };
  };

  return { buildHarmonicDrive, ballPositions, calcDependentProperties };
});

const __utils = mod(() => {
  /** @param {number} a @param {number} b */
  const gcd = (a, b) => {
    let tmp = 0;
    if (b < a) {
      tmp = a;
      a = b;
      b = tmp;
    }
    while (b) {
      tmp = a % b;
      a = b;
      b = tmp;
    }
    return a;
  };

  return { gcd };
});

/** @template [T=any] @typedef {{ (): T; on(cb: () => void): void; off(cb: () => void): void; }} Getter */
/** @template [T=any] @typedef {(value: T) => void} Setter */
/** @template [T=any] @typedef {Getter<T> & Setter<T>} Accessor */
const __jsx = mod(() => {
  const SVG_NS = "http://www.w3.org/2000/svg",
    HTML_NS = "http://www.w3.org/1999/xhtml";

  let /** @type {Document | XMLDocument} */ doc = document;
  let docNS = doc.lookupNamespaceURI("") || HTML_NS;
  /** @template {keyof HTMLElementTagNameMap} Tag1 @overload @param {'http://www.w3.org/1999/xhtml'} ns @param {Tag1} root @param {(root: HTMLElementTagNameMap[Tag1]) => void} block @returns {Document} */
  /** @template {keyof SVGElementTagNameMap} Tag2 @overload @param {'http://www.w3.org/2000/svg'} ns @param {Tag2} root @param {(root: SVGElementTagNameMap[Tag2]) => void} block @returns {Document} */
  /** @overload @param {string} ns @param {string} root @param {(root: Element) => void} block @returns {Document} */
  /** @param {string} ns @param {string} root @param {(root: Element) => void} block */
  const xmlDocument = (ns, root, block) => {
    const result = document.implementation.createDocument(ns, root);
    const oldDoc = doc;
    const oldNS = docNS;
    doc = result;
    docNS = ns;
    try {
      block(result.children[0]);
      return result;
    } finally {
      doc = oldDoc;
      docNS = oldNS;
    }
  };

  /** Enough for this app */
  const svgSpecificTags = ["circle", "path", "metadata"];

  /** @template {keyof SVGElementTagNameMap} Tag @param {Tag|SVGElementTagNameMap[Tag]} tag @param {Record<string, any>} props @returns {SVGElementTagNameMap[Tag]} */
  const jsx = (tag, props) => {
    let result;
    if (typeof tag == "string") {
      let [prefix, tagName] = tag.split(":");
      if (tagName) {
        const ns = doc.lookupNamespaceURI(prefix);
        if (!ns) throw new Error(`Unknown name space prefix "${prefix}"`);
        result = doc.createElementNS(ns, tagName);
      } else {
        tagName = prefix;
        const ns = docNS === HTML_NS ? (svgSpecificTags.includes(tag) ? SVG_NS : HTML_NS) : docNS;
        result = doc.createElementNS(ns, tagName);
      }
    } else {
      result = tag;
    }

    const /** @type {Array<Node>|null} */ children = props.$ || props.children;
    delete props.$;
    delete props.children;
    for (const prop in props) {
      const [prefix, name] = prop.split(":");
      if (name) {
        const ns = result.lookupNamespaceURI(prefix) || doc.lookupNamespaceURI(prefix);
        if (ns) result.setAttributeNS(ns, prop, props[prop]);
        else result.setAttribute(prop, props[prop]);
      } else {
        result.setAttribute(prop, props[prop]);
      }
    }
    if (children) {
      result.append(...children.filter(Boolean));
    }

    return /** @type {SVGElementTagNameMap[Tag]} */ (result);
  };

  const /** @type {Set<() => void>} */ delayedUpdate = new Set();
  let enqueued = false;
  /** @param {Set<() => void>} listeners */
  const queueUpdate = (listeners) => {
    for (const listener of listeners) delayedUpdate.add(listener);

    if (!enqueued) {
      enqueued = true;
      queueMicrotask(() => {
        try {
          let depth = 20;
          for (; depth-- && delayedUpdate.size;) {
            const snapshot = [...delayedUpdate];
            delayedUpdate.clear();
            for (const listener of snapshot) listener();
          }
          if (depth == 0 && delayedUpdate.size) {
            console.warn("[jsx] Too many updates. The dependency graph likely contains a cycle.");
          }
        } finally {
          delayedUpdate.clear();
          enqueued = false;
        }
      });
    }
  };

  /** @template T @param {T} value @returns {Accessor<T>} */
  const $state = (value) => {
    const /** @type {Set<() => void>} */ listeners = new Set();
    /** @param {[] | [T]} args */
    const result = (...args) => {
      if (!args.length) {
        return value;
      }

      if (args[0] === value) return;

      value = args[0];
      queueUpdate(listeners);
    };
    /** @param {() => void} cb */
    result.on = (cb) => listeners.add(cb);
    /** @param {() => void} cb */
    result.off = (cb) => listeners.delete(cb);

    return /** @type {Accessor<T>} */ (result);
  };

  /** @param {() => void | (() => void)} cb @param {Getter[]} deps */
  const $effect = (cb, deps) => {
    let /** @type {void | null | (() => void)} */ cleanup = null;
    const wrapper = () => {
      if (cleanup) cleanup();

      cleanup = cb();
    };

    wrapper();
    for (const dep of deps) {
      dep.on(wrapper);
    }

    return () => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
      for (const dep of deps) {
        dep.off(wrapper);
      }
    };
  };

  return { xmlDocument, jsx, $state, $effect };
});

const __renderBlueprint = mod(() => {
  const { jsx, xmlDocument } = __jsx();
  const { buildHarmonicDrive, ballPositions, calcDependentProperties } = __harmonicDrive();
  const { gcd } = __utils();

  /** @param {HarmonicDriveProps} props @param {'bezier'|'polyline'} style */
  const renderBlueprint = (props, unit = "mm", style = "polyline") => {
    const xml = xmlDocument("http://www.w3.org/2000/svg", "svg", (svg) => {
      const derived = calcDependentProperties(props);
      const common = gcd(props.zBalls, props.zWaves);
      const frac = [props.zBalls / common, props.zWaves / common];
      const offset = props.thickness + 1;
      const size = 2 * (props.rOuter + offset);
      const drive = buildHarmonicDrive(props, { points: 64, samples: 32, steps: style == "bezier" ? 100 : 0 });
      const balls = ballPositions(0, props.zBalls, derived);
      const { e, rBall, rDisk } = derived;
      const crossHairSize = 0.1 * rDisk;

      const description =
        `Чертежи волнового редуктора с ПТК и передаточным отношением ${frac[0]}:${frac[1]}\n\n` +
        "Создан используя параметры:\n\n" +
        "```json\n" +
        `${JSON.stringify(props, null, "  ")}\n` +
        "```\n" +
        "Из чего были получены параметры:\n\n" +
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
            "inkscape:label": "Жесткое колесо",
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
            "inkscape:label": "Сепаратор",
            stroke: "#f00",
            $: [jsx("path", { id: "separator", d: drive.separator })],
          }),
          jsx("g", {
            id: "layer-wave_gen",
            "inkscape:groupmode": "layer",
            "inkscape:label": "Волнообразователь",
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
            "inkscape:label": "Тела качения",
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

  return renderBlueprint;
});

function main() {
  const { jsx, $state, $effect } = __jsx();
  const { ballPositions, buildHarmonicDrive, calcDependentProperties } = __harmonicDrive();
  const renderBlueprint = __renderBlueprint();
  const { gcd } = __utils();

  const props = {
    thickness: $state(1),
    zBalls: $state(8),
    zWaves: $state(1),
    rOuter: $state(10),
    sepPrecision: $state(0.15),
    baseProp: $state(/** @type {HarmonicBase} */ ("rBall")),
    baseValue: $state(1),
  };

  /** @returns {HarmonicDriveProps} */
  const getProps = () => ({
    thickness: props.thickness(),
    zBalls: props.zBalls(),
    zWaves: props.zWaves(),
    rOuter: props.rOuter(),
    sepPrecision: props.sepPrecision(),
    baseProp: props.baseProp(),
    baseValue: props.baseValue(),
  });

  /** @param {number} x @param {number} precision */
  const roundTo = (x, precision = 0) => {
    const d = 10 ** precision;
    return `${Math.trunc(x * d) / d}`;
  };

  /** @template {Element} T @param {string} selector */
  const $ = (selector) => /** @type {T} */ (document.querySelector(selector));

  const /** @type {HTMLElement} */ oError = $(".control-panel .error");
  const /** @type {HTMLElement} */ oGearRatioNum = $("#label_gear-ratio_num");
  const /** @type {HTMLElement} */ oGearRatioDenom = $("#label_gear-ratio_denom");
  const /** @type {HTMLElement} */ oGearRatio = $("#label_gear-ratio");
  const /** @type {HTMLElement} */ oRInner = $("#label_r-inner");
  const /** @type {HTMLElement} */ oE = $("#label_e");
  const /** @type {HTMLElement} */ oRBall = $("#lable_r-ball");
  const /** @type {HTMLElement} */ oHSep = $("#label_h-sep");

  const /** @type {SVGPathElement} */ oCenter = $("#center");
  const /** @type {SVGPathElement} */ oDrawing = $("#drawing");
  const /** @type {SVGPathElement} */ oHardWheel = $("#hard_wheel");
  const /** @type {SVGPathElement} */ oSeparator = $("#separator");
  const /** @type {SVGPathElement} */ oWaveGen = $("#wave_gen");
  const /** @type {SVGPathElement} */ oBalls = $("#layer-balls");
  const /** @type {SVGCircleElement[]} */ balls = [];

  const TURN = Math.PI * 2;
  //#region Rendering
  const rpm = $state(60);
  let dependedProps = calcDependentProperties(getProps()),
    phiRotor = 0;

  const animation = $state(false);

  const updateMovingParts = () => {
    const { zBalls, zWaves } = getProps();
    const reductionRatio = zWaves / zBalls;
    const phi = phiRotor * reductionRatio;

    const ballsPos = ballPositions(phi, zBalls, dependedProps);
    for (let i = 0; i < balls.length; ++i) {
      const ball = balls[i];
      const pos = ballsPos[i];
      jsx(ball, { cx: "" + pos[0], cy: "" + pos[1] });
    }
    if (phiRotor === 0) {
      oWaveGen.removeAttribute("transform");
      oSeparator.removeAttribute("transform");
    } else {
      jsx(oWaveGen, { transform: `rotate(${(-phiRotor / Math.PI) * 180})` });
      jsx(oSeparator, { transform: `rotate(${(phi / Math.PI) * 180})` });
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
  }, [animation]);

  $effect(() => {
    const props = getProps();
    const { zBalls, zWaves, thickness, rOuter } = props;
    dependedProps = calcDependentProperties(props);
    const { rIn, e, rBall, hSep, rDisk, error } = dependedProps;
    const crossHairSize = 0.1 * rDisk;

    const common = gcd(zBalls, zWaves);
    oGearRatioNum.innerText = (zBalls / common).toString();
    oGearRatioDenom.innerText = (zWaves / common).toString();
    oGearRatio.innerText = roundTo(zBalls / zWaves, 6);
    oRInner.innerText = roundTo(rIn, 6);
    oE.innerText = roundTo(e, 6);
    oRBall.innerText = roundTo(rBall, 6);
    oHSep.innerText = roundTo(hSep, 6);

    const offset = thickness + 1;
    const size = 2 * (rOuter + offset);
    if (!error) {
      oError.innerHTML = "";
      const drive = buildHarmonicDrive(props, { points: 64, samples: 32, steps: 100 });

      const box = oDrawing.getBoundingClientRect();
      jsx(oDrawing, {
        viewBox: `-${rOuter + offset} -${rOuter + offset} ${size} ${size}`,
        width: `${size}px`,
        height: `${size}px`,
        "stroke-width": (size / Math.min(box.width, box.height)).toString(),
      });
      jsx(oCenter, { d: `M-${crossHairSize},0 0 0V-${crossHairSize}M${crossHairSize} 0 0 0V${crossHairSize}` });
      jsx(oHardWheel, { d: drive.hardWheel });
      jsx(oSeparator, { d: drive.separator });
      jsx(oWaveGen, { d: drive.waveGenerator });

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
          ball = jsx("circle", {});
          balls[i] = ball;
          oBalls.appendChild(ball);
        }
        jsx(ball, {
          cx: ballPos[0].toString(),
          cy: ballPos[1].toString(),
          r: rBall.toString(),
        });
      }

      oBalls.style.removeProperty("display");
      updateMovingParts();
    } else {
      oError.innerText = error;
      jsx(oHardWheel, { d: "" });
      jsx(oSeparator, { d: "" });
      jsx(oWaveGen, { d: "" });
      oBalls.style.display = "none";
    }
  }, Object.values(props));
  //#endregion

  //#region Inputs
  $("button#save").addEventListener("click", () => {
    /** @todo Two export variants (polyline and bezier approximation) */
    const drawing = renderBlueprint(getProps(), "mm", "bezier");

    const file = new File([drawing], "harmonic-drive.svg", { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();
  });

  /** @template {string | number | boolean} T @param {HTMLInputElement} input @param {Accessor<T>} value */
  const bindValue = (input, value) => {
    let listener,
      unsub,
      event = "input";
    if (input.type == "radio" || input.type == "checkbox") {
      listener = () => {
        value(/** @type {T} */ (input.checked));
      };
      unsub = $effect(() => {
        input.checked = !!value();
      }, [value]);
      event = "change";
    } else {
      listener = () => {
        value(/** @type {T} */ (Number(input.value)));
      };
      unsub = $effect(() => {
        input.value = value().toString();
      }, [value]);
    }
    input.addEventListener(event, listener);
    return () => {
      unsub;
      input.removeEventListener(event, listener);
    };
  };

  /** @template {string | number | boolean} T @param {HTMLInputElement} input @param {Accessor<T>} value */
  const bindRadio = (input, value) => {
    input.addEventListener("change", () => {
      value(/** @type {T} */ (input.value));
    });
    return $effect(() => {
      input.checked = input.value === value();
    }, [value]);
  };

  for (const selector of document.querySelectorAll('input[name="baseProperty"]')) {
    bindRadio(/** @type {HTMLInputElement} */ (selector), props.baseProp);
  }
  bindValue($('input[name="animation"]'), animation);
  bindValue($('input[name="rpm"]'), rpm);
  bindValue($('input[name="z-balls"]'), props.zBalls);
  bindValue($('input[name="z-waves"]'), props.zWaves);
  bindValue($('input[name="thickness"]'), props.thickness);
  bindValue($('input[name="sep-precision"]'), props.sepPrecision);
  bindValue($('input[name="r-outer"]'), props.rOuter);

  let prevBase = props.baseProp();
  $effect(() => {
    const _props = getProps();
    _props.baseProp = prevBase;
    const prevDerived = calcDependentProperties(_props);
    prevBase = props.baseProp();
    switch (prevBase) {
      case "rBall":
        props.baseValue(prevDerived.rBall);
        return bindValue($('input[name="r-ball"]'), props.baseValue);
      case "rIn":
        props.baseValue(prevDerived.rIn);
        return bindValue($('input[name="r-inner"]'), props.baseValue);
      case "e":
        props.baseValue(prevDerived.e);
        return bindValue($('input[name="e"]'), props.baseValue);
      case "hSep":
        props.baseValue(prevDerived.hSep);
        return bindValue($('input[name="h-sep"]'), props.baseValue);
    }
  }, [props.baseProp]);

  $effect(() => {
    const /** @type {HTMLInputElement} */ iRInner = $('input[name="r-inner"]');
    iRInner.max = "" + props.rOuter();
  }, [props.rOuter]);
  //#endregion
}
document.addEventListener("DOMContentLoaded", main);
