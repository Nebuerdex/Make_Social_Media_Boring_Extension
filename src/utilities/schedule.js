/**
 * Coalesce work onto animation frames / microtasks.
 * @module utilities/schedule
 */

/**
 * @param {() => void} fn
 * @returns {() => void} schedule (call repeatedly; runs once per frame)
 */
export function createRafCoalescer(fn) {
  let scheduled = false;
  return () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      fn();
    });
  };
}

/**
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
export function silent(fn) {
  try {
    return fn();
  } catch {
    return /** @type {T} */ (undefined);
  }
}
