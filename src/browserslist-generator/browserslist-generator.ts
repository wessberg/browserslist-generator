// @ts-ignore
import Browserslist from "browserslist";
// @ts-ignore
import {feature as caniuseFeature, features as caniuseFeatures} from "caniuse-lite";
import compatData from "mdn-browser-compat-data";
import {get} from "object-path";
import {gt, gte, lte} from "semver";
import {getNextVersionOfBrowser, getOldestVersionOfBrowser, getPreviousVersionOfBrowser, getSortedBrowserVersions, normalizeBrowserVersion} from "./browser-version";
import {coerce, coerceToString} from "./coerce";
import {compareVersions} from "./compare-versions";
import {ComparisonOperator} from "./comparison-operator";
import {EcmaVersion, ES2015_FEATURES, ES2016_FEATURES, ES2017_FEATURES, ES2018_FEATURES, ES2019_FEATURES, ES5_FEATURES} from "./ecma-version";
import {IBrowserSupportForFeaturesCommonResult} from "./i-browser-support-for-features-common-result";
import {CaniuseBrowser, CaniuseStats, CaniuseStatsNormalized, CaniuseSupportKind, ICaniuseBrowserCorrection, ICaniuseDataCorrection, ICaniuseFeature} from "./i-caniuse";
import {IMdn, MdnBrowserName} from "./i-mdn";
import {NORMALIZE_BROWSER_VERSION_REGEXP} from "./normalize-browser-version-regexp";
import {UaParserWrapper} from "./ua-parser-wrapper";
import {IUseragentBrowser, IUseragentOS} from "./useragent/useragent-typed";

/**
 * A Cache between user agent names and generated Browserslists
 * @type {Map<string, string[]>}
 */
const userAgentToBrowserslistCache: Map<string, string[]> = new Map();

/**
 * A Cache for retrieving browser support for some features
 * @type {Map<string, IBrowserSupportForFeaturesCommonResult>}
 */
const browserSupportForFeaturesCache: Map<string, IBrowserSupportForFeaturesCommonResult> = new Map();

/**
 * A Cache between feature names and their CaniuseStats
 * @type {Map<string, CaniuseStatsNormalized>}
 */
const featureToCaniuseStatsCache: Map<string, CaniuseStatsNormalized> = new Map();

/**
 * A Cache between user agents with any amount of features and whether or not they are supported by the user agent
 * @type {Map<string, boolean>}
 */
const userAgentWithFeaturesToSupportCache: Map<string, boolean> = new Map();

// tslint:disable:no-magic-numbers

/**
 * A Map between features and browsers that has partial support for them but should be allowed anyway
 * @type {Map<string, string[]>}
 */
const PARTIAL_SUPPORT_ALLOWANCES = <Map<string, CaniuseBrowser[] | "*">>new Map([["shadowdomv1", "*"], ["custom-elementsv1", "*"], ["web-animation", "*"]]);

/**
 * These browsers will be ignored all-together since they only report the latest
 * version from Caniuse and is considered unreliable because of it
 * @type {Set<string>}
 */
const IGNORED_BROWSERS_INPUT: CaniuseBrowser[] = ["and_chr", "and_ff", "and_uc", "and_qq", "baidu", "op_mini"];
const IGNORED_BROWSERS: Set<CaniuseBrowser> = new Set(IGNORED_BROWSERS_INPUT);

/**
 * Applies the given correction within the given version range
 * @param browser
 * @param start
 * @param end
 * @param supportKind
 */
