const __utils = mod(async () => {
  const { ENV } = await __config();

  const { trunc } = Math;

  /** @param {number} a @param {number} b */
  const gcd = (a, b) => {
    let tmp = 0;
    a = trunc(a) || 1;
    b = trunc(b) || 1;
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

  /** @param {number} x @param {number} precision */
  const roundTo = (x, precision = 0) => {
    const d = 10 ** precision;
    return Math.round(x * d) / d;
  };

  /** @template {Element} T @param {string} selector */
  const $ = (selector) => {
    const result = /** @type {T} */ (document.querySelector(selector));
    if (ENV == "development" && !result) throw new Error("Element not found");
    return result;
  };

  return { gcd, roundTo, $ };
});
