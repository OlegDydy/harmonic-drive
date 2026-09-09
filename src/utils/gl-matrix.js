/** @typedef {[x: number, y: number]} Vec2Like */
/** @typedef {[a: number, b: number, c: number, d: number, tx: number, ty: number]} Mat2dLike */
const __utils_glMatrix = mod(() => {
  const Vec2 = {
    /** @param {number} x @param {number} y @returns {Vec2Like} */
    create: (x = 0, y = 0) => [x, y],
    /** @param {Vec2Like} result @param {number} x @param {number} y */
    set: (result, x, y) => ((result[0] = x), (result[1] = y), result),
    /** @param {Vec2Like} dest @param {Readonly<Vec2Like>} src */
    copy: (dest, src) => ((dest[0] = src[0]), (dest[1] = src[1]), dest),
    /** @param {Vec2Like} result @param {Readonly<Vec2Like>} a */
    neg: (result, a) => ((result[0] = -a[0]), (result[1] = -a[1]), result),
    /** @param {Vec2Like} result @param {Readonly<Vec2Like>} a @param {Readonly<Vec2Like>} b */
    add: (result, a, b) => ((result[0] = a[0] + b[0]), (result[1] = a[1] + b[1]), result),
    /** @param {Vec2Like} result @param {Readonly<Vec2Like>} a @param {Readonly<Vec2Like>} b */
    sub: (result, a, b) => ((result[0] = a[0] - b[0]), (result[1] = a[1] - b[1]), result),
    /** @param {Vec2Like} result @param {Readonly<Vec2Like>} a @param {Readonly<Vec2Like>} b */
    mul: (result, a, b) => ((result[0] = a[0] * b[0]), (result[1] = a[1] * b[1]), result),
    /** @param {Vec2Like} result @param {Readonly<Vec2Like>} a @param {Readonly<Vec2Like>} b */
    div: (result, a, b) => ((result[0] = a[0] / b[0]), (result[1] = a[1] / b[1]), result),
    /** @param {Vec2Like} result @param {Readonly<Vec2Like>} a @param {number} factor */
    scale: (result, a, factor) => ((result[0] = a[0] * factor), (result[1] = a[1] * factor), result),
    /** @param {Vec2Like} result @param {Readonly<Vec2Like>} a @param {Readonly<Vec2Like>} b @param {number} factor */
    scaleAndAdd: (result, a, b, factor) => (
      (result[0] = a[0] + b[0] * factor),
      (result[1] = a[1] + b[1] * factor),
      result
    ),
    /** @param {Readonly<Vec2Like>} a @param {Readonly<Vec2Like>} b */
    dot: (a, b) => a[0] * b[0] + a[1] * b[1],
    /** @param {Readonly<Vec2Like>} a */
    magSq: (a) => a[0] * a[0] + a[1] * a[1],
    /** @param {Readonly<Vec2Like>} a */
    mag: (a) => Math.hypot(a[0], a[1]),
    /** @param {Readonly<Vec2Like>} a @param {Readonly<Vec2Like>} b */
    distSq: (a, b) => {
      const dx = a[0] - b[0],
        dy = a[1] - b[1];
      return dx * dx + dy * dy;
    },
    /** @param {Readonly<Vec2Like>} a @param {Readonly<Vec2Like>} b */
    dist: (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]),
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
      const [x, y] = a;
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
