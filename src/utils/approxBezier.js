/** @typedef {[Vec2Like, Vec2Like, Vec2Like, Vec2Like]} Bezier */
/**
 * @typedef {object} AdjustProps
 * @prop {number} [adjustSteps=16] How many steps do to make curve as precise (300 gives a good accuracy for final rendering)
 * @prop {number} [samplingPoints=16] How many points to use to sample the curve fitting error
 * @prop {Vec2Like} [tangent1] Constraint of first handle
 * @prop {Vec2Like} [tangent2] Constraint of second handle
 */
const __utils_approxBezier = mod.sync(() => {
  const { Vec2 } = __utils_glMatrix();

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
    if (line.prev == null) return Vec2.dist(line.origin, point);

    const pa = Vec2.sub([0, 0], point, line.prev.origin);
    const ba = Vec2.sub([0, 0], line.origin, line.prev.origin);
    const h = clamp(Vec2.dot(pa, ba) / Vec2.magSq(ba), 0.0, 1.0);
    return Vec2.magSq(Vec2.scaleAndAdd(pa, pa, ba, -h));
  };

  /** @param {Line} line @param {Vec2Like} point  */
  const lineGradient = (point, line) => {
    if (line.prev == null) return Vec2.sub([0, 0], line.origin, point);

    const pa = Vec2.sub([0, 0], point, line.prev.origin);
    const ba = Vec2.sub([0, 0], line.origin, line.prev.origin);
    const h = clamp(Vec2.dot(pa, ba) / Vec2.magSq(ba), 0.0, 1.0);
    return Vec2.scaleAndAdd(pa, Vec2.neg(pa, pa), ba, h);
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
