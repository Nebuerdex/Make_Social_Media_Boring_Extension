/**
 * Remove / collapse visual media according to settings.
 * Heavy lifting is CSS injected once per shadow host; avoid full-document scans.
 * @module media/mediaRemover
 */

import { LOG_NAMESPACES } from "../../shared/constants.js";
import { forEachRelevantShadow, queryAll, toggleClass } from "../../utilities/dom.js";
import { createLogger } from "../../utilities/logger.js";
import { elementIsDecorativeIcon } from "./mediaDetector.js";

const log = createLogger(LOG_NAMESPACES.MEDIA);
const HIDE = "msmb-media-hide";
const STYLE_ATTR = "data-msmb-media-style";

/** @type {WeakSet<ShadowRoot>} */
const styledShadows = new WeakSet();

/** @type {string} */
let cachedCss = "";

/**
 * @param {{ hideImages: boolean, hideVideos: boolean, hideAvatars: boolean, hideSubredditIcons: boolean, compactLayout: boolean }} settings
 */
function buildShadowCss(settings) {
  const rules = [];
  const compact = settings.compactLayout
    ? "height:0!important;max-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;border:0!important;"
    : "";

  if (settings.hideImages) {
    rules.push(`
      img:not([data-msmb-keep]), picture, faceplate-img:not([data-msmb-keep]),
      gallery-carousel, media-lightbox-img, shreddit-aspect-ratio,
      [slot="post-media-container"], [slot="thumbnail"], [slot="full-media"],
      [data-testid="post-media"] {
        display:none!important;${compact}
      }
    `);
  }
  if (settings.hideVideos) {
    rules.push(`
      video, shreddit-player, gif-player, faceplate-progress-video, iframe,
      reddit-media {
        display:none!important;${compact}
      }
    `);
  }
  if (settings.hideAvatars) {
    rules.push(`
      img[alt*="avatar" i], faceplate-img[alt*="avatar" i],
      [data-testid="user-avatar"], faceplate-hovercard img {
        display:none!important;${compact}
      }
    `);
  }
  if (settings.hideSubredditIcons) {
    rules.push(`
      img[alt*="icon" i], faceplate-img[alt*="subreddit" i],
      [data-testid="subreddit-icon"] {
        display:none!important;${compact}
      }
    `);
  }
  return rules.join("\n");
}

/**
 * @param {ShadowRoot} shadowRoot
 * @param {string} css
 * @param {boolean} force
 */
function injectShadowStyle(shadowRoot, css, force) {
  if (!css) {
    const existing = shadowRoot.querySelector(`style[${STYLE_ATTR}]`);
    existing?.remove();
    styledShadows.delete(shadowRoot);
    return;
  }
  if (!force && styledShadows.has(shadowRoot)) return;

  let style = shadowRoot.querySelector(`style[${STYLE_ATTR}]`);
  if (!style) {
    style = document.createElement("style");
    style.setAttribute(STYLE_ATTR, "1");
    shadowRoot.appendChild(style);
  }
  if (style.textContent !== css) style.textContent = css;
  styledShadows.add(shadowRoot);
}

/**
 * @param {ParentNode} root
 * @param {string} css
 * @param {boolean} force
 */
function injectShadowsUnder(root, css, force) {
  forEachRelevantShadow(root, (shadow) => {
    injectShadowStyle(shadow, css, force);
  });
}

/**
 * Light-DOM media for old.reddit / non-shadow leftovers — scoped, not deep.
 * @param {ParentNode} root
 * @param {Record<string, boolean>} settings
 */
function hideLightDomMedia(root, settings) {
  let removed = 0;
  if (settings.hideImages || settings.hideVideos) {
    const nodes = queryAll(
      root,
      "img, video, iframe, .media-preview, .reddit-video-player-root, a.thumbnail:not(.self):not(.default)"
    );
    for (const el of nodes) {
      const tag = el.tagName.toLowerCase();
      if (tag === "img" && elementIsDecorativeIcon(el)) continue;
      if (tag === "img" && !settings.hideImages) continue;
      if ((tag === "video" || tag === "iframe") && !settings.hideVideos) continue;
      if (!el.classList.contains(HIDE)) {
        toggleClass(el, HIDE, true);
        removed += 1;
      }
    }
  }
  return removed;
}

/**
 * Call when settings change so shadow CSS is rewritten.
 */
export function invalidateMediaStyles() {
  cachedCss = "\0"; // force mismatch
}

/**
 * @param {ParentNode} root
 * @param {Record<string, boolean>} settings
 * @param {{ force?: boolean }} [opts]
 * @returns {number}
 */
export function removeMedia(root, settings, opts = {}) {
  const force = Boolean(opts.force);
  const scope =
    root instanceof Element || root instanceof Document
      ? root
      : document.documentElement;

  const nextCss = buildShadowCss({
    hideImages: Boolean(settings.hideImages),
    hideVideos: Boolean(settings.hideVideos),
    hideAvatars: Boolean(settings.hideAvatars),
    hideSubredditIcons: Boolean(settings.hideSubredditIcons),
    compactLayout: Boolean(settings.compactLayout),
  });

  const cssChanged = nextCss !== cachedCss;
  cachedCss = nextCss;

  if (!settings.hideImages && !settings.hideVideos && !settings.hideAvatars) {
    injectShadowsUnder(document.documentElement, "", true);
    return 0;
  }

  // Inject CSS into shadow hosts under this scope (skip already-styled unless CSS changed)
  injectShadowsUnder(scope, nextCss, force || cssChanged);

  const removed = hideLightDomMedia(scope, settings);
  if (removed) log.debug(`Light-DOM media hide: ${removed}`);
  return removed;
}
