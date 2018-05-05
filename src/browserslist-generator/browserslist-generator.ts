// @ts-ignore
import * as Browserslist from "browserslist";
// @ts-ignore
import {matchesUA} from "browserslist-useragent";
// @ts-ignore
import {feature as caniuseFeature, features as caniuseFeatures} from "caniuse-lite";
import {ComparisonOperator} from "./comparison-operator";
import {CaniuseLiteBrowser, CaniuseLiteStats, CaniuseLiteStatsNormalized, CaniuseSupportKind, ICaniuseLiteFeature, ICaniuseLiteFeatureNormalized} from "./i-caniuse-lite";

// tslint:disable:no-magic-numbers

/**
 * These browsers should be skipped when deciding which browsers to take into account
 * when generating a browserslist
 * @type {Set<string>}
 */
const SKIP_BROWSERS_PAYLOAD: CaniuseLiteBrowser[] = [
	// caniuse.com has some issues with reporting android browsers
	"android",
	"and_chr",
	"and_qq",
	"and_uc"
];
const SKIP_BROWSERS: Set<CaniuseLiteBrowser> = new Set(SKIP_BROWSERS_PAYLOAD);

/**
 * A Regular Expression that captures the part of a browser version that should be kept
 * @type {RegExp}
 */
const NORMALIZE_BROWSER_VERSION_REGEXP = /(?![\d.,]+-)-*(.*)/;

/**
 * A Map between features and browsers that has partial support for them but should be allowed anyway
 * @type {Map<string, string[]>}
 */
