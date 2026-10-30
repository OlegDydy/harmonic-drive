//@ts-check

/** @template [T=unknown] @typedef {{ get(): T }} Signal */
const __signals = mod.sync(() => {
  // A custom implementation of the [JS Signals proposal](https://github.com/tc39/proposal-signals)
  // that uses [Preact's approach](https://preactjs.com/blog/signal-boosting) to implementing the dependency graph.

  /**
   * A modified version of the DCEL where we move around vertices instead of faces.
   * @typedef {{ targ: WeakRef<ComputeNode>; prev: HalfEdge | null; next: HalfEdge | null; twin: HalfEdge; }} HalfEdge Dependency as half-edge
   * @typedef {{ signal: Signal & { [NOTIFY]?: () => void }; state: ComputeState; sources: HalfEdge | null; sourcesTail: HalfEdge | null; sinks: HalfEdge | null; sinksTail: HalfEdge | null; onWatched?: (() => void) | null; onUnwatched?: (() => void) | null; }} ComputeNode
   */
  /**
   * @template T @template {Signal<T>} This
   * @typedef {{ equals?(a: T, b: T): boolean; [WATCHED]?(this: This): void; [UNWATCHED]?(this: This): void; }} SignalOptions
   */
  /** @template [T=unknown] {{ get(): T; }} Signal */
  /** @template {string} V @typedef {{ [K in V]: K }} Enum */

  /**
   * dirty -> computing; computing -> clean; clean -> dirty/checked; checked -> clean/dirty.
   * @enum {'dirty' | 'computing' | 'clean' | 'checked'}
   */
  const ComputeState = /** @type {Enum<ComputeState>} */ ({
    dirty: "dirty",
    computing: "computing",
    clean: "clean",
    checked: "checked",
  });

  const WATCHED = Symbol("watched");
  const UNWATCHED = Symbol("unwatched");
  const NOTIFY = Symbol("notify");

  const E_FROZEN_READ = "Reading signals not permitted during Watcher callback";
  const E_FROZEN_WRITE = "Writes to signals not permitted during Watcher callback";
  const E_FROZEN_WATCHER = "Calling watcher methods not permitted during Watcher callback";
  const E_COMPUTING = "Signals cannot be read during the computing";
  const E_INVALID_DCEL = "Invalid list structure!";
  const E_EXTERNAL_SIGNAL = "Signal not derived from State or Computed";
  const E_NOTIFICATION_ERRORS = "Errors during notification phase";

  /** @param {Signal} signal @param {SignalOptions<unknown, Signal>} options @returns {ComputeNode} */
  const dcel_newNode = (signal, options) => ({
    signal,
    state: ComputeState.clean,
    sinks: null,
    sinksTail: null,
    sources: null,
    sourcesTail: null,
    onWatched: options[WATCHED]?.bind(signal),
    onUnwatched: options[UNWATCHED]?.bind(signal),
  });

  const TWIN_STUB = /** @type {HalfEdge} */ (/** @type {unknown} */ (null));

  // Optimized for Terser
  /** @param {ComputeNode} source @param {ComputeNode} sink @returns {void} */
  const dcel_connect = (source, sink) => {
    const /** @type {HalfEdge} */ edge = {
        targ: new WeakRef(sink),
        next: null,
        prev: source.sinksTail,
        twin: TWIN_STUB,
      },
      /** @type {HalfEdge} */ twin = { targ: new WeakRef(source), next: null, prev: sink.sourcesTail, twin: edge };
    edge.twin = twin;

    if (source.sinksTail) {
      source.sinksTail.next = edge;
    } else {
      source.sinks = edge;
    }
    source.sinksTail = edge;

    if (sink.sourcesTail) {
      sink.sourcesTail.next = twin;
    } else {
      sink.sources = twin;
    }
    sink.sourcesTail = twin;
  };

  /** @param {HalfEdge | null | undefined} root @param {(node: ComputeNode, edge: HalfEdge) => void} cb @returns {void} */
  const dcel_each = (root, cb) => {
    while (root) {
      const edge = root;
      root = root.next;
      const target = edge.targ.deref();
      if (target) {
        cb(target, edge);
      } else {
        dcel_delete(edge);
      }
    }
  };

  /** @param {HalfEdge} edge @returns {void} */
  const dcel_delete = (edge) => {
    _dcel_unlink(edge);
    _dcel_unlink(edge.twin);
  };

  /** @param {HalfEdge} edge @returns {void} */
  const _dcel_unlink = (edge) => {
    const { prev, next, twin } = edge;
    const node = twin.targ.deref();

    if (prev) {
      prev.next = next;
    } else if (node) {
      if (node.sinks === edge) {
        node.sinks = edge.next;
      } else if (node.sources === edge) {
        node.sources = edge.next;
      } else throw new TypeError(E_INVALID_DCEL);
    }

    if (next) {
      next.prev = prev;
    } else if (node) {
      if (node.sinksTail === edge) {
        node.sinksTail = edge.prev;
      } else if (node.sourcesTail === edge) {
        node.sourcesTail = edge.prev;
      } else throw new TypeError(E_INVALID_DCEL);
    }
  };

  let /** @type {ComputeNode | undefined} */ computing = undefined;
  let frozen = false;
  const /** @type {Set<() => void>} */ toNotify = new Set();

  /**
   * @todo Should the Watcher fire again in stale branch or not? Probably not, since the decision to use signals
   * is made by the Watcher itself.
   * @param {ComputeNode} node @returns {void}
   */
  const pushChecked = (node) =>
    dcel_each(node.sinks, (sink) => {
      const { state, signal } = sink;
      if (state == ComputeState.clean) {
        sink.state = ComputeState.checked;
        pushChecked(sink);
      }
      if (signal[NOTIFY]) toNotify.add(signal[NOTIFY]);
    });

  /** @param {ComputeNode} node @returns {void} */
  const pushDirty = (node) =>
    dcel_each(node.sinks, (sink) => {
      const { state, signal } = sink;
      if (state == ComputeState.clean) {
        sink.state = ComputeState.dirty;
        pushChecked(sink);
      } else if (state == ComputeState.checked) {
        sink.state = ComputeState.dirty;
      }
      if (signal[NOTIFY]) toNotify.add(signal[NOTIFY]);
    });

  /** @param {ComputeNode} node @returns {void} */
  const markDirty = (node) =>
    dcel_each(node.sinks, (sink) => {
      if (sink.state != ComputeState.computing) {
        sink.state = ComputeState.dirty;
      }
    });

  const /** @type {WeakMap<Signal<any> | Watcher, ComputeNode>} */ _signals = new WeakMap();

  /** @template [T = any] @implements {Signal<T>} */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class State {
    /** @type {T} */ #value;
    /** @type {unknown} */ #error;
    /** @type {ComputeNode} */ #node;
    /** @type {(a: T, b: T) => boolean} */ #eq;

    /** @param {T} value @param {SignalOptions<T, State<T>>} options */
    constructor(value, options = {}) {
      this.#value = value;
      this.#node = dcel_newNode(this, {});
      this.#eq = options.equals || Object.is;
      _signals.set(this, this.#node);
    }

    /** @returns {T} */
    get() {
      if (computing) {
        dcel_connect(this.#node, computing);
      }
      if (frozen) {
        throw new Error(E_FROZEN_READ);
      }
      if (this.#error != undefined) {
        throw this.#error;
      }

      return this.#value;
    }

    /** @param {T} value @returns {void} */
    set(value) {
      if (frozen) {
        throw new Error(E_FROZEN_WRITE);
      }

      try {
        if (this.#eq(this.#value, value)) {
          return;
        }

        this.#error = undefined;
        this.#value = value;

        const /** @type {unknown[]} */ errors = [];
        toNotify.clear();
        pushDirty(this.#node);

        for (const notify of toNotify) {
          try {
            notify();
          } catch (notifyError) {
            errors.push(notifyError);
          }
        }
        if (errors.length) {
          throw new AggregateError(errors, E_NOTIFICATION_ERRORS);
        }
      } catch (e) {
        this.#error = e;
        throw e;
      }
    }
  }

  const Unset = new Error("Unset");

  /** @template [T = any] @implements {Signal<T>} */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class Computed {
    #value = /** @type {T} */ (undefined);
    /** @type {unknown} */ #error = Unset;
    /** @type {ComputeNode} */ #node;
    /** @type {(a: T, b: T) => boolean} */ #eq;
    /** @type {(this: Computed<T>) => T} */ #cb;

    /** @param {(this: Computed<T>) => T} cb @param {SignalOptions<T, Computed<T>>} options */
    constructor(cb, options = {}) {
      this.#node = dcel_newNode(this, options);
      this.#node.state = ComputeState.dirty;
      this.#cb = cb;
      this.#eq = options.equals || Object.is;
      _signals.set(this, this.#node);
    }

    /** @returns {T} */
    get() {
      const node = this.#node;
      if (computing) {
        dcel_connect(node, computing);
      }
      if (frozen) {
        throw new Error(E_FROZEN_READ);
      }

      let { state } = node;

      if (state == ComputeState.clean) {
        if (this.#error != undefined) {
          throw this.#error;
        }

        return this.#value;
      }
      if (state == ComputeState.computing) {
        throw new Error(E_COMPUTING);
      }
      if (state == ComputeState.checked) {
        try {
          dcel_each(node.sources, (src) => src.signal.get());
        } catch {
          // do not leak errors during sources check
        }
        state = node.state;
      }
      if (state == ComputeState.dirty) {
        node.state = ComputeState.computing;
        const parent = computing;
        try {
          dcel_each(node.sources, (_, edge) => dcel_delete(edge));
          computing = node;
          const nextValue = this.#cb();
          if (this.#error === Unset || !this.#eq(this.#value, nextValue)) {
            this.#value = nextValue;
            this.#error = undefined;
            markDirty(node);
          }
        } catch (e) {
          this.#error = e;
          markDirty(node);
          throw e;
        } finally {
          node.state = ComputeState.clean;
          computing = parent;
        }
      } else {
        node.state = ComputeState.clean;
      }
      return this.#value;
    }
  }

  /** @template [T = void] @param {() => T} cb @returns {T} */
  const untrack = (cb) => {
    const parent = computing;
    computing = undefined;
    try {
      return cb();
    } finally {
      computing = parent;
    }
  };

  class Watcher {
    /** @type {ComputeNode} */ #node;
    /** @type {(this: Watcher) => void} */ #cb;
    /** @type {WeakSet<Signal>} */ #watched = new WeakSet();

    /** @param {(this: Watcher) => void} cb */
    constructor(cb) {
      this.#node = dcel_newNode(/** @type {Signal} */ (/** @type {unknown} */ (this)), {});
      this.#cb = cb;
      _signals.set(this, this.#node);
    }

    /** @returns {void} */
    [NOTIFY] = () => {
      const prevFrozen = frozen;
      try {
        frozen = true;
        this.#cb();
      } finally {
        frozen = prevFrozen;
      }
    };

    // The proposal requires the Watcher to subscribe to the entire dependency tree. However, given the dynamic
    // nature of the dependency tree, this makes the code unnecessarily complex and slow without a clear reason.
    /** @param {...Signal} signals @returns {void} */
    watch(...signals) {
      if (frozen) {
        throw new Error(E_FROZEN_WATCHER);
      }

      const node = this.#node;
      const set = this.#watched;
      dcel_each(node.sources, (node) => set.add(node.signal));

      for (const signal of signals) {
        if (!set.has(signal)) {
          const source = _signals.get(signal);
          if (!source) {
            throw new TypeError(E_EXTERNAL_SIGNAL);
          }

          try {
            frozen = true;
            if (source.onWatched && !source.sinks) source.onWatched();
          } finally {
            frozen = false;
          }
          dcel_connect(source, node);
          set.add(signal);
        }
      }
    }

    /** @param {...Signal} signals @returns {void} */
    unwatch(...signals) {
      if (frozen) {
        throw new Error(E_FROZEN_WATCHER);
      }

      const toRemove = new Set(signals);

      dcel_each(this.#node.sources, (node, edge) => {
        if (toRemove.has(node.signal)) {
          dcel_delete(edge);
          try {
            frozen = true;
            if (node.onUnwatched && !node.sinks) node.onUnwatched();
          } finally {
            frozen = false;
          }
          this.#watched.delete(node.signal);
        }
      });
    }

    /** @returns {Signal[]} */
    getPending() {
      const /** @type {Signal[]} */ sources = [];
      dcel_each(this.#node.sources, (node) => {
        if (node.state == ComputeState.dirty || node.state == ComputeState.checked) sources.push(node.signal);
      });
      return sources;
    }
  }

  /** @param {Computed | Watcher} signal @returns {(State | Computed)[]} */
  const introspectSources = (signal) => {
    const /** @type {Signal[]} */ result = [];
    dcel_each(_signals.get(signal)?.sources, (src) => result.push(src.signal));
    return /** @type {(State | Computed)[]} */ (result);
  };

  /** @param {State | Computed} signal @returns {(Computed | Watcher)[]} */
  const introspectSinks = (signal) => {
    const /** @type {Signal[]} */ result = [];
    dcel_each(_signals.get(signal)?.sinks, (src) => result.push(src.signal));
    return /** @type {(Computed | Watcher)[]} */ (result);
  };

  /** @param {Computed | Watcher} signal @returns {boolean} */
  const hasSources = (signal) => !!_signals.get(signal)?.sources;

  /** @param {State | Computed} signal @returns {boolean} */
  const hasSinks = (signal) => !!_signals.get(signal)?.sinks;

  return {
    State,
    Computed,
    subtle: {
      untrack,
      currentComputed: () => /** @type {Computed | undefined} */ (computing?.signal),
      introspectSources,
      introspectSinks,
      hasSinks,
      hasSources,
      Watcher,
      watched: WATCHED,
      unwatched: UNWATCHED,
    },
  };
});
