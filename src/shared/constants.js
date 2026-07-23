/**
 * Shared constants — no runtime logic.
 * @module shared/constants
 */

import { SITE_DEFINITIONS as SITES } from "./siteDefinitions.js";

export const EXTENSION_NAME = "Make Social Media Boring";

/** Public site (support + settings). Cog and options open this. */
export const SITE_URL =
  "https://nebuerdex.github.io/Make_Social_Media_Boring_Extension/";

export const SITE_SETTINGS_URL = `${SITE_URL}#settings`;

export const STORAGE_KEYS = Object.freeze({
  ROOT: "msmb",
});

/** Bump when the persisted document shape changes; run a migrator. */
export const SCHEMA_VERSION = 4;

export const LOG_NAMESPACES = Object.freeze({
  BACKGROUND: "Background",
  SETTINGS: "Settings",
  STORAGE: "Storage",
  OBSERVER: "Observer",
  ROUTER: "Router",
  SORTER: "Sorter",
  MEDIA: "Media",
  FILTER: "Filter",
  BOOTSTRAP: "Bootstrap",
  SITE: "Site",
});

export const SITE_DEFINITIONS = SITES;

export const SITE_IDS = Object.freeze(SITE_DEFINITIONS.map((s) => s.id));

/**
 * Feature flags shown on the options page and consumed by site adapters.
 */
export const SETTING_DEFINITIONS = Object.freeze([
  {
    key: "reversePostOrder",
    label: "Reverse post order",
    description: "Least popular / overlooked content first",
  },
  {
    key: "reverseCommentOrder",
    label: "Reverse comment order",
    description: "Low-engagement replies first (where supported)",
  },
  {
    key: "hideImages",
    label: "Hide images",
    description: "Images, galleries, thumbnails, preview cards",
  },
  {
    key: "hideVideos",
    label: "Hide videos",
    description: "Players, GIFs, Shorts, Reels, embeds",
  },
  {
    key: "hideAwards",
    label: "Hide awards / reactions chrome",
    description: "Awards, reaction piles, sticker chrome where applicable",
  },
  {
    key: "hideAvatars",
    label: "Hide avatars",
    description: "Profile pictures in feeds",
  },
  {
    key: "hideSubredditIcons",
    label: "Hide community icons",
    description: "Subreddit / page / channel icons",
  },
  {
    key: "hidePromoted",
    label: "Hide promoted / ads",
    description: "Sponsored and ad units",
  },
  {
    key: "hideSuggested",
    label: "Hide suggested posts",
    description: "Suggested / recommended feed units",
  },
  {
    key: "compactLayout",
    label: "Compact layout",
    description: "Collapse empty space after media removal",
  },
  {
    key: "hideTrendingPanels",
    label: "Hide trending panels",
    description: "Trending and popular modules",
  },
  {
    key: "hideRecommendationPanels",
    label: "Hide recommendation panels",
    description: "For you / similar / up next rails",
  },
  {
    key: "hideSidebars",
    label: "Hide sidebars",
    description: "Right rail and secondary columns",
  },
  {
    key: "hideProfileCards",
    label: "Hide profile cards",
    description: "Hover cards and profile promo units",
  },
]);

export const SETTING_KEYS = Object.freeze(
  SETTING_DEFINITIONS.map((d) => d.key)
);
