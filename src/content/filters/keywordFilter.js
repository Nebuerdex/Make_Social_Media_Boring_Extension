/**
 * Keyword / engagement-bait heuristics for titles and domains.
 * @module filters/keywordFilter
 */

const BAIT_TITLE =
  /\b(you won'?t believe|gone wrong|gone sexual|only \d+\%|like and subscribe|link in bio|free vbucks|smash upvote|upvote if|tag someone|change my mind\b.*🔥|this (is|will) (blow|break)|wait for it)\b/i;

const BAIT_DOMAIN =
  /tiktok\.com|youtube\.com\/shorts|youtu\.be|instagram\.com\/reel|streamable\.com|redgifs\.com|gfycat\.com|imgur\.com\/(a\/|gallery)/i;

/**
 * @param {string} title
 * @returns {boolean}
 */
export function isClickbaitTitle(title) {
  if (!title) return false;
  if (BAIT_TITLE.test(title)) return true;
  // Heavy emoji / ALL CAPS short meme titles
  const letters = title.replace(/[^a-zA-Z]/g, "");
  if (letters.length >= 8 && letters === letters.toUpperCase()) return true;
  return false;
}

/**
 * @param {string} href
 * @returns {boolean}
 */
export function isBaitDomain(href) {
  if (!href) return false;
  return BAIT_DOMAIN.test(href);
}
