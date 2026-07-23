/**
 * WeakMap-backed caches that die with their DOM nodes.
 * @module utilities/cache
 */

/**
 * @template V
 * @returns {{ get: (el: object) => V | undefined, set: (el: object, value: V) => void, has: (el: object) => boolean, delete: (el: object) => void }}
 */
export function createWeakCache() {
  /** @type {WeakMap<object, V>} */
  const map = new WeakMap();
  return {
    get: (el) => map.get(el),
    set: (el, value) => {
      map.set(el, value);
    },
    has: (el) => map.has(el),
    delete: (el) => {
      map.delete(el);
    },
  };
}
