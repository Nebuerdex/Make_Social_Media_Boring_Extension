/**
 * Platform selector configs for non-Reddit sites.
 * Prefer roles / test ids / semantic attributes over brittle class hashes.
 * @module sites/platformConfigs
 */

import { createPlatformAdapter, parseEngagementNumber } from "./createPlatform.js";

/** @param {string} hostname */
const bare = (hostname) => hostname.replace(/^www\./i, "").toLowerCase();

/** @param {string} hostname @param {RegExp} re */
const host = (hostname, re) => re.test(bare(hostname));

/** @param {string} hostname @param {string} needle */
const hostIncludes = (hostname, needle) => bare(hostname).includes(needle);

export const twitter = createPlatformAdapter({
  id: "twitter",
  match: (h) => host(h, /^(twitter\.com|x\.com)$/i),
  feedRoots: '[data-testid="primaryColumn"], main[role="main"]',
  postSelector: 'article[data-testid="tweet"]',
  commentSelector: 'article[data-testid="tweet"]',
  chrome: {
    sidebars: '[data-testid="sidebarColumn"]',
    trending: '[data-testid="sidebarColumn"] section',
    recommendations: '[data-testid="sidebarColumn"]',
    promoted: '[data-testid="placementTracking"], [data-testid="promotedIndicator"]',
    profileCards: '[data-testid="HoverCard"], [data-testid="UserCell"]',
  },
  parseEngagement: (el) => {
    const group = el.querySelector('[role="group"]');
    if (!group) return 0;
    let likes = 0;
    for (const btn of group.querySelectorAll("[aria-label]")) {
      const label = btn.getAttribute("aria-label") || "";
      if (/like|view/i.test(label)) {
        likes = Math.max(likes, parseEngagementNumber(label));
      }
    }
    return likes;
  },
});

export const youtube = createPlatformAdapter({
  id: "youtube",
  match: (h) =>
    /youtube\.com$/i.test(bare(h)) ||
    /^m\.youtube\.com$/i.test(h) ||
    /^youtu\.be$/i.test(bare(h)),
  feedRoots:
    "ytd-rich-grid-renderer, ytd-section-list-renderer, ytd-watch-next-secondary-results-renderer, ytd-browse, ytd-search",
  postSelector:
    "ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer, ytd-reel-item-renderer",
  chrome: {
    sidebars: "#secondary, ytd-guide-renderer",
    recommendations:
      "ytd-watch-next-secondary-results-renderer, ytd-reel-shelf-renderer",
    promoted:
      "ytd-ad-slot-renderer, ytd-promoted-sparkles-web-renderer, ytd-in-feed-ad-layout-renderer",
  },
  parseEngagement: (el) => {
    const views =
      el.querySelector(
        "#metadata-line span, .ytd-video-meta-block #metadata-line span, span.inline-metadata-item"
      )?.textContent || "";
    return parseEngagementNumber(views);
  },
});

export const instagram = createPlatformAdapter({
  id: "instagram",
  match: (h) => host(h, /^instagram\.com$/i),
  feedRoots: 'main[role="main"], section',
  postSelector: "article",
  chrome: {
    recommendations: 'a[href*="/explore/"]',
    promoted: '[aria-label*="Sponsored" i]',
  },
  parseEngagement: (el) => {
    const like = el.querySelector('section span, a[href*="/liked_by/"] span');
    return parseEngagementNumber(
      like?.textContent || el.getAttribute("aria-label") || ""
    );
  },
});

export const tiktok = createPlatformAdapter({
  id: "tiktok",
  match: (h) => host(h, /^tiktok\.com$/i),
  feedRoots:
    '#app, main, [data-e2e="recommend-list-item-container"]',
  postSelector:
    '[data-e2e="recommend-list-item-container"], [data-e2e="user-post-item"], article',
  chrome: {
    sidebars: '[data-e2e="landing-nav"], nav',
    recommendations: '[data-e2e="suggest-accounts"]',
    promoted: '[data-e2e="ad"]',
  },
  parseEngagement: (el) => {
    const strong = el.querySelector(
      '[data-e2e="like-count"], [data-e2e="browser-mode-like"], strong'
    );
    return parseEngagementNumber(strong?.textContent || "");
  },
});

