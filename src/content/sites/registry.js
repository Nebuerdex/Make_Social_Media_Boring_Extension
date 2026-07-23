/**
 * Resolve which site adapter handles the current hostname.
 * @module sites/registry
 */

import { PLATFORM_ADAPTERS } from "./platformConfigs.js";
import { redditAdapter } from "./reddit.js";

const ADAPTERS = [redditAdapter, ...PLATFORM_ADAPTERS];

/**
 * @param {string} [hostname]
 * @returns {{ id: string, match: Function, mount: Function } | null}
 */
export function resolveAdapter(hostname = location.hostname) {
  const host = hostname.replace(/^www\./i, "").toLowerCase();
  for (const adapter of ADAPTERS) {
    try {
      if (adapter.match(host) || adapter.match(hostname)) return adapter;
    } catch {
      /* ignore */
    }
  }
  return null;
}

export function listAdapters() {
  return ADAPTERS.map((a) => a.id);
}
