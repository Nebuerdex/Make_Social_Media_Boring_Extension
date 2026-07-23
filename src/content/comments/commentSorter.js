/**
 * Reverse-popularity sort for comment siblings.
 * @module comments/commentSorter
 */

import { LOG_NAMESPACES } from "../../shared/constants.js";
import { createWeakCache } from "../../utilities/cache.js";
import { queryOne, reorderChildren } from "../../utilities/dom.js";
import { createLogger } from "../../utilities/logger.js";
import {
  collectComments,
  groupCommentsByParent,
} from "./commentCollector.js";

const log = createLogger(LOG_NAMESPACES.SORTER);
const cache = createWeakCache();

/**
 * @param {Element} comment
 * @returns {{ score: number, createdMs: number, fp: string }}
 */
function parseComment(comment) {
  const fp = `${comment.getAttribute("score") || ""}|${comment.getAttribute("id") || ""}`;
  if (cache.has(comment)) {
    const hit = /** @type {{ score: number, createdMs: number, fp: string }} */ (
      cache.get(comment)
    );
    if (hit.fp === fp) return hit;
  }

  let score = 0;
  const scoreAttr = comment.getAttribute("score") || comment.getAttribute("data-score");
  if (scoreAttr != null) {
    score = Number.parseInt(String(scoreAttr).replace(/,/g, ""), 10) || 0;
  } else {
    const el = queryOne(comment, ".score, [id*='-comment-rt-score-']");
    if (el) {
      score =
        Number.parseInt(
          String(el.getAttribute("title") || el.textContent || "0").replace(/,/g, ""),
          10
        ) || 0;
    }
  }

  let createdMs = 0;
  const time = queryOne(comment, "time[datetime], faceplate-timeago");
  if (time) {
    const dt = time.getAttribute("ts") || time.getAttribute("datetime");
    createdMs = Date.parse(dt || "") || Number(dt) || 0;
  }

  const signals = { score, createdMs, fp };
  cache.set(comment, signals);
  return signals;
}

/**
 * @param {ParentNode} root
 * @returns {number}
 */
export function sortCommentsAscending(root) {
  const comments = collectComments(root);
  if (comments.length < 2) return 0;

  const groups = groupCommentsByParent(comments);
  let touched = 0;

  for (const [parent, siblings] of groups) {
    if (siblings.length < 2) continue;

    const decorated = siblings.map((el) => {
      const s = parseComment(el);
      return {
        el,
        key: /** @type {[number, number]} */ ([
          s.score,
          s.createdMs ? -s.createdMs : 0,
        ]),
      };
    });
    decorated.sort((a, b) => a.key[0] - b.key[0] || a.key[1] - b.key[1]);
    const ordered = decorated.map((d) => d.el);

    let changed = false;
    for (let i = 0; i < ordered.length; i += 1) {
      if (ordered[i] !== siblings[i]) {
        changed = true;
        break;
      }
    }
    if (!changed) continue;

    reorderChildren(parent, ordered);
    touched += 1;
  }

  if (touched) log.debug(`Reordered comments across ${touched} level(s).`);
  return touched;
}
