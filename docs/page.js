(() => {
  const config = window.DONATE_CONFIG || { methods: [] };
  const actions = document.getElementById("donate-actions");
  const setupNote = document.getElementById("setup-note");
  const storeLink = document.getElementById("store-link");
  const storeSep = document.getElementById("store-sep");
  const form = document.getElementById("feedback-form");
  const statusEl = document.getElementById("feedback-status");
  const submitBtn = document.getElementById("feedback-submit");

  const methods = (config.methods || []).filter((m) => m && m.href);

  if (!methods.length) {
    setupNote.hidden = false;
    actions.replaceChildren();
  } else {
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
  }

  if (config.chromeStoreUrl) {
    storeLink.hidden = false;
    storeSep.hidden = false;
    storeLink.href = config.chromeStoreUrl;
  }

  if (!form) return;

  const email = config.feedbackEmail || "reubenh.1996@gmail.com";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusEl.hidden = false;
    statusEl.textContent = "Sending…";
    statusEl.dataset.state = "pending";
    submitBtn.disabled = true;

    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      message: String(data.get("message") || "").trim(),
      _subject: "Make Social Media Boring — feedback",
      _template: "table",
      _captcha: "false",
    };

    if (!payload.message) {
      statusEl.textContent = "Write something first.";
      statusEl.dataset.state = "error";
      submitBtn.disabled = false;
      return;
    }

    try {
      const res = await fetch(
        `https://formsubmit.co/ajax/${encodeURIComponent(email)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      statusEl.textContent = "Sent. Thanks — I’ll read it.";
      statusEl.dataset.state = "ok";
      form.reset();
    } catch {
      statusEl.innerHTML =
        'Couldn’t send from the browser. Email me directly at <a href="mailto:reubenh.1996@gmail.com">reubenh.1996@gmail.com</a>.';
      statusEl.dataset.state = "error";
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
