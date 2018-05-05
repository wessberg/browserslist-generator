// @ts-ignore
import {matchesUA} from "browserslist-useragent";
// @ts-ignore
import {getSupport} from "caniuse-api";
// @ts-ignore
import * as Browserslist from "browserslist";
import {ComparisonOperator} from "./comparison-operator";

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
	return matchesUA(userAgent, {
		browsers: browserslist,
		_allowHigherVersions: true,
		ignoreMinor: true,
		ignorePatch: true
	});
}

/**
 * Returns the input query, but extended with the given options
 * @param {string[]} query
 * @param {string|string[]} extendWith
 * @returns {string[]}
 */
function extendQueryWith (query: string[], extendWith: string|string[]): string[] {
	const normalizedExtendWith = Array.isArray(extendWith) ? extendWith : [extendWith];
	return [...new Set([
		...query,
		...normalizedExtendWith
	])];
}

/**
 * Returns the input query, but extended with 'unreleased versions'
 * @param {string[]} query
 * @returns {string[]}
 */
function extendQueryWithUnreleasedVersions (query: string[]): string[] {
	return extendQueryWith(query, "unreleased versions");
}

/**
 * Generates a Browserslist based on browser support for the given features
 * @param {string[]} features
 * @returns {string}
 */
export function browsersWithSupportForFeatures (...features: string[]): string[] {
	const baseQuery = browsersWithSupportForFeaturesCommon(">=", ...features);
	return extendQueryWithUnreleasedVersions(baseQuery);
}

/**
 * Returns true if the given browserslist support all of the given features
 * @param {string[]} browserslist
 * @param {string} features
 * @returns {boolean}
 */
export function browserslistSupportsFeatures (browserslist: string[], ...features: string[]): boolean {
	// First, generate an ideal browserslist that would target the given features exactly
	const normalizedIdealBrowserslist: string[] = Browserslist(browsersWithSupportForFeatures(...features));

	// Now, normalize the input browserslist
	const normalizedInputBrowserslist: string[] = Browserslist(extendQueryWithUnreleasedVersions(browserslist));

	// Now, compare the two and see if they align. If they do, the input browserslist *does* support all of the given features.
	// They align if all members of the input browserslist are included in the ideal browserslist
	return normalizedInputBrowserslist.every(option => normalizedIdealBrowserslist.includes(option));
}

/**
 * Generates a Browserslist based on browsers that *doesn't* support the given features
 * @param {string[]} features
 * @returns {string}
 */
export function browsersWithoutSupportForFeatures (...features: string[]): string[] {
	return browsersWithSupportForFeaturesCommon("<", ...features);
}

/**
 * Common logic for the functions that generate browserslists based on feature support
 * @param {ComparisonOperator} comparisonOperator
 * @param {string} features
 * @returns {string[]}
 */
function browsersWithSupportForFeaturesCommon (comparisonOperator: ComparisonOperator, ...features: string[]): string[] {
	// A map between browser names and their required versions
	const browserMap: Map<string, number> = new Map();

	for (const feature of features) {
		const support = getSupport(feature);
		Object.entries(support)
			.filter(([browser]) => !SKIP_BROWSERS.has(browser))
			.forEach(([browser, stats]) => {
				const version = (<{ y: number }>stats).y;

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
	return Array.from(
		browserMap.entries())
		.map(([browser, version]) => `${browser} ${comparisonOperator} ${version}`
		);
}