const PARTIAL_SUPPORT_ALLOWANCES: Map<string, CaniuseLiteBrowser[]> = new Map([
	[
		"shadowdomv1",
		<CaniuseLiteBrowser[]>["chrome", "safari", "ios_saf"]
	],
	[
		"custom-elementsv1",
		<CaniuseLiteBrowser[]>["chrome", "safari", "ios_saf"]
	]
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
function extendQueryWith (query: string[], extendWith: string | string[]): string[] {
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
 * Normalizes the given ICaniuseLiteFeature
 * @param {ICaniuseLiteFeature} feature
 * @returns {ICaniuseLiteFeatureNormalized}
 */
function getCaniuseLiteFeatureNormalized (feature: ICaniuseLiteFeature): ICaniuseLiteFeatureNormalized {
	Object.keys(feature.stats).forEach((browser: keyof CaniuseLiteStats) => {
		const browserDict = feature.stats[browser];
		Object.entries(browserDict).forEach(([version, support]: [string, string]) => {
			const versionMatch = version.match(NORMALIZE_BROWSER_VERSION_REGEXP);
			const normalizedVersion = versionMatch == null ? version : versionMatch[1];
			let supportKind: CaniuseSupportKind;
			if (support.startsWith("y")) {
				supportKind = CaniuseSupportKind.AVAILABLE;
			}

			else if (support.startsWith("n")) {
				supportKind = CaniuseSupportKind.UNAVAILABLE;
			}

			else if (support.startsWith("a")) {
				supportKind = CaniuseSupportKind.PARTIAL_SUPPORT;
			}
			else {
				supportKind = CaniuseSupportKind.PREFIXED;
			}

			// Delete the rewritten version
			if (version !== normalizedVersion) {
				delete browserDict[version];
			}
			browserDict[normalizedVersion] = supportKind;
		});
	});
	return <ICaniuseLiteFeatureNormalized> feature;
}

/**
 * Gets the latest (stable) version of the given browser
 * @param {CaniuseLiteBrowser} browser
 * @returns {string}
 */
function getLatestVersionOfBrowser (browser: CaniuseLiteBrowser): string {
	const queryResultsMapped: Map<CaniuseLiteBrowser, string[]> = new Map();

	// Generate the Browserslist query
	const queryResult: string[] = Browserslist([`>= 0%`, `unreleased versions`]);

	// First, organize the different versions of the browsers inside the Map
	queryResult.forEach(part => {
		const [currentBrowser, version] = <[CaniuseLiteBrowser, string]> part.split(" ");
		let versions = queryResultsMapped.get(currentBrowser);

		if (versions == null) {
			versions = [];
			queryResultsMapped.set(currentBrowser, versions);
		}

		const versionMatch = version.match(NORMALIZE_BROWSER_VERSION_REGEXP);
		const normalizedVersion = versionMatch == null ? version : versionMatch[1];

		versions.push(normalizedVersion);
	});
	return queryResultsMapped.get(browser)!
		.sort(compareVersions)
		.slice(-1)[0];
}

/**
 * Gets the support from caniuse for the given feature
 * @param {string} feature
 * @returns {ICaniuseLiteFeatureNormalized}
 */
function getSupport (feature: string): CaniuseLiteStatsNormalized {
	return getCaniuseLiteFeatureNormalized(<ICaniuseLiteFeature> caniuseFeature(caniuseFeatures[feature])).stats;
}

/**
 * Compares two versions, a and b
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function compareVersions (a: string, b: string): number {
	const normalizedA = isNaN(parseFloat(a)) ? a : parseFloat(a);
	const normalizedB = isNaN(parseFloat(b)) ? b : parseFloat(b);

	if (typeof normalizedA === "string" && typeof normalizedB !== "string") {
		return 1;
	}

	if (typeof normalizedB === "string" && typeof normalizedA !== "string") {
		return -1;
	}

	if (normalizedA < normalizedB) return -1;
	if (normalizedA > normalizedB) return 1;
	return 0;
}

/**
 * Gets the first version that matches the given CaniuseSupportKind
 * @param {CaniuseSupportKind} kind
 * @param {object} stats
 * @returns {string | undefined}
 */
function getFirstVersionWithSupportKind (kind: CaniuseSupportKind, stats: { [key: string]: CaniuseSupportKind }): string | undefined {
	// Sort all keys of the object
	const sortedKeys = Object.keys(stats).sort(compareVersions);

	for (const key of sortedKeys) {
		if (stats[key] === kind) {
			return key;
		}
	}

	return undefined;
}

/**
 * Common logic for the functions that generate browserslists based on feature support
 * @param {ComparisonOperator} comparisonOperator
 * @param {string} features
 * @returns {string[]}
 */
function browsersWithSupportForFeaturesCommon (comparisonOperator: ComparisonOperator, ...features: string[]): string[] {
	// All of the generated browser maps
	const browserMaps: Map<CaniuseLiteBrowser, string>[] = [];

	for (const feature of features) {
		const support = getSupport(feature);
		// A map between browser names and their required versions
		const browserMap: Map<CaniuseLiteBrowser, string> = new Map();
		Object.entries(support)
			.filter(([browser]: [CaniuseLiteBrowser, { [key: string]: CaniuseSupportKind }]) => !SKIP_BROWSERS.has(browser))
			.forEach(([browser, stats]: [CaniuseLiteBrowser, { [key: string]: CaniuseSupportKind }]) => {
				const fullSupportVersion = getFirstVersionWithSupportKind(CaniuseSupportKind.AVAILABLE, stats);
				const partialSupportVersion = getFirstVersionWithSupportKind(CaniuseSupportKind.PARTIAL_SUPPORT, stats);

				if (fullSupportVersion != null) {
					browserMap.set(browser, fullSupportVersion);
				}

				// Otherwise, check if partial support exists and should be allowed
				if (partialSupportVersion != null) {
					// Get all partial support allowances for this specific feature
					const partialSupportMatch = PARTIAL_SUPPORT_ALLOWANCES.get(feature);

					if (partialSupportMatch != null) {
						// Check if partial support exists for the browser
						if (partialSupportMatch.includes(browser)) {
							// If no full supported version exists or if the partial supported version has a lower version number than the full supported one, use that one instead
							if (fullSupportVersion == null || compareVersions(partialSupportVersion, fullSupportVersion) < 0) {
								browserMap.set(browser, partialSupportVersion);
							}
						}
					}
				}

				// Apply additional checks depending on the comparison operator
				switch (comparisonOperator) {
					case "<":
					case "<=":
						// Add all browsers with no support whatsoever, or those that require prefixing or flags
						browserMap.set(browser, getLatestVersionOfBrowser(browser));
				}

			});
		browserMaps.push(browserMap);
	}

	// Now, remove all browsers that isn't part of all generated browser maps
	for (const browserMap of browserMaps) {
		for (const browser of browserMap.keys()) {
			if (!browserMaps.every(map => map.has(browser))) {
				// Delete the browser if it isn't included in all of the browser maps
				browserMap.delete(browser);
			}
		}
	}

	// Now, prepare a combined browser map
	const combinedBrowserMap: Map<CaniuseLiteBrowser, string> = new Map();

	for (const browserMap of browserMaps) {
		for (const [browser, version] of browserMap.entries()) {
			// Take the existing entry from the combined map
			const existingVersion = combinedBrowserMap.get(browser);
			// The browser should be set in the map if it has no entry already
			let shouldSet = existingVersion == null;

			// If it *has* an entry, also check if the version should be updated, depending on the comparison operator
			if (existingVersion != null) {
				const comparableVersion = isNaN(parseFloat(version)) ? version : parseFloat(version);
				const comparableExistingVersion = isNaN(parseFloat(existingVersion)) ? version : parseFloat(existingVersion);
				switch (comparisonOperator) {
					case ">=":
					case ">":
						shouldSet = comparableVersion >= comparableExistingVersion;
						break;
					case "<=":
					case "<":
						shouldSet = comparableVersion <= comparableExistingVersion;
						break;
				}
			}

			if (shouldSet) {
				// Set the version in the map
				combinedBrowserMap.set(browser, version);
			}

		}
	}

	// Finally, generate a string array of the browsers
	return Array.from(
		combinedBrowserMap.entries())
		.map(([browser, version]) => `${browser} ${comparisonOperator} ${version}`
		);
}