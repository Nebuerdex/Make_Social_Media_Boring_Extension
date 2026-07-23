/**
 * Popup — quick site toggles + link to the public settings page.
 * @module popup/popup
 */

import {
  LOG_NAMESPACES,
  SITE_DEFINITIONS,
  SITE_SETTINGS_URL,
  SITE_URL,
} from "../shared/constants.js";
import { createStorage } from "../shared/storage.js";
import { createLogger, setLoggingEnabled } from "../utilities/logger.js";

const log = createLogger(LOG_NAMESPACES.SETTINGS);
const storage = createStorage({
  onError: (err) => log.error("Storage failure", err),
});

const sitesForm = document.getElementById("sites-form");
const debugEl = /** @type {HTMLInputElement} */ (
  document.getElementById("debugLogging")
);

function openSettingsPage() {
  chrome.tabs.create({ url: SITE_SETTINGS_URL });
}

function openSupportPage() {
  chrome.tabs.create({ url: SITE_URL });
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
  const enabledSites = {};
  for (const site of SITE_DEFINITIONS) {
    const input = /** @type {HTMLInputElement | null} */ (
      document.getElementById(`site-${site.id}`)
    );
    if (input) enabledSites[site.id] = input.checked;
  }

  const current = await storage.readRoot();
  current.debugLogging = debugEl.checked;
  current.enabledSites = { ...current.enabledSites, ...enabledSites };
  await storage.writeRoot(current);
  setLoggingEnabled(current.debugLogging);
  log.info("Popup settings saved.");
}

renderSites();

document.getElementById("open-settings")?.addEventListener("click", openSettingsPage);
document
  .getElementById("open-settings-link")
  ?.addEventListener("click", openSettingsPage);
document.querySelector(".popup-logo")?.addEventListener("click", openSupportPage);

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