export const facebook = createPlatformAdapter({
  id: "facebook",
  match: (h) => host(h, /^(facebook\.com|fb\.com|m\.facebook\.com)$/i),
  feedRoots: '[role="main"], [role="feed"], div[data-pagelet*="Feed"]',
  postSelector: '[role="article"]',
  chrome: {
    sidebars: '[role="complementary"], [data-pagelet*="RightRail"]',
    recommendations: '[aria-label*="Suggested" i]',
    promoted: '[aria-label*="Sponsored" i]',
  },
  parseEngagement: (el) => {
    const reactions = el.querySelector(
      '[aria-label*="reaction" i], [aria-label*="Like" i]'
    );
    return Math.max(
      parseEngagementNumber(el.getAttribute("aria-label") || ""),
      parseEngagementNumber(reactions?.getAttribute("aria-label") || "")
    );
  },
});

export const linkedin = createPlatformAdapter({
  id: "linkedin",
  match: (h) => host(h, /^linkedin\.com$/i),
  feedRoots: "main, .scaffold-finite-scroll__content, .feed-container",
  postSelector:
    '.feed-shared-update-v2, .occludable-update, [data-id*="urn:li:activity"]',
  chrome: {
    sidebars: ".scaffold-layout__aside, aside",
    trending: ".feed-shared-news-module, .news-module",
    recommendations: ".feed-shared-follow-recommendation",
  },
  parseEngagement: (el) => {
    const social = el.querySelector(
      ".social-details-social-counts__reactions-count, .social-details-social-counts__item"
    );
    return parseEngagementNumber(social?.textContent || "");
  },
});

export const threads = createPlatformAdapter({
  id: "threads",
  match: (h) => host(h, /^threads\.net$/i),
  feedRoots: 'main[role="main"], [role="main"]',
  postSelector: '[data-pressable-container="true"], article',
  chrome: {
    recommendations: '[href*="/search"], [href*="/trending"]',
  },
  parseEngagement: (el) =>
    parseEngagementNumber(el.getAttribute("aria-label") || el.textContent || ""),
});

export const pinterest = createPlatformAdapter({
  id: "pinterest",
  match: (h) => hostIncludes(h, "pinterest."),
  feedRoots: '[data-test-id="pinGrid"], [role="main"], #container',
  postSelector:
    '[data-test-id="pin"], [data-test-id="pinWrapper"], [data-grid-item="true"], article',
  chrome: {
    sidebars: '[data-test-id="homefeed-interest-picker"], aside',
    recommendations: '[data-test-id="related-pins"], [data-test-id="today-article"]',
    promoted: '[data-test-id="ad-badge"], [aria-label*="Promoted" i], [aria-label*="Sponsored" i]',
  },
  parseEngagement: (el) =>
    parseEngagementNumber(el.getAttribute("aria-label") || el.textContent || ""),
});

export const bluesky = createPlatformAdapter({
  id: "bluesky",
  match: (h) => host(h, /^bsky\.app$/i),
  feedRoots: 'main, [data-testid="homeScreenFeed"], div[style*="overflow"]',
  postSelector: '[data-testid="feedItem-by-"], [data-testid^="feedItem"], article',
  chrome: {
    sidebars: 'aside, [data-testid="rightNav"]',
    recommendations: '[data-testid="recommendedFeedsCard"], [href*="/feeds"]',
  },
  parseEngagement: (el) => {
    let best = 0;
    for (const node of el.querySelectorAll("[aria-label], button")) {
      const n = parseEngagementNumber(
        node.getAttribute("aria-label") || node.textContent || ""
      );
      if (n > best) best = n;
    }
    return best;
  },
});

