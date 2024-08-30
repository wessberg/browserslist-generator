import Browserslist from "browserslist";
import {feature as caniuseFeature, features as caniuseFeatures} from "caniuse-lite";
import * as compatData from "@mdn/browser-compat-data" assert {type: "json"};
import objectPath from "object-path";
import {gt, gte, lt, lte} from "semver";
import {
	getClosestMatchingBrowserVersion,
	getNextVersionOfBrowser,
	getOldestVersionOfBrowser,
	getPreviousVersionOfBrowser,
	getSortedBrowserVersions,
	getSortedBrowserVersionsWithLeadingVersion,
	normalizeBrowserVersion
} from "./browser-version.js";
import {UNKNOWN_CANIUSE_BROWSER} from "./constant.js";
import {ensureSemver, coerceToString} from "./ensure-semver.js";
import {compareVersions} from "./compare-versions.js";
import type {ComparisonOperator} from "./comparison-operator.js";
import type {EcmaVersion} from "./ecma-version.js";
import {
	ES2015_FEATURES,
	ES2016_FEATURES,
	ES2017_FEATURES,
	ES2018_FEATURES,
	ES2019_FEATURES,
	ES2020_FEATURES,
	ES2021_FEATURES,
	ES2022_FEATURES,
	ES2023_FEATURES,
	ES2024_FEATURES,
	ES5_FEATURES
} from "./ecma-version.js";
import {rangeCorrection} from "./range-correction.js";
import type {BrowserSupportForFeaturesCommonResult} from "./browser-support-for-features-common-result.js";
import type {CaniuseBrowser, CaniuseStats, CaniuseStatsNormalized, CaniuseBrowserCorrection, CaniuseFeature, VersionedCaniuseBrowser} from "./i-caniuse.js";
import {CaniuseSupportKind} from "./i-caniuse.js";
import type {Mdn, MdnBrowserName} from "./mdn.js";
import {NORMALIZE_BROWSER_VERSION_REGEXP} from "./normalize-browser-version-regexp.js";
import {UaParserWrapper} from "./ua-parser-wrapper.js";
import type {UseragentBrowser, UseragentEngine, UseragentOs} from "./useragent/useragent-typed.js";

/**
 * A Cache between user agent names and generated Browserslists
 */
const userAgentToBrowserslistCache: Map<string, string[]> = new Map();

/**
 * A Cache for retrieving browser support for some features
 */
const browserSupportForFeaturesCache: Map<string, BrowserSupportForFeaturesCommonResult> = new Map();

/**
 * A Cache between feature names and their CaniuseStats
 */
const featureToCaniuseStatsCache: Map<string, CaniuseStatsNormalized> = new Map();

/**
 * A Cache between user agents with any amount of features and whether or not they are supported by the user agent
 */
const userAgentWithFeaturesToSupportCache: Map<string, boolean> = new Map();

/**
 * By and large, MDN has the best compat data, especially when looking into at which point older version of Android-based browsers
 * received support for a feature. Therefore we generally prioritize MDN compat data and will attempt to rewrite common caniuse queries to
 * their respective MDN feature names
 */
const CANIUSE_TO_MDN_FEATURE_MAP = {
	pointer: "api.PointerEvent.PointerEvent",
	shadowdomv1: "api.ShadowRoot",
	"custom-elementsv1": "api.CustomElementRegistry",
	template: "html.elements.template",
	fetch: "api.fetch",
	promises: "javascript.builtins.Promise",
	"object-values": "javascript.builtins.Object.values",
	mutationobserver: "api.MutationObserver",
	"focusin-focusout-events": "api.Element.focusin_event",
	"high-resolution-time": "api.Performance.now",
	url: "api.URL",
	urlsearchparams: "api.URLSearchParams",
	"object-fit": "css.properties.object-fit",
	"console-basic": "api.console.info",
	"console-time": "api.console.time",
	"atob-btoa": "api.atob",
	blobbuilder: "api.Blob.Blob",
	bloburls: "api.URL.createObjectURL",
	requestidlecallback: "api.Window.requestIdleCallback",
	requestanimationframe: "api.Window.requestAnimationFrame",
	proxy: "javascript.builtins.Proxy"
} as const;

/**
 * A Map between features and browsers that has partial support for them but should be allowed anyway
 * @type {Map<string, string[]>}
 */
const PARTIAL_SUPPORT_ALLOWANCES = new Map([
	["shadowdomv1", "*"],
	["custom-elementsv1", "*"],
	["web-animation", "*"]
]) as Map<string, CaniuseBrowser[] | "*">;

const TYPED_ARRAY_BASE_DATA_CORRECTIONS_INPUT: CaniuseBrowserCorrection = {
	/* eslint-disable @typescript-eslint/naming-convention */
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
	bb: rangeCorrection("bb", CaniuseSupportKind.AVAILABLE, `10`)
	/* eslint-enable @typescript-eslint/naming-convention */
};

const TYPED_ARRAY_ES2015_DATA_CORRECTIONS_INPUT: CaniuseBrowserCorrection = {
	/* eslint-disable @typescript-eslint/naming-convention */
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
	/* eslint-enable @typescript-eslint/naming-convention */
};

