// @ts-ignore
import Browserslist from "browserslist";
import {compareVersions} from "./compare-versions";
import {CaniuseBrowser} from "./i-caniuse";
import {NORMALIZE_BROWSER_VERSION_REGEXP} from "./normalize-browser-version-regexp";

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
 * Gets the latest (stable) version of the given browser
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
	const indexOfVersion = versions.indexOf(version);
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
	const indexOfVersion = versions.indexOf(version);
	// If the version isn't included, or if it is the first version of it, return undefined
	if (indexOfVersion <= 0) return undefined;
	return versions[indexOfVersion + 1];
}
