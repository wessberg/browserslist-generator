// @ts-ignore
import {getSupport} from "caniuse-api";
// @ts-ignore
import {matchesUA} from "browserslist-useragent";

/**
 * These browsers should be skipped when deciding which browsers to take into account
 * when generating a browserslist
 * @type {Set<string>}
 */
const SKIP_BROWSERS: Set<string> = new Set([
	// caniuse.com has some issues with reporting android browsers
	"android",
	"and_chr",
	"and_qq",
	"and_uc"
]);

/**
 * A function that will match a browserslist on the given user agent
 * @param {string} userAgent
 * @param {string[]} browserslist
 * @returns {boolean}
 */
export function matchBrowserslistOnUserAgent (userAgent: string, browserslist: string[]): boolean {
	return matchesUA(userAgent, {browsers: browserslist});
}

/**
 * Generates a Browserslist based on browser support for the given features
 * @param {string[]} features
 * @returns {string}
 */
export function browsersWithSupportForFeatures (...features: string[]): string[] {
	// A map between browser names and their required versions
	const browserMap: Map<string, number> = new Map();

	for (const feature of features) {
		const support = getSupport(feature);
		Object.entries(support)
			.filter(([browser]) => !SKIP_BROWSERS.has(browser))
			.forEach(([browser, stats]) => {
			const version = (<{y: number}>stats).y;

			if (version != null) {
				// Get the existing version, if any
				const existingVersion = browserMap.get(browser);
				// If there is no existing version, or if the required version is greater than the existing one, update it
				if (existingVersion == null || version > existingVersion) {
					browserMap.set(browser, version);
				}
			}
		});
	}
	// Finally, generate a string array of the browsers
	return Array.from(browserMap.entries())
		.map(([browser, version]) => `${browser} >= ${version}`);
}