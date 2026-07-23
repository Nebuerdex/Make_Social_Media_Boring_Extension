/**
 * Collect post elements from a root / batch.
 * @module posts/postCollector
 */

import { queryAll } from "../../utilities/dom.js";
import { SELECTORS } from "../../utilities/selectors.js";

/**
 * @param {ParentNode} root
 * @returns {Element[]}
 */
export function collectPosts(root) {
  const posts = queryAll(root, SELECTORS.post);
  // If root itself is a post
  if (
    root instanceof Element &&
    root.matches?.(SELECTORS.post) &&
    !posts.includes(root)
  ) {
    posts.unshift(root);
  }
  // Dedupe
  return Array.from(new Set(posts));
}

/**
 * Group posts by shared parent for local reordering (never cross feed boundaries).
 * @param {Element[]} posts
 * @returns {Map<Element, Element[]>}
 */
export function groupPostsByParent(posts) {
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
  return groups;
}
