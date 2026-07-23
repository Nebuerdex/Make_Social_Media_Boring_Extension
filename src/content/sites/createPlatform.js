/**
 * Generic anti-algorithm adapter for DOM-based social feeds.
 * CSS chrome + media hiding, optional popularity sort, SPA-aware observer.
 * @module sites/createPlatform
 */

import { LOG_NAMESPACES } from "../../shared/constants.js";
import { debounce } from "../../utilities/debounce.js";
import { queryAll, reorderChildren } from "../../utilities/dom.js";
import { createLogger } from "../../utilities/logger.js";
import { createRafCoalescer } from "../../utilities/schedule.js";
import { createRouter } from "../router.js";

const log = createLogger(LOG_NAMESPACES.SITE);

/**
 * @typedef {{
 *   id: string,
 *   match: (hostname: string) => boolean,
 *   feedRoots: string,
 *   postSelector: string,
 *   commentSelector?: string,
 *   chrome?: Partial<Record<'sidebars'|'trending'|'recommendations'|'promoted'|'profileCards'|'awards', string>>,
 *   media?: { images?: string, videos?: string, avatars?: string },
 *   parseEngagement?: (el: Element) => number,
 * }} PlatformConfig
 */

/**
 * @param {string} text
 * @returns {number}
 */
export function parseEngagementNumber(text) {
  if (!text) return 0;
  const m = String(text).replace(/,/g, "").match(/([\d.]+)\s*([KMB])?/i);
  if (!m) return 0;
  let n = Number.parseFloat(m[1]);
  const s = (m[2] || "").toUpperCase();
  if (s === "K") n *= 1e3;
  if (s === "M") n *= 1e6;
  if (s === "B") n *= 1e9;
  return Math.round(n) || 0;
}

/**
 * Default: pull first large-ish number from aria-labels / text.
 * @param {Element} el
 */
function defaultParseEngagement(el) {
  const aria = el.getAttribute("aria-label") || "";
  const fromAria = parseEngagementNumber(aria);
  if (fromAria) return fromAria;

  const labeled = el.querySelectorAll("[aria-label]");
  let best = 0;
  for (const node of labeled) {
    const n = parseEngagementNumber(node.getAttribute("aria-label") || "");
    if (n > best) best = n;
  }
  return best;
}

/**
 * @param {PlatformConfig} config
 */
