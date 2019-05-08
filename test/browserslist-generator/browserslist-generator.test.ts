import test from "ava";
// @ts-ignore
import {bingBot, chrome, edge, firefox, googleBot, ie, safari} from "useragent-generator";
import {
	browserslistSupportsEcmaVersion,
	browserslistSupportsFeatures,
	browsersWithoutSupportForFeatures,
	browsersWithSupportForEcmaVersion,
	browsersWithSupportForFeatures,
	generateBrowserslistFromUseragent,
	getAppropriateEcmaVersionForBrowserslist,
	getFirstVersionsWithFullSupport,
	matchBrowserslistOnUserAgent,
	userAgentSupportsFeatures
} from "../../src/browserslist-generator/browserslist-generator";

const SAFARI_TP_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.2 Safari/605.1.15";

// tslint:disable:no-duplicate-string

// tslint:disable:no-identical-functions

// tslint:disable:no-commented-code

const ES_MODULE_FEATURE_NAME = "es6-module";
const SHADOW_DOM_FEATURE_NAME = "shadowdomv1";
const CUSTOM_ELEMENTS_FEATURE_NAME = "custom-elementsv1";
const PROMISE_FINALLY = "javascript.builtins.Promise.finally";
const UNRELEASED_VERSIONS = "unreleased versions";

test("browsersWithSupportForFeatures() => Will skip 'Android' in the generated browserslist", t => {
	t.true(!browsersWithSupportForFeatures(ES_MODULE_FEATURE_NAME, SHADOW_DOM_FEATURE_NAME, CUSTOM_ELEMENTS_FEATURE_NAME).some(part => part.includes("android")));
});

test("browsersWithoutSupportForFeatures() => Will include all browsers that simply has no support for the given features at all", t => {
	t.true(browsersWithoutSupportForFeatures(ES_MODULE_FEATURE_NAME, SHADOW_DOM_FEATURE_NAME, CUSTOM_ELEMENTS_FEATURE_NAME).some(part => part.includes("ie")));
});

test("matchBrowserslistOnUserAgent() => Will not match Firefox > 54 for a Firefox v54 user agent", t => {
	t.false(matchBrowserslistOnUserAgent(firefox("54"), ["Firefox > 54"]));
});

test("matchBrowserslistOnUserAgent() => Will correctly determine that Firefox v62 supports es6-module", t => {
	t.true(userAgentSupportsFeatures(firefox(63), "es6-module"));
});

test("matchBrowserslistOnUserAgent() => Will correctly determine that Firefox v63 supports javascript.builtins.Map", t => {
	t.true(userAgentSupportsFeatures(firefox(63), "javascript.builtins.Map.@@iterator"));
});

test("matchBrowserslistOnUserAgent() => Will correctly determine that Firefox v63 supports custom-elementsv1", t => {
	t.true(userAgentSupportsFeatures(firefox(63), CUSTOM_ELEMENTS_FEATURE_NAME));
});

test("matchBrowserslistOnUserAgent() => Will match Firefox >= 54 for a Firefox v54 user agent", t => {
	t.true(matchBrowserslistOnUserAgent(firefox("54"), ["Firefox >= 54"]));
});

test("matchBrowserslistOnUserAgent() => Will match Chrome 68 for a Chrome v68 user agent", t => {
	t.true(matchBrowserslistOnUserAgent(chrome("68"), ["Chrome >= 68", UNRELEASED_VERSIONS]));
});

test("matchBrowserslistOnUserAgent() => Will match Chrome for an Android Chrome v18 user agent", t => {
	t.true(matchBrowserslistOnUserAgent(chrome.androidPhone("18"), ["chrome >= 18", UNRELEASED_VERSIONS]));
});

test("matchBrowserslistOnUserAgent() => Will match iOS Chrome but treat it as iOS safari", t => {
	t.true(matchBrowserslistOnUserAgent(chrome.iOS("10.3"), ["ios_saf >= 10", UNRELEASED_VERSIONS]));
});

