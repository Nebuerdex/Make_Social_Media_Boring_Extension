/**
 * Orchestrates filter → media → sort pipelines.
 * Supports incremental (batch) and full passes; pauses observers during DOM writes.
 * @module content/pipeline
 */

import { LOG_NAMESPACES } from "../shared/constants.js";
import { createLogger } from "../utilities/logger.js";
import { sortCommentsAscending } from "./comments/commentSorter.js";
import {
  applyChromeFilters,
  applyEngagementFilters,
  resetFilterCaches,
} from "./filters/engagementFilter.js";
import { invalidateMediaStyles, removeMedia } from "./media/mediaRemover.js";
import { collectPosts } from "./posts/postCollector.js";
import { sortPostsAscending } from "./posts/postSorter.js";

const log = createLogger(LOG_NAMESPACES.BOOTSTRAP);

/** @type {null | (() => void)} */
let pauseObservers = null;
/** @type {null | (() => void)} */
let resumeObservers = null;

/**
 * Wire observer pause hooks so sorts don't re-enter the pipeline.
 * @param {{ pause: () => void, resume: () => void }} hooks
 */
export function setObserverControl(hooks) {
  pauseObservers = hooks.pause;
  resumeObservers = hooks.resume;
}

/**
 * @param {ParentNode} root
 * @param {Record<string, boolean>} settings
 * @param {{ force?: boolean, sort?: boolean }} [opts]
 */
export function runPipeline(root, settings, opts = {}) {
  const force = Boolean(opts.force);
  const shouldSort = opts.sort !== false;

  try {
    pauseObservers?.();
    applyChromeFilters(settings, { force });
    applyEngagementFilters(root, settings, { force });
    removeMedia(root, settings, { force });

    if (shouldSort && settings.reversePostOrder) {
      sortPostsAscending(collectPosts(root));
    }

    if (shouldSort && settings.reverseCommentOrder) {
      sortCommentsAscending(root);
    }
  } catch (err) {
    log.error("Pipeline failed; Reddit left as-is for this pass.", err);
  } finally {
    resumeObservers?.();
  }
}

/**
 * @param {Record<string, boolean>} settings
 */
export function runFullPass(settings) {
  log.debug("Full pass.");
  runPipeline(document, settings, { force: true, sort: true });
}

/**
 * Settings or navigation invalidated skip-caches.
 */
export function invalidateCaches() {
  resetFilterCaches();
  invalidateMediaStyles();
}