export const ninegag = createPlatformAdapter({
  id: "ninegag",
  match: (h) => host(h, /^9gag\.com$/i),
  feedRoots: ".main-container, #list-view-2, main, .list-stream",
  postSelector: "article, .list-stream > div, .ui-post",
  chrome: {
    sidebars: ".sidebar, aside, .featured-section",
    promoted: ".badge-toast, .ad-container, [class*='ad-']",
  },
  parseEngagement: (el) => {
    const points = el.querySelector(".point, .post-vote, [class*='vote']");
    return parseEngagementNumber(points?.textContent || "");
  },
});

export const ifunny = createPlatformAdapter({
  id: "ifunny",
  match: (h) => host(h, /^ifunny\.co$/i),
  feedRoots: "main, .feed, #content",
  postSelector: "article, .post, [data-id], .feed__list > div",
  chrome: {
    sidebars: "aside, .sidebar",
    promoted: "[class*='ad'], .adsbygoogle",
  },
  parseEngagement: (el) =>
    parseEngagementNumber(
      el.querySelector("[class*='smile'], [class*='like'], .counter")?.textContent ||
        ""
    ),
});

export const imgur = createPlatformAdapter({
  id: "imgur",
  match: (h) => host(h, /^imgur\.com$/i),
  feedRoots: "main, .Discovery, #content, .cards",
  postSelector: "article, .Post-item, .Gallery-item, .Card, [class*='Post']",
  chrome: {
    sidebars: "aside, .Sidebar, .Footer",
    promoted: "[class*='Ad'], .advertisement",
  },
  parseEngagement: (el) =>
    parseEngagementNumber(
      el.querySelector("[class*='score'], [class*='point'], [title*='score' i]")
        ?.textContent ||
        el.getAttribute("aria-label") ||
        ""
    ),
});

export const lemon8 = createPlatformAdapter({
  id: "lemon8",
  match: (h) =>
    host(h, /^lemon8-app\.com$/i) || hostIncludes(h, "lemon8"),
  feedRoots: "main, #root, [class*='feed']",
  postSelector: "article, [class*='FeedCard'], [class*='feed-item'], section",
  chrome: {
    sidebars: "aside, nav",
    recommendations: "[class*='recommend'], [class*='Suggest']",
  },
  parseEngagement: (el) =>
    parseEngagementNumber(el.textContent?.slice(0, 120) || ""),
});

export const xiaohongshu = createPlatformAdapter({
  id: "xiaohongshu",
  match: (h) =>
    host(h, /^xiaohongshu\.com$/i) ||
    hostIncludes(h, "xiaohongshu") ||
    host(h, /^xhslink\.com$/i),
  feedRoots: "main, #app, .feeds-container, .main-container",
  postSelector:
    "section.note-item, .note-item, [class*='note-item'], [class*='Feed'], article",
  chrome: {
    sidebars: "aside, .side-bar",
    recommendations: "[class*='recommend']",
  },
  parseEngagement: (el) =>
    parseEngagementNumber(
      el.querySelector("[class*='like'], [class*='count']")?.textContent || ""
    ),
});

export const douyin = createPlatformAdapter({
  id: "douyin",
  match: (h) => host(h, /^douyin\.com$/i),
  feedRoots: "#root, main, [class*='player'], [id*='waterfall']",
  postSelector:
    "[class*='video'], [class*='feed'] > div, [data-e2e], article",
  chrome: {
    sidebars: "aside, nav, [class*='sidebar']",
    recommendations: "[class*='recommend'], [class*='suggest']",
    promoted: "[class*='ad-'], [class*='Ad']",
  },
  parseEngagement: (el) =>
    parseEngagementNumber(
      el.querySelector("[class*='like'], [class*='count']")?.textContent || ""
    ),
});