test("matchBrowserslistOnUserAgent() => Supports Samsung Browser 8.2 (e.g. Samsung Internet)", t => {
	t.true(
		matchBrowserslistOnUserAgent(
			"Mozilla/5.0 (Linux; Android 7.0; SAMSUNG SM-A510F Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/8.2 Chrome/63.0.3239.111 Mobile Safari/537.36",
			["samsung >= 8.2", UNRELEASED_VERSIONS]
		)
	);
});

test("matchBrowserslistOnUserAgent() => Will match Safari v11", t => {
	t.true(matchBrowserslistOnUserAgent(safari("11"), ["safari 11", UNRELEASED_VERSIONS]));
});

test("matchBrowserslistOnUserAgent() => Will match Safari TP", t => {
	t.true(matchBrowserslistOnUserAgent(SAFARI_TP_USER_AGENT, ["safari TP", UNRELEASED_VERSIONS]));
});

test("matchBrowserslistOnUserAgent() => Will match iOS Safari v11", t => {
	t.true(matchBrowserslistOnUserAgent(safari.iOS("11.2"), ["ios_saf 11", UNRELEASED_VERSIONS]));
});

test("matchBrowserslistOnUserAgent() => Will match iOS Safari in a WebView v11", t => {
	t.true(matchBrowserslistOnUserAgent(safari.iOSWebview("11.2"), ["ios_saf 11", UNRELEASED_VERSIONS]));
});

test("matchBrowserslistOnUserAgent() => Will match iOS Firefox but treat it as iOS Safari", t => {
	t.true(matchBrowserslistOnUserAgent(firefox.iOS("8.3"), ["ios_saf >= 8", UNRELEASED_VERSIONS]));
});

test("matchBrowserslistOnUserAgent() => Will match chrome as an Android WebView (as android)", t => {
	t.true(matchBrowserslistOnUserAgent(chrome.androidWebview("4.4.4"), ["android >= 4", UNRELEASED_VERSIONS]));
});

test("matchBrowserslistOnUserAgent() => Will match Android Chrome on a Phone (as regular chrome)", t => {
	t.true(matchBrowserslistOnUserAgent(chrome.androidPhone("66"), ["chrome >= 66", UNRELEASED_VERSIONS]));
});

test("matchBrowserslistOnUserAgent() => Will match Android Chrome on a Tablet (as regular Chrome)", t => {
	t.true(matchBrowserslistOnUserAgent(chrome.androidTablet("66"), ["chrome >= 66", UNRELEASED_VERSIONS]));
});

test("matchBrowserslistOnUserAgent() => Will match Android Chrome on a Chromecast (as chrome)", t => {
	t.true(matchBrowserslistOnUserAgent(chrome.chromecast("66"), ["chrome >= 66", UNRELEASED_VERSIONS]));
});

test("matchBrowserslistOnUserAgent() => Will match Headless Chrome as Chrome", t => {
	t.true(
		matchBrowserslistOnUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/72.0.3617.0 Safari/537.36", [
			"chrome >= 72",
			UNRELEASED_VERSIONS
		])
	);
});

test("matchBrowserslistOnUserAgent() => Will match GoogleBot as Chrome v41", t => {
	t.true(matchBrowserslistOnUserAgent(googleBot(), ["chrome >= 41", UNRELEASED_VERSIONS]));
});

test("matchBrowserslistOnUserAgent() => Will match BingBot as IE 8", t => {
	t.true(matchBrowserslistOnUserAgent(bingBot(), ["ie >= 8", UNRELEASED_VERSIONS]));
});

test("matchBrowserslistOnUserAgent() => Will match YahooBot as IE 8", t => {
	t.true(matchBrowserslistOnUserAgent(bingBot(), ["ie >= 8", UNRELEASED_VERSIONS]));
});

test("matchBrowserslistOnUserAgent() => Will match Android Firefox (as desktop firefox)", t => {
	t.true(matchBrowserslistOnUserAgent(firefox.androidPhone("57"), ["firefox >= 57", UNRELEASED_VERSIONS]));
});

