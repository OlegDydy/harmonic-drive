const __utils = mod.sync(() => {
  const { trunc } = Math;
  const { get } = __jsx();

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

  /** @param {number} x @returns {string} */
  const fmt = (x) => `${Number.isFinite(x) ? roundTo(x, 6).toLocaleString() : "—"}`;

  /**
   @typedef {{
    (...classes: (string | false | null | undefined)[]): string;
    (...classes: MaybeGetter<string | false | null | undefined>[]): () => string;
   }} CN */

  const cn = /** @type {CN} classes */ (
    (...classes) =>
      classes.some((i) => typeof i == "function")
        ? () =>
            classes
              .map((i) => get(i))
              .filter(Boolean)
              .join(" ")
        : classes.filter(Boolean).join(" ")
  );

  return { gcd, roundTo, fmt, cn };
});
