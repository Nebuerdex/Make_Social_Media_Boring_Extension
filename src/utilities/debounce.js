/**
 * Leading/trailing debounce for observer batches (Phase 2+).
 * @module utilities/debounce
 */

/**
 * @template {(...args: never[]) => void} T
 * @param {T} fn
 * @param {number} waitMs
 * @returns {T & { cancel: () => void }}
 */
export function debounce(fn, waitMs) {
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timer;

  const wrapped = /** @type {T & { cancel: () => void }} */ (
    (...args) => {
      if (timer !== undefined) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = undefined;
        fn(...args);
      }, waitMs);
    }
  );

  wrapped.cancel = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };

  return wrapped;
}
