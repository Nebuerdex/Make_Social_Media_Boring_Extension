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

/**
 * Pack settings into a bitfield (sync-quota friendly).
 * @param {Record<string, boolean>} settings
 * @returns {number}
 */
export function packSettings(settings) {
  let bits = 0;
  SETTING_KEYS.forEach((key, i) => {
    if (settings?.[key] !== false) bits |= 1 << i;
  });
  return bits;
}

/**
 * Unpack a bitfield (or legacy object) into settings.
 * @param {unknown} value
 * @returns {Record<string, boolean>}
 */
export function unpackSettings(value) {
  const settings = createDefaultSettings();
  if (typeof value === "number" && Number.isFinite(value)) {
    SETTING_KEYS.forEach((key, i) => {
      settings[key] = Boolean(value & (1 << i));
    });
    return settings;
  }
  if (value && typeof value === "object") {
    const incoming = /** @type {Record<string, unknown>} */ (value);
    for (const key of SETTING_KEYS) {
      if (key in incoming) settings[key] = Boolean(incoming[key]);
    }
  }
  return settings;
}

/** Default: every flag on for every site (packed). */
export function createDefaultSettingsBySite() {
  const packed = packSettings(createDefaultSettings());
  /** @type {Record<string, number>} */
  const settingsBySite = {};
  for (const id of SITE_IDS) {
    settingsBySite[id] = packed;
  }
  return settingsBySite;
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
 * Canonical persisted document (schema v4 — per-site settings).
 * @returns {{
 *   schemaVersion: number,
 *   debugLogging: boolean,
 *   settingsBySite: Record<string, number>,
 *   enabledSites: Record<string, boolean>
 * }}
 */
export function createDefaultRoot() {
  return {
    schemaVersion: SCHEMA_VERSION,
    debugLogging: false,
    settingsBySite: createDefaultSettingsBySite(),
    enabledSites: createDefaultEnabledSites(),
  };
}

/**
 * @param {{ settingsBySite?: Record<string, number|Record<string, boolean>> }} root
 * @param {string} siteId
 * @returns {Record<string, boolean>}
 */
export function getSettingsForSite(root, siteId) {
  const packed = root?.settingsBySite?.[siteId];
  return unpackSettings(packed);
}
