// @ts-ignore
import * as Browserslist from "browserslist";
// @ts-ignore
import {feature as caniuseFeature, features as caniuseFeatures} from "caniuse-lite";
import {getLatestVersionOfBrowser, getNextVersionOfBrowser, getPreviousVersionOfBrowser} from "./browser-version";
import {compareVersions} from "./compare-versions";
import {ComparisonOperator} from "./comparison-operator";
import {CaniuseBrowser, CaniuseLiteStats, CaniuseLiteStatsNormalized, CaniuseSupportKind, ICaniuseLiteFeature, ICaniuseLiteFeatureNormalized} from "./i-caniuse-lite";
import {NORMALIZE_BROWSER_VERSION_REGEXP} from "./normalize-browser-version-regexp";
import {UAParser} from "ua-parser-js";
import {IUseragentBrowser, IUseragentDevice, IUseragentOS} from "./useragent/useragent-typed";

// tslint:disable:no-magic-numbers

/**
 * These browsers should be skipped when deciding which browsers to take into account
 * when generating a browserslist
 * @type {Set<string>}
 */
const SKIP_BROWSERS_PAYLOAD: CaniuseBrowser[] = [
	// caniuse.com has some issues with reporting android browsers
	"android",
	"and_chr",
	"and_qq",
	"and_uc"
];
const SKIP_BROWSERS: Set<CaniuseBrowser> = new Set(SKIP_BROWSERS_PAYLOAD);

/**
 * A Map between features and browsers that has partial support for them but should be allowed anyway
 * @type {Map<string, string[]>}
 */
const PARTIAL_SUPPORT_ALLOWANCES: Map<string, CaniuseBrowser[]> = new Map([
	[
		"shadowdomv1",
		<CaniuseBrowser[]>["chrome", "safari", "ios_saf"]
	],
	[
		"custom-elementsv1",
		<CaniuseBrowser[]>["chrome", "safari", "ios_saf"]
	]
]);

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
 * Gets the support from caniuse for the given feature
 * @param {string} feature
 * @returns {ICaniuseLiteFeatureNormalized}
 */
