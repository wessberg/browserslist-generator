import {coerce as _coerce, SemVer} from "semver";
import {SAFARI_TP_MAJOR_VERSION} from "./browser-version";
import {CaniuseBrowser} from "./i-caniuse";

/**
 * Coerces the given version
 * @param {CaniuseBrowser} browser
 * @param {string} version
 * @returns {SemVer}
 */
export function ensureSemver(browser: CaniuseBrowser | undefined, version: string): SemVer {
	if ((browser === "op_mini" || browser === "android") && version === "all") {
		return _coerce("0.0.0")!;
	} else if (browser === "safari" && version === "TP") {
		return SAFARI_TP_MAJOR_VERSION;
	}

	return _coerce(version)!;
}

/**
 * Coerces the given version
 * @param {CaniuseBrowser} browser
 * @param {string} version
 * @returns {string}
 */
export function coerceToString(browser: CaniuseBrowser, version: string): string {
	return ensureSemver(browser, version).toString();
}
