/**
 * Structured, namespace-scoped logging. Disabled unless debugLogging is on.
 * @module utilities/logger
 */

/** @type {boolean} */
let enabled = false;

/**
 * @param {boolean} value
 */
export function setLoggingEnabled(value) {
  enabled = Boolean(value);
}

/**
 * @param {string} namespace
 * @returns {{ debug: Function, info: Function, warn: Function, error: Function }}
 */
export function createLogger(namespace) {
  const prefix = `[${namespace}]`;

  return {
    debug: (...args) => {
      if (enabled) console.debug(prefix, ...args);
    },
    info: (...args) => {
      if (enabled) console.info(prefix, ...args);
    },
    warn: (...args) => {
      // Warnings always surface — failures must remain diagnosable.
      console.warn(prefix, ...args);
    },
    error: (...args) => {
      console.error(prefix, ...args);
    },
  };
}
