/**
 * Content-script entry — detect site, mount matching adapter.
 * @module content/main
 */

import { LOG_NAMESPACES } from "../shared/constants.js";
import { createStorage } from "../shared/storage.js";
import { createLogger, setLoggingEnabled } from "../utilities/logger.js";
import { resolveAdapter } from "./sites/registry.js";

const log = createLogger(LOG_NAMESPACES.BOOTSTRAP);

const storage = createStorage({
  onError: (err) => log.error("Storage failure", err),
});

async function bootstrap() {
  try {
    const adapter = resolveAdapter();
    if (!adapter) {
      log.debug("No adapter for host", location.hostname);
      return;
    }

    const root = await storage.readRoot();
    setLoggingEnabled(root.debugLogging);

    if (root.enabledSites?.[adapter.id] === false) {
      log.info(`Site disabled in settings: ${adapter.id}`);
      return;
    }

    /** @type {Array<(next: { settings: Record<string, boolean>, debugLogging: boolean }) => void>} */
    const listeners = [];

    const destroy = adapter.mount({
      settings: root.settings,
      debugLogging: root.debugLogging,
      onChange: (cb) => {
        listeners.push(cb);
        return () => {
          const i = listeners.indexOf(cb);
          if (i >= 0) listeners.splice(i, 1);
        };
      },
    });

    storage.subscribe((next) => {
      setLoggingEnabled(next.debugLogging);
      if (next.enabledSites?.[adapter.id] === false) {
        log.info(`Site turned off: ${adapter.id} — reload tab to fully unload.`);
        try {
          destroy?.();
        } catch {
          /* ignore */
        }
        return;
      }
      for (const cb of listeners) {
        try {
          cb({ settings: next.settings, debugLogging: next.debugLogging });
        } catch (err) {
          log.error("Settings listener failed", err);
        }
      }
    });

    window.__msmbDestroy = () => {
      try {
        destroy?.();
      } catch {
        /* ignore */
      }
    };

    log.info(`Bootstrapped adapter: ${adapter.id}`);
  } catch (err) {
    log.error("Bootstrap failed; leaving page untouched.", err);
  }
}

void bootstrap();