function getSupport (feature: string): CaniuseLiteStatsNormalized {
	return getCaniuseLiteFeatureNormalized(<ICaniuseLiteFeature> caniuseFeature(caniuseFeatures[feature])).stats;
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
	const browserMaps: Map<CaniuseBrowser, string>[] = [];

	for (const feature of features) {
		const support = getSupport(feature);
		// A map between browser names and their required versions
		const browserMap: Map<CaniuseBrowser, string> = new Map();
		Object.entries(support)
			.filter(([browser]: [CaniuseBrowser, { [key: string]: CaniuseSupportKind }]) => !SKIP_BROWSERS.has(browser))
			.forEach(([browser, stats]: [CaniuseBrowser, { [key: string]: CaniuseSupportKind }]) => {
				const fullSupportVersion = getFirstVersionWithSupportKind(CaniuseSupportKind.AVAILABLE, stats);
				const partialSupportVersion = getFirstVersionWithSupportKind(CaniuseSupportKind.PARTIAL_SUPPORT, stats);
				let versionToSet: string|undefined;

				if (fullSupportVersion != null) {
					versionToSet = fullSupportVersion;
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
								versionToSet = partialSupportVersion;
							}
						}
					}
				}

				if (versionToSet == null) {
					// Apply additional checks depending on the comparison operator
					switch (comparisonOperator) {
						case "<":
						case "<=":
							// Add all browsers with no support whatsoever, or those that require prefixing or flags
							versionToSet = getLatestVersionOfBrowser(browser);
					}
				}

				if (versionToSet != null) {
					browserMap.set(browser, versionToSet);
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
	const combinedBrowserMap: Map<CaniuseBrowser, string> = new Map();

	for (const browserMap of browserMaps) {
		for (const [browser, version] of browserMap.entries()) {
			// Take the existing entry from the combined map
			const existingVersion = combinedBrowserMap.get(browser);
			// The browser should be set in the map if it has no entry already
			const shouldSet = existingVersion == null || compareVersions(version, existingVersion) >= 0;

			if (shouldSet) {
				// Set the version in the map
				combinedBrowserMap.set(browser, version);
			}

		}
	}

	// Finally, generate a string array of the browsers
	return [].concat.apply([], Array.from(
		combinedBrowserMap.entries()
	)
		.map(([browser, version]) => {
				// The version is not a number, so we can't do comparisons on it.
				if (isNaN(parseFloat(version))) {
					switch (comparisonOperator) {
						case "<":
						case "<=":
							const previousVersion = getPreviousVersionOfBrowser(browser, version);
							return [
								`not ${browser} ${version}`,
								...(previousVersion == null ? [] : [`${browser} ${comparisonOperator} ${previousVersion}`])
							];
						case ">":
						case ">=":
							const nextVersion = getNextVersionOfBrowser(browser, version);
							return [
								`${browser} ${version}`,
								...(nextVersion == null ? [] : [`${browser} ${comparisonOperator} ${nextVersion}`])
							];
					}
				}
				return [`${browser} ${comparisonOperator} ${version}`];
			}
		));
}

/**
 * Gets the matching CaniuseBrowser for the given UseragentBrowser. Not all are supported, so it may return undefined
 * @param {UAParser} parser
 * @returns {CaniuseBrowser}
 */
function getCaniuseBrowserForUseragentBrowser (parser: InstanceType<typeof UAParser>): CaniuseBrowser | undefined {
	const browser = <IUseragentBrowser> parser.getBrowser();
	const device = <IUseragentDevice> parser.getDevice();
	const os = <IUseragentOS> parser.getOS();

	// First, if it is a Blackberry device, it will always be the 'bb' browser
	if (device.vendor === "BlackBerry" || os.name === "BlackBerry") {
		return "bb";
	}

	switch (browser.name) {

		case "Android Browser": {
			// If the vendor is Samsung, the default browser is Samsung Internet
			if (device.vendor === "Samsung") {
				return "samsung";
			}

			// Default to the stock android browser
			return "android";
		}

		case "Baidu":
			return "baidu";

		case "Chrome":
			return "chrome";

		case "Edge":
			return "edge";

		case "Firefox":

			// Check if the OS is Android, in which case this is actually Firefox for Android
			if (os.name === "Android") {
				return "and_ff";
			}

			// If the OS is iOS, it is actually Safari that drives the WebView
			else if (os.name === "iOS") {
				return "ios_saf";
			}

			// Default to Firefox
			return "firefox";

		case "IE":
			return "ie";

		case "IE Mobile":
			return "ie_mob";

		case "Safari":
			return "safari";

		case "Mobile Safari":
			return "ios_saf";

		case "Opera":
			return "opera";

		case "Opera Mini":
			return "op_mini";

		case "Opera Mobi":
			return "op_mob";

		case "QQBrowser":
			return "and_qq";

		case "UCBrowser":
			return "and_uc";

		default:
			return undefined;
	}
}

/**
 * Normalizes the version of the browser such that it plays well with Caniuse
 * @param {CaniuseBrowser} browser
 * @param {string} version
 * @returns {string}
 */
function getCaniuseVersionForUseragentVersion (browser: CaniuseBrowser, version: string): string {
	switch (browser) {
		case "op_mini":
			// Always use 'all' with Opera Mini
			return "all";

		case "safari": {
			// Check if there is a newer version of the browser
			const nextBrowserVersion = getNextVersionOfBrowser(browser, version);

			// If there isn't we're in the Technology Preview
			if (nextBrowserVersion == null) {
				return "TP";
			}

			// Otherwise, return the current version
			return version;
		}

		default:
			// For anything else, just use that version
			return version;
	}
}

/**
 * Generates a browserslist from the provided useragent string
 * @param {string} useragent
 * @param {string[]} browserslist
 * @returns {string[]}
 */
export function matchBrowserslistOnUserAgent (useragent: string, browserslist: string[]): boolean {
	const parser = new UAParser(useragent);
	const version = parser.getBrowser().version;

	// Prepare a CaniuseBrowser name from the useragent string
	const browserName = getCaniuseBrowserForUseragentBrowser(parser);

	// If the browser name or version couldn't be determined, return false immediately
	if (browserName == null || version == null) return false;

	// Prepare a version from the useragent that plays well with caniuse
	const browserVersion = getCaniuseVersionForUseragentVersion(browserName, version);

	// Prepare a browserslist from the useragent itself
	const useragentBrowserslist: string[] = Browserslist([`${browserName} ${browserVersion}`]);

	// Pipe the input browserslist through Browserslist to normalize it
	const normalizedInputBrowserslist: string[] = Browserslist(browserslist);

	// Now, compare the two, and if the normalized input browserslist includes every option from the user agent, it is matched
	return useragentBrowserslist.every(option => normalizedInputBrowserslist.includes(option));
}