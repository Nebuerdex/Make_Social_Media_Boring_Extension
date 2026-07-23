/**
 * Hide engagement-bait posts and chrome (promoted, suggested, panels).
 * Skips posts whose fingerprint has not changed.
 * @module filters/engagementFilter
 */

import { LOG_NAMESPACES } from "../../shared/constants.js";
import { queryAll, queryOne, toggleClass } from "../../utilities/dom.js";
import { createLogger } from "../../utilities/logger.js";
import { SELECTORS } from "../../utilities/selectors.js";
import { classifyPostMedia } from "../media/mediaDetector.js";
import { collectPosts } from "../posts/postCollector.js";
import { isBaitDomain, isClickbaitTitle } from "./keywordFilter.js";

const log = createLogger(LOG_NAMESPACES.FILTER);
const HIDE = "msmb-filter-hide";

/** @type {WeakMap<Element, string>} */
const fingerprints = new WeakMap();

/** @type {string} */
let lastChromeKey = "";

/**
 * @param {Element} post
 * @returns {string}
 */
function postFingerprint(post) {
  return [
    post.getAttribute("id") || "",
    post.getAttribute("permalink") || "",
    post.getAttribute("post-type") || "",
    post.getAttribute("content-href") || post.getAttribute("data-url") || "",
    post.getAttribute("score") || "",
    post.hasAttribute("promoted") ? "1" : "0",
  ].join("|");
}

/**
 * @param {Element} post
 * @returns {string}
 */
function readTitle(post) {
  return (
    post.getAttribute("post-title") ||
    post.getAttribute("title") ||
    queryOne(post, "a[slot='title'], a[data-click-id='body'], a.title")?.textContent ||
    ""
  ).trim();
}

/**
 * @param {Element} post
 * @param {Record<string, boolean>} settings
 * @returns {boolean}
 */
function shouldHidePost(post, settings) {
  if (settings.hidePromoted) {
    if (post.matches?.(SELECTORS.promoted) || post.closest?.(SELECTORS.promoted)) {
      return true;
    }
    if (
      post.hasAttribute("promoted") ||
      post.getAttribute("is-promoted") === "true" ||
      /promoted|sponsored/i.test(post.getAttribute("aria-label") || "")
    ) {
      return true;
    }
  }

  if (settings.hideSuggested) {
    const label = `${post.getAttribute("noun") || ""} ${post.getAttribute("aria-label") || ""}`;
    if (/suggest|recommend|because you/i.test(label)) return true;
  }

  const { isImagePost, isVideoPost } = classifyPostMedia(post);

  if (settings.hideImages && isImagePost) return true;
  if (settings.hideVideos && isVideoPost) return true;

  const href =
    post.getAttribute("content-href") ||
    post.getAttribute("data-url") ||
    "";
  if (settings.hideVideos && isBaitDomain(href)) return true;

  // Clickbait check only when title attr exists (avoid DOM reads)
  const titleAttr = post.getAttribute("post-title") || post.getAttribute("title");
  const title = titleAttr || (isImagePost || isVideoPost ? readTitle(post) : "");
  if (title && isClickbaitTitle(title) && (isImagePost || isVideoPost || isBaitDomain(href))) {
    return true;
  }

  return false;
}

/**
 * @param {ParentNode} root
 * @param {Record<string, boolean>} settings
 * @param {{ force?: boolean }} [opts]
 * @returns {number}
 */
export function applyEngagementFilters(root, settings, opts = {}) {
  const force = Boolean(opts.force);
  let hidden = 0;
  const posts = collectPosts(root);

  for (const post of posts) {
    const fp = postFingerprint(post);
    if (!force && fingerprints.get(post) === fp) continue;
    fingerprints.set(post, fp);

    const hide = shouldHidePost(post, settings);
    const was = post.classList.contains(HIDE);
    toggleClass(post, HIDE, hide);
    if (hide && !was) hidden += 1;
  }

  if (settings.hidePromoted) {
    // Scope promoted query to root when possible
    const scope = root instanceof Document ? document : root;
    queryAll(scope, SELECTORS.promoted).forEach((el) => {
      if (!el.classList.contains(HIDE)) {
        toggleClass(el, HIDE, true);
        hidden += 1;
      }
    });
  }

  if (hidden) log.debug(`Hidden ${hidden} unit(s).`);
  return hidden;
}

/**
 * @param {Record<string, boolean>} settings
 * @param {{ force?: boolean }} [opts]
 */
export function applyChromeFilters(settings, opts = {}) {
  const key = [
    settings.hideSidebars,
    settings.hideTrendingPanels,
    settings.hideRecommendationPanels,
    settings.hideProfileCards,
    settings.hideAwards,
    settings.compactLayout,
  ].join(",");

  if (!opts.force && key === lastChromeKey) return;
  lastChromeKey = key;

  const root = document.documentElement;
  root.classList.toggle("msmb-hide-sidebars", Boolean(settings.hideSidebars));
  root.classList.toggle("msmb-hide-trending", Boolean(settings.hideTrendingPanels));
  root.classList.toggle(
    "msmb-hide-recommendations",
    Boolean(settings.hideRecommendationPanels)
  );
  root.classList.toggle("msmb-hide-profile-cards", Boolean(settings.hideProfileCards));
  root.classList.toggle("msmb-hide-awards", Boolean(settings.hideAwards));
  root.classList.toggle("msmb-compact", Boolean(settings.compactLayout));
}

/** Reset skip-caches after settings change / navigation */
export function resetFilterCaches() {
  lastChromeKey = "";
}
