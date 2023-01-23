import {gte, lte} from "semver";
import {getSortedBrowserVersions} from "./browser-version.js";
import {coerceToString} from "./ensure-semver.js";
import type {CaniuseBrowser, CaniuseSupportKind, CaniuseDataCorrection} from "./i-caniuse.js";

/**
 * Applies the given correction within the given version range
 */
export function rangeCorrection(browser: CaniuseBrowser, supportKind: CaniuseSupportKind, start?: string, end?: string): CaniuseDataCorrection[] {
	const versions = getSortedBrowserVersions(browser);
	const corrections: CaniuseDataCorrection[] = [];

	versions.forEach(version => {
		let shouldSet = false;

		if (start == null && end == null) {
			shouldSet = true;
		} else if (start != null && end == null) {
			if (version === "TP") {
				shouldSet = true;
			} else if (version === "all") {
				shouldSet = true;
			} else {
				shouldSet = gte(coerceToString(browser, version), coerceToString(browser, start));
			}
		} else if (start == null && end != null) {
			if (version === "TP") {
				shouldSet = end === "TP";
			} else if (version === "all") {
				shouldSet = true;
			} else {
				shouldSet = lte(coerceToString(browser, version), coerceToString(browser, end));
			}
		} else if (start != null && end != null) {
			if (version === "TP") {
				shouldSet = end === "TP";
			} else if (version === "all") {
				shouldSet = true;
			} else {
				shouldSet = gte(coerceToString(browser, version), coerceToString(browser, start)) && lte(coerceToString(browser, version), coerceToString(browser, end));
			}
		}

		if (shouldSet) {
			corrections.push({
				kind: supportKind,
				version
			});
		}
	});
	return corrections;
}