test("matchBrowserslistOnUserAgent() => Will match Internet Explorer", t => {
	t.true(matchBrowserslistOnUserAgent(ie("9"), ["ie 9", UNRELEASED_VERSIONS]));
});

test("matchBrowserslistOnUserAgent() => Will match Internet Explorer Mobile", t => {
	t.true(matchBrowserslistOnUserAgent(ie.windowsPhone("10"), ["ie_mob 10", UNRELEASED_VERSIONS]));
});

test("matchBrowserslistOnUserAgent() => Will match Microsoft Edge", t => {
	t.true(matchBrowserslistOnUserAgent(edge("16"), ["edge >= 16", UNRELEASED_VERSIONS]));
});

test("matchBrowserslistOnUserAgent() => Won't match an unreleased version that doesn't support the given features #1", t => {
	t.false(matchBrowserslistOnUserAgent(firefox("61"), browsersWithSupportForFeatures(ES_MODULE_FEATURE_NAME, SHADOW_DOM_FEATURE_NAME, CUSTOM_ELEMENTS_FEATURE_NAME)));
});

test("matchBrowserslistOnUserAgent() => Won't match an unreleased version that doesn't support the given features #2", t => {
	t.true(matchBrowserslistOnUserAgent(firefox("61"), browsersWithoutSupportForFeatures(ES_MODULE_FEATURE_NAME, SHADOW_DOM_FEATURE_NAME, CUSTOM_ELEMENTS_FEATURE_NAME)));
});

test("browserslistSupportsFeatures() => Will correctly determine if a browserslist support the given set of features #1", t => {
	const browserslist = browsersWithSupportForFeatures(ES_MODULE_FEATURE_NAME, SHADOW_DOM_FEATURE_NAME, CUSTOM_ELEMENTS_FEATURE_NAME);
	t.true(browserslistSupportsFeatures(browserslist, ES_MODULE_FEATURE_NAME, SHADOW_DOM_FEATURE_NAME, CUSTOM_ELEMENTS_FEATURE_NAME));
});

test("browserslistSupportsFeatures() => Will correctly determine if a browserslist support the given set of features #2", t => {
	const browserslist = browsersWithoutSupportForFeatures(ES_MODULE_FEATURE_NAME, SHADOW_DOM_FEATURE_NAME, CUSTOM_ELEMENTS_FEATURE_NAME);
	t.false(browserslistSupportsFeatures(browserslist, ES_MODULE_FEATURE_NAME, SHADOW_DOM_FEATURE_NAME, CUSTOM_ELEMENTS_FEATURE_NAME));
});

test("browserslistSupportsFeatures() => Will correctly determine if a browserslist support the given set of features #3", t => {
	const browserslist = browsersWithSupportForFeatures(ES_MODULE_FEATURE_NAME, SHADOW_DOM_FEATURE_NAME, CUSTOM_ELEMENTS_FEATURE_NAME);
	t.true(browserslistSupportsFeatures(browserslist, ES_MODULE_FEATURE_NAME));
});

test("browserslistSupportsFeatures() => Will correctly determine if a browserslist support the given set of features #4", t => {
	const browserslist = browsersWithSupportForFeatures(ES_MODULE_FEATURE_NAME);
	t.false(browserslistSupportsFeatures(browserslist, ES_MODULE_FEATURE_NAME, SHADOW_DOM_FEATURE_NAME, CUSTOM_ELEMENTS_FEATURE_NAME));
});

test("Android versions above v4.4.4 will report the Chrome version #1", t => {
	const browserMap = getFirstVersionsWithFullSupport("es6-class");
	const androidVersion = browserMap.get("android");
	// Assert that no android version is reported
	t.true(androidVersion == null);
});

test("userAgentSupportsFeatures() => Correctly determines that Chrome 63 supports Promise.finally #1", t => {
	t.true(userAgentSupportsFeatures(chrome("63"), PROMISE_FINALLY));
});

