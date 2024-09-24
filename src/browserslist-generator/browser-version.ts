import Browserslist from "browserslist";
import {coerce as _coerce, gt, gte, lt} from "semver";
import {ensureSemver} from "./ensure-semver.js";
import {compareVersions} from "./compare-versions.js";
import type {CaniuseBrowser} from "./i-caniuse.js";
import {NORMALIZE_BROWSER_VERSION_REGEXP} from "./normalize-browser-version-regexp.js";
import {assertNonEmptyArray} from "./util.js";

export const SAFARI_TP_MAJOR_VERSION = (() => {
	const versions = getSortedBrowserVersions("safari");
	const lastVersionBeforeTp = versions[versions.length - 2];
	const coerced = _coerce(lastVersionBeforeTp)!;
	if (coerced.minor === 9) {
		return _coerce(coerced.major + 1)!;
	} else {
		return _coerce(`${coerced.major}.${coerced.minor + 1}.0`)!;
	}
})();

/**
 * Ensures that for any given version of a browser, if it is newer than the latest known version, the last known version will be used as a fallback
 */
export function normalizeBrowserVersion(browser: CaniuseBrowser, givenVersion: string, versions: string[] = getSortedBrowserVersions(browser), allowSmaller = false): string {
	const givenVersionCoerced = ensureSemver(browser, givenVersion);
	const latestVersion = getLatestVersionOfBrowser(browser);
	const latestVersionCoerced = ensureSemver(browser, latestVersion);

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

	const closestMatch = getClosestMatchingBrowserVersion(browser, givenVersion, versions);
	const semverClosestMatch = ensureSemver(browser, closestMatch);

	// Allow smaller, but not larger browser versions than the known ones
	if (allowSmaller && semverClosestMatch != null && lt(givenVersionCoerced, semverClosestMatch, {loose: true})) {
		return givenVersion;
	}

	return closestMatch;
}

/**
 * Gets the known version of the given browser that is closest to the given version
 */
export function getClosestMatchingBrowserVersion(browser: CaniuseBrowser, version: string, versions: string[] = getSortedBrowserVersions(browser)): string {
	assertNonEmptyArray(versions, `Could not find any versions for browser: ${browser}`);

	const coerced = ensureSemver(browser, version);

	if (browser === "op_mini" && version === "all") return "all";
	if (browser === "safari") {
		const browserMajorMinorSemver = coerced == null ? undefined : ensureSemver(browser, `${coerced.major}.${coerced.minor}`);
		const browserLatestNonTpSemver = coerced == null ? undefined : ensureSemver(browser, versions.slice(-2)[0]!);

		if (version === "TP") {
			return "TP";
		}
		// If the given version is greater than or equal to the latest non-technical preview version of Safari, the closest match IS TP.
		else if (browserMajorMinorSemver != null && browserLatestNonTpSemver != null && gt(browserMajorMinorSemver, browserLatestNonTpSemver)) {
			return "TP";
		}
	}

	let [candidate] = versions;

	versions.forEach(currentVersion => {
		const currentCoerced = ensureSemver(browser, currentVersion);
		if (currentCoerced != null && coerced != null && gte(coerced, currentCoerced)) {
			candidate = currentVersion;
		}
	});

	return candidate;
}

export function getSortedBrowserVersionsWithLeadingVersion(browser: CaniuseBrowser, inputVersion?: string): string[] {
	const versions = getSortedBrowserVersions(browser);
	const [firstVersion] = versions;

	if (firstVersion != null && inputVersion != null) {
		const firstVersionSemver = ensureSemver(browser, firstVersion);
		let nextInputVersion = inputVersion;
		while (true) {
			const nextInputSemver = ensureSemver(browser, nextInputVersion);
			if (firstVersionSemver != null && nextInputSemver != null && gt(firstVersionSemver, nextInputSemver)) {
				versions.unshift(nextInputVersion);
				nextInputVersion = String(nextInputSemver.major + 1);
			} else {
				break;
			}
		}
	}
	return versions;
}

/**
 * Gets all versions of the given browser, sorted
 */
export function getSortedBrowserVersions(browser: CaniuseBrowser): string[] {
	// Generate the Browserslist query
	const queryResult: string[] = Browserslist([`>= 0%`, `unreleased versions`]);
	const versions: string[] = [];

	// First, organize the different versions of the browsers inside the Map
	queryResult.forEach(part => {
		const [currentBrowser, version] = part.split(" ") as [CaniuseBrowser, string];
		if (currentBrowser !== browser) return;

		const versionMatch = version.match(NORMALIZE_BROWSER_VERSION_REGEXP);
		const normalizedVersion = versionMatch == null ? version : versionMatch[1];

		if (normalizedVersion != null) {
			versions.push(normalizedVersion);
		}
	});

	return versions.sort(compareVersions);
}

/**
 * Gets the latest version of the given browser
 */
export function getLatestVersionOfBrowser(browser: CaniuseBrowser): string {
	const versions = getSortedBrowserVersions(browser);
	assertNonEmptyArray(versions);
	return versions[versions.length - 1]!;
}

/**
 * Gets the oldest (stable) version of the given browser
 */
export function getOldestVersionOfBrowser(browser: CaniuseBrowser): string {
	const versions = getSortedBrowserVersions(browser);
	assertNonEmptyArray(versions);

	return versions[0];
}

/**
 * Gets the previous version of the given browser from the given version
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
 */
export function getNextVersionOfBrowser(browser: CaniuseBrowser, version: string): string | undefined {
	const versions = getSortedBrowserVersions(browser);
	const indexOfVersion = versions.indexOf(normalizeBrowserVersion(browser, version, versions));
	// If the version isn't included, or if it is the first version of it, return undefined
	if (indexOfVersion <= 0) return undefined;
	return versions[indexOfVersion + 1];
}
