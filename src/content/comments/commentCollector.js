/**
 * Collect comments and group by parent for thread-local sorts.
 * @module comments/commentCollector
 */

import { queryAll } from "../../utilities/dom.js";
import { SELECTORS } from "../../utilities/selectors.js";

/**
 * @param {ParentNode} root
 * @returns {Element[]}
 */
export function collectComments(root) {
  const comments = queryAll(root, SELECTORS.comment);
  if (
    root instanceof Element &&
    root.matches?.(SELECTORS.comment) &&
    !comments.includes(root)
  ) {
    comments.unshift(root);
  }
  return Array.from(new Set(comments));
}

/**
 * @param {Element[]} comments
 * @returns {Map<Element, Element[]>}
 */
export function groupCommentsByParent(comments) {
  /** @type {Map<Element, Element[]>} */
  const groups = new Map();
  for (const comment of comments) {
    const parent = comment.parentElement;
    if (!parent) continue;
    let list = groups.get(parent);
    if (!list) {
      list = [];
      groups.set(parent, list);
    }
    list.push(comment);
  }
  return groups;
}