test("userAgentSupportsFeatures() => Correctly determines that Safari 10 doesn't support Promise.finally #1", t => {
	t.false(userAgentSupportsFeatures(safari("10"), PROMISE_FINALLY));
});

test("browserslistSupportsFeatures() => Will correctly determine if a browserslist support the given set of Mdn features #1", t => {
	const browserslist = browsersWithoutSupportForFeatures(PROMISE_FINALLY, "javascript.builtins.TypedArray.@@species");
	t.false(browserslistSupportsFeatures(browserslist, PROMISE_FINALLY, "javascript.builtins.TypedArray.@@species"));
});

test("userAgentSupportsFeatures() => Correctly determines that IE 11 supports Object.defineProperty #1", t => {
	t.true(userAgentSupportsFeatures(ie("11"), "javascript.builtins.Object.defineProperty"));
});

test("userAgentSupportsFeatures() => Correctly determines that IE 11 doesn't support WeakSets #1", t => {
	t.true(!userAgentSupportsFeatures(ie("11"), "javascript.builtins.WeakSet"));
});

test("userAgentSupportsFeatures() => Correctly determines that Chrome 70 supports TypedArray.find #1", t => {
	t.true(userAgentSupportsFeatures(chrome("70"), "javascript.builtins.TypedArray.find"));
});

test("generateBrowserslistFromUseragent() => Will fall back to the latest known version if given a version of a browser that is newer than what is known by Caniuse #1", t => {
	t.notThrows(() => generateBrowserslistFromUseragent(firefox("9999")));
});

test("userAgentSupportsFeatures() => Correctly determines that Chrome 70 supports Web Animations (even though support is partial) #1", t => {
	t.true(userAgentSupportsFeatures(chrome("70"), "web-animation"));
});

test("userAgentSupportsFeatures() => Correctly determines that Safari 12.0.2 doesn't support Web Animations #1", t => {
	t.false(userAgentSupportsFeatures(safari("12.0.2"), "web-animation"));
});

test("userAgentSupportsFeatures() => Correctly determines that Safari 12.1 doesn't support Web Animations #1", t => {
	t.false(userAgentSupportsFeatures(safari("12.1"), "web-animation"));
});

test("userAgentSupportsFeatures() => Correctly determines that Edge 16.16299 doesn't support the URL constructor #1", t => {
	t.false(userAgentSupportsFeatures(edge("16.16299"), "url", "urlsearchparams"));
});

test("userAgentSupportsFeatures() => Correctly determines that Safari TP *does* support Web Animations #1", t => {
	t.true(userAgentSupportsFeatures(SAFARI_TP_USER_AGENT, "web-animation"));
});

test("browsersWithSupportForEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES3 doesn't support ES5 features #1", t => {
	t.false(browserslistSupportsFeatures(browsersWithSupportForEcmaVersion("es3"), "es5"));
});

test("browsersWithSupportForEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES5 doesn't support ES2015 features #1", t => {
	t.false(browserslistSupportsFeatures(browsersWithSupportForEcmaVersion("es5"), "es6-class"));
});

test("browsersWithSupportForEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES2015 doesn't support ES2016 features #1", t => {
	t.false(browserslistSupportsFeatures(browsersWithSupportForEcmaVersion("es2015"), "javascript.operators.arithmetic.exponentiation"));
});

test("browsersWithSupportForEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES2016 doesn't support ES2017 features #1", t => {
	t.false(browserslistSupportsFeatures(browsersWithSupportForEcmaVersion("es2016"), "async-functions"));
});

test("browsersWithSupportForEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES2017 doesn't support ES2018 features #1", t => {
	t.false(browserslistSupportsFeatures(browsersWithSupportForEcmaVersion("es2017"), "javascript.operators.spread.spread_in_object_literals"));
});

test("browsersWithSupportForEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES2018 does support LATEST features #1", t => {
	t.true(browserslistSupportsFeatures(browsersWithSupportForEcmaVersion("es2018"), "javascript.operators.spread.spread_in_object_literals"));
});

