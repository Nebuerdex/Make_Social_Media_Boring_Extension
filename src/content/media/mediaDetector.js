/**
 * Detect visual media on a node or post subtree.
 * Prefer attributes over DOM walks.
 * @module media/mediaDetector
 */

import { queryAll, queryOne } from "../../utilities/dom.js";
import { MEDIA_NODE_SELECTOR } from "../../utilities/selectors.js";

const MEDIA_HREF =
  /i\.redd\.it|preview\.redd\.it|external-preview\.redd\.it|v\.redd\.it|\.gifv?\b|\.mp4\b|\.webm\b|i\.imgur\.com|gfycat\.com|redgifs\.com|giphy\.com|youtube\.com|youtu\.be|streamable\.com|tiktok\.com|shorts\//i;

const IMAGE_POST_TYPES = new Set([
  "image",
  "gallery",
  "gif",
  "animated",
  "multipart_image",
]);

const VIDEO_POST_TYPES = new Set(["video", "media"]);

const TEXTISH_TYPES = new Set(["text", "self", "link", ""]);

/**
 * @param {Element} el
 * @returns {boolean}
 */
export function elementIsDecorativeIcon(el) {
  const tag = el.tagName?.toLowerCase() || "";
  if (tag !== "img" && tag !== "faceplate-img") return false;
  const w = Number(el.getAttribute("width") || el.width || 0);
  const h = Number(el.getAttribute("height") || el.height || 0);
  if ((w && w <= 48) || (h && h <= 48)) return true;
  const alt = (el.getAttribute("alt") || "").toLowerCase();
  if (/avatar|icon|logo|emoji/.test(alt)) return true;
  const cls = (el.getAttribute("class") || "").toLowerCase();
  if (/avatar|icon|logo/.test(cls)) return true;
  return false;
}

/**
 * Shallow light-DOM media probe (no shadow walk).
 * @param {Element} root
 */
export function detectMediaInLight(root) {
  /** @type {Element[]} */
  const images = [];
  /** @type {Element[]} */
  const videos = [];
  /** @type {Element[]} */
  const embeds = [];

  for (const el of queryAll(
    root,
    `${MEDIA_NODE_SELECTOR}, img, faceplate-img, picture, iframe`
  )) {
    const tag = el.tagName.toLowerCase();
    if (tag === "img" || tag === "faceplate-img" || tag === "picture") {
      if (elementIsDecorativeIcon(el)) continue;
      images.push(el);
    } else if (
      tag === "video" ||
      tag === "shreddit-player" ||
      tag === "gif-player" ||
      tag === "faceplate-progress-video"
    ) {
      videos.push(el);
    } else if (tag === "iframe") {
      embeds.push(el);
    } else if (
      tag === "gallery-carousel" ||
      tag === "shreddit-aspect-ratio" ||
      tag === "media-lightbox-img"
    ) {
      images.push(el);
    }
  }

  return { images, videos, embeds };
}

/**
 * @param {Element} post
 * @returns {{ isImagePost: boolean, isVideoPost: boolean, postType: string }}
 */
export function classifyPostMedia(post) {
  const postType = (
    post.getAttribute("post-type") ||
    post.getAttribute("type") ||
    ""
  ).toLowerCase();

  const href =
    post.getAttribute("content-href") ||
    post.getAttribute("data-url") ||
    "";

  let isImagePost = IMAGE_POST_TYPES.has(postType);
  let isVideoPost = VIDEO_POST_TYPES.has(postType);

  if (href) {
    if (/v\.redd\.it|youtube|youtu\.be|tiktok|redgifs|streamable|\.mp4|\.webm|gifv/i.test(href)) {
      isVideoPost = true;
    } else if (MEDIA_HREF.test(href)) {
      isImagePost = true;
    }
  }

  // Attribute path is enough for typed shreddit posts
  if (isImagePost || isVideoPost) {
    return { isImagePost, isVideoPost, postType };
  }

  if (TEXTISH_TYPES.has(postType) && !href) {
    return { isImagePost: false, isVideoPost: false, postType };
  }

  // old.reddit
  if (post.classList?.contains("thing")) {
    const thumb = queryOne(post, "a.thumbnail");
    if (thumb && !/\b(self|default|nsfw|spoiler)\b/.test(thumb.className)) {
      isImagePost = true;
    }
    if (queryOne(post, ".expando .media-preview, video, iframe, .reddit-video-player-root")) {
      isVideoPost = true;
    }
    return { isImagePost, isVideoPost, postType };
  }

  // Last resort: shallow light DOM only (shadow media handled by CSS injector)
  if (!postType || postType === "link") {
    const media = detectMediaInLight(post);
    if (media.videos.length || media.embeds.length) isVideoPost = true;
    else if (media.images.length) isImagePost = true;
  }

  return { isImagePost, isVideoPost, postType };
}

export { MEDIA_HREF };
