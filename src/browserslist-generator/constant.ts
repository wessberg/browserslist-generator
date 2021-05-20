/**
 * Caniuse has only a limited set of supported browsers.
 * There are cases where there is simply no way to guess
 * a browser based on a User Agent, and in these cases
 * this can be used as a fallback.
 * Chrome is the world's most used browser, and as an evergreen
 * browser, it is commonly the newest version. But to be safe
 * This fallback browser is placed a bit in the past
 */
export const UNKNOWN_CANIUSE_BROWSER = {
	browser: "chrome",
	version: "80"
} as const;