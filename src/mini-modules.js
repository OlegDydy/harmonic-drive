/**
 * Async body make this system compatible with ESM `await import()` syntax
 * @template T @param {() => T | Promise<T>} ctx @returns {() => Promise<T>}
 */
function mod(ctx) {
  /** @type {T} */ let module;
  let initialized = false;
  return async () => {
    if (!initialized) {
      module = await ctx();
      initialized = true;
    }
    return module;
  };
}
