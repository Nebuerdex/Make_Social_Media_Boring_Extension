(() => {
  const config = window.DONATE_CONFIG || { methods: [] };
  const actions = document.getElementById("donate-actions");
  const setupNote = document.getElementById("setup-note");
  const storeLink = document.getElementById("store-link");
  const storeSep = document.getElementById("store-sep");

  const methods = (config.methods || []).filter((m) => m && m.href);

  if (!methods.length) {
    setupNote.hidden = false;
    actions.innerHTML = "";
    return;
  }

  setupNote.hidden = true;
  const frag = document.createDocumentFragment();

  for (const method of methods) {
    const a = document.createElement("a");
    a.className = method.primary ? "btn btn-primary" : "btn btn-secondary";
    a.href = method.href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = method.label;
    frag.appendChild(a);
  }

  actions.replaceChildren(frag);

  if (config.chromeStoreUrl) {
    storeLink.hidden = false;
    storeSep.hidden = false;
    storeLink.href = config.chromeStoreUrl;
  }
})();
