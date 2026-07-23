/**
 * Popup settings UI — global dullness + per-site enable toggles.
 * @module popup/popup
 */

import {
  LOG_NAMESPACES,
  SETTING_DEFINITIONS,
  SITE_DEFINITIONS,
} from "../shared/constants.js";
import { createStorage } from "../shared/storage.js";
import { createLogger, setLoggingEnabled } from "../utilities/logger.js";

const log = createLogger(LOG_NAMESPACES.SETTINGS);
const storage = createStorage({
  onError: (err) => log.error("Storage failure", err),
});

const form = document.getElementById("settings-form");
const sitesForm = document.getElementById("sites-form");
const debugEl = document.getElementById("debugLogging");

function renderSettings() {
  const frag = document.createDocumentFragment();
  for (const def of SETTING_DEFINITIONS) {
    const label = document.createElement("label");
    label.className = "setting";
    label.htmlFor = def.key;

    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = def.key;
    input.name = def.key;

    const title = document.createElement("span");
    title.className = "label";
    title.textContent = def.label;

    const hint = document.createElement("span");
    hint.className = "hint";
    hint.textContent = def.description;

    label.append(input, title, hint);
    frag.append(label);
  }
  form.replaceChildren(frag);
}

function renderSites() {
  const frag = document.createDocumentFragment();
  for (const site of SITE_DEFINITIONS) {
    const label = document.createElement("label");
    label.className = "setting";
    label.htmlFor = `site-${site.id}`;

    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = `site-${site.id}`;
    input.dataset.siteId = site.id;

    const title = document.createElement("span");
    title.className = "label";
    title.textContent = site.label;

    const hint = document.createElement("span");
    hint.className = "hint";
    hint.textContent = site.hosts;

    label.append(input, title, hint);
    frag.append(label);
  }
  sitesForm.replaceChildren(frag);
}

/**
 * @param {import("../shared/storage.js").RootDocument} root
 */
function syncForm(root) {
  setLoggingEnabled(root.debugLogging);
  debugEl.checked = root.debugLogging;

  for (const def of SETTING_DEFINITIONS) {
    const input = document.getElementById(def.key);
    if (input) input.checked = Boolean(root.settings[def.key]);
  }

  for (const site of SITE_DEFINITIONS) {
    const input = /** @type {HTMLInputElement | null} */ (
      document.getElementById(`site-${site.id}`)
    );
    if (input) {
      input.checked = root.enabledSites?.[site.id] !== false;
    }
  }
}

async function persistFromForm() {
  /** @type {Record<string, boolean>} */
  const settings = {};
  for (const def of SETTING_DEFINITIONS) {
    const input = /** @type {HTMLInputElement | null} */ (
      document.getElementById(def.key)
    );
    if (input) settings[def.key] = input.checked;
  }

  /** @type {Record<string, boolean>} */
  const enabledSites = {};
  for (const site of SITE_DEFINITIONS) {
    const input = /** @type {HTMLInputElement | null} */ (
      document.getElementById(`site-${site.id}`)
    );
    if (input) enabledSites[site.id] = input.checked;
  }

  const current = await storage.readRoot();
  current.debugLogging = debugEl.checked;
  current.settings = { ...current.settings, ...settings };
  current.enabledSites = { ...current.enabledSites, ...enabledSites };
  await storage.writeRoot(current);
  setLoggingEnabled(current.debugLogging);
  log.info("Settings saved.");
}

renderSites();
renderSettings();

storage
  .readRoot()
  .then((root) => {
    syncForm(root);
    log.info("Popup loaded settings.");
  })
  .catch((err) => log.error("Failed to load settings", err));

document.body.addEventListener("change", () => {
  void persistFromForm();
});

storage.subscribe((root) => {
  syncForm(root);
});
