/**
 * Bridge: public site ↔ extension storage via window.postMessage.
 * Injected only on the GitHub Pages origin.
 */
(() => {
  const PAGE = "msmb-page";
  const EXT = "msmb-extension";

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.source !== PAGE || typeof data.type !== "string") return;
    if (!data.type.startsWith("msmb.")) return;

    chrome.runtime.sendMessage(
      {
        type: data.type,
        payload: data.payload,
        requestId: data.requestId,
      },
      (response) => {
        const err = chrome.runtime.lastError;
        window.postMessage(
          {
            source: EXT,
            requestId: data.requestId,
            ok: !err,
            error: err ? err.message : null,
            payload: response ?? null,
          },
          "*"
        );
      }
    );
  });

  window.postMessage({ source: EXT, type: "msmb.ready" }, "*");
})();
