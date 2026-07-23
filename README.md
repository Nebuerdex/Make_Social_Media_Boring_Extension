# Make Social Media Boring

Chrome MV3 extension that treats **popularity as a negative signal** across social platforms.

## Supported sites (21)

Reddit · X (Twitter) · YouTube · Instagram · TikTok · Facebook · LinkedIn · Threads · Pinterest · Bluesky · 9GAG · iFunny · Imgur · Lemon8 · Xiaohongshu (RED) · Douyin · Weibo · Bilibili · VK · Tumblr · Flickr

| Depth | Sites |
|---|---|
| Full pipeline | Reddit |
| Shared platform adapter | Everything else |

Per-site on/off toggles + shared dullness settings are in the popup.

## Install

1. `chrome://extensions` → Developer mode  
2. **Load unpacked** → this folder  
3. **Reload** the extension after updates (needed when new hosts are added)  
4. Allow site access if Chrome prompts  
5. Hard-refresh each social tab (`Ctrl+Shift+R`)

### After editing source

```bash
npm install
npm run build
```

## Layout

```
src/content/sites/reddit.js           # deep Reddit pipeline
src/content/sites/createPlatform.js   # generic adapter
src/content/sites/platformConfigs.js  # selectors per site
src/content/sites/registry.js
dist/content.js                       # bundled content script
```
