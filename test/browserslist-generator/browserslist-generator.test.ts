import test from "ava";
// @ts-ignore
import {chrome, edge, firefox, ie, safari} from "useragent-generator";
import {browserslistSupportsFeatures, browsersWithoutSupportForFeatures, browsersWithSupportForFeatures, getFirstVersionsWithFullSupport, matchBrowserslistOnUserAgent, userAgentSupportsFeatures} from "../../src/browserslist-generator/browserslist-generator";

test("browsersWithSupportForFeatures() => Will skip 'Android' in the generated browserslist", t => {
	t.true(!browsersWithSupportForFeatures(
		"es6-module",
		"shadowdomv1",
		"custom-elementsv1"
	).some(part => part.includes("android")));
});

test("browsersWithSupportForFeatures() => Won't include Samsung 6.2 for es6-modules", t => {
	t.true(!browsersWithSupportForFeatures(
		"es6-module",
		"shadowdomv1",
		"custom-elementsv1"
	).some(part => part.toLowerCase().includes("samsung")));
});

test("browsersWithoutSupportForFeatures() => Will include all browsers that simply has no support for the given features at all", t => {
	t.true(browsersWithoutSupportForFeatures(
		"es6-module",
		"shadowdomv1",
		"custom-elementsv1"
	).some(part => part.includes("ie")));
});

test("matchBrowserslistOnUserAgent() => Will not match Firefox > 54 for a Firefox v54 user agent", t => {
	t.false(matchBrowserslistOnUserAgent(firefox("54"), ["Firefox > 54"]));
});

test("matchBrowserslistOnUserAgent() => Will match Firefox >= 54 for a Firefox v54 user agent", t => {
	t.true(matchBrowserslistOnUserAgent(firefox("54"), ["Firefox >= 54"]));
});

test("matchBrowserslistOnUserAgent() => Will match Chrome 68 for a Chrome v68 user agent", t => {
	t.true(matchBrowserslistOnUserAgent(chrome("68"), ["Chrome >= 68", "unreleased versions"]));
});

test("matchBrowserslistOnUserAgent() => Will match Chrome for an Android Chrome v18 user agent", t => {
	t.true(matchBrowserslistOnUserAgent(chrome.androidPhone("18"), ["chrome >= 18", "unreleased versions"]));
});

test("matchBrowserslistOnUserAgent() => Will match iOS Chrome but treat it as iOS safari", t => {
	t.true(matchBrowserslistOnUserAgent(chrome.iOS("10.3"), ["ios_saf >= 10", "unreleased versions"]));
});

test("matchBrowserslistOnUserAgent() => Will match Safari v11", t => {
	t.true(matchBrowserslistOnUserAgent(safari("11"), ["safari 11", "unreleased versions"]));
});

test("matchBrowserslistOnUserAgent() => Will match Safari TP", t => {
	t.true(matchBrowserslistOnUserAgent(safari("11.2"), ["safari TP", "unreleased versions"]));
});

test("matchBrowserslistOnUserAgent() => Will match iOS Safari v11", t => {
	t.true(matchBrowserslistOnUserAgent(safari.iOS("11"), ["ios_saf 11", "unreleased versions"]));
});

test("matchBrowserslistOnUserAgent() => Will match iOS Safari in a WebView v11", t => {
	t.true(matchBrowserslistOnUserAgent(safari.iOSWebview("11"), ["ios_saf 11", "unreleased versions"]));
});

test("matchBrowserslistOnUserAgent() => Will match iOS Firefox but treat it as iOS Safari", t => {
	t.true(matchBrowserslistOnUserAgent(firefox.iOS("8.3"), ["ios_saf >= 8", "unreleased versions"]));
});

test("matchBrowserslistOnUserAgent() => Will match chrome as an Android WebView (as android)", t => {
	t.true(matchBrowserslistOnUserAgent(chrome.androidWebview("4.4.4"), ["android >= 4", "unreleased versions"]));
});

test("matchBrowserslistOnUserAgent() => Will match Android Chrome on a Phone (as regular chrome)", t => {
	t.true(matchBrowserslistOnUserAgent(chrome.androidPhone("66"), ["chrome >= 66", "unreleased versions"]));
});

test("matchBrowserslistOnUserAgent() => Will match Android Chrome on a Tablet (as regular Chrome)", t => {
	t.true(matchBrowserslistOnUserAgent(chrome.androidTablet("66"), ["chrome >= 66", "unreleased versions"]));
});

