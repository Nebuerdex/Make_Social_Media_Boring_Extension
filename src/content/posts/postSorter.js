/**
 * Reorder posts least-popular → most-popular within each parent.
 * @module posts/postSorter
 */

import { LOG_NAMESPACES } from "../../shared/constants.js";
import { reorderChildren } from "../../utilities/dom.js";
import { createLogger } from "../../utilities/logger.js";
import { groupPostsByParent } from "./postCollector.js";
import { compareKeys, parsePost, popularityKey } from "./postParser.js";

const log = createLogger(LOG_NAMESPACES.SORTER);

/**
 * @param {Element[]} posts
 * @returns {number} number of parents reordered
 */
export function sortPostsAscending(posts) {
  if (!posts.length) return 0;

  const groups = groupPostsByParent(posts);
  let parentsTouched = 0;

  for (const [parent, siblings] of groups) {
    if (siblings.length < 2) continue;

    // Include only direct children that are in our set; preserve relative
    // slots of non-post siblings by sorting posts then appending in order
    // among themselves via appendChild moves.
    const decorated = siblings.map((el) => {
      const signals = parsePost(el);
      return { el, key: popularityKey(signals), signals };
    });

    decorated.sort((a, b) => compareKeys(a.key, b.key));
    const ordered = decorated.map((d) => d.el);

    // Stable no-op check
    let changed = false;
    for (let i = 0; i < ordered.length; i += 1) {
      if (ordered[i] !== siblings[i]) {
        changed = true;
        break;
      }
    }
    if (!changed) continue;

    reorderChildren(parent, ordered);
    parentsTouched += 1;
  }

  if (parentsTouched) {
    log.info(`Reordered posts across ${parentsTouched} container(s).`);
  }
  return parentsTouched;
}
