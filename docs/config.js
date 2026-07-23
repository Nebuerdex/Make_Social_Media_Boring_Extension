/**
 * Donation page config — put your real links here, then host the /website folder.
 *
 * Examples:
 *   paypal: "https://paypal.me/YourName"
 *   kofi:   "https://ko-fi.com/yourname"
 *   bmc:    "https://buymeacoffee.com/yourname"
 *   stripe: "https://buy.stripe.com/..."
 *   github: "https://github.com/sponsors/yourname"
 */
window.DONATE_CONFIG = {
  // Chrome Web Store listing (optional — shown in footer when set)
  chromeStoreUrl: "",

  // Add as many methods as you want. First one is the primary button.
  methods: [
    {
      id: "paypal",
      label: "Donate with PayPal",
      href: "", // e.g. "https://paypal.me/YourName"
      primary: true,
    },
    {
      id: "kofi",
      label: "Support on Ko-fi",
      href: "", // e.g. "https://ko-fi.com/yourname"
      primary: false,
    },
    {
      id: "bmc",
      label: "Buy me a coffee",
      href: "", // e.g. "https://www.buymeacoffee.com/yourname"
      primary: false,
    },
  ],
};