function rangeCorrection(browser: CaniuseBrowser, supportKind: CaniuseSupportKind, start?: string, end?: string): ICaniuseDataCorrection[] {
	const versions = getSortedBrowserVersions(browser);
	const corrections: ICaniuseDataCorrection[] = [];

	versions.forEach(version => {
		let shouldSet: boolean = false;

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

const TYPED_ARRAY_BASE_DATA_CORRECTIONS_INPUT: ICaniuseBrowserCorrection = {
	android: rangeCorrection("android", CaniuseSupportKind.AVAILABLE, `4`),
	chrome: rangeCorrection("and_chr", CaniuseSupportKind.AVAILABLE, `7`),
	and_chr: rangeCorrection("and_chr", CaniuseSupportKind.AVAILABLE, `7`),
	edge: rangeCorrection("edge", CaniuseSupportKind.AVAILABLE, "12"),
	samsung: rangeCorrection("samsung", CaniuseSupportKind.AVAILABLE, `4`),
	opera: rangeCorrection("opera", CaniuseSupportKind.AVAILABLE, `12`),
	op_mob: rangeCorrection("op_mob", CaniuseSupportKind.AVAILABLE, `12`),
	firefox: rangeCorrection("firefox", CaniuseSupportKind.AVAILABLE, `4`),
	and_ff: rangeCorrection("and_ff", CaniuseSupportKind.AVAILABLE, `4`),
	safari: rangeCorrection("safari", CaniuseSupportKind.AVAILABLE, `6`),
	ios_saf: rangeCorrection("safari", CaniuseSupportKind.AVAILABLE, `5`),
	ie: rangeCorrection("ie", CaniuseSupportKind.AVAILABLE, `11`),
	op_mini: rangeCorrection("op_mini", CaniuseSupportKind.AVAILABLE, `all`),
	bb: rangeCorrection("bb", CaniuseSupportKind.AVAILABLE, `10`),
	and_uc: rangeCorrection("and_uc", CaniuseSupportKind.AVAILABLE, `11.8`),
	and_qq: rangeCorrection("and_qq", CaniuseSupportKind.AVAILABLE, `1.2`),
	baidu: rangeCorrection("baidu", CaniuseSupportKind.AVAILABLE, `7.12`)
};

const TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT: ICaniuseBrowserCorrection = {
	android: rangeCorrection("android", CaniuseSupportKind.AVAILABLE, `45`),
	chrome: rangeCorrection("and_chr", CaniuseSupportKind.AVAILABLE, `45`),
	and_chr: rangeCorrection("and_chr", CaniuseSupportKind.AVAILABLE, `45`),
	edge: rangeCorrection("edge", CaniuseSupportKind.AVAILABLE, "12"),
	samsung: rangeCorrection("samsung", CaniuseSupportKind.AVAILABLE, `5`),
	opera: rangeCorrection("opera", CaniuseSupportKind.AVAILABLE, `32`),
	op_mob: rangeCorrection("op_mob", CaniuseSupportKind.AVAILABLE, `32`),
	firefox: rangeCorrection("firefox", CaniuseSupportKind.AVAILABLE, `38`),
	and_ff: rangeCorrection("and_ff", CaniuseSupportKind.AVAILABLE, `38`),
	safari: rangeCorrection("safari", CaniuseSupportKind.AVAILABLE, `10`),
	ios_saf: rangeCorrection("safari", CaniuseSupportKind.AVAILABLE, `10`),
	ie: rangeCorrection("ie", CaniuseSupportKind.AVAILABLE, `11`),
	ie_mob: rangeCorrection("ie", CaniuseSupportKind.AVAILABLE, `11`)
};

const TYPED_ARRAY_ES2016_DATA_CORRECTIONS_INPUT: ICaniuseBrowserCorrection = {
	android: rangeCorrection("android", CaniuseSupportKind.AVAILABLE, `47`),
	chrome: rangeCorrection("and_chr", CaniuseSupportKind.AVAILABLE, `47`),
	and_chr: rangeCorrection("and_chr", CaniuseSupportKind.AVAILABLE, `47`),
	edge: rangeCorrection("edge", CaniuseSupportKind.AVAILABLE, "14"),
	samsung: rangeCorrection("samsung", CaniuseSupportKind.AVAILABLE, `5`),
	opera: rangeCorrection("opera", CaniuseSupportKind.AVAILABLE, `34`),
	op_mob: rangeCorrection("op_mob", CaniuseSupportKind.AVAILABLE, `34`),
	firefox: rangeCorrection("firefox", CaniuseSupportKind.AVAILABLE, `43`),
	and_ff: rangeCorrection("and_ff", CaniuseSupportKind.AVAILABLE, `43`),
	safari: rangeCorrection("safari", CaniuseSupportKind.AVAILABLE, `10`),
	ios_saf: rangeCorrection("safari", CaniuseSupportKind.AVAILABLE, `10`)
};

const TYPED_ARRAY_KEYS_VALUES_ENTRIES_ITERATOR_DATA_CORRECTIONS_INPUT: ICaniuseBrowserCorrection = {
	android: rangeCorrection("android", CaniuseSupportKind.AVAILABLE, `38`),
	chrome: rangeCorrection("and_chr", CaniuseSupportKind.AVAILABLE, `38`),
	and_chr: rangeCorrection("and_chr", CaniuseSupportKind.AVAILABLE, `38`),
	edge: rangeCorrection("edge", CaniuseSupportKind.AVAILABLE, "12"),
	samsung: rangeCorrection("samsung", CaniuseSupportKind.AVAILABLE, `5`),
	opera: rangeCorrection("opera", CaniuseSupportKind.AVAILABLE, `26`),
	op_mob: rangeCorrection("op_mob", CaniuseSupportKind.AVAILABLE, `26`),
	firefox: rangeCorrection("firefox", CaniuseSupportKind.AVAILABLE, `37`),
	and_ff: rangeCorrection("and_ff", CaniuseSupportKind.AVAILABLE, `37`),
	safari: rangeCorrection("safari", CaniuseSupportKind.AVAILABLE, `10`),
	ios_saf: rangeCorrection("safari", CaniuseSupportKind.AVAILABLE, `10`)
};

const TYPED_ARRAY_SPECIES_DATA_CORRECTIONS_INPUT: ICaniuseBrowserCorrection = {
	android: rangeCorrection("android", CaniuseSupportKind.AVAILABLE, `51`),
	chrome: rangeCorrection("and_chr", CaniuseSupportKind.AVAILABLE, `51`),
	and_chr: rangeCorrection("and_chr", CaniuseSupportKind.AVAILABLE, `51`),
	edge: rangeCorrection("edge", CaniuseSupportKind.AVAILABLE, "13"),
	samsung: rangeCorrection("samsung", CaniuseSupportKind.AVAILABLE, `5`),
	opera: rangeCorrection("opera", CaniuseSupportKind.AVAILABLE, `38`),
	op_mob: rangeCorrection("op_mob", CaniuseSupportKind.AVAILABLE, `38`),
	firefox: rangeCorrection("firefox", CaniuseSupportKind.AVAILABLE, `48`),
	and_ff: rangeCorrection("and_ff", CaniuseSupportKind.AVAILABLE, `48`),
	safari: rangeCorrection("safari", CaniuseSupportKind.AVAILABLE, `10`),
	ios_saf: rangeCorrection("safari", CaniuseSupportKind.AVAILABLE, `10`)
};

/**
 * Not all Caniuse data is entirely correct. For some features, the data on https://kangax.github.io/compat-table/es6/
 * is more correct. When a Browserslist is generated based on support for specific features, it is really important
 * that it is correct, especially if the browserslist will be used as an input to tools such as @babel/preset-env.
 * This table provides some corrections to the Caniuse data that makes it align better with actual availability
 * @type {[string, ICaniuseBrowserCorrection][]}
 */
const FEATURE_TO_BROWSER_DATA_CORRECTIONS_INPUT: [string, ICaniuseBrowserCorrection][] = [
	[
		"xhr2",
		{
			ie: [
				{
					// Caniuse reports that XMLHttpRequest support is partial in Internet Explorer 11, but it is in fact properly supported
					kind: CaniuseSupportKind.AVAILABLE,
					version: "11"
				}
			]
		}
	],
	[
		"es6-class",
		{
			edge: [
				{
					// Caniuse reports that Microsoft Edge has been supporting classes since v12, but it was prefixed until v13
					kind: CaniuseSupportKind.PREFIXED,
					version: "12"
				}
			],
			ios_saf: [
				{
					// Caniuse reports that iOS Safari has been supporting classes since v9, but the implementation was only partial
					kind: CaniuseSupportKind.PARTIAL_SUPPORT,
					version: "9"
				},
				{
					// Caniuse reports that iOS Safari has been supporting classes since v9, but the implementation was only partial
					kind: CaniuseSupportKind.PARTIAL_SUPPORT,
					version: "9.2"
				},
				{
					// Caniuse reports that iOS Safari has been supporting classes since v9, but the implementation was only partial
					kind: CaniuseSupportKind.PARTIAL_SUPPORT,
					version: "9.3"
				}
			],
			safari: [
				{
					// Caniuse reports that Safari has been supporting classes since v9, but the implementation was only partial
					kind: CaniuseSupportKind.PARTIAL_SUPPORT,
					version: "9"
				},
				{
					// Caniuse reports that Safari has been supporting classes since v9, but the implementation was only partial
					kind: CaniuseSupportKind.PARTIAL_SUPPORT,
					version: "9.1"
				}
			]
		}
	],
	["javascript.builtins.TypedArray.from", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.of", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.subarray", TYPED_ARRAY_BASE_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.copyWithin", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.every", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.fill", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.filter", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.find", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.findIndex", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.forEach", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.indexOf", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.join", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.lastIndexOf", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.map", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.reduce", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.reduceRight", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.reverse", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.some", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.sort", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.toLocaleString", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.toString", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.slice", TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.includes", TYPED_ARRAY_ES2016_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.keys", TYPED_ARRAY_KEYS_VALUES_ENTRIES_ITERATOR_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.values", TYPED_ARRAY_KEYS_VALUES_ENTRIES_ITERATOR_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.entries", TYPED_ARRAY_KEYS_VALUES_ENTRIES_ITERATOR_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.@@iterator", TYPED_ARRAY_KEYS_VALUES_ENTRIES_ITERATOR_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray.@@species", TYPED_ARRAY_SPECIES_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.TypedArray", TYPED_ARRAY_BASE_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.Int8Array", TYPED_ARRAY_BASE_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.Int16Array", TYPED_ARRAY_BASE_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.Int32Array", TYPED_ARRAY_BASE_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.Float32Array", TYPED_ARRAY_BASE_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.Float64Array", TYPED_ARRAY_BASE_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.Uint8Array", TYPED_ARRAY_BASE_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.Uint8ClampedArray", TYPED_ARRAY_BASE_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.Uint16ClampedArray", TYPED_ARRAY_BASE_DATA_CORRECTIONS_INPUT],
	["javascript.builtins.Uint32ClampedArray", TYPED_ARRAY_BASE_DATA_CORRECTIONS_INPUT],
	[
		"javascript.builtins.String.@@iterator",
		{
			android: rangeCorrection("chrome", CaniuseSupportKind.AVAILABLE, `38`),
			chrome: rangeCorrection("chrome", CaniuseSupportKind.AVAILABLE, `38`),
			and_chr: rangeCorrection("and_chr", CaniuseSupportKind.AVAILABLE, `38`),
			edge: rangeCorrection("edge", CaniuseSupportKind.AVAILABLE, `12`),
			opera: rangeCorrection("opera", CaniuseSupportKind.AVAILABLE, `25`),
			op_mob: rangeCorrection("op_mob", CaniuseSupportKind.AVAILABLE, `25`),
			firefox: rangeCorrection("firefox", CaniuseSupportKind.AVAILABLE, `36`),
			and_ff: rangeCorrection("and_ff", CaniuseSupportKind.AVAILABLE, `36`),
			safari: rangeCorrection("safari", CaniuseSupportKind.AVAILABLE, `9`),
			ios_saf: rangeCorrection("ios_saf", CaniuseSupportKind.AVAILABLE, `9`),
			samsung: rangeCorrection("samsung", CaniuseSupportKind.AVAILABLE, `3`)
		}
	],
	[
		"javascript.builtins.Symbol.asyncIterator",
		{
			android: rangeCorrection("android", CaniuseSupportKind.AVAILABLE, `63`),
			chrome: rangeCorrection("chrome", CaniuseSupportKind.AVAILABLE, `63`),
			and_chr: rangeCorrection("and_chr", CaniuseSupportKind.AVAILABLE, `63`),
			opera: rangeCorrection("opera", CaniuseSupportKind.AVAILABLE, `50`),
			op_mob: rangeCorrection("op_mob", CaniuseSupportKind.AVAILABLE, `50`),
			firefox: rangeCorrection("firefox", CaniuseSupportKind.AVAILABLE, `57`),
			and_ff: rangeCorrection("and_ff", CaniuseSupportKind.AVAILABLE, `57`),
			safari: rangeCorrection("safari", CaniuseSupportKind.AVAILABLE, `11.1`),
			ios_saf: rangeCorrection("ios_saf", CaniuseSupportKind.AVAILABLE, `11.1`)
		}
	],
	[
		"javascript.builtins.Array.@@species",
		{
			android: rangeCorrection("android", CaniuseSupportKind.AVAILABLE, `51`),
			// MDN reports that it doesn't support Array.@@species, but it does and has done since Chrome v51
			chrome: rangeCorrection("chrome", CaniuseSupportKind.AVAILABLE, `51`),
			// MDN reports that it doesn't support Array.@@species, but it does and has done since Chrome for Android v51
			and_chr: rangeCorrection("and_chr", CaniuseSupportKind.AVAILABLE, `51`),
			// MDN reports that it doesn't support Array.@@species, but it does and has done since Edge v14
			edge: rangeCorrection("edge", CaniuseSupportKind.AVAILABLE, `14`),
			// MDN reports that it doesn't support Array.@@species, but it does and has done since Firefox v41
			firefox: rangeCorrection("firefox", CaniuseSupportKind.AVAILABLE, `41`),
			// MDN reports that it doesn't support Array.@@species, but it does and has done since Firefox for Android v41
			and_ff: rangeCorrection("and_ff", CaniuseSupportKind.AVAILABLE, `41`),
			// MDN reports that it doesn't support Array.@@species, but it does and has done since Opera v38
			opera: rangeCorrection("opera", CaniuseSupportKind.AVAILABLE, `38`),
			// MDN reports that it doesn't support Array.@@species, but it does and has done since Opera for Android v38
			op_mob: rangeCorrection("op_mob", CaniuseSupportKind.AVAILABLE, `38`),
			// MDN reports that it doesn't support Array.@@species, but it does and has done since Safari v10
			safari: rangeCorrection("safari", CaniuseSupportKind.AVAILABLE, `10`),
			// MDN reports that it doesn't support Array.@@species, but it does and has done since Safari for iOS v10
			ios_saf: rangeCorrection("ios_saf", CaniuseSupportKind.AVAILABLE, `10`)
		}
	],
	[
		"javascript.builtins.Date.@@toPrimitive",
		{
			android: rangeCorrection("android", CaniuseSupportKind.AVAILABLE, `48`),
			// MDN reports that it doesn't support Date.@@toPrimitive, but it does and has done since Chrome v48
			chrome: rangeCorrection("chrome", CaniuseSupportKind.AVAILABLE, `48`),
			// MDN reports that it doesn't support Date.@@toPrimitive, but it does and has done since Chrome for Android v48
			and_chr: rangeCorrection("and_chr", CaniuseSupportKind.AVAILABLE, `48`),
			// MDN reports that it doesn't support Date.@@toPrimitive, but it does and has done in all Edge versions
			edge: rangeCorrection("edge", CaniuseSupportKind.AVAILABLE),
			// MDN reports that it doesn't support Date.@@toPrimitive, but it does and has done since Firefox v44
			firefox: rangeCorrection("firefox", CaniuseSupportKind.AVAILABLE, `44`),
			// MDN reports that it doesn't support Date.@@toPrimitive, but it does and has done since Firefox for Android v44
			and_ff: rangeCorrection("and_ff", CaniuseSupportKind.AVAILABLE, `44`),
			// MDN reports that it doesn't support Date.@@toPrimitive, but it does and has done since Opera v35
			opera: rangeCorrection("opera", CaniuseSupportKind.AVAILABLE, `35`),
			// MDN reports that it doesn't support Date.@@toPrimitive, but it does and has done since Opera for Android v35
			op_mob: rangeCorrection("op_mob", CaniuseSupportKind.AVAILABLE, `35`),
			// MDN reports that it doesn't support Date.@@toPrimitive, but it does and has done since Safari v10
			safari: rangeCorrection("safari", CaniuseSupportKind.AVAILABLE, `10`),
			// MDN reports that it doesn't support Date.@@toPrimitive, but it does and has done since Safari for iOS v10
			ios_saf: rangeCorrection("ios_saf", CaniuseSupportKind.AVAILABLE, `10`),
			// MDN reports that it doesn't support the Date.@@toPrimitive method, but it does and has done for all Samsung Internet versions
			samsung: rangeCorrection("samsung", CaniuseSupportKind.AVAILABLE)
		}
	],
	[
		"fetch",
		{
			edge: [
				{
					// Caniuse reports that Microsoft Edge has been supporting fetch since v14, but the implementation was quite unstable until v15
					kind: CaniuseSupportKind.UNAVAILABLE,
					version: "14"
				}
			]
		}
	]
];

/**
 * A Map between caniuse features and corrections to apply (see above)
 * @type {Map<string, ICaniuseBrowserCorrection>}
 */
const FEATURE_TO_BROWSER_DATA_CORRECTIONS_MAP: Map<string, ICaniuseBrowserCorrection> = new Map(FEATURE_TO_BROWSER_DATA_CORRECTIONS_INPUT);

/**
 * Returns the input query, but extended with the given options
 * @param {string[]} query
 * @param {string|string[]} extendWith
 * @returns {string[]}
 */
function extendQueryWith(query: string[], extendWith: string | string[]): string[] {
	const normalizedExtendWith = Array.isArray(extendWith) ? extendWith : [extendWith];
	return [...new Set([...query, ...normalizedExtendWith])];
}

/**
 * Normalizes the given Browserslist
 * @param {string | string[]} browserslist
 * @returns {string[]}
 */
export function normalizeBrowserslist(browserslist: string | string[]): string[] {
	return Browserslist(browserslist);
}

/**
 * Returns the input query, but extended with 'unreleased versions'
 * @param {string[]} query
 * @param {Iterable<CaniuseBrowser>} browsers
 * @returns {string[]}
 */
function extendQueryWithUnreleasedVersions(query: string[], browsers: Iterable<CaniuseBrowser>): string[] {
	return extendQueryWith(query, Array.from(browsers).map(browser => `unreleased ${browser} versions`));
}

/**
 * Generates a Browserslist based on browser support for the given features
 * @param {string[]} features
 * @returns {string}
 */
export function browsersWithSupportForFeatures(...features: string[]): string[] {
	const {query, browsers} = browserSupportForFeaturesCommon(">=", ...features);
	return extendQueryWithUnreleasedVersions(query, browsers);
}

/**
 * Returns true if the given Browserslist supports the given EcmaVersion
 * @param browserslist
 * @param version
 */
export function browserslistSupportsEcmaVersion(browserslist: string[], version: EcmaVersion): boolean {
	switch (version) {
		case "es3":
			// ES3 is the lowest possible target and will always be treated as supported
			return true;

		case "es5":
			return browserslistSupportsFeatures(browserslist, ...ES5_FEATURES);

		case "es2015":
			return browserslistSupportsFeatures(browserslist, ...ES2015_FEATURES);

		case "es2016":
			return browserslistSupportsFeatures(browserslist, ...ES2016_FEATURES);

		case "es2017":
			return browserslistSupportsFeatures(browserslist, ...ES2017_FEATURES);

		case "es2018":
			return browserslistSupportsFeatures(browserslist, ...ES2018_FEATURES);

		case "es2019":
			return browserslistSupportsFeatures(browserslist, ...ES2019_FEATURES);
	}
}

/**
 * Returns the appropriate Ecma version for the given Browserslist
 * @param {string[]} browserslist
 * @returns {EcmaVersion}
 */
export function getAppropriateEcmaVersionForBrowserslist(browserslist: string[]): EcmaVersion {
	if (browserslistSupportsEcmaVersion(browserslist, "es2018")) return "es2018";
	else if (browserslistSupportsEcmaVersion(browserslist, "es2017")) return "es2017";
	else if (browserslistSupportsEcmaVersion(browserslist, "es2016")) return "es2016";
	else if (browserslistSupportsEcmaVersion(browserslist, "es2015")) return "es2015";
	else if (browserslistSupportsEcmaVersion(browserslist, "es5")) return "es5";
	else return "es3";
}

/**
 * Generates a Browserslist based on browser support for the given ECMA version
 * @param {EcmaVersion} version
 * @returns {string[]}
 */
export function browsersWithSupportForEcmaVersion(version: EcmaVersion): string[] {
	switch (version) {
		case "es3":
			return browsersWithoutSupportForFeatures(...ES5_FEATURES);
		case "es5":
			return browsersWithSupportForFeatures(...ES5_FEATURES);
		case "es2015":
			return browsersWithSupportForFeatures(...ES2015_FEATURES);
		case "es2016":
			return browsersWithSupportForFeatures(...ES2016_FEATURES);
		case "es2017":
			return browsersWithSupportForFeatures(...ES2017_FEATURES);
		case "es2018":
			return browsersWithSupportForFeatures(...ES2018_FEATURES);
		case "es2019":
			return browsersWithSupportForFeatures(...ES2019_FEATURES);
	}
}

/**
 * Returns true if the given browserslist support all of the given features
 * @param {string[]} browserslist
 * @param {string} features
 * @returns {boolean}
 */
export function browserslistSupportsFeatures(browserslist: string[], ...features: string[]): boolean {
	// First, generate an ideal browserslist that would target the given features exactly
	const normalizedIdealBrowserslist: string[] = normalizeBrowserslist(browsersWithSupportForFeatures(...features));

	// Now, normalize the input browserslist
	const normalizedInputBrowserslist: string[] = normalizeBrowserslist(browserslist);

	// Now, compare the two and see if they align. If they do, the input browserslist *does* support all of the given features.
	// They align if all members of the input browserslist are included in the ideal browserslist
	return normalizedInputBrowserslist.every(option => normalizedIdealBrowserslist.includes(option));
}

/**
 * Generates a Browserslist based on browsers that *doesn't* support the given features
 * @param {string[]} features
 * @returns {string}
 */
export function browsersWithoutSupportForFeatures(...features: string[]): string[] {
	return browserSupportForFeaturesCommon("<", ...features).query;
}

/**
 * Returns true if the given browser should be ignored. The data reported from Caniuse is a bit lacking.
 * For example, only the latest version of and_ff, and_qq, and_uc and baidu is reported, and since
 * android went to use Chromium for the WebView, it has only reported the latest Chromium version
 * @param {CaniuseBrowser} browser
 * @param {string} version
 * @returns {boolean}
 */
function shouldIgnoreBrowser(browser: CaniuseBrowser, version: string): boolean {
	return (
		(browser === "android" && gt(coerceToString(browser, version), coerceToString(browser, "4.4.4"))) ||
		(browser === "op_mob" && gt(coerceToString(browser, version), coerceToString(browser, "12.1"))) ||
		IGNORED_BROWSERS.has(browser)
	);
}

/**
 * Normalizes the given ICaniuseLiteFeature
 * @param {CaniuseStats} stats
 * @param {string} featureName
 * @returns {CaniuseStatsNormalized}
 */
function getCaniuseLiteFeatureNormalized(stats: CaniuseStats, featureName: string): CaniuseStatsNormalized {
	// Check if a correction exists for this browser
	const featureCorrectionMatch = FEATURE_TO_BROWSER_DATA_CORRECTIONS_MAP.get(featureName);

	Object.keys(stats).forEach((browser: keyof CaniuseStats) => {
		const browserDict = stats[browser];
		Object.entries(browserDict).forEach(([version, support]: [string, string]) => {
			const versionMatch = version.match(NORMALIZE_BROWSER_VERSION_REGEXP);
			const normalizedVersion = versionMatch == null ? version : versionMatch[1];
			let supportKind: CaniuseSupportKind;

			if (support === CaniuseSupportKind.AVAILABLE || support === CaniuseSupportKind.UNAVAILABLE || support === CaniuseSupportKind.PARTIAL_SUPPORT || support === CaniuseSupportKind.PREFIXED) {
				supportKind = support;
			} else if (support.startsWith("y")) {
				supportKind = CaniuseSupportKind.AVAILABLE;
			} else if (support.startsWith("n")) {
				supportKind = CaniuseSupportKind.UNAVAILABLE;
			} else if (support.startsWith("a")) {
				supportKind = CaniuseSupportKind.PARTIAL_SUPPORT;
			} else {
				supportKind = CaniuseSupportKind.PREFIXED;
			}

			// Delete the rewritten version
			if (version !== normalizedVersion) {
				delete browserDict[version];
			}
			if (support !== supportKind) {
				browserDict[normalizedVersion] = supportKind;
			}

			// If a feature correction exists for this feature, apply applicable corrections
			if (featureCorrectionMatch != null) {
				// Check if the browser has some corrections
				const browserMatch = featureCorrectionMatch[browser];
				if (browserMatch != null) {
					// Apply all corrections
					browserMatch.forEach(correction => {
						browserDict[correction.version] = correction.kind;
					});
				}
			}
		});
	});

	const normalizedStats = <CaniuseStatsNormalized>stats;

	// Now, run through the normalized stats
	Object.keys(normalizedStats).forEach((browser: keyof CaniuseStatsNormalized) => {
		const browserDict = normalizedStats[browser];
		Object.entries(browserDict).forEach(([version]: [string, CaniuseSupportKind]) => {
			// If browser is Android and version is greater than "4.4.4", or if the browser is Chrome, Firefox, UC, QQ for Android, or Baidu,
			// strip it entirely from the data, since Caniuse only reports the latest versions of those browsers
			if (shouldIgnoreBrowser(browser, version)) {
				delete browserDict[version];
			}
		});
	});

	return normalizedStats;
}

/**
 * Gets the support from caniuse for the given feature
 * @param {string} feature
 * @returns {CaniuseStatsNormalized}
 */
function getCaniuseFeatureSupport(feature: string): CaniuseStatsNormalized {
	return getCaniuseLiteFeatureNormalized((<ICaniuseFeature>caniuseFeature(caniuseFeatures[feature])).stats, feature);
}

/**
 * Returns true if the given feature is a Caniuse feature
 * @param feature
 */
function isCaniuseFeature(feature: string): boolean {
	return caniuseFeatures[feature] != null;
}

/**
 * Returns true if the given feature is a MDN feature
 * @param feature
 */
function isMdnFeature(feature: string): boolean {
	return get(compatData, feature) != null;
}

/**
 * Asserts that the given feature is a valid Caniuse or MDN feature name
 * @param {string} feature
 */
function assertKnownFeature(feature: string): void {
	if (!isCaniuseFeature(feature) && !isMdnFeature(feature)) {
		throw new TypeError(`The given feature: '${feature}' is unknown. It must be a valid Caniuse or MDN feature!`);
	}
}

/**
 * Gets the feature support for the given feature
 * @param {string} feature
 * @returns {CaniuseStatsNormalized}
 */
function getFeatureSupport(feature: string): CaniuseStatsNormalized {
	// First check if the cache has a match and return it if so
	const cacheHit = featureToCaniuseStatsCache.get(feature);
	if (cacheHit != null) return cacheHit;

	// Assert that the feature is in fact known
	assertKnownFeature(feature);

	const result = isMdnFeature(feature) ? getMdnFeatureSupport(feature) : getCaniuseFeatureSupport(feature);

	// Store it in the cache before returning it
	featureToCaniuseStatsCache.set(feature, result);
	return result;
}

/**
 * Gets the support from caniuse for the given feature
 * @param {string} feature
 * @returns {CaniuseStatsNormalized}
 */
function getMdnFeatureSupport(feature: string): CaniuseStatsNormalized {
	const match: IMdn = get(compatData, feature);
	const supportMap = match.__compat.support;

	const formatBrowser = (mdnBrowser: MdnBrowserName, caniuseBrowser: CaniuseBrowser): {[key: string]: CaniuseSupportKind} => {
		const versionMap = supportMap[mdnBrowser];
		const versionAdded =
			versionMap == null
				? false
				: Array.isArray(versionMap)
				? // If there are multiple entries, take the one that hasn't been removed yet, if any
				  (() => {
						const versionStillInBrowser = versionMap.filter(element => element.version_removed == null)[0];
						return versionStillInBrowser == null || versionStillInBrowser.version_added == null ? false : versionStillInBrowser.version_added;
				  })()
				: versionMap.version_added;

		const dict: {[key: string]: CaniuseSupportKind} = {};
		const supportedSince: string | null = versionAdded === false ? null : versionAdded === true ? getOldestVersionOfBrowser(caniuseBrowser) : versionAdded;

		getSortedBrowserVersions(caniuseBrowser).forEach(version => {
			// If the features has never been supported, mark the feature as unavailable
			if (supportedSince == null) {
				dict[version] = CaniuseSupportKind.UNAVAILABLE;
			} else {
				dict[version] =
					version === "TP" || version === "all" || gte(coerceToString(caniuseBrowser, version), coerceToString(caniuseBrowser, supportedSince))
						? CaniuseSupportKind.AVAILABLE
						: CaniuseSupportKind.UNAVAILABLE;
			}
		});
		return dict;
	};

	const stats: CaniuseStatsNormalized = {
		and_chr: formatBrowser("chrome_android", "and_chr"),
		chrome: formatBrowser("chrome", "chrome"),
		and_ff: formatBrowser("firefox_android", "and_ff"),
		and_qq: {},
		and_uc: {},
		android: formatBrowser("webview_android", "android"),
		baidu: {},
		bb: {},
		edge: formatBrowser("edge", "edge"),
		samsung: formatBrowser("samsunginternet_android", "samsung"),
		ie: formatBrowser("ie", "ie"),
		ie_mob: formatBrowser("ie", "ie_mob"),
		safari: formatBrowser("safari", "safari"),
		ios_saf: formatBrowser("safari_ios", "ios_saf"),
		opera: formatBrowser("opera", "opera"),
		op_mini: {},
		op_mob: {},
		firefox: formatBrowser("firefox", "firefox")
	};
	return getCaniuseLiteFeatureNormalized(stats, feature);
}

/**
 * Gets the first version that matches the given CaniuseSupportKind
 * @param {CaniuseSupportKind} kind
 * @param {object} stats
 * @returns {string | undefined}
 */
function getFirstVersionWithSupportKind(kind: CaniuseSupportKind, stats: {[key: string]: CaniuseSupportKind}): string | undefined {
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
 * Sorts the given browserslist. Ensures that 'not' expressions come last
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function sortBrowserslist(a: string, b: string): number {
	if (a.startsWith("not") && !b.startsWith("not")) return 1;
	if (!a.startsWith("not") && b.startsWith("not")) return -1;
	return 0;
}

/**
 * Gets a Map between browser names and the first version of them that supported the given feature
 * @param {string} feature
 * @returns {Map<CaniuseBrowser, string>}
 */
export function getFirstVersionsWithFullSupport(feature: string): Map<CaniuseBrowser, string> {
	const support = getFeatureSupport(feature);
	// A map between browser names and their required versions
	const browserMap: Map<CaniuseBrowser, string> = new Map();
	Object.entries(support).forEach(([browser, stats]: [CaniuseBrowser, {[key: string]: CaniuseSupportKind}]) => {
		const fullSupportVersion = getFirstVersionWithSupportKind(CaniuseSupportKind.AVAILABLE, stats);
		if (fullSupportVersion != null) {
			browserMap.set(browser, fullSupportVersion);
		}
	});
	return browserMap;
}

/**
 * Gets the Cache key for the given combination of a comparison operator and any amount of features
 * @param {ComparisonOperator} comparisonOperator
 * @param {string[]} features
 */
function getBrowserSupportForFeaturesCacheKey(comparisonOperator: ComparisonOperator, features: string[]): string {
	return `${comparisonOperator}.${features.sort().join(",")}`;
}

/**
 * Common logic for the functions that generate browserslists based on feature support
 * @param {ComparisonOperator} comparisonOperator
 * @param {string} features
 * @returns {IBrowserSupportForFeaturesCommonResult}
 */
function browserSupportForFeaturesCommon(comparisonOperator: ComparisonOperator, ...features: string[]): IBrowserSupportForFeaturesCommonResult {
	const cacheKey = getBrowserSupportForFeaturesCacheKey(comparisonOperator, features);

	// First check if the cache has a hit and return it if so
	const cacheHit = browserSupportForFeaturesCache.get(cacheKey);
	if (cacheHit != null) {
		return cacheHit;
	}

	// All of the generated browser maps
	const browserMaps: Map<CaniuseBrowser, string>[] = [];

	for (const feature of features) {
		const support = getFeatureSupport(feature);

		// A map between browser names and their required versions
		const browserMap: Map<CaniuseBrowser, string> = new Map();
		Object.entries(support).forEach(([browser, stats]: [CaniuseBrowser, {[key: string]: CaniuseSupportKind}]) => {
			const fullSupportVersion = getFirstVersionWithSupportKind(CaniuseSupportKind.AVAILABLE, stats);
			const partialSupportVersion = getFirstVersionWithSupportKind(CaniuseSupportKind.PARTIAL_SUPPORT, stats);
			let versionToSet: string | undefined;

			if (fullSupportVersion != null) {
				versionToSet = fullSupportVersion;
			}

			// Otherwise, check if partial support exists and should be allowed
			if (partialSupportVersion != null) {
				// Get all partial support allowances for this specific feature
				const partialSupportMatch = PARTIAL_SUPPORT_ALLOWANCES.get(feature);

				// Check if partial support exists for the browser. // If no full supported version exists or if the partial supported version has a lower version number than the full supported one, use that one instead
				if (
					partialSupportMatch != null &&
					((partialSupportMatch === "*" || partialSupportMatch.includes(browser)) && (fullSupportVersion == null || compareVersions(partialSupportVersion, fullSupportVersion) < 0))
				) {
					versionToSet = partialSupportVersion;
				}
			}

			if (versionToSet == null) {
				// Apply additional checks depending on the comparison operator
				switch (comparisonOperator) {
					case "<":
					case "<=":
						// Add all browsers with no support whatsoever, or those that require prefixing or flags
						versionToSet = "-1";
				}
			}

			if (versionToSet != null && !shouldIgnoreBrowser(browser, versionToSet)) {
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
			const shouldSet = existingVersion !== "-1" && (existingVersion == null || version === "-1" || compareVersions(version, existingVersion) >= 0);

			if (shouldSet) {
				// Set the version in the map
				combinedBrowserMap.set(browser, version);
			}
		}
	}

	// Finally, generate a string array of the browsers
	// Make sure that 'not' expressions come last
	const query: string[] = ([] as string[]).concat
		.apply(
			[],
			Array.from(combinedBrowserMap.entries()).map(([browser, version]) => {
				// The version is not a number, so we can't do comparisons on it.
				if (isNaN(parseFloat(version))) {
					switch (comparisonOperator) {
						case "<":
						case "<=":
							const previousVersion = getPreviousVersionOfBrowser(browser, version);
							return [`not ${browser} ${version}`, ...(previousVersion == null ? [] : [`${browser} ${comparisonOperator} ${previousVersion}`])];
						case ">":
						case ">=":
							const nextVersion = getNextVersionOfBrowser(browser, version);
							return [`${browser} ${version}`, ...(nextVersion == null ? [] : [`${browser} ${comparisonOperator} ${nextVersion}`])];
					}
				}
				return parseInt(version) === -1
					? [
							`${comparisonOperator === ">" || comparisonOperator === ">=" ? "not " : ""}${browser} ${browser === "op_mini" ? "all" : "> 0"}`,
							`${comparisonOperator === ">" || comparisonOperator === ">=" ? "not " : ""}unreleased ${browser} versions`
					  ]
					: [`${browser} ${comparisonOperator} ${version}`];
			})
		)
		.sort(sortBrowserslist);
	const returnObject = {
		query,
		browsers: new Set(combinedBrowserMap.keys())
	};

	// Store it in the cache before returning it
	browserSupportForFeaturesCache.set(cacheKey, returnObject);
	return returnObject;
}

/**
 * Gets the matching CaniuseBrowser for the given UseragentBrowser. Not all are supported, so it may return undefined
 * @param {UaParserWrapper} parser
 * @returns {CaniuseBrowser}
 */
function getCaniuseBrowserForUseragentBrowser(parser: UaParserWrapper): CaniuseBrowser | undefined {
	const browser = parser.getBrowser();
	const device = parser.getDevice();
	const os = parser.getOS();

	// First, if it is a Blackberry device, it will always be the 'bb' browser
	if (device.vendor === "BlackBerry" || os.name === "BlackBerry") {
		return "bb";
	}

	switch (browser.name) {
		case "Samsung Browser":
			return "samsung";

		case "Android Browser": {
			// If the vendor is Samsung, the default browser is Samsung Internet
			if (device.vendor === "Samsung") {
				return "samsung";
			}

			// Default to the stock android browser
			return "android";
		}

		case "WebKit":
			// This will be the case if we're in an iOS Safari WebView
			if (device.type === "mobile" || device.type === "tablet" || device.type === "smarttv" || device.type === "wearable" || device.type === "embedded") {
				return "ios_saf";
			}
			// Otherwise, fall back to Safari
			return "safari";

		case "Baidu":
			return "baidu";

		case "Chrome Headless":
			return "chrome";

		case "Chrome":
			// Check if the OS is Android, in which case this is actually Chrome for Android. Make it report as regular Chrome
			if (os.name === "Android") {
				return "chrome";
			}

			// If the OS is iOS, it is actually Safari that drives the WebView
			else if (os.name === "iOS") {
				return "ios_saf";
			}

			// Otherwise, fall back to chrome
			return "chrome";

		case "Edge":
			return "edge";

		case "Firefox":
			// Check if the OS is Android, in which case this is actually Firefox for Android.
			// Make it report as regular Firefox
			if (os.name === "Android") {
				return "firefox";
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
		case "IEMobile":
			return "ie_mob";

		case "Safari":
			return "safari";

		case "Mobile Safari":
		case "MobileSafari":
		case "Safari Mobile":
		case "SafariMobile":
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
 * @param {IUseragentBrowser} useragentBrowser
 * @param {IUseragentOS} useragentOS
 * @returns {string}
 */
function getCaniuseVersionForUseragentVersion(browser: CaniuseBrowser, version: string, useragentBrowser: IUseragentBrowser, useragentOS: IUseragentOS): string {
	// Ensure that we have a normalized version to work with
	version = normalizeBrowserVersion(browser, version);

	// Always use 'all' with Opera Mini
	if (browser === "op_mini") {
		return "all";
	} else if (browser === "safari") {
		// Check if there is a newer version of the browser
		const nextBrowserVersion = getNextVersionOfBrowser(browser, version);

		// If there isn't we're in the Technology Preview
		if (nextBrowserVersion == null) {
			return "TP";
		}
	}

	const coerced = coerce(browser, version);

	// Make sure that we have a proper Semver version to work with
	if (coerced == null) throw new TypeError(`Could not detect the version of: '${version}' for browser: ${browser}`);

	// Unpack the semver version
	const {major, minor, patch} = coerced;

	// Generates a Semver version
	const buildSemverVersion = (majorVersion: number, minorVersion?: number, patchVersion?: number): string => {
		return `${majorVersion}${minorVersion == null || minorVersion === 0 ? "" : `.${minorVersion}`}${patchVersion == null || patchVersion === 0 ? "" : `.${patchVersion}`}`;
	};

	switch (browser) {
		case "chrome":
		case "ie":
		case "ie_mob":
		case "edge":
		case "bb":
		case "and_chr":
		case "and_ff":
			// Always use the major version of these browser
			return buildSemverVersion(major);

		case "opera":
		case "op_mob":
			// Opera may have minor versions before it went to Chromium. After that, always use major versions
			if (major === 10 || major === 11 || major === 12) {
				return buildSemverVersion(major, minor);
			}

			// For anything else, only use the major version
			return buildSemverVersion(major);

		case "ios_saf": {
			// For browsers that report as iOS safari, they may actually be other browsers using Safari's WebView.
			// We want them to report as iOS safari since they will support the same browsers, but we have to apply
			// some tricks in order to get the version number

			// If it is in fact mobile Safari, just use the reported version
			if (useragentBrowser.name === "Safari" || useragentBrowser.name === "Mobile Safari") {
				// iOS may have minor releases, but never patch releases, according to caniuse
				return buildSemverVersion(major, minor);
			}

			// Otherwise, try to get the assumed Safari version from the OS version
			else {
				if (useragentOS.version == null) throw new ReferenceError(`Could not detect OS version of iOS for ${useragentBrowser.name} on iOS`);
				// Decide the Semver version
				const osSemver = coerce(undefined, useragentOS.version);

				// Use only the main version
				return `${osSemver.major}`;
			}
		}

		case "safari":
		case "firefox": {
			// These may have minor releases, but never patch releases, according to caniuse
			return buildSemverVersion(major, minor);
		}

		case "android":
			// Up to version 4.4.4, these could include patch releases. After that, only use major versions
			if (major < 4) {
				return buildSemverVersion(major, minor);
			} else if (major === 4) {
				return buildSemverVersion(major, minor, patch);
			} else {
				return buildSemverVersion(major);
			}

		case "and_uc":
		case "samsung":
		case "and_qq":
		case "baidu":
			// These may always contain minor versions
			return buildSemverVersion(major, minor);

		default:
			// For anything else, just use the major version
			return buildSemverVersion(major);
	}
}

/**
 * Generates a browserslist from the provided useragent string
 * @param {string} useragent
 * @returns {string[]}
 */
export function generateBrowserslistFromUseragent(useragent: string): string[] {
	// Check if a user agent has been generated previously for this specific user agent
	const cacheHit = userAgentToBrowserslistCache.get(useragent);
	if (cacheHit != null) return cacheHit;

	// Otherwise, generate a new one
	const parser = new UaParserWrapper(useragent);
	const browser = parser.getBrowser();
	const os = parser.getOS();
	const version = browser.version;

	// Prepare a CaniuseBrowser name from the useragent string
	const browserName = getCaniuseBrowserForUseragentBrowser(parser);

	// If the browser name or version couldn't be determined, return false immediately
	if (browserName == null || version == null) {
		console.log(`No caniuse browser and/or version could be determined for:`);
		console.log("os:", parser.getOS());
		console.log("browser:", parser.getBrowser());
		console.log("device:", parser.getDevice());
		console.log("cpu:", parser.getCPU());
		console.log("browser:", parser.getEngine());
		userAgentToBrowserslistCache.set(useragent, []);
		return [];
	}

	// Prepare a version from the useragent that plays well with caniuse
	const browserVersion = getCaniuseVersionForUseragentVersion(browserName, version, browser, os);

	// Prepare a browserslist from the useragent itself
	const normalizedBrowserslist = normalizeBrowserslist([`${browserName} ${browserVersion}`]);

	// Store it in the cache before returning it
	userAgentToBrowserslistCache.set(useragent, normalizedBrowserslist);
	return normalizedBrowserslist;
}

/**
 * Generates a browserslist from the provided useragent string and checks if it matches
 * the given browserslist
 * @param {string} useragent
 * @param {string[]} browserslist
 * @returns {string[]}
 */
export function matchBrowserslistOnUserAgent(useragent: string, browserslist: string[]): boolean {
	const useragentBrowserslist = generateBrowserslistFromUseragent(useragent);

	// Pipe the input browserslist through Browserslist to normalize it
	const normalizedInputBrowserslist: string[] = normalizeBrowserslist(browserslist);

	// Now, compare the two, and if the normalized input browserslist includes every option from the user agent, it is matched
	return useragentBrowserslist.every(option => normalizedInputBrowserslist.includes(option));
}

/**
 * Returns a key to use for the cache between user agents with feature names and whether or not the user agent supports them
 * @param {string} useragent
 * @param {string[]} features
 */
function userAgentWithFeaturesCacheKey(useragent: string, features: string[]): string {
	return `${useragent}.${features.join(",")}`;
}

/**
 * Returns true if the given user agent supports the given features
 * @param {string} useragent
 * @param {string[]} features
 * @returns {string[]}
 */
export function userAgentSupportsFeatures(useragent: string, ...features: string[]): boolean {
	// Check if these features has been computed previously for the given user agent
	const cacheKey = userAgentWithFeaturesCacheKey(useragent, features);
	const cacheHit = userAgentWithFeaturesToSupportCache.get(cacheKey);
	// If so, return the cache hit
	if (cacheHit != null) return cacheHit;

	// Prepare a browserslist from the useragent itself
	const useragentBrowserslist = generateBrowserslistFromUseragent(useragent);

	// Prepare a browserslist for browsers that support the given features
	const supportedBrowserslist = normalizeBrowserslist(browsersWithSupportForFeatures(...features));

	// Now, compare the two, and if the browserslist with supported browsers includes every option from the user agent, the user agent supports all of the given features
	const support = useragentBrowserslist.every(option => supportedBrowserslist.includes(option));

	// Set it in the cache and return it
	userAgentWithFeaturesToSupportCache.set(cacheKey, support);
	return support;
}