test("browserslistSupportsEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES3 doesn't support ES5 features #1", t => {
	t.false(browserslistSupportsEcmaVersion(browsersWithSupportForEcmaVersion("es3"), "es5"));
});

test("browserslistSupportsEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES5 doesn't support ES2015 features #1", t => {
	t.false(browserslistSupportsEcmaVersion(browsersWithSupportForEcmaVersion("es5"), "es2015"));
});

test("browserslistSupportsEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES2015 doesn't support ES2016 features #1", t => {
	t.false(browserslistSupportsEcmaVersion(browsersWithSupportForEcmaVersion("es2015"), "es2016"));
});

test("browserslistSupportsEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES2016 doesn't support ES2017 features #1", t => {
	t.false(browserslistSupportsEcmaVersion(browsersWithSupportForEcmaVersion("es2016"), "es2017"));
});

test("browserslistSupportsEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES2017 doesn't support ES2018 features #1", t => {
	t.false(browserslistSupportsEcmaVersion(browsersWithSupportForEcmaVersion("es2017"), "es2018"));
});

test("browserslistSupportsEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES2018 does support LATEST features #1", t => {
	t.true(browserslistSupportsEcmaVersion(browsersWithSupportForEcmaVersion("es2018"), "es2018"));
});

test("getAppropriateEcmaVersionForBrowserslist() => Correctly determines that the most appropriate Ecma version for a Browserslist targeting browsers only compatible with ES3 is indeed ES3 #1", t => {
	t.deepEqual(getAppropriateEcmaVersionForBrowserslist(browsersWithSupportForEcmaVersion("es3")), "es3");
});

test("getAppropriateEcmaVersionForBrowserslist() => Correctly determines that the most appropriate Ecma version for a Browserslist targeting browsers only compatible with ES5 is indeed ES5 #1", t => {
	t.deepEqual(getAppropriateEcmaVersionForBrowserslist(browsersWithSupportForEcmaVersion("es5")), "es5");
});

test("getAppropriateEcmaVersionForBrowserslist() => Correctly determines that the most appropriate Ecma version for a Browserslist targeting browsers only compatible with ES2015 is indeed ES2015 #1", t => {
	t.deepEqual(getAppropriateEcmaVersionForBrowserslist(browsersWithSupportForEcmaVersion("es2015")), "es2015");
});

test("getAppropriateEcmaVersionForBrowserslist() => Correctly determines that the most appropriate Ecma version for a Browserslist targeting browsers only compatible with ES2016 is indeed ES2016 #1", t => {
	t.deepEqual(getAppropriateEcmaVersionForBrowserslist(browsersWithSupportForEcmaVersion("es2016")), "es2016");
});

test("getAppropriateEcmaVersionForBrowserslist() => Correctly determines that the most appropriate Ecma version for a Browserslist targeting browsers only compatible with ES2017 is indeed ES2017 #1", t => {
	t.deepEqual(getAppropriateEcmaVersionForBrowserslist(browsersWithSupportForEcmaVersion("es2017")), "es2017");
});

test("getAppropriateEcmaVersionForBrowserslist() => Correctly determines that the most appropriate Ecma version for a Browserslist targeting browsers only compatible with ES2018 is indeed ES2018 #1", t => {
	t.deepEqual(getAppropriateEcmaVersionForBrowserslist(browsersWithSupportForEcmaVersion("es2018")), "es2018");
});

test("getAppropriateEcmaVersionForBrowserslist() => Correctly determines that the most appropriate Ecma version for a Browserslist targeting browsers only compatible with ES2019 is indeed ES2019 #1", t => {
	t.deepEqual(getAppropriateEcmaVersionForBrowserslist(browsersWithSupportForEcmaVersion("es2019")), "es2019");
});

// test.only("playground", t => {
// 	browsersWithoutSupportForFeatures("api.Window");
// 	t.true(true);
// });
