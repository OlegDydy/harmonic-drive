/**
 * Async body make this system compatible with ESM `await import()` syntax
 * @template T @param {() => T | Promise<T>} ctx @returns {() => Promise<T>}
 */
function mod(ctx) {
  let /** @type {T} */ module;
  let initialized = false;
  return async () => {
    if (!initialized) {
      module = await ctx();
      initialized = true;
    }
    return module;
  };
}
/** @template T @param {() => T} ctx @returns {() => T} */
mod.sync = (ctx) => {
  let /** @type {T} */ module;
  let initialized = false;
  return () => {
    if (!initialized) {
      module = ctx();
      initialized = true;
    }
    return module;
  };
};
