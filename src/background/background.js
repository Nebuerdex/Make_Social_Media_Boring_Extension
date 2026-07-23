/**
 * Service worker — install seeding and future message bus.
 * Phase 1: ensure defaults exist; no Reddit DOM access here.
 * @module background/background
 */

import { createDefaultRoot } from "../shared/config.js";
import { LOG_NAMESPACES, STORAGE_KEYS } from "../shared/constants.js";
import { createStorage, migrateRawStorage } from "../shared/storage.js";
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

    if (!hasRoot) {
      await storage.writeRoot(createDefaultRoot());
      log.info("Seeded default settings document.");
    } else {
      // Persist migrated shape if we still see legacy keys.
      if (raw.sites) {
        await storage.writeRoot(root);
        log.info("Migrated legacy settings to schema v1.");
      }
    }
  } catch (err) {
    log.error("ensureDefaults failed", err);
  }
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

void ensureDefaults();
