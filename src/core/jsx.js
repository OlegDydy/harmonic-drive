/**
 * @typedef {Node | string | false | null | undefined} JSXPlain
 * @typedef {JSXPlain | JSXPlain[]} JSXElement
 * @typedef {JSXElement[]} JSXChunkArray
 */
/** @template {Record<string, any>} [Props={}] @template {JSXElement} [R=JSXElement] @typedef {(props: Props) => R} FC */
/** @template [T=any] @typedef {() => T} Getter */
/** @template [T=any] @typedef {(() => T) | T} MaybeGetter */
/** @template [T=any] @typedef {(value: T) => void} Setter */
/** @template [T=any] @typedef {{ (): T; (v: T): void; }} Accessor */
const __jsx = mod.sync(() => {
  const {
    State,
    Computed,
    subtle: { Watcher, untrack },
  } = __signals();

  /** @typedef {Set<() => void>} EffectArea */
  /** @template {{}} [T={}] @typedef {{ original: T; dispose(): void; dirty: boolean; }} WrapContext */

  const SVG_NS = "http://www.w3.org/2000/svg",
    HTML_NS = "http://www.w3.org/1999/xhtml";
  const E_NOT_IN_COMPONENT = "Effects can not be defined outside of a components";
  const E_HOOKS = "life cycle hooks can not be called outside of component";
  const RAW = Symbol("raw");

  /** @template T @param {T} value @returns {value is (NonNullable<T> & { [RAW]: WrapContext<T> })} */
  const isWrapped = (value) => value != null && typeof value == "object" && RAW in value;

  /** @param {any} obj @param {() => void} [onChange] */
  const wrap = (obj, onChange) => {
    if (!obj || typeof obj != "object") return obj;

    const /** @type {WrapContext} */ ctx = {
        original: obj,
        dirty: false,
        dispose() {
          onChange = undefined;
        },
      };
    const result = new Proxy(obj, {
      set(target, prop, newValue, receiver) {
        if (prop != RAW && newValue !== target[prop]) {
          ctx.dirty = true;
          onChange?.();
        }
        return Reflect.set(target, prop, newValue, receiver);
      },
    });
    result[RAW] = ctx;

    return result;
  };

  /** @template T @param {T} obj @returns {T} */
  const unwrap = (obj) => (isWrapped(obj) ? obj[RAW].original : obj);

  /** @template [T=unknown] @param {T} value @param {(v: T) => T} process @param {(a: T, b: T) => boolean} equals @returns {Accessor<T>} */
  const _state = (value, process, equals) => {
    value = process(unwrap(value));
    const signal = new State(value, { equals });
    return /** @type {Accessor<T>} */ (
      /** @param {[value: T]|[]} args */
      (...args) => {
        if (!args.length) return signal.get();

        const next = unwrap(args[0]);
        if (isWrapped(value)) {
          const ctx = value[RAW];
          if (ctx.original === next) {
            signal.set(value);
            ctx.dirty = false;
            return;
          } else {
            ctx.dispose();
          }
        }

        value = process(next);
        signal.set(value);
      }
    );
  };

  /** @template T @param {T} value @param {(a: T, b: T) => boolean} eq @returns {Accessor<T>} */
  const $state = (value, eq = Object.is) => {
    const result = /** @type {typeof _state<T>} */ (_state)(
      value,
      (v) => wrap(v, () => result(v)),
      (prev, next) => {
        if (isWrapped(prev) && prev[RAW].dirty) return false;
        return eq(prev, next);
      },
    );
    return result;
  };
  /** @template T @param {T} value @param {(a: T, b: T) => boolean} eq @returns {Accessor<T>} */
  $state.raw = (value, eq = Object.is) => /** @type {typeof _state<T>} */ (_state)(value, (i) => i, eq);

  /** @template T @param {() => T} cb @param {(a: T, b: T) => boolean} equals @returns {Getter<T>} */
  const $derived = (cb, equals = Object.is) => {
    const signal = new Computed(cb, { equals });
    return () => signal.get();
  };

  let queued = false;
  const MAX_DEPTH = 20;
  const queueEffect = () => {
    if (!queued) {
      queued = true;
      queueMicrotask(() => {
        try {
          let depth = MAX_DEPTH;
          // let updated = 0;
          let /** @type {Signal[]} */ snapshot;
          while (depth-- && (snapshot = effects.getPending()).length) {
            // updated += snapshot.length;
            for (const effector of snapshot) effector.get();
          }
          // console.debug(`[jsx-debug] Depth: ${MAX_DEPTH - depth}; updated: ${updated}`);
          if (depth == 0 && (snapshot = effects.getPending()).length) {
            console.warn("[jsx] Too many updates. The dependency graph likely contains a cycle.", snapshot);
          }
        } finally {
          queued = false;
        }
      });
    }
  };

  let /** @type {EffectArea | null} */ currentEffectArea = null;

  /** @param {(area: EffectArea) => void} cb @param {EffectArea | null} [parent] */
  const effectArea = (cb, parent) => {
    const prev = parent || currentEffectArea;
    const /** @type {EffectArea} */ area = new Set();
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

  const effects = new Watcher(queueEffect);

  /** @param {() => (() => void) | void} cb */
  const $effect = (cb) => {
    if (!currentEffectArea) throw new Error(E_NOT_IN_COMPONENT);

    let /** @type {(() => void) | void} */ cleanup;
    const signal = new Computed(() => {
      cleanup?.();
      cleanup = cb();
    });
    const dispose = () => {
      cleanup?.();
      cleanup = undefined;
      effects.unwatch(signal);
    };

    effects.watch(signal);
    queueEffect();
    currentEffectArea.add(dispose);
  };

  let /** @type {Document | XMLDocument} */ doc = document;
  let docNS = doc.lookupNamespaceURI("") || HTML_NS;

  /** @param {string | Node} el */
  const materialize = (el) => {
    return typeof el === "string" ? doc.createTextNode(el) : el;
  };

  /** @param {Node[]} chunk @param {JSXElement | JSXChunkArray} value @param {Node} anchor */
  const assignChunk = (chunk, value, anchor) => {
    if (!Array.isArray(value)) value = [value];
    const materialized = value
      .flat()
      .filter(/** @return {i is Node | string} */ (i) => !!i)
      .map(materialize);
    if (!materialized.length) materialized.push(anchor);

    const end = chunk[0];
    if (end === materialized[0]) return chunk;

    const root = end.parentNode;
    if (root) {
      for (const child of materialized) root.insertBefore(child, end);
      for (const child of chunk) {
        if (child.parentElement) root.removeChild(child);
      }
      chunk.length = 0;
      chunk.push(...materialized);
    }
  };

  /** @template [T2=unknown] @overload @param {Accessor<T2>} v @returns {T2} */
  /** @template [T=unknown] @overload @param {MaybeGetter<T>} v @returns {T} */
  /** @template [T=unknown] @param {MaybeGetter<T>} v */
  const get = (v) => (typeof v == "function" ? /** @type {Getter<T>} */ (v)() : v);

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

  /** @param {Element} node @param {string} event @param {() => void} set @param {() => void} [get] */
  const useListener = (node, event, set, get) => {
    if (get)
      $effect(() => {
        get();
      });

    $effect(() => {
      node.addEventListener(event, set);
      return () => node.removeEventListener(event, set);
    });
  };

  /** @template {string | number | boolean} T @param {HTMLInputElement} input @param {Accessor<T>} value */
  const bindValue = (input, value) => {
    const { type } = input;
    if (type == "radio" || type == "checkbox")
      return useListener(
        input,
        "change",
        () => value(/** @type {T} */ (input.checked)),
        () => (input.checked = !!value()),
      );
    if (type == "number")
      return useListener(
        input,
        "input",
        () => value(/** @type {T} */ (Number(input.value))),
        () => (input.value = "" + value()),
      );

    return useListener(
      input,
      input instanceof HTMLSelectElement ? "change" : "input",
      () => value(/** @type {T} */ (input.value)),
      () => (input.value = "" + value()),
    );
  };

  /** @template {string | number | boolean} T @param {HTMLInputElement} input @param {Accessor<T>} value */
  const bindGroup = (input, value) => {
    return useListener(
      input,
      "change",
      () => {
        if (input.checked) value(/** @type {T} */ (input.value));
      },
      () => (input.checked = input.value === value()),
    );
  };

  /** @typedef {Exclude<keyof SVGElementTagNameMap, keyof HTMLElementTagNameMap>} SVGUniqTags */

  // prettier-ignore
  const svgSpecificTags = new Set([
    "animate", "animateMotion", "animateTransform", "circle", "clipPath", "defs", "desc", "ellipse", "feBlend",
    "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap",
    "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur",
    "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting",
    "feSpotLight", "feTile", "feTurbulence", "filter", "foreignObject", "g", "image", "line", "linearGradient",
    "marker", "mask", "metadata", "mpath", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "set",
    "stop", "svg", "switch", "symbol", "text", "textPath", "tspan", "use", "view",
  ]);

  /**
   * Support `$` shortcut for `children` property
   * @type {{
       <T extends keyof SVGElementTagNameMap>(tag: T, props?: Record<string, any> | undefined): SVGElementTagNameMap[T];
       <T extends keyof HTMLElementTagNameMap>(tag: T, props?: Record<string, any> | undefined): HTMLElementTagNameMap[T];
       (tag: Element | string, props?: Record<string, any> | undefined): Element;
   }}
   * @param {string | Element} tag @param {Record<string, any>} props @returns {Element}
   */
  const jsx = (tag, props = {}) => {
    let result;
    if (typeof tag == "string") {
      let [prefix, tagName] = tag.split(":");
      if (tagName) {
        const ns = doc.lookupNamespaceURI(prefix);
        if (!ns) throw new Error(`Unknown name space prefix "${prefix}"`);
        result = doc.createElementNS(ns, tagName);
      } else {
        tagName = prefix;
        const ns = docNS === HTML_NS ? (svgSpecificTags.has(tag) ? SVG_NS : HTML_NS) : docNS;
        result = doc.createElementNS(ns, tagName);
      }
    } else {
      result = tag;
    }

    const /** @type {((() => JSXPlain) | JSXElement)[] | null} */ children = props.$ || props.children;
    delete props.$;
    delete props.children;
    for (const prop in props) {
      const value = props[prop];
      const [prefix, name] = prop.split(":");
      const ns = result.lookupNamespaceURI(prefix) || doc.lookupNamespaceURI(prefix);
      if (prefix == "bind") {
        switch (typeof value == "function" && name) {
          // Built-in bindings
          case "this":
            value(result);
            onDestroy(() => value(undefined));
            break;
          case "value":
            bindValue(/** @type {HTMLInputElement} */ (result), value);
            break;
          case "group":
            bindGroup(/** @type {HTMLInputElement} */ (result), value);
            break;
          default:
            /** @todo fallback to MutationObserver */
            throw new Error("Unsupported binding");
        }
      } else if (name && ns) {
        if (typeof value == "function") {
          if (name.startsWith("on")) {
            useListener(result, name.slice(2), value);
          } else {
            $effect(() => {
              const v = value();
              if (v != null && v !== false) result.setAttributeNS(ns, prop, v);
              else result.removeAttributeNS(ns, prop);
            });
          }
        } else if (value != null && value !== false) result.setAttributeNS(ns, prop, value);
      } else {
        if (typeof value == "function")
          if (prop.startsWith("on")) {
            useListener(result, prop.slice(2), value);
          } else {
            $effect(() => {
              const v = value();
              if (v != null && v !== false) result.setAttribute(prop, v);
              else result.removeAttribute(prop);
            });
          }
        else if (value != null && value !== false) result.setAttribute(prop, value);
      }
    }
    if (children) {
      for (const child of children.flat()) {
        const value = typeof child == "function" ? child() : child;
        if (value) result.append(value);
      }
    }

    return result;
  };

  const makeAnchor = () => doc.createComment("");

  /** @param {MaybeGetter<unknown>} getter */
  const $text = (getter) => {
    if (typeof getter !== "function") return "" + getter;

    const result = doc.createTextNode(untrack(/** @type {Getter<any>} */ (getter)));
    $effect(() => {
      const value = getter();
      result.data = value ? "" + value : "";
    });
    return result;
  };

  /** @param {Element} target @param {() => JSXElement | JSXChunkArray} render */
  const $portal = (target, render) => {
    const anchor = makeAnchor();
    const /** @type {Node[]} */ chunk = [anchor];
    const data = render();
    onMount(() => {
      target.append(anchor);
      assignChunk(chunk, data, anchor);

      return () => {
        assignChunk(chunk, [anchor], anchor);
        chunk.length = 0;
        target.removeChild(anchor);
      };
    });
    return anchor;
  };

  /** @param {[cond: () => any, render: () => JSXElement | JSXChunkArray][]} cases @param {() => JSXElement} [_default] */
  const $switch = (cases, _default) => {
    const area = currentEffectArea;
    if (!area) throw new Error(E_NOT_IN_COMPONENT);

    const anchor = makeAnchor();
    const /** @type {Node[]} */ chunk = [anchor];
    const next = $derived(() => {
      for (const [cond, render] of cases) {
        if (cond()) {
          return render;
        }
      }
      return _default;
    });
    $effect(() =>
      effectArea(() => {
        const n = next()?.();
        assignChunk(chunk, n, anchor);
      }, area),
    );
    // onDestroy;
    area.add(() => {
      assignChunk(chunk, [], anchor);
      anchor.parentElement?.removeChild(anchor);
    });

    return anchor;
  };

  /** @typedef {{ chunk: Node[]; anchor: Comment; dispose(): void; }} CacheEntry */
  /**
   * @todo Implement key-based cache
   * @template T
   * @param {() => T[]} list
   * @param {(item: T, index: number) => JSXElement | JSXChunkArray} render
   * @param {(item: T) => unknown} [key]
   */
  const $each = (list, render, key) => {
    const area = currentEffectArea;
    if (!area) throw new Error(E_NOT_IN_COMPONENT);

    const /** @type {Map<unknown, CacheEntry>} */ cache = new Map();
    const anchor = makeAnchor();
    const /** @type {Node[]} */ chunk = [anchor];
    $effect(() => {
      effectArea(() => {
        const /** @type {JSXElement[]} */ next = [];
        for (let i = 0, _list = list(); i < _list.length; ++i) {
          const data = render(_list[i], i);
          if (Array.isArray(data)) next.push(...data);
          else next.push(data);
        }
        assignChunk(chunk, next, anchor);
      }, area);
    });
    // onDestroy
    area.add(() => {
      assignChunk(chunk, [], anchor);
      anchor.parentElement?.removeChild(anchor);
    });

    return anchor;
  };

  /** @param {() => void | (() => void)} cb */
  const onMount = (cb) => $effect(() => untrack(cb));

  /** @param {() => void} cb */
  const onDestroy = (cb) => {
    const area = currentEffectArea;
    if (!area) throw new Error(E_HOOKS);

    area.add(cb);
  };

  /** @param {() => JSXElement | JSXChunkArray} component @param {Element} target */
  const render = (component, target) =>
    effectArea(() => {
      if (!target) throw new Error("Mount point is not provided");

      const anchor = doc.createComment("");
      const /** @type {Node[]} */ chunk = [anchor];
      const data = component();
      target.append(...chunk);
      assignChunk(chunk, Array.isArray(data) ? data.flat() : data, anchor);
      onDestroy(() => {
        assignChunk(chunk, [anchor], anchor);
        target.removeChild(anchor);
      });
    });

  return {
    render,
    xmlDocument,
    jsx,
    onMount,
    onDestroy,
    $state,
    $derived,
    $effect,
    $text,
    $portal,
    $switch,
    $each,
    get,
    untrack,
    unwrap,
  };
});
