/**
 * Versioned storage access. Sync area for cross-device persistence.
 * @module shared/storage
 */

import {
  createDefaultEnabledSites,
  createDefaultRoot,
  createDefaultSettings,
  createDefaultSettingsBySite,
  getSettingsForSite,
  packSettings,
  unpackSettings,
} from "./config.js";
import { SCHEMA_VERSION, SITE_IDS, STORAGE_KEYS } from "./constants.js";

/**
 * @typedef {ReturnType<typeof createDefaultRoot>} RootDocument
 */

/**
 * @param {unknown} value
 * @returns {RootDocument}
 */
export function normalizeRoot(value) {
  const defaults = createDefaultRoot();
  if (!value || typeof value !== "object") {
    return defaults;
  }

  const incoming = /** @type {Record<string, unknown>} */ (value);

  /** @type {Record<string, number>} */
  let settingsBySite = createDefaultSettingsBySite();

  if (incoming.settingsBySite && typeof incoming.settingsBySite === "object") {
    const rawMap = /** @type {Record<string, unknown>} */ (
      incoming.settingsBySite
    );
    for (const id of SITE_IDS) {
      if (rawMap[id] !== undefined) {
        settingsBySite[id] = packSettings(unpackSettings(rawMap[id]));
      }
    }
  } else if (incoming.settings && typeof incoming.settings === "object") {
    // Schema ≤3: one global settings object → copy onto every site.
    const shared = packSettings(unpackSettings(incoming.settings));
    for (const id of SITE_IDS) {
      settingsBySite[id] = shared;
    }
  }

  const enabledSites = {
    ...defaults.enabledSites,
    ...(incoming.enabledSites && typeof incoming.enabledSites === "object"
      ? /** @type {Record<string, boolean>} */ (incoming.enabledSites)
      : {}),
  };
  for (const key of Object.keys(enabledSites)) {
    if (!SITE_IDS.includes(key)) delete enabledSites[key];
    else enabledSites[key] = Boolean(enabledSites[key]);
  }
  for (const id of SITE_IDS) {
    if (enabledSites[id] === undefined) enabledSites[id] = true;
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    debugLogging: Boolean(incoming.debugLogging),
    settingsBySite,
    enabledSites,
  };
}

/**
 * @param {Record<string, unknown>} raw
 * @returns {RootDocument}
 */
export function migrateRawStorage(raw) {
  if (raw && raw[STORAGE_KEYS.ROOT]) {
    return normalizeRoot(raw[STORAGE_KEYS.ROOT]);
  }

  // Legacy v0.2: { sites: { reddit: { ... } } }
  if (raw && raw.sites && typeof raw.sites === "object") {
    const reddit = /** @type {Record<string, unknown>} */ (
      /** @type {Record<string, unknown>} */ (raw.sites).reddit || {}
    );
    const root = createDefaultRoot();
    const settings = createDefaultSettings();
    if (typeof reddit.reverseFeed === "boolean") {
      settings.reversePostOrder = reddit.reverseFeed;
    }
    if (typeof reddit.hideAwards === "boolean") {
      settings.hideAwards = reddit.hideAwards;
    }
    if (reddit.textOnlyPosts === true) {
      settings.hideImages = true;
      settings.hideVideos = true;
    }
    const packed = packSettings(settings);
    for (const id of SITE_IDS) {
      root.settingsBySite[id] = packed;
    }
    if (reddit.enabled === false) {
      root.enabledSites.reddit = false;
    }
    return root;
  }

  return createDefaultRoot();
}

/**
 * @param {{ onError?: (err: unknown) => void }} [hooks]
 */
export function createStorage(hooks = {}) {
  const { onError = () => {} } = hooks;

  async function readRoot() {
    try {
      const raw = await chrome.storage.sync.get(null);
      return migrateRawStorage(raw);
    } catch (err) {
      onError(err);
      return createDefaultRoot();
    }
  }

  /**
   * @param {RootDocument} root
   */
  async function writeRoot(root) {
    try {
      const normalized = normalizeRoot(root);
      await chrome.storage.sync.set({ [STORAGE_KEYS.ROOT]: normalized });
      await chrome.storage.sync.remove(["sites", "enabled", "grayscale"]);
    } catch (err) {
      onError(err);
    }
  }

  /**
   * @param {string} siteId
   * @param {Partial<Record<string, boolean>>} patch
   */
  async function updateSettingsForSite(siteId, patch) {
    const current = await readRoot();
    const next = { ...getSettingsForSite(current, siteId), ...patch };
    current.settingsBySite = {
      ...current.settingsBySite,
      [siteId]: packSettings(next),
    };
    await writeRoot(current);
    return current;
  }

  /**
   * @param {(root: RootDocument) => void} listener
   */
  function subscribe(listener) {
    /** @param {Record<string, chrome.storage.StorageChange>} changes @param {string} area */
    const handler = (changes, area) => {
      if (area !== "sync") return;
      if (!changes[STORAGE_KEYS.ROOT]) return;
      listener(normalizeRoot(changes[STORAGE_KEYS.ROOT].newValue));
    };
    chrome.storage.onChanged.addListener(handler);
    return () => chrome.storage.onChanged.removeListener(handler);
  }

  return { readRoot, writeRoot, updateSettingsForSite, subscribe };
}

export {
  createDefaultSettings,
  createDefaultEnabledSites,
  getSettingsForSite,
  packSettings,
  unpackSettings,
};