export const weibo = createPlatformAdapter({
  id: "weibo",
  match: (h) => host(h, /^weibo\.com$/i) || hostIncludes(h, "weibo."),
  feedRoots: "main, #app, .woo-panel-main, .WB_feed",
  postSelector:
    ".woo-panel-main, .WB_cardwrap, .Feed_wrap, article, [class*='Feed']",
  chrome: {
    sidebars: "aside, .woo-box-flex > aside, .WB_frame_b",
    trending: "[class*='Hot'], .hot_rank",
    promoted: "[class*='ad'], .WB_ad",
  },
  parseEngagement: (el) =>
    parseEngagementNumber(
      el.querySelector("[class*='like'], [title*='赞'], .woo-like-count")
        ?.textContent || ""
    ),
});

export const bilibili = createPlatformAdapter({
  id: "bilibili",
  match: (h) =>
    host(h, /^bilibili\.com$/i) ||
    host(h, /^bilibili\.tv$/i) ||
    hostIncludes(h, "bilibili."),
  feedRoots:
    "main, .bili-video-card, .feed2, #i_cecream, .container",
  postSelector:
    ".bili-video-card, .video-card, .feed-card, .bili-dyn-item, .small-item",
  chrome: {
    sidebars: "aside, .right-container, .recommend-list",
    recommendations: ".recommended-swipe, .recommend-container",
    promoted: ".ad-report, .banner-ad, [class*='ad-']",
  },
  parseEngagement: (el) =>
    parseEngagementNumber(
      el.querySelector(".bili-video-card__stats--item, .play-num, .view")
        ?.textContent || ""
    ),
});

export const vk = createPlatformAdapter({
  id: "vk",
  match: (h) => host(h, /^(vk\.com|vk\.ru)$/i),
  feedRoots: "#content, .main_feed, [data-testid='feed'], main",
  postSelector: ".feed_row, .post, [class*='Post'], article",
  chrome: {
    sidebars: "#side_bar, aside, .right_list",
    recommendations: ".feed_block_recommended, .page_block_header",
    promoted: ".ads_ad_box, .ad_box, [class*='ads_']",
  },
  parseEngagement: (el) =>
    parseEngagementNumber(
      el.querySelector(".PostBottomAction, .like_button_count, [class*='like']")
        ?.textContent || ""
    ),
});

export const tumblr = createPlatformAdapter({
  id: "tumblr",
  match: (h) => hostIncludes(h, "tumblr.com"),
  feedRoots: 'main, [role="main"], .l-content, #base-container',
  postSelector: "article, .post, [data-id], .FtjPK",
  chrome: {
    sidebars: "aside, .l-sidebar, [aria-label*='Sidebar' i]",
    recommendations: "[href*='/explore'], .recommended",
    promoted: "[class*='ad-'], .takeover-ad",
  },
  parseEngagement: (el) =>
    parseEngagementNumber(
      el.querySelector("[aria-label*='note' i], .note_count, [class*='note']")
        ?.textContent ||
        el.getAttribute("aria-label") ||
        ""
    ),
});

export const flickr = createPlatformAdapter({
  id: "flickr",
  match: (h) => host(h, /^flickr\.com$/i),
  feedRoots: "main, .main, #content, .photo-list",
  postSelector:
    ".photo-list-photo-view, .photo-list-photo-container, .avatar, article, .photo",
  chrome: {
    sidebars: "aside, .sidebar",
    recommendations: ".explore, .recommended",
  },
  parseEngagement: (el) =>
    parseEngagementNumber(
      el.querySelector(".engagement, .stats, [class*='fave']")?.textContent || ""
    ),
});

export const PLATFORM_ADAPTERS = [
  twitter,
  youtube,
  instagram,
  tiktok,
  facebook,
  linkedin,
  threads,
  pinterest,
  bluesky,
  ninegag,
  ifunny,
  imgur,
  lemon8,
  xiaohongshu,
  douyin,
  weibo,
  bilibili,
  vk,
  tumblr,
  flickr,
];
