/**
 * Default configuration document written to storage.
 * @module shared/config
 */

import { SCHEMA_VERSION, SETTING_KEYS, SITE_IDS } from "./constants.js";

/** @returns {Record<string, boolean>} */
export function createDefaultSettings() {
  /** @type {Record<string, boolean>} */
  const settings = {};
  for (const key of SETTING_KEYS) {
    settings[key] = true;
  }
  return settings;
}

/** @returns {Record<string, boolean>} */
export function createDefaultEnabledSites() {
  /** @type {Record<string, boolean>} */
  const enabledSites = {};
  for (const id of SITE_IDS) {
    enabledSites[id] = true;
  }
  return enabledSites;
}

/**
 * Canonical persisted document (schema v2).
 * @returns {{
 *   schemaVersion: number,
 *   debugLogging: boolean,
 *   settings: Record<string, boolean>,
 *   enabledSites: Record<string, boolean>
 * }}
 */
export function createDefaultRoot() {
  return {
    schemaVersion: SCHEMA_VERSION,
    debugLogging: false,
    settings: createDefaultSettings(),
    enabledSites: createDefaultEnabledSites(),
  };
}