test("matchBrowserslistOnUserAgent() => Will match Android Chrome on a Chromecast (as chrome)", t => {
	t.true(matchBrowserslistOnUserAgent(chrome.chromecast("66"), ["chrome >= 66", "unreleased versions"]));
});

test("matchBrowserslistOnUserAgent() => Will match Android Firefox (as desktop firefox)", t => {
	t.true(matchBrowserslistOnUserAgent(firefox.androidPhone("57"), ["firefox >= 57", "unreleased versions"]));
});

test("matchBrowserslistOnUserAgent() => Will match Internet Explorer", t => {
	t.true(matchBrowserslistOnUserAgent(ie("9"), ["ie 9", "unreleased versions"]));
});

test("matchBrowserslistOnUserAgent() => Will match Internet Explorer Mobile", t => {
	t.true(matchBrowserslistOnUserAgent(ie.windowsPhone("10"), ["ie_mob 10", "unreleased versions"]));
});

test("matchBrowserslistOnUserAgent() => Will match Microsoft Edge", t => {
	t.true(matchBrowserslistOnUserAgent(edge("16"), ["edge >= 16", "unreleased versions"]));
});

test("matchBrowserslistOnUserAgent() => Won't match an unreleased version that doesn't support the given features", t => {
	t.false(matchBrowserslistOnUserAgent(firefox("61"), browsersWithSupportForFeatures("es6-module", "shadowdomv1", "custom-elementsv1")));
});

test("matchBrowserslistOnUserAgent() => Won't match an unreleased version that doesn't support the given features", t => {
	t.true(matchBrowserslistOnUserAgent(firefox("61"), browsersWithoutSupportForFeatures("es6-module", "shadowdomv1", "custom-elementsv1")));
});

test("browserslistSupportsFeatures() => Will correctly determine if a browserslist support the given set of features #1", t => {
	const browserslist = browsersWithSupportForFeatures("es6-module", "shadowdomv1", "custom-elementsv1");
	t.true(browserslistSupportsFeatures(browserslist, "es6-module", "shadowdomv1", "custom-elementsv1"));
});

test("browserslistSupportsFeatures() => Will correctly determine if a browserslist support the given set of features #2", t => {
	const browserslist = browsersWithoutSupportForFeatures("es6-module", "shadowdomv1", "custom-elementsv1");
	t.false(browserslistSupportsFeatures(browserslist, "es6-module", "shadowdomv1", "custom-elementsv1"));
});

test("browserslistSupportsFeatures() => Will correctly determine if a browserslist support the given set of features #3", t => {
	const browserslist = browsersWithSupportForFeatures("es6-module", "shadowdomv1", "custom-elementsv1");
	t.true(browserslistSupportsFeatures(browserslist, "es6-module"));
});

test("browserslistSupportsFeatures() => Will correctly determine if a browserslist support the given set of features #4", t => {
	const browserslist = browsersWithSupportForFeatures("es6-module");
	t.false(browserslistSupportsFeatures(browserslist, "es6-module", "shadowdomv1", "custom-elementsv1"));
});

test("Android versions above v4.4.4 will report the Chrome version #1", t => {
	const browserMap = getFirstVersionsWithFullSupport("es6-class");
	const androidVersion = browserMap.get("android");
	// Assert that no android version is reported
	t.true(androidVersion == null);
});

test("userAgentSupportsFeatures() => Correctly determines that Chrome 63 supports Promise.finally #1", t => {
	t.true(userAgentSupportsFeatures(chrome("63"), "javascript.builtins.Promise.finally"));
});

test("userAgentSupportsFeatures() => Correctly determines that Safari 10 doesn't support Promise.finally #1", t => {
	t.false(!userAgentSupportsFeatures(safari("10"), "javascript.builtins.Promise.finally"));
});

test("browserslistSupportsFeatures() => Will correctly determine if a browserslist support the given set of Mdn features #1", t => {
	const browserslist = browsersWithoutSupportForFeatures(
		"javascript.builtins.Promise.finally",
		"javascript.builtins.TypedArray.@@species"
	);
	t.false(browserslistSupportsFeatures(browserslist, "javascript.builtins.Promise.finally", "javascript.builtins.TypedArray.@@species"));
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