(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // src/shared/siteDefinitions.js
  var SITE_DEFINITIONS;
  var init_siteDefinitions = __esm({
    "src/shared/siteDefinitions.js"() {
      SITE_DEFINITIONS = Object.freeze([
        { id: "reddit", label: "Reddit", hosts: "reddit.com" },
        { id: "twitter", label: "X (Twitter)", hosts: "x.com, twitter.com" },
        { id: "youtube", label: "YouTube", hosts: "youtube.com" },
        { id: "instagram", label: "Instagram", hosts: "instagram.com" },
        { id: "tiktok", label: "TikTok", hosts: "tiktok.com" },
        { id: "facebook", label: "Facebook", hosts: "facebook.com" },
        { id: "linkedin", label: "LinkedIn", hosts: "linkedin.com" },
        { id: "threads", label: "Threads", hosts: "threads.net" },
        { id: "pinterest", label: "Pinterest", hosts: "pinterest.com" },
        { id: "bluesky", label: "Bluesky", hosts: "bsky.app" },
        { id: "ninegag", label: "9GAG", hosts: "9gag.com" },
        { id: "ifunny", label: "iFunny", hosts: "ifunny.co" },
        { id: "imgur", label: "Imgur", hosts: "imgur.com" },
        { id: "lemon8", label: "Lemon8", hosts: "lemon8-app.com" },
        { id: "xiaohongshu", label: "Xiaohongshu (RED)", hosts: "xiaohongshu.com" },
        { id: "douyin", label: "Douyin", hosts: "douyin.com" },
        { id: "weibo", label: "Weibo", hosts: "weibo.com" },
        { id: "bilibili", label: "Bilibili", hosts: "bilibili.com" },
        { id: "vk", label: "VK", hosts: "vk.com" },
        { id: "tumblr", label: "Tumblr", hosts: "tumblr.com" },
        { id: "flickr", label: "Flickr", hosts: "flickr.com" }
      ]);
    }
  });

  // src/shared/constants.js
  var STORAGE_KEYS, SCHEMA_VERSION, LOG_NAMESPACES, SITE_DEFINITIONS2, SITE_IDS, SETTING_DEFINITIONS, SETTING_KEYS;
  var init_constants = __esm({
    "src/shared/constants.js"() {
      init_siteDefinitions();
      STORAGE_KEYS = Object.freeze({
        ROOT: "msmb"
      });
      SCHEMA_VERSION = 3;
      LOG_NAMESPACES = Object.freeze({
        BACKGROUND: "Background",
        SETTINGS: "Settings",
        STORAGE: "Storage",
        OBSERVER: "Observer",
        ROUTER: "Router",
        SORTER: "Sorter",
        MEDIA: "Media",
        FILTER: "Filter",
        BOOTSTRAP: "Bootstrap",
        SITE: "Site"
      });
      SITE_DEFINITIONS2 = SITE_DEFINITIONS;
      SITE_IDS = Object.freeze(SITE_DEFINITIONS2.map((s) => s.id));
      SETTING_DEFINITIONS = Object.freeze([
        {
          key: "reversePostOrder",
          label: "Reverse post order",
          description: "Least popular / overlooked content first"
        },
        {
          key: "reverseCommentOrder",
          label: "Reverse comment order",
          description: "Low-engagement replies first (where supported)"
        },
        {
          key: "hideImages",
          label: "Hide images",
          description: "Images, galleries, thumbnails, preview cards"
        },
        {
          key: "hideVideos",
          label: "Hide videos",
          description: "Players, GIFs, Shorts, Reels, embeds"
        },
        {
          key: "hideAwards",
          label: "Hide awards / reactions chrome",
          description: "Awards, reaction piles, sticker chrome where applicable"
        },
        {
          key: "hideAvatars",
          label: "Hide avatars",
          description: "Profile pictures in feeds"
        },
        {
          key: "hideSubredditIcons",
          label: "Hide community icons",
          description: "Subreddit / page / channel icons"
        },
        {
          key: "hidePromoted",
          label: "Hide promoted / ads",
          description: "Sponsored and ad units"
        },
        {
          key: "hideSuggested",
          label: "Hide suggested posts",
          description: "Suggested / recommended feed units"
        },
        {
          key: "compactLayout",
          label: "Compact layout",
          description: "Collapse empty space after media removal"
        },
        {
          key: "hideTrendingPanels",
          label: "Hide trending panels",
          description: "Trending and popular modules"
        },
        {
          key: "hideRecommendationPanels",
          label: "Hide recommendation panels",
          description: "For you / similar / up next rails"
        },
        {
          key: "hideSidebars",
          label: "Hide sidebars",
          description: "Right rail and secondary columns"
        },
        {
          key: "hideProfileCards",
          label: "Hide profile cards",
          description: "Hover cards and profile promo units"
        }
      ]);
      SETTING_KEYS = Object.freeze(
        SETTING_DEFINITIONS.map((d) => d.key)
      );
    }
  });

  // src/shared/config.js
  function createDefaultSettings() {
    const settings = {};
    for (const key of SETTING_KEYS) {
      settings[key] = true;
    }
    return settings;
  }
  function createDefaultEnabledSites() {
    const enabledSites = {};
    for (const id of SITE_IDS) {
      enabledSites[id] = true;
    }
    return enabledSites;
  }
  function createDefaultRoot() {
    return {
      schemaVersion: SCHEMA_VERSION,
      debugLogging: false,
      settings: createDefaultSettings(),
      enabledSites: createDefaultEnabledSites()
    };
  }
  var init_config = __esm({
    "src/shared/config.js"() {
      init_constants();
    }
  });

  // src/shared/storage.js
  function normalizeRoot(value) {
    const defaults = createDefaultRoot();
    if (!value || typeof value !== "object") {
      return defaults;
    }
    const incoming = (
      /** @type {Partial<RootDocument>} */
      value
    );
    const settings = {
      ...defaults.settings,
      ...incoming.settings && typeof incoming.settings === "object" ? incoming.settings : {}
    };
    for (const key of Object.keys(settings)) {
      if (!(key in defaults.settings)) delete settings[key];
      else settings[key] = Boolean(settings[key]);
    }
    const enabledSites = {
      ...defaults.enabledSites,
      ...incoming.enabledSites && typeof incoming.enabledSites === "object" ? incoming.enabledSites : {}
    };
    for (const key of Object.keys(enabledSites)) {
      if (!SITE_IDS.includes(key)) delete enabledSites[key];
      else enabledSites[key] = Boolean(enabledSites[key]);
    }
    for (const id of SITE_IDS) {
      if (enabledSites[id] === void 0) enabledSites[id] = true;
    }
    return {
      schemaVersion: SCHEMA_VERSION,
      debugLogging: Boolean(incoming.debugLogging),
      settings,
      enabledSites
    };
  }
  function migrateRawStorage(raw) {
    if (raw && raw[STORAGE_KEYS.ROOT]) {
      return normalizeRoot(raw[STORAGE_KEYS.ROOT]);
    }
    if (raw && raw.sites && typeof raw.sites === "object") {
      const reddit = (
        /** @type {Record<string, unknown>} */
        /** @type {Record<string, unknown>} */
        raw.sites.reddit || {}
      );
      const root = createDefaultRoot();
      if (typeof reddit.reverseFeed === "boolean") {
        root.settings.reversePostOrder = reddit.reverseFeed;
      }
      if (typeof reddit.hideAwards === "boolean") {
        root.settings.hideAwards = reddit.hideAwards;
      }
      if (reddit.textOnlyPosts === true) {
        root.settings.hideImages = true;
        root.settings.hideVideos = true;
      }
      if (reddit.enabled === false) {
        root.enabledSites.reddit = false;
      }
      return root;
    }
    return createDefaultRoot();
  }
  function createStorage(hooks = {}) {
    const { onError = () => {
    } } = hooks;
    async function readRoot() {
      try {
        const raw = await chrome.storage.sync.get(null);
        return migrateRawStorage(raw);
      } catch (err) {
        onError(err);
        return createDefaultRoot();
      }
    }
    async function writeRoot(root) {
      try {
        const normalized = normalizeRoot(root);
        await chrome.storage.sync.set({ [STORAGE_KEYS.ROOT]: normalized });
        await chrome.storage.sync.remove(["sites", "enabled", "grayscale"]);
      } catch (err) {
        onError(err);
      }
    }
    async function updateSettings(patch) {
      const current = await readRoot();
      current.settings = { ...current.settings, ...patch };
      await writeRoot(current);
      return current;
    }
    function subscribe(listener) {
      const handler = (changes, area) => {
        if (area !== "sync") return;
        if (!changes[STORAGE_KEYS.ROOT]) return;
        listener(normalizeRoot(changes[STORAGE_KEYS.ROOT].newValue));
      };
      chrome.storage.onChanged.addListener(handler);
      return () => chrome.storage.onChanged.removeListener(handler);
    }
    return { readRoot, writeRoot, updateSettings, subscribe };
  }
  var init_storage = __esm({
    "src/shared/storage.js"() {
      init_config();
      init_constants();
    }
  });

  // src/utilities/logger.js
  function setLoggingEnabled(value) {
    enabled = Boolean(value);
  }
  function createLogger(namespace) {
    const prefix = `[${namespace}]`;
    return {
      debug: (...args) => {
        if (enabled) console.debug(prefix, ...args);
      },
      info: (...args) => {
        if (enabled) console.info(prefix, ...args);
      },
      warn: (...args) => {
        console.warn(prefix, ...args);
      },
      error: (...args) => {
        console.error(prefix, ...args);
      }
    };
  }
  var enabled;
  var init_logger = __esm({
    "src/utilities/logger.js"() {
      enabled = false;
    }
  });

  // src/utilities/debounce.js
  function debounce(fn, waitMs) {
    let timer;
    const wrapped = (
      /** @type {T & { cancel: () => void }} */
      ((...args) => {
        if (timer !== void 0) clearTimeout(timer);
        timer = setTimeout(() => {
          timer = void 0;
          fn(...args);
        }, waitMs);
      })
    );
    wrapped.cancel = () => {
      if (timer !== void 0) clearTimeout(timer);
      timer = void 0;
    };
    return wrapped;
  }
  var init_debounce = __esm({
    "src/utilities/debounce.js"() {
    }
  });

  // src/utilities/dom.js
  function queryAll(root, selector) {
    if (!root || !selector) return [];
    try {
      return Array.from(root.querySelectorAll(selector));
    } catch {
      return [];
    }
  }
  function queryOne(root, selector) {
    if (!root || !selector) return null;
    try {
      return root.querySelector(selector);
    } catch {
      return null;
    }
  }
  function forEachRelevantShadow(root, visit, maxDepth = 4) {
    const walk = (node, depth) => {
      if (depth > maxDepth) return;
      let hosts;
      try {
        hosts = node.querySelectorAll(SHADOW_HOST_SELECTOR);
      } catch {
        return;
      }
      for (const host2 of hosts) {
        const shadow = host2.shadowRoot;
        if (!shadow) continue;
        visit(shadow, host2);
        walk(shadow, depth + 1);
      }
    };
    if (root instanceof Element && root.shadowRoot) {
      visit(root.shadowRoot, root);
      walk(root.shadowRoot, 1);
    }
    walk(root, 0);
  }
  function toggleClass(el, className, on) {
    try {
      el.classList.toggle(className, on);
    } catch {
    }
  }
  function reorderChildren(parent, orderedNodes) {
    const present = orderedNodes.filter((n) => n.parentElement === parent);
    if (present.length < 2) return;
    const sentinel = document.createComment("msmb-reorder");
    parent.insertBefore(sentinel, present[0]);
    for (const node of present) {
      parent.insertBefore(node, sentinel);
    }
    sentinel.remove();
  }
  var SHADOW_HOST_SELECTOR;
  var init_dom = __esm({
    "src/utilities/dom.js"() {
      SHADOW_HOST_SELECTOR = [
        "shreddit-post",
        "shreddit-comment",
        "shreddit-comment-tree",
        "shreddit-feed",
        "shreddit-player",
        "shreddit-aspect-ratio",
        "gallery-carousel",
        "faceplate-img",
        "faceplate-tracker",
        "faceplate-hovercard",
        "media-lightbox-img",
        "gif-player"
      ].join(",");
    }
  });

  // src/utilities/schedule.js
  function createRafCoalescer(fn) {
    let scheduled = false;
    return () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        fn();
      });
    };
  }
  var init_schedule = __esm({
    "src/utilities/schedule.js"() {
    }
  });

  // src/content/router.js
  function parseLocation(href = location.href) {
    let url;
    try {
      url = new URL(href);
    } catch {
      return { type: "other", path: "/", href };
    }
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const lower = path.toLowerCase();
    if (lower === "/" || lower === "/home" || lower.startsWith("/home/")) {
      return { type: "home", path, href };
    }
    if (lower === "/r/popular" || lower.startsWith("/r/popular/")) {
      return { type: "popular", path, href };
    }
    if (lower === "/r/all" || lower.startsWith("/r/all/")) {
      return { type: "all", path, href };
    }
    if (/^\/r\/[^/]+\/comments\//i.test(path)) {
      return { type: "comments", path, href };
    }
    if (/^\/r\/[^/+]+$/i.test(path) || /^\/r\/[^/+]+\//i.test(path)) {
      if (path.includes("+")) {
        return { type: "multireddit", path, href };
      }
      return { type: "subreddit", path, href };
    }
    if (/^\/user\//i.test(path) || /^\/u\//i.test(path)) {
      return { type: "user", path, href };
    }
    if (lower.startsWith("/search")) {
      return { type: "search", path, href };
    }
    if (lower.includes("/saved")) {
      return { type: "saved", path, href };
    }
    return { type: "other", path, href };
  }
  function createRouter(onNavigate) {
    let current = parseLocation();
    let destroyed = false;
    let pollTimer = 0;
    const emit = (reason) => {
      if (destroyed) return;
      const next = parseLocation();
      if (next.href === current.href && next.type === current.type) return;
      current = next;
      log.info(`Navigate (${reason}) \u2192 ${next.type}`, next.path);
      try {
        onNavigate(next);
      } catch (err) {
        log.error("onNavigate failed", err);
      }
    };
    const wrapHistory = (methodName) => {
      const original = history[methodName].bind(history);
      history[methodName] = function patched(...args) {
        const result = original(...args);
        queueMicrotask(() => emit(methodName));
        return result;
      };
      return original;
    };
    const originalPush = wrapHistory("pushState");
    const originalReplace = wrapHistory("replaceState");
    const onPop = () => emit("popstate");
    window.addEventListener("popstate", onPop);
    pollTimer = window.setInterval(() => emit("poll"), 2e3);
    log.info(`Router ready \u2192 ${current.type}`, current.path);
    return {
      getRoute: () => current,
      destroy: () => {
        destroyed = true;
        window.removeEventListener("popstate", onPop);
        window.clearInterval(pollTimer);
        history.pushState = originalPush;
        history.replaceState = originalReplace;
      }
    };
  }
  var log;
  var init_router = __esm({
    "src/content/router.js"() {
      init_constants();
      init_logger();
      log = createLogger(LOG_NAMESPACES.ROUTER);
    }
  });

  // src/content/sites/createPlatform.js
  function parseEngagementNumber(text) {
    if (!text) return 0;
    const m = String(text).replace(/,/g, "").match(/([\d.]+)\s*([KMB])?/i);
    if (!m) return 0;
    let n = Number.parseFloat(m[1]);
    const s = (m[2] || "").toUpperCase();
    if (s === "K") n *= 1e3;
    if (s === "M") n *= 1e6;
    if (s === "B") n *= 1e9;
    return Math.round(n) || 0;
  }
  function defaultParseEngagement(el) {
    const aria = el.getAttribute("aria-label") || "";
    const fromAria = parseEngagementNumber(aria);
    if (fromAria) return fromAria;
    const labeled = el.querySelectorAll("[aria-label]");
    let best = 0;
    for (const node of labeled) {
      const n = parseEngagementNumber(node.getAttribute("aria-label") || "");
      if (n > best) best = n;
    }
    return best;
  }
  function createPlatformAdapter(config) {
    function mount(ctx) {
      let settings = ctx.settings;
      const html = document.documentElement;
      html.dataset.msmbSite = config.id;
      html.dataset.msmbReady = "1";
      let observer = null;
      let destroyed = false;
      const applyChrome = () => {
        html.classList.toggle("msmb-hide-sidebars", Boolean(settings.hideSidebars));
        html.classList.toggle("msmb-hide-trending", Boolean(settings.hideTrendingPanels));
        html.classList.toggle(
          "msmb-hide-recommendations",
          Boolean(settings.hideRecommendationPanels)
        );
        html.classList.toggle("msmb-hide-promoted", Boolean(settings.hidePromoted));
        html.classList.toggle("msmb-hide-profile-cards", Boolean(settings.hideProfileCards));
        html.classList.toggle("msmb-hide-awards", Boolean(settings.hideAwards));
        html.classList.toggle("msmb-hide-images", Boolean(settings.hideImages));
        html.classList.toggle("msmb-hide-videos", Boolean(settings.hideVideos));
        html.classList.toggle("msmb-hide-avatars", Boolean(settings.hideAvatars));
        html.classList.toggle(
          "msmb-hide-community-icons",
          Boolean(settings.hideSubredditIcons)
        );
        html.classList.toggle("msmb-compact", Boolean(settings.compactLayout));
        html.classList.toggle("msmb-reverse-feed", Boolean(settings.reversePostOrder));
      };
      const hidePromotedNodes = () => {
        if (!settings.hidePromoted || !config.chrome?.promoted) return;
        for (const el of queryAll(document, config.chrome.promoted)) {
          el.classList.add("msmb-filter-hide");
        }
      };
      const hideSuggestedViaText = () => {
        if (!settings.hideSuggested) return;
        for (const post of queryAll(document, config.postSelector)) {
          const label = (post.getAttribute("aria-label") || post.textContent || "").slice(0, 200);
          if (/suggested|recommended|sponsored|promoted|for you/i.test(label)) {
            post.classList.add("msmb-filter-hide");
          }
        }
      };
      const sortPosts = () => {
        if (!settings.reversePostOrder) return;
        const parse = config.parseEngagement || defaultParseEngagement;
        const posts = queryAll(document, config.postSelector).filter(
          (el) => !el.classList.contains("msmb-filter-hide")
        );
        const groups = /* @__PURE__ */ new Map();
        for (const post of posts) {
          const parent = post.parentElement;
          if (!parent) continue;
          let list = groups.get(parent);
          if (!list) {
            list = [];
            groups.set(parent, list);
          }
          list.push(post);
        }
        for (const [parent, siblings] of groups) {
          if (siblings.length < 2) continue;
          if (siblings.length > 40) {
            parent.classList.add("msmb-feed-reverse");
            continue;
          }
          const decorated = siblings.map((el) => ({
            el,
            n: parse(el)
          }));
          decorated.sort((a, b) => a.n - b.n);
          const ordered = decorated.map((d) => d.el);
          let changed = false;
          for (let i = 0; i < ordered.length; i += 1) {
            if (ordered[i] !== siblings[i]) {
              changed = true;
              break;
            }
          }
          if (changed) reorderChildren(parent, ordered);
        }
      };
      const sortComments = () => {
        if (!settings.reverseCommentOrder || !config.commentSelector) return;
        const comments = queryAll(document, config.commentSelector);
        const groups = /* @__PURE__ */ new Map();
        for (const c of comments) {
          const parent = c.parentElement;
          if (!parent) continue;
          let list = groups.get(parent);
          if (!list) {
            list = [];
            groups.set(parent, list);
          }
          list.push(c);
        }
        const parse = config.parseEngagement || defaultParseEngagement;
        for (const [parent, siblings] of groups) {
          if (siblings.length < 2) continue;
          const decorated = siblings.map((el) => ({ el, n: parse(el) }));
          decorated.sort((a, b) => a.n - b.n);
          reorderChildren(
            parent,
            decorated.map((d) => d.el)
          );
        }
      };
      const run = () => {
        if (destroyed) return;
        applyChrome();
        hidePromotedNodes();
        hideSuggestedViaText();
        sortPosts();
        sortComments();
      };
      const schedule = createRafCoalescer(run);
      const debounced = debounce(schedule, 180);
      const connectObserver = () => {
        observer?.disconnect();
        const roots = queryAll(document, config.feedRoots);
        const targets = roots.length ? roots : [document.documentElement];
        observer = new MutationObserver(() => debounced());
        for (const t of targets) {
          try {
            observer.observe(t, { childList: true, subtree: true });
          } catch {
          }
        }
      };
      const router = createRouter(() => {
        window.setTimeout(() => {
          connectObserver();
          run();
        }, 100);
      });
      connectObserver();
      run();
      const unsub = ctx.onChange((next) => {
        settings = next.settings;
        run();
      });
      const sweep = window.setInterval(() => schedule(), 1e4);
      log2.info(`Mounted platform adapter: ${config.id}`);
      return () => {
        destroyed = true;
        unsub();
        router.destroy();
        observer?.disconnect();
        window.clearInterval(sweep);
        debounced.cancel();
      };
    }
    return {
      id: config.id,
      match: config.match,
      mount
    };
  }
  var log2;
  var init_createPlatform = __esm({
    "src/content/sites/createPlatform.js"() {
      init_constants();
      init_debounce();
      init_dom();
      init_logger();
      init_schedule();
      init_router();
      log2 = createLogger(LOG_NAMESPACES.SITE);
    }
  });

  // src/content/sites/platformConfigs.js
  var bare, host, hostIncludes, twitter, youtube, instagram, tiktok, facebook, linkedin, threads, pinterest, bluesky, ninegag, ifunny, imgur, lemon8, xiaohongshu, douyin, weibo, bilibili, vk, tumblr, flickr, PLATFORM_ADAPTERS;
  var init_platformConfigs = __esm({
    "src/content/sites/platformConfigs.js"() {
      init_createPlatform();
      bare = (hostname) => hostname.replace(/^www\./i, "").toLowerCase();
      host = (hostname, re) => re.test(bare(hostname));
      hostIncludes = (hostname, needle) => bare(hostname).includes(needle);
      twitter = createPlatformAdapter({
        id: "twitter",
        match: (h) => host(h, /^(twitter\.com|x\.com)$/i),
        feedRoots: '[data-testid="primaryColumn"], main[role="main"]',
        postSelector: 'article[data-testid="tweet"]',
        commentSelector: 'article[data-testid="tweet"]',
        chrome: {
          sidebars: '[data-testid="sidebarColumn"]',
          trending: '[data-testid="sidebarColumn"] section',
          recommendations: '[data-testid="sidebarColumn"]',
          promoted: '[data-testid="placementTracking"], [data-testid="promotedIndicator"]',
          profileCards: '[data-testid="HoverCard"], [data-testid="UserCell"]'
        },
        parseEngagement: (el) => {
          const group = el.querySelector('[role="group"]');
          if (!group) return 0;
          let likes = 0;
          for (const btn of group.querySelectorAll("[aria-label]")) {
            const label = btn.getAttribute("aria-label") || "";
            if (/like|view/i.test(label)) {
              likes = Math.max(likes, parseEngagementNumber(label));
            }
          }
          return likes;
        }
      });
      youtube = createPlatformAdapter({
        id: "youtube",
        match: (h) => /youtube\.com$/i.test(bare(h)) || /^m\.youtube\.com$/i.test(h) || /^youtu\.be$/i.test(bare(h)),
        feedRoots: "ytd-rich-grid-renderer, ytd-section-list-renderer, ytd-watch-next-secondary-results-renderer, ytd-browse, ytd-search",
        postSelector: "ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer, ytd-reel-item-renderer",
        chrome: {
          sidebars: "#secondary, ytd-guide-renderer",
          recommendations: "ytd-watch-next-secondary-results-renderer, ytd-reel-shelf-renderer",
          promoted: "ytd-ad-slot-renderer, ytd-promoted-sparkles-web-renderer, ytd-in-feed-ad-layout-renderer"
        },
        parseEngagement: (el) => {
          const views = el.querySelector(
            "#metadata-line span, .ytd-video-meta-block #metadata-line span, span.inline-metadata-item"
          )?.textContent || "";
          return parseEngagementNumber(views);
        }
      });
      instagram = createPlatformAdapter({
        id: "instagram",
        match: (h) => host(h, /^instagram\.com$/i),
        feedRoots: 'main[role="main"], section',
        postSelector: "article",
        chrome: {
          recommendations: 'a[href*="/explore/"]',
          promoted: '[aria-label*="Sponsored" i]'
        },
        parseEngagement: (el) => {
          const like = el.querySelector('section span, a[href*="/liked_by/"] span');
          return parseEngagementNumber(
            like?.textContent || el.getAttribute("aria-label") || ""
          );
        }
      });
      tiktok = createPlatformAdapter({
        id: "tiktok",
        match: (h) => host(h, /^tiktok\.com$/i),
        feedRoots: '#app, main, [data-e2e="recommend-list-item-container"]',
        postSelector: '[data-e2e="recommend-list-item-container"], [data-e2e="user-post-item"], article',
        chrome: {
          sidebars: '[data-e2e="landing-nav"], nav',
          recommendations: '[data-e2e="suggest-accounts"]',
          promoted: '[data-e2e="ad"]'
        },
        parseEngagement: (el) => {
          const strong = el.querySelector(
            '[data-e2e="like-count"], [data-e2e="browser-mode-like"], strong'
          );
          return parseEngagementNumber(strong?.textContent || "");
        }
      });
      facebook = createPlatformAdapter({
        id: "facebook",
        match: (h) => host(h, /^(facebook\.com|fb\.com|m\.facebook\.com)$/i),
        feedRoots: '[role="main"], [role="feed"], div[data-pagelet*="Feed"]',
        postSelector: '[role="article"]',
        chrome: {
          sidebars: '[role="complementary"], [data-pagelet*="RightRail"]',
          recommendations: '[aria-label*="Suggested" i]',
          promoted: '[aria-label*="Sponsored" i]'
        },
        parseEngagement: (el) => {
          const reactions = el.querySelector(
            '[aria-label*="reaction" i], [aria-label*="Like" i]'
          );
          return Math.max(
            parseEngagementNumber(el.getAttribute("aria-label") || ""),
            parseEngagementNumber(reactions?.getAttribute("aria-label") || "")
          );
        }
      });
      linkedin = createPlatformAdapter({
        id: "linkedin",
        match: (h) => host(h, /^linkedin\.com$/i),
        feedRoots: "main, .scaffold-finite-scroll__content, .feed-container",
        postSelector: '.feed-shared-update-v2, .occludable-update, [data-id*="urn:li:activity"]',
        chrome: {
          sidebars: ".scaffold-layout__aside, aside",
          trending: ".feed-shared-news-module, .news-module",
          recommendations: ".feed-shared-follow-recommendation"
        },
        parseEngagement: (el) => {
          const social = el.querySelector(
            ".social-details-social-counts__reactions-count, .social-details-social-counts__item"
          );
          return parseEngagementNumber(social?.textContent || "");
        }
      });
      threads = createPlatformAdapter({
        id: "threads",
        match: (h) => host(h, /^threads\.net$/i),
        feedRoots: 'main[role="main"], [role="main"]',
        postSelector: '[data-pressable-container="true"], article',
        chrome: {
          recommendations: '[href*="/search"], [href*="/trending"]'
        },
        parseEngagement: (el) => parseEngagementNumber(el.getAttribute("aria-label") || el.textContent || "")
      });
      pinterest = createPlatformAdapter({
        id: "pinterest",
        match: (h) => hostIncludes(h, "pinterest."),
        feedRoots: '[data-test-id="pinGrid"], [role="main"], #container',
        postSelector: '[data-test-id="pin"], [data-test-id="pinWrapper"], [data-grid-item="true"], article',
        chrome: {
          sidebars: '[data-test-id="homefeed-interest-picker"], aside',
          recommendations: '[data-test-id="related-pins"], [data-test-id="today-article"]',
          promoted: '[data-test-id="ad-badge"], [aria-label*="Promoted" i], [aria-label*="Sponsored" i]'
        },
        parseEngagement: (el) => parseEngagementNumber(el.getAttribute("aria-label") || el.textContent || "")
      });
      bluesky = createPlatformAdapter({
        id: "bluesky",
        match: (h) => host(h, /^bsky\.app$/i),
        feedRoots: 'main, [data-testid="homeScreenFeed"], div[style*="overflow"]',
        postSelector: '[data-testid="feedItem-by-"], [data-testid^="feedItem"], article',
        chrome: {
          sidebars: 'aside, [data-testid="rightNav"]',
          recommendations: '[data-testid="recommendedFeedsCard"], [href*="/feeds"]'
        },
        parseEngagement: (el) => {
          let best = 0;
          for (const node of el.querySelectorAll("[aria-label], button")) {
            const n = parseEngagementNumber(
              node.getAttribute("aria-label") || node.textContent || ""
            );
            if (n > best) best = n;
          }
          return best;
        }
      });
      ninegag = createPlatformAdapter({
        id: "ninegag",
        match: (h) => host(h, /^9gag\.com$/i),
        feedRoots: ".main-container, #list-view-2, main, .list-stream",
        postSelector: "article, .list-stream > div, .ui-post",
        chrome: {
          sidebars: ".sidebar, aside, .featured-section",
          promoted: ".badge-toast, .ad-container, [class*='ad-']"
        },
        parseEngagement: (el) => {
          const points = el.querySelector(".point, .post-vote, [class*='vote']");
          return parseEngagementNumber(points?.textContent || "");
        }
      });
      ifunny = createPlatformAdapter({
        id: "ifunny",
        match: (h) => host(h, /^ifunny\.co$/i),
        feedRoots: "main, .feed, #content",
        postSelector: "article, .post, [data-id], .feed__list > div",
        chrome: {
          sidebars: "aside, .sidebar",
          promoted: "[class*='ad'], .adsbygoogle"
        },
        parseEngagement: (el) => parseEngagementNumber(
          el.querySelector("[class*='smile'], [class*='like'], .counter")?.textContent || ""
        )
      });
      imgur = createPlatformAdapter({
        id: "imgur",
        match: (h) => host(h, /^imgur\.com$/i),
        feedRoots: "main, .Discovery, #content, .cards",
        postSelector: "article, .Post-item, .Gallery-item, .Card, [class*='Post']",
        chrome: {
          sidebars: "aside, .Sidebar, .Footer",
          promoted: "[class*='Ad'], .advertisement"
        },
        parseEngagement: (el) => parseEngagementNumber(
          el.querySelector("[class*='score'], [class*='point'], [title*='score' i]")?.textContent || el.getAttribute("aria-label") || ""
        )
      });
      lemon8 = createPlatformAdapter({
        id: "lemon8",
        match: (h) => host(h, /^lemon8-app\.com$/i) || hostIncludes(h, "lemon8"),
        feedRoots: "main, #root, [class*='feed']",
        postSelector: "article, [class*='FeedCard'], [class*='feed-item'], section",
        chrome: {
          sidebars: "aside, nav",
          recommendations: "[class*='recommend'], [class*='Suggest']"
        },
        parseEngagement: (el) => parseEngagementNumber(el.textContent?.slice(0, 120) || "")
      });
      xiaohongshu = createPlatformAdapter({
        id: "xiaohongshu",
        match: (h) => host(h, /^xiaohongshu\.com$/i) || hostIncludes(h, "xiaohongshu") || host(h, /^xhslink\.com$/i),
        feedRoots: "main, #app, .feeds-container, .main-container",
        postSelector: "section.note-item, .note-item, [class*='note-item'], [class*='Feed'], article",
        chrome: {
          sidebars: "aside, .side-bar",
          recommendations: "[class*='recommend']"
        },
        parseEngagement: (el) => parseEngagementNumber(
          el.querySelector("[class*='like'], [class*='count']")?.textContent || ""
        )
      });
      douyin = createPlatformAdapter({
        id: "douyin",
        match: (h) => host(h, /^douyin\.com$/i),
        feedRoots: "#root, main, [class*='player'], [id*='waterfall']",
        postSelector: "[class*='video'], [class*='feed'] > div, [data-e2e], article",
        chrome: {
          sidebars: "aside, nav, [class*='sidebar']",
          recommendations: "[class*='recommend'], [class*='suggest']",
          promoted: "[class*='ad-'], [class*='Ad']"
        },
        parseEngagement: (el) => parseEngagementNumber(
          el.querySelector("[class*='like'], [class*='count']")?.textContent || ""
        )
      });
      weibo = createPlatformAdapter({
        id: "weibo",
        match: (h) => host(h, /^weibo\.com$/i) || hostIncludes(h, "weibo."),
        feedRoots: "main, #app, .woo-panel-main, .WB_feed",
        postSelector: ".woo-panel-main, .WB_cardwrap, .Feed_wrap, article, [class*='Feed']",
        chrome: {
          sidebars: "aside, .woo-box-flex > aside, .WB_frame_b",
          trending: "[class*='Hot'], .hot_rank",
          promoted: "[class*='ad'], .WB_ad"
        },
        parseEngagement: (el) => parseEngagementNumber(
          el.querySelector("[class*='like'], [title*='\u8D5E'], .woo-like-count")?.textContent || ""
        )
      });
      bilibili = createPlatformAdapter({
        id: "bilibili",
        match: (h) => host(h, /^bilibili\.com$/i) || host(h, /^bilibili\.tv$/i) || hostIncludes(h, "bilibili."),
        feedRoots: "main, .bili-video-card, .feed2, #i_cecream, .container",
        postSelector: ".bili-video-card, .video-card, .feed-card, .bili-dyn-item, .small-item",
        chrome: {
          sidebars: "aside, .right-container, .recommend-list",
          recommendations: ".recommended-swipe, .recommend-container",
          promoted: ".ad-report, .banner-ad, [class*='ad-']"
        },
        parseEngagement: (el) => parseEngagementNumber(
          el.querySelector(".bili-video-card__stats--item, .play-num, .view")?.textContent || ""
        )
      });
      vk = createPlatformAdapter({
        id: "vk",
        match: (h) => host(h, /^(vk\.com|vk\.ru)$/i),
        feedRoots: "#content, .main_feed, [data-testid='feed'], main",
        postSelector: ".feed_row, .post, [class*='Post'], article",
        chrome: {
          sidebars: "#side_bar, aside, .right_list",
          recommendations: ".feed_block_recommended, .page_block_header",
          promoted: ".ads_ad_box, .ad_box, [class*='ads_']"
        },
        parseEngagement: (el) => parseEngagementNumber(
          el.querySelector(".PostBottomAction, .like_button_count, [class*='like']")?.textContent || ""
        )
      });
      tumblr = createPlatformAdapter({
        id: "tumblr",
        match: (h) => hostIncludes(h, "tumblr.com"),
        feedRoots: 'main, [role="main"], .l-content, #base-container',
        postSelector: "article, .post, [data-id], .FtjPK",
        chrome: {
          sidebars: "aside, .l-sidebar, [aria-label*='Sidebar' i]",
          recommendations: "[href*='/explore'], .recommended",
          promoted: "[class*='ad-'], .takeover-ad"
        },
        parseEngagement: (el) => parseEngagementNumber(
          el.querySelector("[aria-label*='note' i], .note_count, [class*='note']")?.textContent || el.getAttribute("aria-label") || ""
        )
      });
      flickr = createPlatformAdapter({
        id: "flickr",
        match: (h) => host(h, /^flickr\.com$/i),
        feedRoots: "main, .main, #content, .photo-list",
        postSelector: ".photo-list-photo-view, .photo-list-photo-container, .avatar, article, .photo",
        chrome: {
          sidebars: "aside, .sidebar",
          recommendations: ".explore, .recommended"
        },
        parseEngagement: (el) => parseEngagementNumber(
          el.querySelector(".engagement, .stats, [class*='fave']")?.textContent || ""
        )
      });
      PLATFORM_ADAPTERS = [
        twitter,
        youtube,
        instagram,
        tiktok,
        facebook,
        linkedin,
        threads,
        pinterest,
        bluesky,
        ninegag,
        ifunny,
        imgur,
        lemon8,
        xiaohongshu,
        douyin,
        weibo,
        bilibili,
        vk,
        tumblr,
        flickr
      ];
    }
  });

  // src/utilities/selectors.js
  var SELECTORS, MEDIA_NODE_SELECTOR;
  var init_selectors = __esm({
    "src/utilities/selectors.js"() {
      SELECTORS = Object.freeze({
        /** Feed / list roots worth observing */
        feedRoots: [
          "shreddit-feed",
          "faceplate-tracker[noun='posts']",
          "#siteTable",
          "[data-testid='post-list']",
          "main",
          "shreddit-comment-tree",
          "#comment-tree",
          ".commentarea"
        ].join(","),
        post: "shreddit-post, .thing.link, [data-testid='post-container']",
        comment: "shreddit-comment, shreddit-profile-comment, .comment",
        commentTree: "shreddit-comment-tree, #comment-tree, .commentarea .sitetable",
        promoted: [
          "shreddit-ad-post",
          "shreddit-ad",
          "[data-testid='ad']",
          "[promoted]",
          ".promotedlink",
          ".promoted",
          "[aria-label*='advertisement' i]",
          "[aria-label*='promoted' i]"
        ].join(","),
        sidebar: [
          "#right-sidebar-container",
          "aside",
          ".side",
          "[data-testid='frontpage-sidebar']"
        ].join(","),
        awards: [
          "award-button",
          "shreddit-awards",
          ".awardings-bar",
          "[aria-label*='award' i]"
        ].join(",")
      });
      MEDIA_NODE_SELECTOR = [
        "shreddit-player",
        "shreddit-aspect-ratio",
        "gallery-carousel",
        "gif-player",
        "media-lightbox-img",
        "video",
        "reddit-media",
        '[slot="post-media-container"]',
        '[slot="thumbnail"]',
        '[slot="full-media"]',
        '[data-testid="post-media"]',
        "faceplate-progress-video"
      ].join(",");
    }
  });

  // src/content/observer.js
  function createFeedObserver(options) {
    const { onBatch, debounceMs = 120 } = options;
    let observer = null;
    const pending = /* @__PURE__ */ new Set();
    let roots = [];
    const flush = debounce(() => {
      if (pending.size === 0) return;
      const batch = Array.from(pending);
      pending.clear();
      log3.debug(`Detected ${batch.length} new nodes.`);
      try {
        onBatch(batch);
      } catch (err) {
        log3.error("onBatch failed", err);
      }
    }, debounceMs);
    const handleMutations = (mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          pending.add(
            /** @type {Element} */
            node
          );
        }
      }
      flush();
    };
    const resolveRoots = () => {
      const found = queryAll(document, SELECTORS.feedRoots);
      const concrete = found.filter((el) => {
        const tag = el.tagName;
        if (tag === "SHREDDIT-FEED" || tag === "FACEPLATE-TRACKER") return true;
        if (el.id === "siteTable" || el.id === "comment-tree") return true;
        if (tag === "SHREDDIT-COMMENT-TREE") return true;
        if (el.getAttribute("data-testid") === "post-list") return true;
        return false;
      });
      const chosen = concrete.length ? concrete : found.slice(0, 2);
      if (chosen.length) return chosen;
      const fallback = queryAll(
        document,
        "shreddit-app, #App, #shortcut-results, body > div"
      ).slice(0, 1);
      return fallback;
    };
    const connect = () => {
      disconnect();
      roots = resolveRoots();
      if (!roots.length) {
        log3.warn("No feed roots found; retrying later.");
        return false;
      }
      observer = new MutationObserver(handleMutations);
      for (const root of roots) {
        try {
          observer.observe(root, { childList: true, subtree: true });
        } catch (err) {
          log3.warn("Failed to observe root", root, err);
        }
      }
      log3.info(`Observing ${roots.length} root(s).`);
      return true;
    };
    const disconnect = () => {
      flush.cancel();
      pending.clear();
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      roots = [];
    };
    return {
      connect,
      disconnect,
      /** Force a synthetic full pass by calling onBatch with roots */
      requestFullPass: () => {
        try {
          onBatch(resolveRoots());
        } catch (err) {
          log3.error("requestFullPass failed", err);
        }
      }
    };
  }
  var log3;
  var init_observer = __esm({
    "src/content/observer.js"() {
      init_constants();
      init_debounce();
      init_dom();
      init_logger();
      init_selectors();
      log3 = createLogger(LOG_NAMESPACES.OBSERVER);
    }
  });

  // src/utilities/cache.js
  function createWeakCache() {
    const map = /* @__PURE__ */ new WeakMap();
    return {
      get: (el) => map.get(el),
      set: (el, value) => {
        map.set(el, value);
      },
      has: (el) => map.has(el),
      delete: (el) => {
        map.delete(el);
      }
    };
  }
  var init_cache = __esm({
    "src/utilities/cache.js"() {
    }
  });

  // src/content/comments/commentCollector.js
  function collectComments(root) {
    const comments = queryAll(root, SELECTORS.comment);
    if (root instanceof Element && root.matches?.(SELECTORS.comment) && !comments.includes(root)) {
      comments.unshift(root);
    }
    return Array.from(new Set(comments));
  }
  function groupCommentsByParent(comments) {
    const groups = /* @__PURE__ */ new Map();
    for (const comment of comments) {
      const parent = comment.parentElement;
      if (!parent) continue;
      let list = groups.get(parent);
      if (!list) {
        list = [];
        groups.set(parent, list);
      }
      list.push(comment);
    }
    return groups;
  }
  var init_commentCollector = __esm({
    "src/content/comments/commentCollector.js"() {
      init_dom();
      init_selectors();
    }
  });

  // src/content/comments/commentSorter.js
  function parseComment(comment) {
    const fp = `${comment.getAttribute("score") || ""}|${comment.getAttribute("id") || ""}`;
    if (cache.has(comment)) {
      const hit = (
        /** @type {{ score: number, createdMs: number, fp: string }} */
        cache.get(comment)
      );
      if (hit.fp === fp) return hit;
    }
    let score = 0;
    const scoreAttr = comment.getAttribute("score") || comment.getAttribute("data-score");
    if (scoreAttr != null) {
      score = Number.parseInt(String(scoreAttr).replace(/,/g, ""), 10) || 0;
    } else {
      const el = queryOne(comment, ".score, [id*='-comment-rt-score-']");
      if (el) {
        score = Number.parseInt(
          String(el.getAttribute("title") || el.textContent || "0").replace(/,/g, ""),
          10
        ) || 0;
      }
    }
    let createdMs = 0;
    const time = queryOne(comment, "time[datetime], faceplate-timeago");
    if (time) {
      const dt = time.getAttribute("ts") || time.getAttribute("datetime");
      createdMs = Date.parse(dt || "") || Number(dt) || 0;
    }
    const signals = { score, createdMs, fp };
    cache.set(comment, signals);
    return signals;
  }
  function sortCommentsAscending(root) {
    const comments = collectComments(root);
    if (comments.length < 2) return 0;
    const groups = groupCommentsByParent(comments);
    let touched = 0;
    for (const [parent, siblings] of groups) {
      if (siblings.length < 2) continue;
      const decorated = siblings.map((el) => {
        const s = parseComment(el);
        return {
          el,
          key: (
            /** @type {[number, number]} */
            [
              s.score,
              s.createdMs ? -s.createdMs : 0
            ]
          )
        };
      });
      decorated.sort((a, b) => a.key[0] - b.key[0] || a.key[1] - b.key[1]);
      const ordered = decorated.map((d) => d.el);
      let changed = false;
      for (let i = 0; i < ordered.length; i += 1) {
        if (ordered[i] !== siblings[i]) {
          changed = true;
          break;
        }
      }
      if (!changed) continue;
      reorderChildren(parent, ordered);
      touched += 1;
    }
    if (touched) log4.debug(`Reordered comments across ${touched} level(s).`);
    return touched;
  }
  var log4, cache;
  var init_commentSorter = __esm({
    "src/content/comments/commentSorter.js"() {
      init_constants();
      init_cache();
      init_dom();
      init_logger();
      init_commentCollector();
      log4 = createLogger(LOG_NAMESPACES.SORTER);
      cache = createWeakCache();
    }
  });

  // src/content/media/mediaDetector.js
  function elementIsDecorativeIcon(el) {
    const tag = el.tagName?.toLowerCase() || "";
    if (tag !== "img" && tag !== "faceplate-img") return false;
    const w = Number(el.getAttribute("width") || el.width || 0);
    const h = Number(el.getAttribute("height") || el.height || 0);
    if (w && w <= 48 || h && h <= 48) return true;
    const alt = (el.getAttribute("alt") || "").toLowerCase();
    if (/avatar|icon|logo|emoji/.test(alt)) return true;
    const cls = (el.getAttribute("class") || "").toLowerCase();
    if (/avatar|icon|logo/.test(cls)) return true;
    return false;
  }
  function detectMediaInLight(root) {
    const images = [];
    const videos = [];
    const embeds = [];
    for (const el of queryAll(
      root,
      `${MEDIA_NODE_SELECTOR}, img, faceplate-img, picture, iframe`
    )) {
      const tag = el.tagName.toLowerCase();
      if (tag === "img" || tag === "faceplate-img" || tag === "picture") {
        if (elementIsDecorativeIcon(el)) continue;
        images.push(el);
      } else if (tag === "video" || tag === "shreddit-player" || tag === "gif-player" || tag === "faceplate-progress-video") {
        videos.push(el);
      } else if (tag === "iframe") {
        embeds.push(el);
      } else if (tag === "gallery-carousel" || tag === "shreddit-aspect-ratio" || tag === "media-lightbox-img") {
        images.push(el);
      }
    }
    return { images, videos, embeds };
  }
  function classifyPostMedia(post) {
    const postType = (post.getAttribute("post-type") || post.getAttribute("type") || "").toLowerCase();
    const href = post.getAttribute("content-href") || post.getAttribute("data-url") || "";
    let isImagePost = IMAGE_POST_TYPES.has(postType);
    let isVideoPost = VIDEO_POST_TYPES.has(postType);
    if (href) {
      if (/v\.redd\.it|youtube|youtu\.be|tiktok|redgifs|streamable|\.mp4|\.webm|gifv/i.test(href)) {
        isVideoPost = true;
      } else if (MEDIA_HREF.test(href)) {
        isImagePost = true;
      }
    }
    if (isImagePost || isVideoPost) {
      return { isImagePost, isVideoPost, postType };
    }
    if (TEXTISH_TYPES.has(postType) && !href) {
      return { isImagePost: false, isVideoPost: false, postType };
    }
    if (post.classList?.contains("thing")) {
      const thumb = queryOne(post, "a.thumbnail");
      if (thumb && !/\b(self|default|nsfw|spoiler)\b/.test(thumb.className)) {
        isImagePost = true;
      }
      if (queryOne(post, ".expando .media-preview, video, iframe, .reddit-video-player-root")) {
        isVideoPost = true;
      }
      return { isImagePost, isVideoPost, postType };
    }
    if (!postType || postType === "link") {
      const media = detectMediaInLight(post);
      if (media.videos.length || media.embeds.length) isVideoPost = true;
      else if (media.images.length) isImagePost = true;
    }
    return { isImagePost, isVideoPost, postType };
  }
  var MEDIA_HREF, IMAGE_POST_TYPES, VIDEO_POST_TYPES, TEXTISH_TYPES;
  var init_mediaDetector = __esm({
    "src/content/media/mediaDetector.js"() {
      init_dom();
      init_selectors();
      MEDIA_HREF = /i\.redd\.it|preview\.redd\.it|external-preview\.redd\.it|v\.redd\.it|\.gifv?\b|\.mp4\b|\.webm\b|i\.imgur\.com|gfycat\.com|redgifs\.com|giphy\.com|youtube\.com|youtu\.be|streamable\.com|tiktok\.com|shorts\//i;
      IMAGE_POST_TYPES = /* @__PURE__ */ new Set([
        "image",
        "gallery",
        "gif",
        "animated",
        "multipart_image"
      ]);
      VIDEO_POST_TYPES = /* @__PURE__ */ new Set(["video", "media"]);
      TEXTISH_TYPES = /* @__PURE__ */ new Set(["text", "self", "link", ""]);
    }
  });

  // src/content/posts/postCollector.js
  function collectPosts(root) {
    const posts = queryAll(root, SELECTORS.post);
    if (root instanceof Element && root.matches?.(SELECTORS.post) && !posts.includes(root)) {
      posts.unshift(root);
    }
    return Array.from(new Set(posts));
  }
  function groupPostsByParent(posts) {
    const groups = /* @__PURE__ */ new Map();
    for (const post of posts) {
      const parent = post.parentElement;
      if (!parent) continue;
      let list = groups.get(parent);
      if (!list) {
        list = [];
        groups.set(parent, list);
      }
      list.push(post);
    }
    return groups;
  }
  var init_postCollector = __esm({
    "src/content/posts/postCollector.js"() {
      init_dom();
      init_selectors();
    }
  });

  // src/content/filters/keywordFilter.js
  function isClickbaitTitle(title) {
    if (!title) return false;
    if (BAIT_TITLE.test(title)) return true;
    const letters = title.replace(/[^a-zA-Z]/g, "");
    if (letters.length >= 8 && letters === letters.toUpperCase()) return true;
    return false;
  }
  function isBaitDomain(href) {
    if (!href) return false;
    return BAIT_DOMAIN.test(href);
  }
  var BAIT_TITLE, BAIT_DOMAIN;
  var init_keywordFilter = __esm({
    "src/content/filters/keywordFilter.js"() {
      BAIT_TITLE = /\b(you won'?t believe|gone wrong|gone sexual|only \d+\%|like and subscribe|link in bio|free vbucks|smash upvote|upvote if|tag someone|change my mind\b.*🔥|this (is|will) (blow|break)|wait for it)\b/i;
      BAIT_DOMAIN = /tiktok\.com|youtube\.com\/shorts|youtu\.be|instagram\.com\/reel|streamable\.com|redgifs\.com|gfycat\.com|imgur\.com\/(a\/|gallery)/i;
    }
  });

  // src/content/filters/engagementFilter.js
  function postFingerprint(post) {
    return [
      post.getAttribute("id") || "",
      post.getAttribute("permalink") || "",
      post.getAttribute("post-type") || "",
      post.getAttribute("content-href") || post.getAttribute("data-url") || "",
      post.getAttribute("score") || "",
      post.hasAttribute("promoted") ? "1" : "0"
    ].join("|");
  }
  function readTitle(post) {
    return (post.getAttribute("post-title") || post.getAttribute("title") || queryOne(post, "a[slot='title'], a[data-click-id='body'], a.title")?.textContent || "").trim();
  }
  function shouldHidePost(post, settings) {
    if (settings.hidePromoted) {
      if (post.matches?.(SELECTORS.promoted) || post.closest?.(SELECTORS.promoted)) {
        return true;
      }
      if (post.hasAttribute("promoted") || post.getAttribute("is-promoted") === "true" || /promoted|sponsored/i.test(post.getAttribute("aria-label") || "")) {
        return true;
      }
    }
    if (settings.hideSuggested) {
      const label = `${post.getAttribute("noun") || ""} ${post.getAttribute("aria-label") || ""}`;
      if (/suggest|recommend|because you/i.test(label)) return true;
    }
    const { isImagePost, isVideoPost } = classifyPostMedia(post);
    if (settings.hideImages && isImagePost) return true;
    if (settings.hideVideos && isVideoPost) return true;
    const href = post.getAttribute("content-href") || post.getAttribute("data-url") || "";
    if (settings.hideVideos && isBaitDomain(href)) return true;
    const titleAttr = post.getAttribute("post-title") || post.getAttribute("title");
    const title = titleAttr || (isImagePost || isVideoPost ? readTitle(post) : "");
    if (title && isClickbaitTitle(title) && (isImagePost || isVideoPost || isBaitDomain(href))) {
      return true;
    }
    return false;
  }
  function applyEngagementFilters(root, settings, opts = {}) {
    const force = Boolean(opts.force);
    let hidden = 0;
    const posts = collectPosts(root);
    for (const post of posts) {
      const fp = postFingerprint(post);
      if (!force && fingerprints.get(post) === fp) continue;
      fingerprints.set(post, fp);
      const hide = shouldHidePost(post, settings);
      const was = post.classList.contains(HIDE);
      toggleClass(post, HIDE, hide);
      if (hide && !was) hidden += 1;
    }
    if (settings.hidePromoted) {
      const scope = root instanceof Document ? document : root;
      queryAll(scope, SELECTORS.promoted).forEach((el) => {
        if (!el.classList.contains(HIDE)) {
          toggleClass(el, HIDE, true);
          hidden += 1;
        }
      });
    }
    if (hidden) log5.debug(`Hidden ${hidden} unit(s).`);
    return hidden;
  }
  function applyChromeFilters(settings, opts = {}) {
    const key = [
      settings.hideSidebars,
      settings.hideTrendingPanels,
      settings.hideRecommendationPanels,
      settings.hideProfileCards,
      settings.hideAwards,
      settings.compactLayout
    ].join(",");
    if (!opts.force && key === lastChromeKey) return;
    lastChromeKey = key;
    const root = document.documentElement;
    root.classList.toggle("msmb-hide-sidebars", Boolean(settings.hideSidebars));
    root.classList.toggle("msmb-hide-trending", Boolean(settings.hideTrendingPanels));
    root.classList.toggle(
      "msmb-hide-recommendations",
      Boolean(settings.hideRecommendationPanels)
    );
    root.classList.toggle("msmb-hide-profile-cards", Boolean(settings.hideProfileCards));
    root.classList.toggle("msmb-hide-awards", Boolean(settings.hideAwards));
    root.classList.toggle("msmb-compact", Boolean(settings.compactLayout));
  }
  function resetFilterCaches() {
    lastChromeKey = "";
  }
  var log5, HIDE, fingerprints, lastChromeKey;
  var init_engagementFilter = __esm({
    "src/content/filters/engagementFilter.js"() {
      init_constants();
      init_dom();
      init_logger();
      init_selectors();
      init_mediaDetector();
      init_postCollector();
      init_keywordFilter();
      log5 = createLogger(LOG_NAMESPACES.FILTER);
      HIDE = "msmb-filter-hide";
      fingerprints = /* @__PURE__ */ new WeakMap();
      lastChromeKey = "";
    }
  });

  // src/content/media/mediaRemover.js
  function buildShadowCss(settings) {
    const rules = [];
    const compact = settings.compactLayout ? "height:0!important;max-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;border:0!important;" : "";
    if (settings.hideImages) {
      rules.push(`
      img:not([data-msmb-keep]), picture, faceplate-img:not([data-msmb-keep]),
      gallery-carousel, media-lightbox-img, shreddit-aspect-ratio,
      [slot="post-media-container"], [slot="thumbnail"], [slot="full-media"],
      [data-testid="post-media"] {
        display:none!important;${compact}
      }
    `);
    }
    if (settings.hideVideos) {
      rules.push(`
      video, shreddit-player, gif-player, faceplate-progress-video, iframe,
      reddit-media {
        display:none!important;${compact}
      }
    `);
    }
    if (settings.hideAvatars) {
      rules.push(`
      img[alt*="avatar" i], faceplate-img[alt*="avatar" i],
      [data-testid="user-avatar"], faceplate-hovercard img {
        display:none!important;${compact}
      }
    `);
    }
    if (settings.hideSubredditIcons) {
      rules.push(`
      img[alt*="icon" i], faceplate-img[alt*="subreddit" i],
      [data-testid="subreddit-icon"] {
        display:none!important;${compact}
      }
    `);
    }
    return rules.join("\n");
  }
  function injectShadowStyle(shadowRoot, css, force) {
    if (!css) {
      const existing = shadowRoot.querySelector(`style[${STYLE_ATTR}]`);
      existing?.remove();
      styledShadows.delete(shadowRoot);
      return;
    }
    if (!force && styledShadows.has(shadowRoot)) return;
    let style = shadowRoot.querySelector(`style[${STYLE_ATTR}]`);
    if (!style) {
      style = document.createElement("style");
      style.setAttribute(STYLE_ATTR, "1");
      shadowRoot.appendChild(style);
    }
    if (style.textContent !== css) style.textContent = css;
    styledShadows.add(shadowRoot);
  }
  function injectShadowsUnder(root, css, force) {
    forEachRelevantShadow(root, (shadow) => {
      injectShadowStyle(shadow, css, force);
    });
  }
  function hideLightDomMedia(root, settings) {
    let removed = 0;
    if (settings.hideImages || settings.hideVideos) {
      const nodes = queryAll(
        root,
        "img, video, iframe, .media-preview, .reddit-video-player-root, a.thumbnail:not(.self):not(.default)"
      );
      for (const el of nodes) {
        const tag = el.tagName.toLowerCase();
        if (tag === "img" && elementIsDecorativeIcon(el)) continue;
        if (tag === "img" && !settings.hideImages) continue;
        if ((tag === "video" || tag === "iframe") && !settings.hideVideos) continue;
        if (!el.classList.contains(HIDE2)) {
          toggleClass(el, HIDE2, true);
          removed += 1;
        }
      }
    }
    return removed;
  }
  function invalidateMediaStyles() {
    cachedCss = "\0";
  }
  function removeMedia(root, settings, opts = {}) {
    const force = Boolean(opts.force);
    const scope = root instanceof Element || root instanceof Document ? root : document.documentElement;
    const nextCss = buildShadowCss({
      hideImages: Boolean(settings.hideImages),
      hideVideos: Boolean(settings.hideVideos),
      hideAvatars: Boolean(settings.hideAvatars),
      hideSubredditIcons: Boolean(settings.hideSubredditIcons),
      compactLayout: Boolean(settings.compactLayout)
    });
    const cssChanged = nextCss !== cachedCss;
    cachedCss = nextCss;
    if (!settings.hideImages && !settings.hideVideos && !settings.hideAvatars) {
      injectShadowsUnder(document.documentElement, "", true);
      return 0;
    }
    injectShadowsUnder(scope, nextCss, force || cssChanged);
    const removed = hideLightDomMedia(scope, settings);
    if (removed) log6.debug(`Light-DOM media hide: ${removed}`);
    return removed;
  }
  var log6, HIDE2, STYLE_ATTR, styledShadows, cachedCss;
  var init_mediaRemover = __esm({
    "src/content/media/mediaRemover.js"() {
      init_constants();
      init_dom();
      init_logger();
      init_mediaDetector();
      log6 = createLogger(LOG_NAMESPACES.MEDIA);
      HIDE2 = "msmb-media-hide";
      STYLE_ATTR = "data-msmb-media-style";
      styledShadows = /* @__PURE__ */ new WeakSet();
      cachedCss = "";
    }
  });

  // src/content/posts/postParser.js
  function parseCount(raw) {
    if (raw == null || raw === "") return 0;
    const s = String(raw).trim().toLowerCase().replace(/,/g, "");
    if (s === "\u2022" || s === "-" || s === "vote" || s === "votes") return 0;
    const m = s.match(/^(-?\d+(?:\.\d+)?)([kmb])?$/i);
    if (!m) {
      const n2 = Number.parseInt(s, 10);
      return Number.isFinite(n2) ? n2 : 0;
    }
    let n = Number.parseFloat(m[1]);
    const suffix = (m[2] || "").toLowerCase();
    if (suffix === "k") n *= 1e3;
    if (suffix === "m") n *= 1e6;
    if (suffix === "b") n *= 1e9;
    return Math.round(n);
  }
  function fingerprint(post) {
    return [
      post.getAttribute("score") || "",
      post.getAttribute("comment-count") || post.getAttribute("data-comment-count") || "",
      post.getAttribute("award-count") || "",
      post.getAttribute("created-timestamp") || "",
      post.getAttribute("id") || ""
    ].join("|");
  }
  function readScore(post) {
    const attr = post.getAttribute("score") || post.getAttribute("data-score") || post.getAttribute("data-ups");
    if (attr != null && attr !== "") return parseCount(attr);
    const el = queryOne(
      post,
      "[id*='-score-'], .score.unvoted, .score.likes, .score"
    );
    if (el) return parseCount(el.getAttribute("title") || el.textContent);
    return 0;
  }
  function readComments(post) {
    const attr = post.getAttribute("comment-count") || post.getAttribute("data-comment-count") || post.getAttribute("data-comments");
    if (attr != null && attr !== "") return parseCount(attr);
    const link = queryOne(post, "a[data-click-id='comments'], a[href*='/comments/']");
    if (link) return parseCount(link.textContent);
    return 0;
  }
  function readAwards(post) {
    const attr = post.getAttribute("award-count") || post.getAttribute("data-awards");
    if (attr != null && attr !== "") return parseCount(attr);
    return 0;
  }
  function readCreated(post) {
    const attr = post.getAttribute("created-timestamp") || post.getAttribute("data-timestamp") || post.getAttribute("created");
    if (attr) {
      const ms = Date.parse(attr) || Number(attr);
      if (Number.isFinite(ms)) return ms;
    }
    const time = queryOne(post, "time[datetime], faceplate-timeago");
    if (time) {
      const dt = time.getAttribute("ts") || time.getAttribute("datetime");
      const ms = Date.parse(dt || "") || Number(dt);
      if (Number.isFinite(ms)) return ms;
    }
    return 0;
  }
  function parsePost(post, opts = {}) {
    const fp = fingerprint(post);
    if (!opts.force && cache2.has(post)) {
      const hit = (
        /** @type {PostSignals} */
        cache2.get(post)
      );
      if (hit.fp === fp) return hit;
    }
    const signals = {
      score: readScore(post),
      commentCount: readComments(post),
      awardCount: readAwards(post),
      createdMs: readCreated(post),
      id: post.getAttribute("id") || post.getAttribute("thingid") || post.getAttribute("permalink") || "",
      fp
    };
    cache2.set(post, signals);
    return signals;
  }
  function popularityKey(s) {
    const recency = s.createdMs ? -s.createdMs : 0;
    return [s.score, s.awardCount, s.commentCount, recency];
  }
  function compareKeys(a, b) {
    for (let i = 0; i < a.length; i += 1) {
      if (a[i] !== b[i]) return a[i] - b[i];
    }
    return 0;
  }
  var cache2;
  var init_postParser = __esm({
    "src/content/posts/postParser.js"() {
      init_cache();
      init_dom();
      cache2 = createWeakCache();
    }
  });

  // src/content/posts/postSorter.js
  function sortPostsAscending(posts) {
    if (!posts.length) return 0;
    const groups = groupPostsByParent(posts);
    let parentsTouched = 0;
    for (const [parent, siblings] of groups) {
      if (siblings.length < 2) continue;
      const decorated = siblings.map((el) => {
        const signals = parsePost(el);
        return { el, key: popularityKey(signals), signals };
      });
      decorated.sort((a, b) => compareKeys(a.key, b.key));
      const ordered = decorated.map((d) => d.el);
      let changed = false;
      for (let i = 0; i < ordered.length; i += 1) {
        if (ordered[i] !== siblings[i]) {
          changed = true;
          break;
        }
      }
      if (!changed) continue;
      reorderChildren(parent, ordered);
      parentsTouched += 1;
    }
    if (parentsTouched) {
      log7.info(`Reordered posts across ${parentsTouched} container(s).`);
    }
    return parentsTouched;
  }
  var log7;
  var init_postSorter = __esm({
    "src/content/posts/postSorter.js"() {
      init_constants();
      init_dom();
      init_logger();
      init_postCollector();
      init_postParser();
      log7 = createLogger(LOG_NAMESPACES.SORTER);
    }
  });

  // src/content/pipeline.js
  function setObserverControl(hooks) {
    pauseObservers = hooks.pause;
    resumeObservers = hooks.resume;
  }
  function runPipeline(root, settings, opts = {}) {
    const force = Boolean(opts.force);
    const shouldSort = opts.sort !== false;
    try {
      pauseObservers?.();
      applyChromeFilters(settings, { force });
      applyEngagementFilters(root, settings, { force });
      removeMedia(root, settings, { force });
      if (shouldSort && settings.reversePostOrder) {
        sortPostsAscending(collectPosts(root));
      }
      if (shouldSort && settings.reverseCommentOrder) {
        sortCommentsAscending(root);
      }
    } catch (err) {
      log8.error("Pipeline failed; Reddit left as-is for this pass.", err);
    } finally {
      resumeObservers?.();
    }
  }
  function runFullPass(settings) {
    log8.debug("Full pass.");
    runPipeline(document, settings, { force: true, sort: true });
  }
  function invalidateCaches() {
    resetFilterCaches();
    invalidateMediaStyles();
  }
  var log8, pauseObservers, resumeObservers;
  var init_pipeline = __esm({
    "src/content/pipeline.js"() {
      init_constants();
      init_logger();
      init_commentSorter();
      init_engagementFilter();
      init_mediaRemover();
      init_postCollector();
      init_postSorter();
      log8 = createLogger(LOG_NAMESPACES.BOOTSTRAP);
      pauseObservers = null;
      resumeObservers = null;
    }
  });

  // src/content/sites/reddit.js
  function matchReddit(hostname) {
    return /(^|\.)reddit\.com$/i.test(hostname);
  }
  function mountReddit(ctx) {
    let settings = ctx.settings;
    const pendingNodes = /* @__PURE__ */ new Set();
    const html = document.documentElement;
    html.dataset.msmbSite = "reddit";
    html.dataset.msmbReady = "1";
    html.dataset.msmbDebug = ctx.debugLogging ? "1" : "0";
    const applyMarkers = (s, debug) => {
      html.dataset.msmbDebug = debug ? "1" : "0";
      for (const [key, value] of Object.entries(s)) {
        const datasetKey = `msmb${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        html.dataset[datasetKey] = value ? "1" : "0";
      }
    };
    applyMarkers(settings, ctx.debugLogging);
    function batchScopes(added) {
      const scopes = /* @__PURE__ */ new Set();
      for (const node of added) {
        const post = node.matches?.(SELECTORS.post) ? node : node.closest?.(SELECTORS.post);
        if (post?.parentElement) {
          scopes.add(post.parentElement);
          continue;
        }
        const comment = node.matches?.(SELECTORS.comment) ? node : node.closest?.(SELECTORS.comment);
        if (comment?.parentElement) {
          scopes.add(comment.parentElement);
          continue;
        }
        if (node.matches?.("shreddit-feed, shreddit-comment-tree, #siteTable") || node.querySelector?.(SELECTORS.post)) {
          scopes.add(node);
        }
      }
      if (!scopes.size) {
        for (const root of queryAll(
          document,
          "shreddit-feed, #siteTable, shreddit-comment-tree"
        )) {
          scopes.add(root);
        }
      }
      return Array.from(scopes);
    }
    let observerPaused = false;
    const flushIncremental = createRafCoalescer(() => {
      if (!pendingNodes.size) return;
      const batch = Array.from(pendingNodes);
      pendingNodes.clear();
      for (const scope of batchScopes(batch)) {
        runPipeline(scope, settings, { force: false, sort: true });
      }
    });
    const observer = createFeedObserver({
      debounceMs: 160,
      onBatch: (added) => {
        if (observerPaused) return;
        for (const n of added) pendingNodes.add(n);
        flushIncremental();
      }
    });
    setObserverControl({
      pause: () => {
        observerPaused = true;
      },
      resume: () => {
        pendingNodes.clear();
        observerPaused = false;
      }
    });
    const router = createRouter(() => {
      observer.disconnect();
      pendingNodes.clear();
      invalidateCaches();
      window.setTimeout(() => {
        observer.connect();
        runFullPass(settings);
      }, 80);
    });
    const tryConnect = () => {
      if (!observer.connect()) {
        window.setTimeout(tryConnect, 500);
        return;
      }
      runFullPass(settings);
    };
    tryConnect();
    const unsub = ctx.onChange((next) => {
      settings = next.settings;
      applyMarkers(next.settings, next.debugLogging);
      invalidateCaches();
      runFullPass(settings);
    });
    const sweep = window.setInterval(() => {
      for (const feed of queryAll(
        document,
        "shreddit-feed, #siteTable, shreddit-comment-tree"
      )) {
        runPipeline(feed, settings, { force: false, sort: true });
      }
    }, 8e3);
    log9.info("Mounted Reddit adapter.");
    return () => {
      unsub();
      router.destroy();
      observer.disconnect();
      window.clearInterval(sweep);
    };
  }
  var log9, redditAdapter;
  var init_reddit = __esm({
    "src/content/sites/reddit.js"() {
      init_constants();
      init_dom();
      init_logger();
      init_schedule();
      init_selectors();
      init_observer();
      init_pipeline();
      init_router();
      log9 = createLogger(LOG_NAMESPACES.SITE);
      redditAdapter = {
        id: "reddit",
        match: matchReddit,
        /**
         * @param {{
         *   settings: Record<string, boolean>,
         *   debugLogging: boolean,
         *   onChange: (cb: (next: { settings: Record<string, boolean>, debugLogging: boolean }) => void) => () => void,
         * }} ctx
         */
        mount: mountReddit
      };
    }
  });

  // src/content/sites/registry.js
  function resolveAdapter(hostname = location.hostname) {
    const host2 = hostname.replace(/^www\./i, "").toLowerCase();
    for (const adapter of ADAPTERS) {
      try {
        if (adapter.match(host2) || adapter.match(hostname)) return adapter;
      } catch {
      }
    }
    return null;
  }
  var ADAPTERS;
  var init_registry = __esm({
    "src/content/sites/registry.js"() {
      init_platformConfigs();
      init_reddit();
      ADAPTERS = [redditAdapter, ...PLATFORM_ADAPTERS];
    }
  });

  // src/content/main.js
  var require_main = __commonJS({
    "src/content/main.js"() {
      init_constants();
      init_storage();
      init_logger();
      init_registry();
      var log10 = createLogger(LOG_NAMESPACES.BOOTSTRAP);
      var storage = createStorage({
        onError: (err) => log10.error("Storage failure", err)
      });
      async function bootstrap() {
        try {
          const adapter = resolveAdapter();
          if (!adapter) {
            log10.debug("No adapter for host", location.hostname);
            return;
          }
          const root = await storage.readRoot();
          setLoggingEnabled(root.debugLogging);
          if (root.enabledSites?.[adapter.id] === false) {
            log10.info(`Site disabled in settings: ${adapter.id}`);
            return;
          }
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
            }
          });
          storage.subscribe((next) => {
            setLoggingEnabled(next.debugLogging);
            if (next.enabledSites?.[adapter.id] === false) {
              log10.info(`Site turned off: ${adapter.id} \u2014 reload tab to fully unload.`);
              try {
                destroy?.();
              } catch {
              }
              return;
            }
            for (const cb of listeners) {
              try {
                cb({ settings: next.settings, debugLogging: next.debugLogging });
              } catch (err) {
                log10.error("Settings listener failed", err);
              }
            }
          });
          window.__msmbDestroy = () => {
            try {
              destroy?.();
            } catch {
            }
          };
          log10.info(`Bootstrapped adapter: ${adapter.id}`);
        } catch (err) {
          log10.error("Bootstrap failed; leaving page untouched.", err);
        }
      }
      void bootstrap();
    }
  });
  require_main();
})();
