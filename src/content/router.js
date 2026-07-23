/**
 * URL → page-type router + SPA navigation detection.
 * Primary: History API hooks. Backup: href polling (slow).
 * @module content/router
 */

import { LOG_NAMESPACES } from "../shared/constants.js";
import { createLogger } from "../utilities/logger.js";

const log = createLogger(LOG_NAMESPACES.ROUTER);

/** @typedef {'home' | 'popular' | 'all' | 'subreddit' | 'comments' | 'user' | 'search' | 'multireddit' | 'saved' | 'other'} PageType */

/**
 * @param {string} [href]
 * @returns {{ type: PageType, path: string, href: string }}
 */
export function parseLocation(href = location.href) {
  let url;
  try {
    url = new URL(href);
  } catch {
    return { type: "other", path: "/", href };
  }

  const path = url.pathname.replace(/\/+$/, "") || "/";
  const lower = path.toLowerCase();

  if (lower === "/" || lower === "/home" || lower.startsWith("/home/")) {
    return { type: "home", path, href };
  }
  if (lower === "/r/popular" || lower.startsWith("/r/popular/")) {
    return { type: "popular", path, href };
  }
  if (lower === "/r/all" || lower.startsWith("/r/all/")) {
    return { type: "all", path, href };
  }
  if (/^\/r\/[^/]+\/comments\//i.test(path)) {
    return { type: "comments", path, href };
  }
  if (/^\/r\/[^/+]+$/i.test(path) || /^\/r\/[^/+]+\//i.test(path)) {
    if (path.includes("+")) {
      return { type: "multireddit", path, href };
    }
    return { type: "subreddit", path, href };
  }
  if (/^\/user\//i.test(path) || /^\/u\//i.test(path)) {
    return { type: "user", path, href };
  }
  if (lower.startsWith("/search")) {
    return { type: "search", path, href };
  }
  if (lower.includes("/saved")) {
    return { type: "saved", path, href };
  }

  return { type: "other", path, href };
}

/**
 * @param {(route: ReturnType<typeof parseLocation>) => void} onNavigate
 * @returns {{ getRoute: () => ReturnType<typeof parseLocation>, destroy: () => void }}
 */
export function createRouter(onNavigate) {
  let current = parseLocation();
  let destroyed = false;
  let pollTimer = 0;

  const emit = (reason) => {
    if (destroyed) return;
    const next = parseLocation();
    if (next.href === current.href && next.type === current.type) return;
    current = next;
    log.info(`Navigate (${reason}) → ${next.type}`, next.path);
    try {
      onNavigate(next);
    } catch (err) {
      log.error("onNavigate failed", err);
    }
  };

  const wrapHistory = (methodName) => {
    const original = history[methodName].bind(history);
    history[methodName] = function patched(...args) {
      const result = original(...args);
      queueMicrotask(() => emit(methodName));
      return result;
    };
    return original;
  };

  const originalPush = wrapHistory("pushState");
  const originalReplace = wrapHistory("replaceState");

  const onPop = () => emit("popstate");
  window.addEventListener("popstate", onPop);

  // Backup: Reddit occasionally mutates URL without History API.
  pollTimer = window.setInterval(() => emit("poll"), 2000);

  log.info(`Router ready → ${current.type}`, current.path);

  return {
    getRoute: () => current,
    destroy: () => {
      destroyed = true;
      window.removeEventListener("popstate", onPop);
      window.clearInterval(pollTimer);
      history.pushState = originalPush;
      history.replaceState = originalReplace;
    },
  };
}
