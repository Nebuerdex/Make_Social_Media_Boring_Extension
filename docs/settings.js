(() => {
  const PAGE = "msmb-page";
  const EXT = "msmb-extension";
  const TIMEOUT_MS = 2500;

  const viewSupport = document.getElementById("view-support");
  const viewSettings = document.getElementById("view-settings");
  const navLinks = document.querySelectorAll("[data-nav]");
  const statusEl = document.getElementById("settings-status");
  const shellEl = document.getElementById("settings-shell");
  const navEl = document.getElementById("site-nav");
  const formEl = document.getElementById("settings-form");
  const titleEl = document.getElementById("site-title");
  const hostsEl = document.getElementById("site-hosts");
  const enabledEl = document.getElementById("site-enabled");

  /** @type {any} */
  let root = null;
  /** @type {Array<{id:string,label:string,hosts:string}>} */
  let sites = [];
  /** @type {Array<{key:string,label:string,description:string}>} */
  let settingDefinitions = [];
  /** @type {string} */
  let activeSiteId = "reddit";
  let ready = false;
  let saving = false;

  function currentView() {
    const hash = (location.hash || "#support").replace(/^#/, "").toLowerCase();
    return hash === "settings" ? "settings" : "support";
  }

  function showView(view) {
    const isSettings = view === "settings";
    viewSupport.hidden = isSettings;
    viewSettings.hidden = !isSettings;
    document.body.classList.toggle("view-settings", isSettings);
    for (const link of navLinks) {
      link.setAttribute(
        "aria-current",
        link.getAttribute("data-nav") === view ? "page" : "false"
      );
    }
    document.title = isSettings
      ? "Settings · Make Social Media Boring"
      : "Make Social Media Boring";
    if (isSettings && ready) syncPanel();
  }

  function setStatus(text, state) {
    statusEl.hidden = false;
    statusEl.textContent = text;
    statusEl.dataset.state = state;
  }

  function request(type, payload) {
    return new Promise((resolve, reject) => {
      const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const onMessage = (event) => {
        if (event.source !== window) return;
        const data = event.data;
        if (!data || data.source !== EXT || data.requestId !== requestId) return;
        window.removeEventListener("message", onMessage);
        clearTimeout(timer);
        if (!data.ok) {
          reject(new Error(data.error || "Extension request failed"));
          return;
        }
        resolve(data.payload);
      };

      const timer = setTimeout(() => {
        window.removeEventListener("message", onMessage);
        reject(new Error("Extension did not respond"));
      }, TIMEOUT_MS);

      window.addEventListener("message", onMessage);
      window.postMessage({ source: PAGE, type, payload, requestId }, "*");
    });
  }

  function renderNav() {
    const frag = document.createDocumentFragment();
    for (const site of sites) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = site.label;
      btn.dataset.siteId = site.id;
      if (site.id === activeSiteId) btn.setAttribute("aria-current", "page");
      btn.addEventListener("click", () => {
        activeSiteId = site.id;
        renderNav();
        syncPanel();
      });
      frag.appendChild(btn);
    }
    navEl.replaceChildren(frag);
  }

  function renderFields() {
    const frag = document.createDocumentFragment();
    for (const def of settingDefinitions) {
      const label = document.createElement("label");
      label.className = "setting";
      label.htmlFor = `opt-${def.key}`;

      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = `opt-${def.key}`;
      input.name = def.key;

      const title = document.createElement("span");
      title.className = "label";
      title.textContent = def.label;

      const desc = document.createElement("span");
      desc.className = "desc";
      desc.textContent = def.description;

      label.append(input, title, desc);
      frag.appendChild(label);
    }
    formEl.replaceChildren(frag);
  }

  function syncPanel() {
    if (!root) return;
    const site = sites.find((s) => s.id === activeSiteId) || sites[0];
    if (!site) return;
    activeSiteId = site.id;
    titleEl.textContent = site.label;
    hostsEl.textContent = site.hosts;
    enabledEl.checked = root.enabledSites?.[site.id] !== false;

    const settings = root.settingsBySite?.[site.id] || {};
    for (const def of settingDefinitions) {
      const input = document.getElementById(`opt-${def.key}`);
      if (input) input.checked = Boolean(settings[def.key]);
    }
  }

  async function persistPanel() {
    if (!root || saving) return;
    saving = true;
    try {
      const settings = {};
      for (const def of settingDefinitions) {
        const input = document.getElementById(`opt-${def.key}`);
        if (input) settings[def.key] = input.checked;
      }

      root = {
        ...root,
        enabledSites: {
          ...root.enabledSites,
          [activeSiteId]: enabledEl.checked,
        },
        settingsBySite: {
          ...root.settingsBySite,
          [activeSiteId]: settings,
        },
      };

      const res = await request("msmb.writeRoot", root);
      if (res?.root) root = res.root;
    } catch (err) {
      setStatus(
        err instanceof Error ? err.message : "Could not save settings.",
        "error"
      );
      shellEl.hidden = true;
    } finally {
      saving = false;
    }
  }

  async function connect() {
    setStatus("Connecting to the extension…", "pending");
    shellEl.hidden = true;
    try {
      const boot = await request("msmb.getBootstrap");
      if (!boot?.ok && boot?.error) throw new Error(boot.error);
      root = boot.root;
      sites = boot.sites || [];
      settingDefinitions = boot.settingDefinitions || [];
      activeSiteId = sites[0]?.id || "reddit";
      renderNav();
      renderFields();
      syncPanel();
      ready = true;
      statusEl.hidden = true;
      shellEl.hidden = false;
    } catch {
      ready = false;
      setStatus(
        "Install or enable Make Social Media Boring in Chrome, then reload this page to edit settings.",
        "error"
      );
      shellEl.hidden = true;
    }
  }

  function onHash() {
    const view = currentView();
    showView(view);
    if (view === "settings" && !ready) void connect();
  }

  window.addEventListener("hashchange", onHash);
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (data?.source === EXT && data.type === "msmb.ready") {
      if (currentView() === "settings") void connect();
    }
  });

  formEl?.addEventListener("change", () => {
    void persistPanel();
  });
  enabledEl?.addEventListener("change", () => {
    void persistPanel();
  });

  onHash();
})();
