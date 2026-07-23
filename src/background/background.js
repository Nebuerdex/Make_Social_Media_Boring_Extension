/**
 * Service worker — defaults + message bus for the public settings site.
 * @module background/background
 */

import {
  createDefaultRoot,
  getSettingsForSite,
  packSettings,
  unpackSettings,
} from "../shared/config.js";
import {
  LOG_NAMESPACES,
  SCHEMA_VERSION,
  SETTING_DEFINITIONS,
  SITE_DEFINITIONS,
  SITE_IDS,
  STORAGE_KEYS,
} from "../shared/constants.js";
import { createStorage, migrateRawStorage, normalizeRoot } from "../shared/storage.js";
import { createLogger, setLoggingEnabled } from "../utilities/logger.js";

const log = createLogger(LOG_NAMESPACES.BACKGROUND);
const storage = createStorage({
  onError: (err) => log.error("Storage failure", err),
});

async function ensureDefaults() {
  try {
    const raw = await chrome.storage.sync.get(null);
    const hasRoot = Boolean(raw && raw[STORAGE_KEYS.ROOT]);
    const root = migrateRawStorage(raw);
    setLoggingEnabled(root.debugLogging);

    const existingVersion =
      raw?.[STORAGE_KEYS.ROOT] &&
      typeof raw[STORAGE_KEYS.ROOT] === "object"
        ? /** @type {{ schemaVersion?: number }} */ (raw[STORAGE_KEYS.ROOT])
            .schemaVersion
        : null;

    if (!hasRoot) {
      await storage.writeRoot(createDefaultRoot());
      log.info("Seeded default settings document.");
    } else if (raw.sites || existingVersion !== SCHEMA_VERSION) {
      await storage.writeRoot(root);
      log.info(`Migrated settings to schema v${SCHEMA_VERSION}.`);
    }
  } catch (err) {
    log.error("ensureDefaults failed", err);
  }
}

/**
 * Serialize root with unpacked per-site settings for the public page.
 * @param {import("../shared/storage.js").RootDocument} root
 */
function toPageRoot(root) {
  /** @type {Record<string, Record<string, boolean>>} */
  const settingsBySite = {};
  for (const id of SITE_IDS) {
    settingsBySite[id] = getSettingsForSite(root, id);
  }
  return {
    schemaVersion: root.schemaVersion,
    debugLogging: root.debugLogging,
    enabledSites: root.enabledSites,
    settingsBySite,
  };
}

/**
 * @param {unknown} incoming
 */
function fromPageRoot(incoming) {
  const base = createDefaultRoot();
  if (!incoming || typeof incoming !== "object") return base;

  const page = /** @type {Record<string, unknown>} */ (incoming);
  /** @type {Record<string, number>} */
  const settingsBySite = { ...base.settingsBySite };

  if (page.settingsBySite && typeof page.settingsBySite === "object") {
    const map = /** @type {Record<string, unknown>} */ (page.settingsBySite);
    for (const id of SITE_IDS) {
      if (map[id] !== undefined) {
        settingsBySite[id] = packSettings(unpackSettings(map[id]));
      }
    }
  }

  return normalizeRoot({
    debugLogging: Boolean(page.debugLogging),
    enabledSites: page.enabledSites,
    settingsBySite,
  });
}

chrome.runtime.onInstalled.addListener(() => {
  void ensureDefaults();
});

chrome.runtime.onStartup.addListener(() => {
  void ensureDefaults();
});

storage.subscribe((root) => {
  setLoggingEnabled(root.debugLogging);
  log.info("Settings document changed.");
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || typeof msg.type !== "string" || !msg.type.startsWith("msmb.")) {
    return;
  }

  void (async () => {
    try {
      if (msg.type === "msmb.getBootstrap") {
        const root = await storage.readRoot();
        setLoggingEnabled(root.debugLogging);
        sendResponse({
          ok: true,
          root: toPageRoot(root),
          sites: SITE_DEFINITIONS,
          settingDefinitions: SETTING_DEFINITIONS,
        });
        return;
      }

      if (msg.type === "msmb.writeRoot") {
        const next = fromPageRoot(msg.payload);
        await storage.writeRoot(next);
        setLoggingEnabled(next.debugLogging);
        sendResponse({ ok: true, root: toPageRoot(next) });
        return;
      }

      sendResponse({ ok: false, error: "Unknown message type" });
    } catch (err) {
      log.error("Message handler failed", err);
      sendResponse({
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  })();

  return true;
});

void ensureDefaults();
