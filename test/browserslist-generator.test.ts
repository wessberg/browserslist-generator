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
} from "../src/browserslist-generator/browserslist-generator";

const FBAN_SAFARI_13_3_USER_AGENT =
	"Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 LightSpeed [FBAN/MessengerLiteForiOS;FBAV/253.1.0.43.116;FBBV/200174216;FBDV/iPhone11,6;FBMD/iPhone;FBSN/iOS;FBSV/13.3.1;FBSS/3;FBCR/;FBID/phone;FBLC/en_US;FBOP/0]";

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

test("userAgentSupportsFeatures() => Will correctly determine that Firefox v62 supports es6-module", t => {
	t.true(userAgentSupportsFeatures(firefox(63), "es6-module"));
});

test("userAgentSupportsFeatures() => Will correctly determine that iOS 14.4.2 supports web-animation", t => {
	t.true(userAgentSupportsFeatures(`Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBDV/iPhone11,8;FBMD/iPhone;FBSN/iOS;FBSV/14.4.2;FBSS/2;FBID/phone;FBLC/it_IT;FBOP/5]`, "web-animation"));
});

test("userAgentSupportsFeatures() => Will correctly determine that Edge Mobile 45 on Android supports web-animation", t => {
	t.true(userAgentSupportsFeatures(`Mozilla/5.0 (Linux; Android 10; SM-A315F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.116 Mobile Safari/537.36 EdgA/45.04.4.4995`, "web-animation"));
});

test("userAgentSupportsFeatures() => Will correctly determine that Firefox v63 supports javascript.builtins.Map", t => {
	t.true(userAgentSupportsFeatures(firefox(63), "javascript.builtins.Map.@@iterator"));
});

test("userAgentSupportsFeatures() => Will correctly determine that Firefox on Android v68 doesn't support `pointer`", t => {
	t.false(userAgentSupportsFeatures(`Mozilla/5.0 (Android 8.0.0; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0`, "pointer"));
});

test("userAgentSupportsFeatures() => Will correctly determine that Firefox v63 supports custom-elementsv1", t => {
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

test("userAgentSupportsFeatures() => Correctly determines that Chromium-based Edge supports Web Animations #1", t => {
	t.true(userAgentSupportsFeatures(`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.74 Safari/537.36 Edg/79.0.309.43`, "web-animation"));
});


test("userAgentSupportsFeatures() => Correctly determines that Edge 15 supports api.Element.classList (even though support is partial) #1", t => {
	t.true(userAgentSupportsFeatures(edge("15"), "api.Element.classList"));
});

test("userAgentSupportsFeatures() => Correctly determines that Safari 12.0.2 doesn't support Web Animations #1", t => {
	t.false(userAgentSupportsFeatures(safari("12.0.2"), "web-animation"));
});

test("userAgentSupportsFeatures() => Correctly determines that Chrome 83 doesn't support :focus-visible #1", t => {
	t.false(userAgentSupportsFeatures(chrome("83"), "css-focus-visible"));
});

test("userAgentSupportsFeatures() => Correctly determines that QQ 9 doesn't support String.prototype.padStart #1", t => {
	t.false(
		userAgentSupportsFeatures(
			`Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36 QBCore/4.0.1301.400 QQBrowser/9.0.2524.400 Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2875.116 Safari/537.36 NetType/WIFI MicroMessenger/7.0.5 WindowsWechat`,
			"javascript.builtins.String.padStart"
		)
	);
});

test("userAgentSupportsFeatures() => Correctly determines that Chrome 71 on Android doesn't support Intl.ListFormat #1", t => {
	t.false(
		userAgentSupportsFeatures(
			`Mozilla/5.0 (Linux; U; Android 10; en-us; SM-G975F Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/71.0.3578.141 Mobile Safari/537.36 XiaoMi/MiuiBrowser/12.1.3-g`,
			"javascript.builtins.Intl.ListFormat"
		)
	);
});

test("userAgentSupportsFeatures() => Correctly determines that Chrome 71 on Android doesn't support Intl.ListFormat #2", t => {
	t.false(userAgentSupportsFeatures(chrome("71"), "javascript.builtins.Intl.ListFormat"));
});

test("userAgentSupportsFeatures() => Correctly determines that Safari 12.1 doesn't support Web Animations #1", t => {
	t.false(userAgentSupportsFeatures(safari("12.1"), "web-animation"));
});

test("userAgentSupportsFeatures() => Correctly determines that Safari 12.1.1 doesn't support Web Animations #1", t => {
	t.false(userAgentSupportsFeatures(safari("12.1.1"), "web-animation"));
});

test("userAgentSupportsFeatures() => Correctly determines that Safari 13.0 doesn't support Web Animations #1", t => {
	t.false(userAgentSupportsFeatures(safari("13.0"), "web-animation"));
});

test("userAgentSupportsFeatures() => Correctly determines that Edge 16.16299 doesn't support the URL constructor #1", t => {
	t.false(userAgentSupportsFeatures(edge("16.16299"), "url", "urlsearchparams"));
});

test("userAgentSupportsFeatures() => Correctly determines that Safari 14.0.1 *doesn't* support ResizeObserver #1", t => {
	t.false(userAgentSupportsFeatures(safari("14.0.1"), "resizeobserver"));
});

test("userAgentSupportsFeatures() => Correctly determines that Safari 13 *doesn't* support ResizeObserver #1", t => {
	t.false(userAgentSupportsFeatures(safari("13.0"), "resizeobserver"));
});

test("userAgentSupportsFeatures() => Correctly determines that Safari 13.3 *doesn't* support ResizeObserver #1", t => {
	t.false(userAgentSupportsFeatures(FBAN_SAFARI_13_3_USER_AGENT, "resizeobserver"));
});

test("browsersWithSupportForEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES3 doesn't support ES5 features #1", t => {
	t.false(browserslistSupportsFeatures(browsersWithSupportForEcmaVersion("es3"), "es5"));
});

test("browsersWithSupportForEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES5 doesn't support ES2015 features #1", t => {
	t.false(browserslistSupportsFeatures(browsersWithSupportForEcmaVersion("es5"), "es6-class"));
});

test("browsersWithSupportForEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES2015 doesn't support ES2016 features #1", t => {
	t.false(browserslistSupportsFeatures(browsersWithSupportForEcmaVersion("es2015"), "javascript.operators.exponentiation"));
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

test("getAppropriateEcmaVersionForBrowserslist() => Correctly determines that the most appropriate Ecma version for a Browserslist targeting browsers only compatible with ES2020 is indeed ES2020 #1", t => {
	t.deepEqual(getAppropriateEcmaVersionForBrowserslist(browsersWithSupportForEcmaVersion("es2020")), "es2020");
});

test("getAppropriateEcmaVersionForBrowserslist() => Correctly determines that the most appropriate Ecma version for the last 1 versions of Chrome is ES2020 #1", t => {
	t.deepEqual(getAppropriateEcmaVersionForBrowserslist(["last 1 and_chr versions"]), "es2020");
});

// test.only("playground", t => {
//   t.true(true);
// });
