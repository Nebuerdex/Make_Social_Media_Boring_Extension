/**
 * Extract popularity signals from a post element.
 * Attribute-first; DOM reads only when score/comment attrs are missing.
 * @module posts/postParser
 */

import { createWeakCache } from "../../utilities/cache.js";
import { queryOne } from "../../utilities/dom.js";

const cache = createWeakCache();

/**
 * @typedef {{ score: number, commentCount: number, awardCount: number, createdMs: number, id: string, fp: string }} PostSignals
 */

/**
 * @param {string | null | undefined} raw
 * @returns {number}
 */
function parseCount(raw) {
  if (raw == null || raw === "") return 0;
  const s = String(raw).trim().toLowerCase().replace(/,/g, "");
  if (s === "•" || s === "-" || s === "vote" || s === "votes") return 0;
  const m = s.match(/^(-?\d+(?:\.\d+)?)([kmb])?$/i);
  if (!m) {
    const n = Number.parseInt(s, 10);
    return Number.isFinite(n) ? n : 0;
  }
  let n = Number.parseFloat(m[1]);
  const suffix = (m[2] || "").toLowerCase();
  if (suffix === "k") n *= 1e3;
  if (suffix === "m") n *= 1e6;
  if (suffix === "b") n *= 1e9;
  return Math.round(n);
}

/**
 * @param {Element} post
 * @returns {string}
 */
function fingerprint(post) {
  return [
    post.getAttribute("score") || "",
    post.getAttribute("comment-count") || post.getAttribute("data-comment-count") || "",
    post.getAttribute("award-count") || "",
    post.getAttribute("created-timestamp") || "",
    post.getAttribute("id") || "",
  ].join("|");
}

/**
 * @param {Element} post
 * @returns {number}
 */
function readScore(post) {
  const attr =
    post.getAttribute("score") ||
    post.getAttribute("data-score") ||
    post.getAttribute("data-ups");
  if (attr != null && attr !== "") return parseCount(attr);

  const el = queryOne(
    post,
    "[id*='-score-'], .score.unvoted, .score.likes, .score"
  );
  if (el) return parseCount(el.getAttribute("title") || el.textContent);
  return 0;
}

/**
 * @param {Element} post
 * @returns {number}
 */
function readComments(post) {
  const attr =
    post.getAttribute("comment-count") ||
    post.getAttribute("data-comment-count") ||
    post.getAttribute("data-comments");
  if (attr != null && attr !== "") return parseCount(attr);

  const link = queryOne(post, "a[data-click-id='comments'], a[href*='/comments/']");
  if (link) return parseCount(link.textContent);
  return 0;
}

/**
 * @param {Element} post
 * @returns {number}
 */
function readAwards(post) {
  const attr = post.getAttribute("award-count") || post.getAttribute("data-awards");
  if (attr != null && attr !== "") return parseCount(attr);
  return 0;
}

/**
 * @param {Element} post
 * @returns {number}
 */
function readCreated(post) {
  const attr =
    post.getAttribute("created-timestamp") ||
    post.getAttribute("data-timestamp") ||
    post.getAttribute("created");
  if (attr) {
    const ms = Date.parse(attr) || Number(attr);
    if (Number.isFinite(ms)) return ms;
  }
  const time = queryOne(post, "time[datetime], faceplate-timeago");
  if (time) {
    const dt = time.getAttribute("ts") || time.getAttribute("datetime");
    const ms = Date.parse(dt || "") || Number(dt);
    if (Number.isFinite(ms)) return ms;
  }
  return 0;
}

/**
 * @param {Element} post
 * @param {{ force?: boolean }} [opts]
 * @returns {PostSignals}
 */
export function parsePost(post, opts = {}) {
  const fp = fingerprint(post);
  if (!opts.force && cache.has(post)) {
    const hit = /** @type {PostSignals} */ (cache.get(post));
    if (hit.fp === fp) return hit;
  }

  const signals = {
    score: readScore(post),
    commentCount: readComments(post),
    awardCount: readAwards(post),
    createdMs: readCreated(post),
    id:
      post.getAttribute("id") ||
      post.getAttribute("thingid") ||
      post.getAttribute("permalink") ||
      "",
    fp,
  };
  cache.set(post, signals);
  return signals;
}

/**
 * @param {PostSignals} s
 * @returns {[number, number, number, number]}
 */
export function popularityKey(s) {
  const recency = s.createdMs ? -s.createdMs : 0;
  return [s.score, s.awardCount, s.commentCount, recency];
}

/**
 * @param {[number, number, number, number]} a
 * @param {[number, number, number, number]} b
 */
export function compareKeys(a, b) {
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}
