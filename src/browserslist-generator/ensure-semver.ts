import {coerce as _coerce, SemVer} from "semver";
import {SAFARI_TP_MAJOR_VERSION} from "./browser-version";
import {CaniuseBrowser} from "./i-caniuse";

/**
 * Coerces the given version
 */
export function ensureSemver(browser: CaniuseBrowser | undefined, version: string): SemVer {
	if ((browser === "op_mini" || browser === "android") && version === "all") {
		return _coerce("0.0.0")!;
	} else if (browser === "safari" && version === "TP") {
		return SAFARI_TP_MAJOR_VERSION;
	}

	return _coerce(version, {loose: true})!;
}

/**
 * Coerces the given version
 */
export function coerceToString(browser: CaniuseBrowser, version: string): string {
	return ensureSemver(browser, version).toString();
}