const TYPED_ARRAY_ES2016_DATA_CORRECTIONS_INPUT: CaniuseBrowserCorrection = {
	/* eslint-disable @typescript-eslint/naming-convention */
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
	/* eslint-enable @typescript-eslint/naming-convention */
};

const TYPED_ARRAY_KEYS_VALUES_ENTRIES_ITERATOR_DATA_CORRECTIONS_INPUT: CaniuseBrowserCorrection = {
	/* eslint-disable @typescript-eslint/naming-convention */
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
	/* eslint-enable @typescript-eslint/naming-convention */
};

const TYPED_ARRAY_SPECIES_DATA_CORRECTIONS_INPUT: CaniuseBrowserCorrection = {
	/* eslint-disable @typescript-eslint/naming-convention */
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
	/* eslint-enable @typescript-eslint/naming-convention */
};

/**
 * Not all Caniuse data is entirely correct. For some features, the data on https://kangax.github.io/compat-table/es6/
 * is more correct. When a Browserslist is generated based on support for specific features, it is really important
 * that it is correct, especially if the browserslist will be used as an input to tools such as @babel/preset-env.
 * This table provides some corrections to the Caniuse data that makes it align better with actual availability
 * @type {[string, CaniuseBrowserCorrection][]}
 */
const FEATURE_TO_BROWSER_DATA_CORRECTIONS_INPUT: [string, CaniuseBrowserCorrection][] = [
	/* eslint-disable @typescript-eslint/naming-convention */
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
		// Caniuse reports that Safari 12.1 and iOS Safari 12.2 has partial support for Web Animations,
		// but they do not - They require enabling it as an experimental feature
		"web-animation",
		{
			safari: rangeCorrection("safari", CaniuseSupportKind.UNAVAILABLE, `0`, "13.4"),
			ios_saf: rangeCorrection("ios_saf", CaniuseSupportKind.UNAVAILABLE, `0`, "13.4")
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
	[
		"api.Element.classList",
		{
			edge: [
				{
					// Caniuse reports that Microsoft Edge v15 has only partial support for class-list since it doesn't support SVG elements,
					// but we don't want feature detections to return false for that browser
					kind: CaniuseSupportKind.AVAILABLE,
					version: "15"
				}
			],
			ie: [
				{
					// Caniuse reports that IE 10 has only partial support for class-list since it doesn't support SVG elements,
					// but we don't want feature detections to return false for that browser
					kind: CaniuseSupportKind.AVAILABLE,
					version: "10"
				},
				{
					// Caniuse reports that IE 11 has only partial support for class-list since it doesn't support SVG elements,
					// but we don't want feature detections to return false for that browser
					kind: CaniuseSupportKind.AVAILABLE,
					version: "11"
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
	],
	[
		"api.Window",
		{
			chrome: rangeCorrection("chrome", CaniuseSupportKind.UNAVAILABLE, `0`, `18`),
			safari: rangeCorrection("safari", CaniuseSupportKind.UNAVAILABLE, `0`, `5.1`),
			ie: rangeCorrection("ie", CaniuseSupportKind.UNAVAILABLE, `0`, `7`),
			opera: rangeCorrection("safari", CaniuseSupportKind.UNAVAILABLE, `0`, `11.1`)
		}
	],
	[
		"javascript.builtins.String.matchAll",
		{
			samsung: rangeCorrection("samsung", CaniuseSupportKind.UNAVAILABLE, `0`, `9.4`)
		}
	],
	[
		"resizeobserver",
		{
			safari: rangeCorrection("safari", CaniuseSupportKind.UNAVAILABLE, `0`)
		}
	]
	/* eslint-enable @typescript-eslint/naming-convention */
];

/**
 * A Map between caniuse features and corrections to apply (see above)
 * @type {Map<string, CaniuseBrowserCorrection>}
 */
const FEATURE_TO_BROWSER_DATA_CORRECTIONS_MAP: Map<string, CaniuseBrowserCorrection> = new Map(FEATURE_TO_BROWSER_DATA_CORRECTIONS_INPUT);

/**
 * Returns the input query, but extended with the given options
 */
function extendQueryWith(query: string[], extendWith: string | string[]): string[] {
	const normalizedExtendWith = Array.isArray(extendWith) ? extendWith : [extendWith];
	return [...new Set([...query, ...normalizedExtendWith])];
}

/**
 * Normalizes the given Browserslist
 */
export function normalizeBrowserslist(browserslist: string | string[]): string[] {
	const result = Browserslist(browserslist);

	// Caniuse only tracks the latest Browser version for Android-based browsers,
	// so we'll need to add the relevant details back in after normalizing the Browserslist
	// to make sure comparsions won't fail
	const inputBrowserslist = Array.isArray(browserslist) ? browserslist : [browserslist];

	for (const browser of ["and_ff", "and_chr", "op_mini"] as const) {
		const versions = getSortedBrowserVersions(browser);
		for (const entry of inputBrowserslist) {
			if (!entry.startsWith(browser)) continue;
			const directMatch = entry.match(new RegExp(`${browser} (\\d+.*)`));
			if (directMatch != null) {
				const candidate = `${browser} ${directMatch[1]}`;
				if (!result.includes(candidate)) {
					result.push(candidate);
				}
			} else {
				const greaterThanOrEqualsMatch = entry.match(new RegExp(`${browser} >= (\\d+)`));

				if (greaterThanOrEqualsMatch != null) {
					let currentMajor = Number(greaterThanOrEqualsMatch[1]);

					while (true) {
						const candidate = `${browser} ${currentMajor}`;
						if (!result.includes(candidate)) {
							result.push(candidate);
							currentMajor++;
							if (Number(getClosestMatchingBrowserVersion(browser, String(currentMajor), versions)) <= currentMajor) break;
						} else {
							break;
						}
					}
				}
			}
		}
	}

	return result.sort();
}

/**
 * Returns the input query, but extended with 'unreleased versions'
 */
function extendQueryWithUnreleasedVersions(query: string[], browsers: Iterable<CaniuseBrowser>): string[] {
	return extendQueryWith(
		query,
		Array.from(browsers).map(browser => `unreleased ${browser} versions`)
	);
}

interface EcmaFeatureFilteringOptions {
	syntaxOnly: boolean;
	featureFilter?(feature: string): boolean;
}

interface BrowsersWithSupportOptions {
	features: string[];
}

/**
 * Generates a Browserslist based on browser support for the given features
 */
export function browsersWithSupportForFeatures(...features: string[]): string[];
export function browsersWithSupportForFeatures(options: BrowsersWithSupportOptions): string[];
export function browsersWithSupportForFeatures(...args: [BrowsersWithSupportOptions] | string[]): string[] {
	const [firstArg] = args;
	const {features} = firstArg != null && typeof firstArg === "object" ? firstArg : {features: args as string[]};

	const {query, browsers} = browserSupportForFeaturesCommon(">=", ...features);
	return extendQueryWithUnreleasedVersions(query, browsers);
}

/**
 * Returns true if the given Browserslist supports the given EcmaVersion
 */
export function browserslistSupportsEcmaVersion(browserslist: string[], version: EcmaVersion, options?: Partial<EcmaFeatureFilteringOptions>): boolean {
	const features = getFeaturesForEcmaVersion(version, options);
	if (features.length === 0) return true;

	return browserslistSupportsFeatures(browserslist, ...features);
}

export function getFeaturesForEcmaVersion(version: EcmaVersion, options?: Partial<EcmaFeatureFilteringOptions>): string[] {
	const features = getFeaturesForEcmaVersionInner(version);
	const filteredFirstPass = Boolean(options?.syntaxOnly) ? features.filter(feature => !feature.startsWith("javascript.builtins.")) : features;
	return typeof options?.featureFilter === "function" ? filteredFirstPass.filter(options.featureFilter) : filteredFirstPass;
}

function getFeaturesForEcmaVersionInner(version: EcmaVersion): string[] {
	switch (version) {
		case "es3":
			// ES3 is the lowest possible target and will always be treated as supported
			return [];

		case "es5":
			return ES5_FEATURES;

		case "es2015":
			return ES2015_FEATURES;

		case "es2016":
			return ES2016_FEATURES;

		case "es2017":
			return ES2017_FEATURES;

		case "es2018":
			return ES2018_FEATURES;

		case "es2019":
			return ES2019_FEATURES;

		case "es2020":
			return ES2020_FEATURES;

		case "es2021":
			return ES2021_FEATURES;

		case "es2022":
			return ES2022_FEATURES;

		case "es2023":
			return ES2023_FEATURES;

		case "es2024":
			return ES2024_FEATURES;
	}
}

/**
 * Returns the appropriate Ecma version for the given Browserslist
 */
export function getAppropriateEcmaVersionForBrowserslist(browserslist: string[], options?: Partial<EcmaFeatureFilteringOptions>): EcmaVersion {
	if (browserslistSupportsEcmaVersion(browserslist, "es2024", options)) return "es2024";
	if (browserslistSupportsEcmaVersion(browserslist, "es2023", options)) return "es2023";
	if (browserslistSupportsEcmaVersion(browserslist, "es2022", options)) return "es2022";
	if (browserslistSupportsEcmaVersion(browserslist, "es2021", options)) return "es2021";
	if (browserslistSupportsEcmaVersion(browserslist, "es2020", options)) return "es2020";
	if (browserslistSupportsEcmaVersion(browserslist, "es2019", options)) return "es2019";
	if (browserslistSupportsEcmaVersion(browserslist, "es2018", options)) return "es2018";
	else if (browserslistSupportsEcmaVersion(browserslist, "es2017", options)) return "es2017";
	else if (browserslistSupportsEcmaVersion(browserslist, "es2016", options)) return "es2016";
	else if (browserslistSupportsEcmaVersion(browserslist, "es2015", options)) return "es2015";
	else if (browserslistSupportsEcmaVersion(browserslist, "es5", options)) return "es5";
	else return "es3";
}

/**
 * Generates a Browserslist based on browser support for the given ECMA version
 */
export function browsersWithSupportForEcmaVersion(version: EcmaVersion, options?: Partial<EcmaFeatureFilteringOptions>): string[] {
	switch (version) {
		case "es3":
			return browsersWithoutSupportForFeatures(...getFeaturesForEcmaVersion("es5", options));
		default:
			return browsersWithSupportForFeatures(...getFeaturesForEcmaVersion(version, options));
	}
}

/**
 * Returns true if the given browserslist support all of the given features
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
 */
export function browsersWithoutSupportForFeatures(...features: string[]): string[];
export function browsersWithoutSupportForFeatures(options: BrowsersWithSupportOptions): string[];
export function browsersWithoutSupportForFeatures(...args: [BrowsersWithSupportOptions] | string[]): string[] {
	const [firstArg] = args;
	const {features} = firstArg != null && typeof firstArg === "object" ? firstArg : {features: args as string[]};

	return browserSupportForFeaturesCommon("<", ...features).query;
}

/**
 * Returns true if the given browser should be ignored. The data reported from Caniuse is a bit lacking.
 * For example, only the latest version of and_ff is reported, and since
 * android went to use Chromium for the WebView, it has only reported the latest Chromium version
 */
function shouldIgnoreBrowser(browser: CaniuseBrowser, version: string): boolean {
	return (
		// The data for the QQ browser is severely lacking and unreliable
		browser === "and_qq" ||
		// The data for the UC browser is severely lacking and unreliable
		browser === "and_uc" ||
		// The data for the Baidu browser is severely lacking and unreliable
		browser === "baidu" ||
		// The data for the KaiOS browser is severely lacking and unreliable
		browser === "kaios" ||
		(browser === "android" && gt(coerceToString(browser, version), coerceToString(browser, "4.4.4"))) ||
		(browser === "op_mob" && gt(coerceToString(browser, version), coerceToString(browser, "12.1")))
	);
}

/**
 * Normalizes the given ICaniuseLiteFeature
 */
function getCaniuseLiteFeatureNormalized(stats: CaniuseStats, featureName: string): CaniuseStatsNormalized {
	// Check if a correction exists for this browser
	const featureCorrectionMatch = FEATURE_TO_BROWSER_DATA_CORRECTIONS_MAP.get(featureName);

	const keys = Object.keys(stats) as (keyof CaniuseStats & string)[];
	keys.forEach(browser => {
		const browserDict = stats[browser];
		Object.entries(browserDict).forEach(([version, support]: [string, string]) => {
			const versionMatch = version.match(NORMALIZE_BROWSER_VERSION_REGEXP);
			const normalizedVersion = versionMatch == null ? version : versionMatch[1];

			let supportKind: CaniuseSupportKind;

			if (
				support === CaniuseSupportKind.AVAILABLE ||
				support === CaniuseSupportKind.UNAVAILABLE ||
				support === CaniuseSupportKind.PARTIAL_SUPPORT ||
				support === CaniuseSupportKind.PREFIXED
			) {
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

	return stats as CaniuseStatsNormalized;
}

/**
 * Gets the support from caniuse for the given feature
 */
function getCaniuseFeatureSupport(feature: string): CaniuseStatsNormalized {
	const rawStats = (caniuseFeature(caniuseFeatures[feature]) as CaniuseFeature).stats;

	for (const browser of Object.keys(rawStats)) {
		const browserDict = rawStats[browser as keyof CaniuseStatsNormalized];
		for (const version of Object.keys(browserDict)) {
			if (shouldIgnoreBrowser(browser as keyof CaniuseStatsNormalized, version)) {
				delete browserDict[version];
			}
		}
	}

	return getCaniuseLiteFeatureNormalized(rawStats, feature);
}

/**
 * Returns true if the given feature is a Caniuse feature
 */
function isCaniuseFeature(feature: string): boolean {
	return caniuseFeatures[feature] != null;
}

/**
 * Returns true if the given feature is a MDN feature
 */
function isMdnFeature(feature: string): boolean {
	return objectPath.get(compatData, feature) != null;
}

/**
 * Asserts that the given feature is a valid Caniuse or MDN feature name
 */
function assertKnownFeature(feature: string): void {
	if (!isCaniuseFeature(feature) && !isMdnFeature(feature)) {
		throw new TypeError(`The given feature: '${feature}' is unknown. It must be a valid Caniuse or MDN feature!`);
	}
}

function normalizeFeature(feature: string): string {
	if (feature in CANIUSE_TO_MDN_FEATURE_MAP) {
		return CANIUSE_TO_MDN_FEATURE_MAP[feature as keyof typeof CANIUSE_TO_MDN_FEATURE_MAP];
	}

	return feature;
}

/**
 * Gets the feature support for the given feature
 */
function getFeatureSupport(feature: string): CaniuseStatsNormalized {
	const normalizedFeature = normalizeFeature(feature);
	// First check if the cache has a match and return it if so
	const cacheHit = featureToCaniuseStatsCache.get(normalizedFeature);
	if (cacheHit != null) return cacheHit;

	// Assert that the feature is in fact known
	assertKnownFeature(normalizedFeature);

	const result = isMdnFeature(normalizedFeature) ? getMdnFeatureSupport(normalizedFeature) : getCaniuseFeatureSupport(normalizedFeature);

	// Store it in the cache before returning it
	featureToCaniuseStatsCache.set(normalizedFeature, result);
	return result;
}

/**
 * Gets the support from caniuse for the given feature
 */
function getMdnFeatureSupport(feature: string): CaniuseStatsNormalized {
	const match: Mdn = objectPath.get(compatData, feature);
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
						return versionStillInBrowser == null || versionStillInBrowser.version_added == null ? false : (versionStillInBrowser.version_added as string | boolean);
				  })()
				: versionMap.version_added;

		const dict: {[key: string]: CaniuseSupportKind} = {};
		const supportedSince: string | null = versionAdded === false ? null : versionAdded === true ? getOldestVersionOfBrowser(caniuseBrowser) : versionAdded;

		getSortedBrowserVersionsWithLeadingVersion(caniuseBrowser, typeof versionAdded === "string" ? versionAdded : undefined).forEach(version => {
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
		/* eslint-disable @typescript-eslint/naming-convention */
		and_chr: formatBrowser("chrome_android", "and_chr"),
		chrome: formatBrowser("chrome", "chrome"),
		and_ff: formatBrowser("firefox_android", "and_ff"),
		android: formatBrowser("webview_android", "android"),
		bb: {},
		and_qq: {},
		and_uc: {},
		kaios: {},
		baidu: {},
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
		/* eslint-enable @typescript-eslint/naming-convention */
	};
	return getCaniuseLiteFeatureNormalized(stats, feature);
}

/**
 * Gets the first version that matches the given CaniuseSupportKind
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
 */
function sortBrowserslist(a: string, b: string): number {
	if (a.startsWith("not") && !b.startsWith("not")) return 1;
	if (!a.startsWith("not") && b.startsWith("not")) return -1;
	return 0;
}

/**
 * Gets a Map between browser names and the first version of them that supported the given feature
 */
export function getFirstVersionsWithFullSupport(feature: string): Map<CaniuseBrowser, string> {
	const normalizedFeature = normalizeFeature(feature);
	const support = getFeatureSupport(normalizedFeature);
	// A map between browser names and their required versions
	const browserMap: Map<CaniuseBrowser, string> = new Map();
	const entries = Object.entries(support) as [CaniuseBrowser, Record<string, CaniuseSupportKind>][];
	entries.forEach(([browser, stats]) => {
		const fullSupportVersion = getFirstVersionWithSupportKind(CaniuseSupportKind.AVAILABLE, stats);
		if (fullSupportVersion != null) {
			browserMap.set(browser, fullSupportVersion);
		}
	});
	return browserMap;
}

/**
 * Gets the Cache key for the given combination of a comparison operator and any amount of features
 */
function getBrowserSupportForFeaturesCacheKey(comparisonOperator: ComparisonOperator, features: string[]): string {
	return `${comparisonOperator}.${features.sort().join(",")}`;
}

/**
 * Common logic for the functions that generate browserslists based on feature support
 */
function browserSupportForFeaturesCommon(comparisonOperator: ComparisonOperator, ...features: string[]): BrowserSupportForFeaturesCommonResult {
	const normalizedFeatures = features.map(normalizeFeature);
	const cacheKey = getBrowserSupportForFeaturesCacheKey(comparisonOperator, normalizedFeatures);

	// First check if the cache has a hit and return it if so
	const cacheHit = browserSupportForFeaturesCache.get(cacheKey);
	if (cacheHit != null) {
		return cacheHit;
	}

	// All of the generated browser maps
	const browserMaps: Map<CaniuseBrowser, string>[] = [];

	for (const normalizedFeature of normalizedFeatures) {
		const support = getFeatureSupport(normalizedFeature);

		// A map between browser names and their required versions
		const browserMap: Map<CaniuseBrowser, string> = new Map();
		const entries = Object.entries(support) as [CaniuseBrowser, Record<string, CaniuseSupportKind>][];
		entries.forEach(([browser, stats]) => {
			const fullSupportVersion = getFirstVersionWithSupportKind(CaniuseSupportKind.AVAILABLE, stats);
			const partialSupportVersion = getFirstVersionWithSupportKind(CaniuseSupportKind.PARTIAL_SUPPORT, stats);
			let versionToSet: string | undefined;

			if (fullSupportVersion != null) {
				versionToSet = fullSupportVersion;
			}

			// Otherwise, check if partial support exists and should be allowed
			if (partialSupportVersion != null) {
				// Get all partial support allowances for this specific feature
				const partialSupportMatch = PARTIAL_SUPPORT_ALLOWANCES.get(normalizedFeature);

				// Check if partial support exists for the browser. // If no full supported version exists or if the partial supported version has a lower version number than the full supported one, use that one instead
				if (
					partialSupportMatch != null &&
					(partialSupportMatch === "*" || partialSupportMatch.includes(browser)) &&
					(fullSupportVersion == null || compareVersions(partialSupportVersion, fullSupportVersion) < 0)
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
						case "<=": {
							const previousVersion = getPreviousVersionOfBrowser(browser, version);
							return [`not ${browser} ${version}`, ...(previousVersion == null ? [] : [`${browser} ${comparisonOperator} ${previousVersion}`])];
						}
						case ">":
						case ">=": {
							const nextVersion = getNextVersionOfBrowser(browser, version);
							return [`${browser} ${version}`, ...(nextVersion == null ? [] : [`${browser} ${comparisonOperator} ${nextVersion}`])];
						}
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
 */
function getCaniuseBrowserForUseragentBrowser(parser: UaParserWrapper): Partial<VersionedCaniuseBrowser> {
	const browser = parser.getBrowser();
	const device = parser.getDevice();
	const os = parser.getOS();
	const engine = parser.getEngine();

	// If the OS is iOS, it is actually Safari that drives the WebView
	if (os.name === "iOS") {
		// Opera Mini with the Presto runtime actually works around
		// the restrictions os the Safari WebView
		if (browser.name === "Opera Mini" && engine.name === "Presto") {
			return {
				browser: "op_mini",
				version: browser.version
			};
		}

		// In all other cases, it is always Safari driving the WebView
		return {
			browser: "ios_saf",
			version: os.version ?? browser.version
		};
	}

	// First, if it is a Blackberry device, it will always be the 'bb' browser
	if (device.vendor === "BlackBerry" || os.name === "BlackBerry") {
		return {
			browser: "bb",
			version: browser.version
		};
	}

	// For platforms where the HeyTapBrowser doesn't report which Chrome version
	// it is based on, we'll have to rely on knowledge from similar user agent strings.
	// as far as we know, HeyTapBrowser on non-iOS is always based on Chrome 70 or 77,
	// seemingly at random. So we'll have to assume Chrome 70 here.
	if (browser.name === "HeyTapBrowser" && engine.name === "WebKit") {
		return {
			browser: "chrome",
			version: "70"
		};
	}

	// Unfortunately, since Caniuse doesn't support PaleMoon,
	// we will have to remap it to its closest equivalent Firefox
	// version (which it is similar to and a fork of).
	// This is less than ideal, but unfortunately a requirement for the time being
	if (browser.name === "PaleMoon" && engine.name === "Goanna" && browser.version != null) {
		const semver = ensureSemver(undefined, browser.version);

		// The data comes from this table: https://en.wikipedia.org/wiki/Pale_Moon_(web_browser)#Releases
		if (lte(semver, "5.0.0")) {
			return {
				browser: "firefox",
				version: "2"
			};
		}

		// Between these two versions, the version numbers followed Firefox/Gecko
		else if (lte(semver, "24.0.0")) {
			return {
				browser: "firefox",
				version: browser.version
			};
		}

		// It kept staying at Firefox 24 for all we know
		else if (lt(semver, "27.0.0")) {
			return {
				browser: "firefox",
				version: "24.0.0"
			};
		}

		// Then, from v27, it was based on a re-fork of Firefox 38.
		// Unfortunately, we don't have fresh data as for the versions
		// in between 27 and 29, so we'll have to stay at version 38 in
		// this range
		else if (lt(semver, "29.0.0")) {
			return {
				browser: "firefox",
				version: "38"
			};
		}

		// We know that v29 points to Firefox 68 in some of its user agents
		else {
			return {
				browser: "firefox",
				version: "68"
			};
		}
	}

	// For the MIUIBrowser, there are some rare instances for major versions 8 and 9 where they'll have no declared Chromium engine.
	// as part of the UA. Under these circumstances, we have to rely on knowledge gathered from scraping related User Agents
	// to determine the equivalent Chromium version
	if (browser.name === "MIUI Browser" && browser.version != null && os.name === "Android" && engine.name == null) {
		const semver = ensureSemver(undefined, browser.version);

		if (semver.major === 8 || semver.major === 9) {
			return {
				browser: "chrome",
				version: "53"
			};
		}
	}

	switch (browser.name) {
		case "Samsung Browser":
		case "Samsung Internet":
			if (browser.version != null) {
				return {
					browser: "samsung",
					version: browser.version
				};
			} else if (engine.name === "Blink" && engine.version != null) {
				return {
					browser: "chrome",
					version: engine.version
				};
			} else {
				break;
			}

		case "Android Browser": {
			// If the vendor is Samsung, the default browser is Samsung Internet
			if (device.vendor === "Samsung") {
				return {
					browser: "samsung",
					version: browser.version
				};
			}

			// Default to the stock android browser
			return {
				browser: "android",
				version: browser.version
			};
		}

		case "WebKit":
			// This will be the case if we're in an iOS Safari WebView
			if (device.type === "mobile" || device.type === "tablet" || device.type === "smarttv" || device.type === "wearable" || device.type === "embedded") {
				return {
					browser: "ios_saf",
					version: os.version
				};
			}
			// Otherwise, fall back to Safari
			return {
				browser: "safari",
				version: browser.version
			};

		case "Baidu":
			return {
				browser: "baidu",
				version: browser.version
			};

		case "Chrome Headless":
		case "Chrome WebView":
			return {
				browser: "chrome",
				version: browser.version
			};

		case "Facebook":
			// We've already asserted that this isn't iOS above, so we must be on Android and inside of a WebView
			return {
				browser: "chrome",
				version: browser.version
			};

		case "Chrome": {
			// Check if the OS is Android, in which case this is actually Chrome for Android. Make it report as regular Chrome
			if (os.name === "Android") {
				// Handle a special case on Android where the Chrome version
				// is actually the WebKit version, and it is actually the stock
				// Android browser.
				if (os.version != null && browser.version != null) {
					const browserSemver = ensureSemver("chrome", browser.version);
					const osSemver = ensureSemver(undefined, os.version);
					if (lte(osSemver, "4.4.4") && gte(browserSemver, "400.0.0")) {
						return {
							browser: "android",
							version: os.version
						};
					}
				}

				// Treat Android Chrome as Desktop Chrome, as these are functionally equivalent and always match each other from a feature support point of view
				return {
					browser: "chrome",
					version: browser.version
				};
			}

			// Otherwise, fall back to chrome
			return {
				browser: "chrome",
				version: browser.version
			};
		}

		case "Edge": {
			// If the Engine is Blink, it's Chrome-based
			if (engine.name === "Blink") {
				// If there is no browser version, fall back to Chrome
				if (browser.version == null) {
					return {
						browser: "chrome",
						version: engine.version
					};
				}

				const semverVersion = ensureSemver("edge", browser.version);

				// If the Major version is in between 18 and 79, this will be Edge Mobile on Android,
				// which is Chromium based but has no related Caniuse browser name. Treat it as Chrome
				if (semverVersion.major > 18 && semverVersion.major < 79) {
					return {
						browser: "chrome",
						version: engine.version
					};
				}
			}

			return {
				browser: "edge",
				version: browser.version
			};
		}

		case "Firefox":
			// Check if the OS is Android, in which case this is actually Firefox for Android.
			if (os.name === "Android") {
				return {
					browser: "and_ff",
					version: browser.version
				};
			}

			// Default to Firefox
			return {
				browser: "firefox",
				version: browser.version
			};

		case "IE":
			return {
				browser: "ie",
				version: browser.version
			};

		case "IE Mobile":
		case "IEMobile":
			return {
				browser: "ie_mob",
				version: browser.version
			};

		case "Safari":
			// If no browser version is reported, and it is based on WebKit,
			// we will have to attempt to "guess" the Safari version with mapping the
			// WebKit version to an equivalent Safari version based on the data
			// here: https://en.wikipedia.org/wiki/Safari_version_history, even
			// though this doesn't seem to map correctly to real-world data
			if (browser.version == null && engine.name === "WebKit" && engine.version != null) {
				const semver = ensureSemver(undefined, engine.version);

				if (lt(semver, "412.0.0")) {
					return {
						browser: "safari",
						version: "1.0"
					};
				}

				if (lt(semver, "522.0.0")) {
					return {
						browser: "safari",
						version: "2.0"
					};
				}

				if (lt(semver, "526.0.0")) {
					return {
						browser: "safari",
						version: "3.0"
					};
				}

				if (lt(semver, "533.0.0")) {
					return {
						browser: "safari",
						version: "4.0"
					};
				}

				if (lt(semver, "536.0.0")) {
					return {
						browser: "safari",
						version: "5.0"
					};
				}

				if (lt(semver, "537.71.0")) {
					return {
						browser: "safari",
						version: "6.0"
					};
				}

				if (lt(semver, "600.0.0")) {
					return {
						browser: "safari",
						version: "7.0"
					};
				}

				if (lt(semver, "601.0.0")) {
					return {
						browser: "safari",
						version: "8.0"
					};
				}

				if (lt(semver, "602.0.0")) {
					return {
						browser: "safari",
						version: "9.0"
					};
				}

				if (lt(semver, "604.0.0")) {
					return {
						browser: "safari",
						version: "10.0"
					};
				}

				if (lt(semver, "606.0.0")) {
					return {
						browser: "safari",
						version: "11.0"
					};
				}

				if (lt(semver, "608.0.0")) {
					return {
						browser: "safari",
						version: "12.0"
					};
				}

				if (lt(semver, "610.0.0")) {
					return {
						browser: "safari",
						version: "13.0"
					};
				}

				// Else it is the current Safari version.
				// Keep this updated regularly
				return {
					browser: "safari",
					version: "14.0"
				};
			}
			return {
				browser: "safari",
				version: browser.version
			};

		case "Mobile Safari":
		case "MobileSafari":
		case "Safari Mobile":
		case "SafariMobile":
			return {
				browser: "ios_saf",
				version: os.version ?? browser.version
			};

		case "Opera":
			return {
				browser: "opera",
				version: browser.version
			};

		case "Opera Mini":
			return {
				browser: "op_mini",
				version: browser.version
			};

		case "Opera Mobi":
			return {
				browser: "op_mob",
				version: browser.version
			};

		case "QQBrowser":
			return {
				browser: "and_qq",
				version: browser.version
			};

		case "UCBrowser":
			return {
				browser: "and_uc",
				version: browser.version
			};

		default:
			switch (engine.name) {
				// If the Engine is Blink, it's Chrome
				case "Blink":
					return {
						browser: "chrome",
						version: engine.version
					};
				case "WebKit":
					return {
						browser: "safari",
						version: browser.version
					};
				case "EdgeHTML":
					return {
						browser: "edge",
						version: browser.version
					};
				case "Gecko":
					return {
						browser: "firefox",
						version: engine.version
					};
				case "Presto":
					return {
						browser: "opera",
						version: browser.version
					};
			}
	}

	// Fall back to the unknown Caniuse browser when all
	// we received was the name of the OS
	if (browser.name == null && engine.name == null && device.type == null && os.name != null) {
		return UNKNOWN_CANIUSE_BROWSER;
	}

	return {};
}

/**
 * Normalizes the version of the browser such that it plays well with Caniuse
 */
function getCaniuseVersionForUseragentVersion(
	{browser, version}: VersionedCaniuseBrowser,
	useragentBrowser: UseragentBrowser,
	useragentOs: UseragentOs,
	useragentEngine: UseragentEngine
): string {
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

	const coerced = ensureSemver(browser, version);

	// Make sure that we have a proper Semver version to work with
	if (coerced == null) throw new TypeError(`Could not detect the version of: '${version}' for browser: ${browser}`);

	// Unpack the semver version
	const {major, minor, patch} = coerced;

	// Generates a Semver version
	const buildSemverVersion = (majorVersion: number, minorVersion?: number, patchVersion?: number): string =>
		`${majorVersion}${minorVersion == null || minorVersion === 0 ? "" : `.${minorVersion}`}${patchVersion == null || patchVersion === 0 ? "" : `.${patchVersion}`}`;

	switch (browser) {
		case "chrome":
			if (useragentEngine.name === "Blink") {
				return buildSemverVersion(ensureSemver(browser, getClosestMatchingBrowserVersion(browser, useragentEngine.version ?? version)).major);
			}
			return buildSemverVersion(major);
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
				if (useragentOs.version == null) throw new ReferenceError(`Could not detect OS version of iOS for ${useragentBrowser.name} on iOS`);
				// Decide the Semver version
				const osSemver = ensureSemver(undefined, getClosestMatchingBrowserVersion(browser, useragentOs.version));

				// iOS may have minor releases, but never patch releases, according to caniuse
				return buildSemverVersion(osSemver.major, osSemver.minor);
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
		case "kaios":
			// These may always contain minor versions
			return buildSemverVersion(major, minor);

		default:
			// For anything else, just use the major version
			return buildSemverVersion(major);
	}
}

/**
 * Generates a browserslist from the provided useragent string
 */
export function generateBrowserslistFromUseragent(useragent: string): string[] {
	// Check if a user agent has been generated previously for this specific user agent
	const cacheHit = userAgentToBrowserslistCache.get(useragent);
	if (cacheHit != null) return cacheHit;

	// Otherwise, generate a new one
	const parser = new UaParserWrapper(useragent);
	const browser = parser.getBrowser();
	const os = parser.getOS();
	const engine = parser.getEngine();

	// Prepare a CaniuseBrowser name from the useragent string
	const {browser: caniuseBrowserName, version: caniuseBrowserVersion} = getCaniuseBrowserForUseragentBrowser(parser);

	// If the browser name or version couldn't be determined, return false immediately
	if (caniuseBrowserName == null || caniuseBrowserVersion == null) {
		throw new TypeError(`No caniuse browser and/or version could be determined for User Agent: ${useragent}`);
	}

	const closestMatchingCaniuseBrowserVersionOrSmaller = normalizeBrowserVersion(caniuseBrowserName, caniuseBrowserVersion, undefined, true);

	const closestMatchingCaniuseBrowserVersion = normalizeBrowserVersion(caniuseBrowserName, caniuseBrowserVersion, undefined);

	const caniuseBrowser = {browser: caniuseBrowserName, version: closestMatchingCaniuseBrowserVersionOrSmaller};

	// Prepare a version from the useragent that plays well with caniuse
	const finalVersion = getCaniuseVersionForUseragentVersion(caniuseBrowser, browser, os, engine);

	// Prepare a browserslist from the useragent itself
	const normalizedBrowserslist = normalizeBrowserslist([`${caniuseBrowserName} ${finalVersion}`]);

	const finalVersionCoerced = ensureSemver(caniuseBrowserName, finalVersion);
	const closestMatchingCaniuseBrowserVersionCoerced = ensureSemver(caniuseBrowserName, closestMatchingCaniuseBrowserVersion);
	if (
		lt(finalVersionCoerced, closestMatchingCaniuseBrowserVersionCoerced, {loose: true}) &&
		normalizedBrowserslist[0] === `${caniuseBrowserName} ${closestMatchingCaniuseBrowserVersion}`
	) {
		normalizedBrowserslist[0] = `${caniuseBrowserName} ${finalVersion}`;
	}

	// Store it in the cache before returning it
	userAgentToBrowserslistCache.set(useragent, normalizedBrowserslist);
	return normalizedBrowserslist;
}

/**
 * Generates a browserslist from the provided useragent string and checks if it matches
 * the given browserslist
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
 */
function userAgentWithFeaturesCacheKey(useragent: string, features: string[]): string {
	return `${useragent}.${features.join(",")}`;
}

/**
 * Returns true if the given user agent supports the given features
 */
export function userAgentSupportsFeatures(useragent: string, ...features: string[]): boolean {
	const normalizedFeatures = features.map(normalizeFeature);

	// Check if these features has been computed previously for the given user agent
	const cacheKey = userAgentWithFeaturesCacheKey(useragent, normalizedFeatures);
	const cacheHit = userAgentWithFeaturesToSupportCache.get(cacheKey);
	// If so, return the cache hit
	if (cacheHit != null) return cacheHit;

	// Prepare a browserslist from the useragent itself
	const useragentBrowserslist = generateBrowserslistFromUseragent(useragent);

	// Prepare a browserslist for browsers that support the given features
	const supportedBrowserslist = normalizeBrowserslist(browsersWithSupportForFeatures(...normalizedFeatures));

	// Now, compare the two, and if the browserslist with supported browsers includes every option from the user agent, the user agent supports all of the given features
	const support = useragentBrowserslist.every(option => supportedBrowserslist.includes(option));

	// Set it in the cache and return it
	userAgentWithFeaturesToSupportCache.set(cacheKey, support);
	return support;
}
