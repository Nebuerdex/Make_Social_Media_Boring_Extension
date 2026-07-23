/**
 * Safe DOM helpers. Never throw into page code.
 * @module utilities/dom
 */

/** Custom-element hosts that commonly hold Reddit media / scores in shadow DOM */
const SHADOW_HOST_SELECTOR = [
  "shreddit-post",
  "shreddit-comment",
  "shreddit-comment-tree",
  "shreddit-feed",
  "shreddit-player",
  "shreddit-aspect-ratio",
  "gallery-carousel",
  "faceplate-img",
  "faceplate-tracker",
  "faceplate-hovercard",
  "media-lightbox-img",
  "gif-player",
].join(",");

/**
 * @param {ParentNode | null | undefined} root
 * @param {string} selector
 * @returns {Element[]}
 */
export function queryAll(root, selector) {
  if (!root || !selector) return [];
  try {
    return Array.from(root.querySelectorAll(selector));
  } catch {
    return [];
  }
}

/**
 * @param {ParentNode | null | undefined} root
 * @param {string} selector
 * @returns {Element | null}
 */
export function queryOne(root, selector) {
  if (!root || !selector) return null;
  try {
    return root.querySelector(selector);
  } catch {
    return null;
  }
}

/**
 * Visit open shadow roots under `root`, limited to known host tags (cheap).
 * Falls back to a shallow custom-element scan if no known hosts match.
 * @param {ParentNode} root
 * @param {(shadowRoot: ShadowRoot, host: Element) => void} visit
 * @param {number} [maxDepth]
 */
export function forEachRelevantShadow(root, visit, maxDepth = 4) {
  /** @param {ParentNode} node @param {number} depth */
  const walk = (node, depth) => {
    if (depth > maxDepth) return;
    let hosts;
    try {
      hosts = node.querySelectorAll(SHADOW_HOST_SELECTOR);
    } catch {
      return;
    }
    for (const host of hosts) {
      const shadow = host.shadowRoot;
      if (!shadow) continue;
      visit(shadow, host);
      walk(shadow, depth + 1);
    }
  };

  if (root instanceof Element && root.shadowRoot) {
    visit(root.shadowRoot, root);
    walk(root.shadowRoot, 1);
  }
  walk(root, 0);
}

/**
 * Light DOM + relevant shadow query. Prefer this over full-tree deepQueryAll.
 * @param {ParentNode} root
 * @param {string} selector
 * @returns {Element[]}
 */
export function deepQueryAll(root, selector) {
  const found = queryAll(root, selector);
  forEachRelevantShadow(root, (shadow) => {
    found.push(...queryAll(shadow, selector));
  });
  return found;
}

/**
 * @param {Element} el
 * @param {string} className
 * @param {boolean} on
 */
export function toggleClass(el, className, on) {
  try {
    el.classList.toggle(className, on);
  } catch {
    /* ignore */
  }
}

/**
 * Reorder a subset of children while leaving non-listed siblings in place.
 * @param {Element} parent
 * @param {Element[]} orderedNodes
 */
export function reorderChildren(parent, orderedNodes) {
  const present = orderedNodes.filter((n) => n.parentElement === parent);
  if (present.length < 2) return;

  const sentinel = document.createComment("msmb-reorder");
  parent.insertBefore(sentinel, present[0]);

  for (const node of present) {
    parent.insertBefore(node, sentinel);
  }
  sentinel.remove();
}
