/**
 * Scoped MutationObserver. Observes feed roots only — never document.body alone.
 * Debounces batches; ignores our own class toggles via attributeFilter omission.
 * @module content/observer
 */

import { LOG_NAMESPACES } from "../shared/constants.js";
import { debounce } from "../utilities/debounce.js";
import { queryAll } from "../utilities/dom.js";
import { createLogger } from "../utilities/logger.js";
import { SELECTORS } from "../utilities/selectors.js";

const log = createLogger(LOG_NAMESPACES.OBSERVER);

/**
 * @param {{ onBatch: (added: Element[]) => void, debounceMs?: number }} options
 */
export function createFeedObserver(options) {
  const { onBatch, debounceMs = 120 } = options;

  /** @type {MutationObserver | null} */
  let observer = null;
  /** @type {Set<Element>} */
  const pending = new Set();
  /** @type {Element[]} */
  let roots = [];

  const flush = debounce(() => {
    if (pending.size === 0) return;
    const batch = Array.from(pending);
    pending.clear();
    log.debug(`Detected ${batch.length} new nodes.`);
    try {
      onBatch(batch);
    } catch (err) {
      log.error("onBatch failed", err);
    }
  }, debounceMs);

  const handleMutations = (mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        pending.add(/** @type {Element} */ (node));
      }
    }
    flush();
  };

  const resolveRoots = () => {
    const found = queryAll(document, SELECTORS.feedRoots);
    // Prefer concrete feed elements over bare <main> when both exist.
    const concrete = found.filter((el) => {
      const tag = el.tagName;
      if (tag === "SHREDDIT-FEED" || tag === "FACEPLATE-TRACKER") return true;
      if (el.id === "siteTable" || el.id === "comment-tree") return true;
      if (tag === "SHREDDIT-COMMENT-TREE") return true;
      if (el.getAttribute("data-testid") === "post-list") return true;
      return false;
    });
    const chosen = concrete.length ? concrete : found.slice(0, 2);
    // Always include document.documentElement as a thin fallback for late mounts —
    // but only childList on element itself? Spec says never observe body if avoidable.
    // We observe chosen roots; if none, observe <main> or #App or shreddit-app.
    if (chosen.length) return chosen;

    const fallback = queryAll(
      document,
      "shreddit-app, #App, #shortcut-results, body > div"
    ).slice(0, 1);
    return fallback;
  };

  const connect = () => {
    disconnect();
    roots = resolveRoots();
    if (!roots.length) {
      log.warn("No feed roots found; retrying later.");
      return false;
    }

    observer = new MutationObserver(handleMutations);
    for (const root of roots) {
      try {
        observer.observe(root, { childList: true, subtree: true });
      } catch (err) {
        log.warn("Failed to observe root", root, err);
      }
    }
    log.info(`Observing ${roots.length} root(s).`);
    return true;
  };

  const disconnect = () => {
    flush.cancel();
    pending.clear();
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    roots = [];
  };

  return {
    connect,
    disconnect,
    /** Force a synthetic full pass by calling onBatch with roots */
    requestFullPass: () => {
      try {
        onBatch(resolveRoots());
      } catch (err) {
        log.error("requestFullPass failed", err);
      }
    },
  };
}
