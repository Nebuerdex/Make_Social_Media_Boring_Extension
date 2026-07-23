/**
 * Reddit site adapter — full anti-algorithm pipeline.
 * @module sites/reddit
 */

import { LOG_NAMESPACES } from "../../shared/constants.js";
import { queryAll } from "../../utilities/dom.js";
import { createLogger } from "../../utilities/logger.js";
import { createRafCoalescer } from "../../utilities/schedule.js";
import { SELECTORS } from "../../utilities/selectors.js";
import { createFeedObserver } from "../observer.js";
import {
  invalidateCaches,
  runFullPass,
  runPipeline,
  setObserverControl,
} from "../pipeline.js";
import { createRouter } from "../router.js";

const log = createLogger(LOG_NAMESPACES.SITE);

/**
 * @param {string} hostname
 */
export function matchReddit(hostname) {
  return /(^|\.)reddit\.com$/i.test(hostname);
}

/**
 * @param {{
 *   settings: Record<string, boolean>,
 *   debugLogging: boolean,
 *   onChange: (cb: (next: { settings: Record<string, boolean>, debugLogging: boolean }) => void) => () => void,
 * }} ctx
 */
export function mountReddit(ctx) {
  let settings = ctx.settings;
  /** @type {Set<Element>} */
  const pendingNodes = new Set();

  const html = document.documentElement;
  html.dataset.msmbSite = "reddit";
  html.dataset.msmbReady = "1";
  html.dataset.msmbDebug = ctx.debugLogging ? "1" : "0";

  const applyMarkers = (s, debug) => {
    html.dataset.msmbDebug = debug ? "1" : "0";
    for (const [key, value] of Object.entries(s)) {
      const datasetKey = `msmb${key.charAt(0).toUpperCase()}${key.slice(1)}`;
      html.dataset[datasetKey] = value ? "1" : "0";
    }
  };
  applyMarkers(settings, ctx.debugLogging);

  /**
   * @param {Element[]} added
   */
  function batchScopes(added) {
    /** @type {Set<Element>} */
    const scopes = new Set();
    for (const node of added) {
      const post = node.matches?.(SELECTORS.post)
        ? node
        : node.closest?.(SELECTORS.post);
      if (post?.parentElement) {
        scopes.add(post.parentElement);
        continue;
      }
      const comment = node.matches?.(SELECTORS.comment)
        ? node
        : node.closest?.(SELECTORS.comment);
      if (comment?.parentElement) {
        scopes.add(comment.parentElement);
        continue;
      }
      if (
        node.matches?.("shreddit-feed, shreddit-comment-tree, #siteTable") ||
        node.querySelector?.(SELECTORS.post)
      ) {
        scopes.add(node);
      }
    }
    if (!scopes.size) {
      for (const root of queryAll(
        document,
        "shreddit-feed, #siteTable, shreddit-comment-tree"
      )) {
        scopes.add(root);
      }
    }
    return Array.from(scopes);
  }

  let observerPaused = false;

  const flushIncremental = createRafCoalescer(() => {
    if (!pendingNodes.size) return;
    const batch = Array.from(pendingNodes);
    pendingNodes.clear();
    for (const scope of batchScopes(batch)) {
      runPipeline(scope, settings, { force: false, sort: true });
    }
  });

  const observer = createFeedObserver({
    debounceMs: 160,
    onBatch: (added) => {
      if (observerPaused) return;
      for (const n of added) pendingNodes.add(n);
      flushIncremental();
    },
  });

  setObserverControl({
    pause: () => {
      observerPaused = true;
    },
    resume: () => {
      pendingNodes.clear();
      observerPaused = false;
    },
  });

  const router = createRouter(() => {
    observer.disconnect();
    pendingNodes.clear();
    invalidateCaches();
    window.setTimeout(() => {
      observer.connect();
      runFullPass(settings);
    }, 80);
  });

  const tryConnect = () => {
    if (!observer.connect()) {
      window.setTimeout(tryConnect, 500);
      return;
    }
    runFullPass(settings);
  };
  tryConnect();

  const unsub = ctx.onChange((next) => {
    settings = next.settings;
    applyMarkers(next.settings, next.debugLogging);
    invalidateCaches();
    runFullPass(settings);
  });

  const sweep = window.setInterval(() => {
    for (const feed of queryAll(
      document,
      "shreddit-feed, #siteTable, shreddit-comment-tree"
    )) {
      runPipeline(feed, settings, { force: false, sort: true });
    }
  }, 8000);

  log.info("Mounted Reddit adapter.");

  return () => {
    unsub();
    router.destroy();
    observer.disconnect();
    window.clearInterval(sweep);
  };
}

export const redditAdapter = {
  id: "reddit",
  match: matchReddit,
  /**
   * @param {{
   *   settings: Record<string, boolean>,
   *   debugLogging: boolean,
   *   onChange: (cb: (next: { settings: Record<string, boolean>, debugLogging: boolean }) => void) => () => void,
   * }} ctx
   */
  mount: mountReddit,
};
