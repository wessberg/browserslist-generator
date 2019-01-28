// @ts-ignore
import Browserslist from "browserslist";
import {gt, gte} from "semver";
import {coerce} from "./coerce";
import {compareVersions} from "./compare-versions";
import {CaniuseBrowser} from "./i-caniuse";
import {NORMALIZE_BROWSER_VERSION_REGEXP} from "./normalize-browser-version-regexp";

/**
 * Ensures that for any given version of a browser, if it is newer than the latest known version, the last known version will be used as a fallback
 * @param {CaniuseBrowser} browser
 * @param {string} givenVersion
 * @param {string[]} [versions]
 */
export function normalizeBrowserVersion(browser: CaniuseBrowser, givenVersion: string, versions: string[] = getSortedBrowserVersions(browser)): string {
	const givenVersionCoerced = coerce(browser, givenVersion);
	const latestVersion = getLatestVersionOfBrowser(browser);
	const latestVersionCoerced = coerce(browser, latestVersion);

	if (givenVersionCoerced == null || latestVersionCoerced == null) {
		throw new TypeError(`Could not detect the version of: '${givenVersion}' for browser: ${browser}`);
	}

	if (
		givenVersionCoerced.major > latestVersionCoerced.major ||
		(givenVersionCoerced.major === latestVersionCoerced.major && givenVersionCoerced.minor > latestVersionCoerced.minor) ||
		(givenVersionCoerced.major === latestVersionCoerced.major && givenVersionCoerced.minor === latestVersionCoerced.minor && givenVersionCoerced.patch > latestVersionCoerced.patch)
	) {
		return latestVersion;
	}

	return getClosestMatchingBrowserVersion(browser, givenVersion, versions);
}

/**
 * Gets the known version of the given browser that is closest to the given version
 * @param {CaniuseBrowser} browser
 * @param {string} version
 * @param {string[]} versions
 */
export function getClosestMatchingBrowserVersion(browser: CaniuseBrowser, version: string, versions: string[] = getSortedBrowserVersions(browser)): string {
	const coerced = coerce(browser, version);

	if (browser === "op_mini" && version === "all") return "all";
	if (browser === "safari") {
		if (version === "TP") return "TP";
		// If the given version is greater than or equal to the latest non-technical preview version of Safari, the closest match IS TP.
		else if (gt(coerce(browser, `${coerced.major}.${coerced.minor}`), coerce(browser, versions.slice(-2)[0]))) return "TP";
	}

	let candidate = versions[0];

	versions.forEach(currentVersion => {
		const currentCoerced = coerce(browser, currentVersion);
		if (gte(coerced, currentCoerced)) {
			candidate = currentVersion;
		}
	});

	return candidate;
}

/**
 * Gets all versions of the given browser, sorted
 * @param {CaniuseBrowser} browser
 * @returns {string}
 */
export function getSortedBrowserVersions(browser: CaniuseBrowser): string[] {
	const queryResultsMapped: Map<CaniuseBrowser, string[]> = new Map();

	// Generate the Browserslist query
	const queryResult: string[] = Browserslist([`>= 0%`, `unreleased versions`]);

	// First, organize the different versions of the browsers inside the Map
	queryResult.forEach(part => {
		const [currentBrowser, version] = <[CaniuseBrowser, string]>part.split(" ");
		let versions = queryResultsMapped.get(currentBrowser);

		if (versions == null) {
			versions = [];
			queryResultsMapped.set(currentBrowser, versions);
		}

		const versionMatch = version.match(NORMALIZE_BROWSER_VERSION_REGEXP);
		const normalizedVersion = versionMatch == null ? version : versionMatch[1];

		versions.push(normalizedVersion);
	});
	return queryResultsMapped.get(browser)!.sort(compareVersions);
}

/**
 * Gets the latest version of the given browser
 * @param {CaniuseBrowser} browser
 * @returns {string}
 */
export function getLatestVersionOfBrowser(browser: CaniuseBrowser): string {
	const versions = getSortedBrowserVersions(browser);
	return versions[versions.length - 1];
}

/**
 * Gets the oldest (stable) version of the given browser
 * @param {CaniuseBrowser} browser
 * @returns {string}
 */
export function getOldestVersionOfBrowser(browser: CaniuseBrowser): string {
	const versions = getSortedBrowserVersions(browser);
	return versions[0];
}

/**
 * Gets the previous version of the given browser from the given version
 * @param {CaniuseBrowser} browser
 * @param {string} version
 * @returns {string | undefined}
 */
export function getPreviousVersionOfBrowser(browser: CaniuseBrowser, version: string): string | undefined {
	const versions = getSortedBrowserVersions(browser);
	const indexOfVersion = versions.indexOf(normalizeBrowserVersion(browser, version, versions));
	// If the version isn't included, or if it is the first version of it, return undefined
	if (indexOfVersion <= 0) return undefined;
	return versions[indexOfVersion - 1];
}

/**
 * Gets the previous version of the given browser from the given version
 * @param {CaniuseBrowser} browser
 * @param {string} version
 * @returns {string | undefined}
 */
export function getNextVersionOfBrowser(browser: CaniuseBrowser, version: string): string | undefined {
	const versions = getSortedBrowserVersions(browser);
	const indexOfVersion = versions.indexOf(normalizeBrowserVersion(browser, version, versions));
	// If the version isn't included, or if it is the first version of it, return undefined
	if (indexOfVersion <= 0) return undefined;
	return versions[indexOfVersion + 1];
}
