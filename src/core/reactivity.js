const __reactivity = mod.sync(() => {
  /**
   * @typedef {Set<() => void>} EffectArea
   * @typedef {{ original: {}; dispose(): void; }} WrapContext
   * @typedef {{ v: number }} Versioned
   * @typedef {() => void} Listener
   * @typedef {{ s: Set<Getter & Versioned>; l: Set<Set<Listener>> }} Derived
   */
  /** @template T @typedef {(prev: Readonly<T>, next: Readonly<T>) => boolean} Comparator */

  let /** @type {EffectArea | null} */ currentEffectArea = null;
  let /** @type {Derived  | null} */ currentDerived = null;
  let nextVersion = 0;
  const /** @type {WeakMap<Getter, Set<Set<Listener>>>} */ stateSources = new WeakMap();
  const /** @type {WeakMap<{}|unknown[], WrapContext>} */ wrapped = new WeakMap();
  const E_NOT_IN_COMPONENT = "Effects can not be defined outside of a components";

  /** @param {any} obj @param {() => void} [onChange] */
  const wrap = (obj, onChange) => {
    if (!obj || typeof obj != "object") return obj;

    const /** @type {WrapContext} */ ctx = {
        original: obj,
        dispose() {
          onChange = undefined;
        },
      };
    const result = new Proxy(obj, {
      set(target, prop, newValue, receiver) {
        if (newValue !== target[prop]) {
          onChange?.();
        }
        return Reflect.set(target, prop, newValue, receiver);
      },
    });
    wrapped.set(result, ctx);

    return result;
  };

  /** @template T @param {T} obj @returns {T} */
  const unwrap = (obj) => /** @type {T} */ (wrapped.get(/** @type {{} | unknown[]} */ (obj))?.original || obj);

  /**
   * @template T
   * @param {T} value
   * @param {Comparator<T>} eq
   * @param {(value: T, invalidate: () => void) => T} process
   * @returns {Accessor<T>}
   */
  const _state = (value, eq = Object.is, process = unwrap) => {
    const /** @type {Set<() => void>} */ listeners = new Set();
    const invalidate = () => {
      result.v = ++nextVersion;
      if (listeners.size) queueUpdate(listeners);
    };
    value = process(unwrap(value), invalidate);

    /** @param {[] | [T]} args */
    const result = (...args) => {
      if (!args.length) {
        if (currentDerived) {
          currentDerived.s.add(result);
          currentDerived.l.add(listeners);
        }
        return value;
      }

      if (args[0] === value || eq(args[0], value)) return;

      const prev = wrapped.get(/** @type {{}} */ (value));
      if (prev) prev.dispose();

      value = process(unwrap(args[0]), invalidate);
      invalidate();
    };
    result.v = ++nextVersion;

    return /** @type {Accessor<T> } */ (result);
  };
  /** @template T @param {T} value @param {Comparator<T>} [eq] @returns {Accessor<T>} */
  const $state = (value, eq) => _state(value, eq, wrap);
  /** @template T @param {T} value @param {Comparator<T>} [eq] @returns {Accessor<T>} */
  $state.raw = (value, eq) => _state(value, eq);

  /** @template T @param {(v: T) => T} change */
  const _derivedNode = (change) => {
    let value = /** @type {T} */ (/** @type {unknown} */ (null));
    let computeVersion = -1;
    const /** @type {Derived} */ node = { s: new Set(), l: new Set() };
    const result = () => {
      // Already in sync
      if (computeVersion === nextVersion) return value;

      const prev = currentDerived;
      currentDerived = node;
      try {
        if (!node.s.size || [...node.s].some((s) => (s(), s.v > result.v))) {
          node.l.clear();
          node.s.clear();
          value = change(value);
        }
        if (prev) {
          prev.s.add(result);
          for (const l of node.l) prev.l.add(l);
        }

        computeVersion = nextVersion;
        return value;
      } finally {
        currentDerived = prev;
      }
    };
    stateSources.set(result, node.l);
    result.v = -1;
    return result;
  };

  /** @template T @param {() => T} cb @param {Comparator<T>} [eq] @returns {Getter<T>} */
  const $derived = (cb, eq = Object.is) => {
    const result = _derivedNode((value) => {
      const nextValue = cb();
      if (result.v == -1 || !(nextValue === value || eq(value, nextValue))) {
        value = nextValue;
        result.v = nextVersion;
      }
      return value;
    });

    return result;
  };

  /** @param {(area: EffectArea) => void} cb @param {EffectArea | null} [parent] */
  const effectArea = (cb, parent) => {
    const prev = parent || currentEffectArea;
    const /** @type {Set<() => void>} */ area = new Set();
    currentEffectArea = area;
    const dispose = () => {
      if (prev) prev.delete(dispose);
      for (const d of area) d();
    };
    try {
      cb(area);
      return dispose;
    } finally {
      prev?.add(dispose);
      currentEffectArea = prev;
    }
  };

  const /** @type {Set<() => void>} */ delayedUpdate = new Set();
  let enqueued = false;
  /** @param {Iterable<() => void>} listeners */
  const queueUpdate = (listeners) => {
    for (const listener of listeners) delayedUpdate.add(listener);

    if (!enqueued) {
      enqueued = true;
      queueMicrotask(() => {
        try {
          const MAX_DEPTH = 20;
          let depth = MAX_DEPTH;
          let updates = 0;
          for (; depth-- && delayedUpdate.size;) {
            updates += delayedUpdate.size;
            const snapshot = [...delayedUpdate];
            delayedUpdate.clear();
            for (const listener of snapshot) listener();
          }
          // console.debug(`[jsx-debug] Depth: ${MAX_DEPTH - depth}; updates: ${updates}`);
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

  /** @param {() => void | (() => void)} cb @returns {void} */
  const $effect = (cb) => {
    if (!currentEffectArea) throw new Error(E_NOT_IN_COMPONENT);

    let /** @type {null | (() => void)} */ destructor = null;
    let /** @type {Set<() => void>[]} */ prevStates = [];
    let disposed = false;
    const clean = () => {
      for (const listeners of prevStates) listeners.delete(listener);
      destructor?.();
    };
    const dispose = () => {
      clean();
      destructor = null;
      prevStates.length = 0;
      disposed = true;
    };

    const listener = _derivedNode((clean) => {
      clean?.();
      const result = cb();
      if (!disposed) {
        prevStates = [...(stateSources.get(listener) || [])];
        for (const listeners of prevStates) {
          listeners.add(listener);
        }
      }
      listener.v = ++nextVersion;

      return result;
    });
    queueUpdate([listener]);

    currentEffectArea.add(dispose);
  };

  /** @template [T=void] @param {() => T} cb */
  const untrack = (cb) => {
    const prev = currentDerived;
    currentDerived = null;
    try {
      return cb();
    } finally {
      currentDerived = prev;
    }
  };

  return {
    $state,
    $derived,
    subtle: {
      currentEffectArea: () => currentEffectArea,
      currentDerived: () => currentDerived,
      queueUpdate,
      effectArea,
      $effect,
      untrack,
      unwrap,
    },
  };
});
