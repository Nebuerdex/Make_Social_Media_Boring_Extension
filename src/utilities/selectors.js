/**
 * Stable selector catalogue. Prefer custom elements, ARIA, test ids, URL cues.
 * Class-name selectors are last-resort fallbacks only.
 * @module utilities/selectors
 */

export const SELECTORS = Object.freeze({
  /** Feed / list roots worth observing */
  feedRoots: [
    "shreddit-feed",
    "faceplate-tracker[noun='posts']",
    "#siteTable",
    "[data-testid='post-list']",
    "main",
    "shreddit-comment-tree",
    "#comment-tree",
    ".commentarea",
  ].join(","),

  post: "shreddit-post, .thing.link, [data-testid='post-container']",
  comment: "shreddit-comment, shreddit-profile-comment, .comment",
  commentTree: "shreddit-comment-tree, #comment-tree, .commentarea .sitetable",

  promoted: [
    "shreddit-ad-post",
    "shreddit-ad",
    "[data-testid='ad']",
    "[promoted]",
    ".promotedlink",
    ".promoted",
    "[aria-label*='advertisement' i]",
    "[aria-label*='promoted' i]",
  ].join(","),

  sidebar: [
    "#right-sidebar-container",
    "aside",
    ".side",
    "[data-testid='frontpage-sidebar']",
  ].join(","),

  awards: [
    "award-button",
    "shreddit-awards",
    ".awardings-bar",
    "[aria-label*='award' i]",
  ].join(","),
});

/** Media node tags / slots commonly used by Reddit's web client */
export const MEDIA_NODE_SELECTOR = [
  "shreddit-player",
  "shreddit-aspect-ratio",
  "gallery-carousel",
  "gif-player",
  "media-lightbox-img",
  "video",
  "reddit-media",
  '[slot="post-media-container"]',
  '[slot="thumbnail"]',
  '[slot="full-media"]',
  '[data-testid="post-media"]',
  "faceplate-progress-video",
].join(",");