export function createPlatformAdapter(config) {
  /**
   * @param {{
   *   settings: Record<string, boolean>,
   *   debugLogging?: boolean,
   *   onChange: (cb: (next: { settings: Record<string, boolean>, debugLogging: boolean }) => void) => () => void,
   * }} ctx
   */
  function mount(ctx) {
    let settings = ctx.settings;
    const html = document.documentElement;
    html.dataset.msmbSite = config.id;
    html.dataset.msmbReady = "1";

    /** @type {MutationObserver | null} */
    let observer = null;
    let destroyed = false;

    const applyChrome = () => {
      html.classList.toggle("msmb-hide-sidebars", Boolean(settings.hideSidebars));
      html.classList.toggle("msmb-hide-trending", Boolean(settings.hideTrendingPanels));
      html.classList.toggle(
        "msmb-hide-recommendations",
        Boolean(settings.hideRecommendationPanels)
      );
      html.classList.toggle("msmb-hide-promoted", Boolean(settings.hidePromoted));
      html.classList.toggle("msmb-hide-profile-cards", Boolean(settings.hideProfileCards));
      html.classList.toggle("msmb-hide-awards", Boolean(settings.hideAwards));
      html.classList.toggle("msmb-hide-images", Boolean(settings.hideImages));
      html.classList.toggle("msmb-hide-videos", Boolean(settings.hideVideos));
      html.classList.toggle("msmb-hide-avatars", Boolean(settings.hideAvatars));
      html.classList.toggle(
        "msmb-hide-community-icons",
        Boolean(settings.hideSubredditIcons)
      );
      html.classList.toggle("msmb-compact", Boolean(settings.compactLayout));
      html.classList.toggle("msmb-reverse-feed", Boolean(settings.reversePostOrder));
    };

    const hidePromotedNodes = () => {
      if (!settings.hidePromoted || !config.chrome?.promoted) return;
      for (const el of queryAll(document, config.chrome.promoted)) {
        el.classList.add("msmb-filter-hide");
      }
    };

    const hideSuggestedViaText = () => {
      if (!settings.hideSuggested) return;
      for (const post of queryAll(document, config.postSelector)) {
        const label = (
          post.getAttribute("aria-label") ||
          post.textContent ||
          ""
        ).slice(0, 200);
        if (/suggested|recommended|sponsored|promoted|for you/i.test(label)) {
          post.classList.add("msmb-filter-hide");
        }
      }
    };

    const sortPosts = () => {
      if (!settings.reversePostOrder) return;
      const parse = config.parseEngagement || defaultParseEngagement;
      const posts = queryAll(document, config.postSelector).filter(
        (el) => !el.classList.contains("msmb-filter-hide")
      );
      /** @type {Map<Element, Element[]>} */
      const groups = new Map();
      for (const post of posts) {
        const parent = post.parentElement;
        if (!parent) continue;
        let list = groups.get(parent);
        if (!list) {
          list = [];
          groups.set(parent, list);
        }
        list.push(post);
      }

      for (const [parent, siblings] of groups) {
        if (siblings.length < 2) continue;
        // Prefer CSS column-reverse on feed when many siblings (cheaper).
        if (siblings.length > 40) {
          parent.classList.add("msmb-feed-reverse");
          continue;
        }
        const decorated = siblings.map((el) => ({
          el,
          n: parse(el),
        }));
        decorated.sort((a, b) => a.n - b.n);
        const ordered = decorated.map((d) => d.el);
        let changed = false;
        for (let i = 0; i < ordered.length; i += 1) {
          if (ordered[i] !== siblings[i]) {
            changed = true;
            break;
          }
        }
        if (changed) reorderChildren(parent, ordered);
      }
    };

    const sortComments = () => {
      if (!settings.reverseCommentOrder || !config.commentSelector) return;
      const comments = queryAll(document, config.commentSelector);
      /** @type {Map<Element, Element[]>} */
      const groups = new Map();
      for (const c of comments) {
        const parent = c.parentElement;
        if (!parent) continue;
        let list = groups.get(parent);
        if (!list) {
          list = [];
          groups.set(parent, list);
        }
        list.push(c);
      }
      const parse = config.parseEngagement || defaultParseEngagement;
      for (const [parent, siblings] of groups) {
        if (siblings.length < 2) continue;
        const decorated = siblings.map((el) => ({ el, n: parse(el) }));
        decorated.sort((a, b) => a.n - b.n);
        reorderChildren(
          parent,
          decorated.map((d) => d.el)
        );
      }
    };

    const run = () => {
      if (destroyed) return;
      applyChrome();
      hidePromotedNodes();
      hideSuggestedViaText();
      sortPosts();
      sortComments();
    };

    const schedule = createRafCoalescer(run);
    const debounced = debounce(schedule, 180);

    const connectObserver = () => {
      observer?.disconnect();
      const roots = queryAll(document, config.feedRoots);
      const targets = roots.length ? roots : [document.documentElement];
      observer = new MutationObserver(() => debounced());
      for (const t of targets) {
        try {
          observer.observe(t, { childList: true, subtree: true });
        } catch {
          /* ignore */
        }
      }
    };

    const router = createRouter(() => {
      window.setTimeout(() => {
        connectObserver();
        run();
      }, 100);
    });

    connectObserver();
    run();

    const unsub = ctx.onChange((next) => {
      settings = next.settings;
      run();
    });

    // Light safety sweep
    const sweep = window.setInterval(() => schedule(), 10000);

    log.info(`Mounted platform adapter: ${config.id}`);

    return () => {
      destroyed = true;
      unsub();
      router.destroy();
      observer?.disconnect();
      window.clearInterval(sweep);
      debounced.cancel();
    };
  }

  return {
    id: config.id,
    match: config.match,
    mount,
  };
}
