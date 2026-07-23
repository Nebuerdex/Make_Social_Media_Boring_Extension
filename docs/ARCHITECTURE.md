# Architecture Decisions

## Product

**Reddit Anti-Algorithm** (spec v1.0). Popularity is a **negative** signal. Store listing name remains *Make Social Media Boring*.

## Target browser

**Chrome only (Manifest V3).** `chrome.*` APIs only — no Firefox / polyfill.

## Content scripts cannot use ESM

Chrome service workers and extension pages support `"type": "module"`. **Content scripts do not reliably support `import`**, even with `type: "module"` in the manifest — the script fails with `Cannot use import statement outside a module`, so Reddit never changes.

**Choice:** keep modular source under `src/content/**`, and ship a bundled IIFE at `dist/content.js` via esbuild (`npm run build`). The manifest loads only the bundle.


## Popup placement

`src/popup/` — not under `content/` (different document / privileges).

## Storage

Versioned document at `chrome.storage.sync.msmb`:

```json
{
  "schemaVersion": 1,
  "debugLogging": false,
  "settings": { "...feature flags, all default true..." }
}
```

Legacy v0.2 `sites.reddit` keys are migrated once, then removed.

## Navigation (Phase 2)

**History API hooks (`pushState` / `replaceState`) + `popstate`**, with a 1s href poll backup. On navigate: disconnect observer → reconnect → full pipeline pass.

## Observers (Phase 2)

Scoped to feed roots (`shreddit-feed`, `#siteTable`, comment trees, etc.). Debounced batches (~120ms). Never observe `document.body` as the sole root.

## Pipeline order

1. Chrome / panel class toggles  
2. Engagement + promoted filters (hide whole posts)  
3. Media removal (light DOM classes + shadow-injected CSS)  
4. Post reverse-popularity sort (per parent)  
5. Comment reverse-popularity sort (per thread level)

## Sorting

Key: `[score ↑, awards ↑, comments ↑, -createdMs]` so overlooked / new / low-engagement rises. Graceful degrade when scores are missing (treated as 0).

## Performance

Hot path principles:

- **Incremental batches** — MutationObserver work is rAF-coalesced and scoped to post/comment parents, not `document`
- **No 2.5s full rescans** — rare 8s feed-only sweep; full pass only on navigate / settings change
- **Skip caches** — WeakMap fingerprints skip unchanged posts; shadow CSS injected once per host
- **Attribute-first parsing** — scores / post-type / href before any DOM walk
- **Observer pause** during our own reorders to avoid feedback loops
- **Shadow walks** limited to known Reddit host tags (not `querySelectorAll('*')` on the whole page)


## Selectors

Prefer custom elements, ARIA, `data-testid`, attributes (`score`, `post-type`, `content-href`). Class names are fallbacks only.
