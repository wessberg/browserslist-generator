import assert from "assert";
import test from "node:test";

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
} from "../src/index.js";

const FBAN_SAFARI_13_3_USER_AGENT =
	"Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 LightSpeed [FBAN/MessengerLiteForiOS;FBAV/253.1.0.43.116;FBBV/200174216;FBDV/iPhone11,6;FBMD/iPhone;FBSN/iOS;FBSV/13.3.1;FBSS/3;FBCR/;FBID/phone;FBLC/en_US;FBOP/0]";

const ES_MODULE_FEATURE_NAME = "es6-module";
const SHADOW_DOM_FEATURE_NAME = "shadowdomv1";
const CUSTOM_ELEMENTS_FEATURE_NAME = "custom-elementsv1";
const PROMISE_FINALLY = "javascript.builtins.Promise.finally";
const UNRELEASED_VERSIONS = "unreleased versions";

await test("browsersWithSupportForFeatures() => Will skip 'Android' in the generated browserslist", () => {
	assert(!browsersWithSupportForFeatures(ES_MODULE_FEATURE_NAME, SHADOW_DOM_FEATURE_NAME, CUSTOM_ELEMENTS_FEATURE_NAME).some(part => part.includes("android")));
});

await test("browsersWithoutSupportForFeatures() => Will include all browsers that simply has no support for the given features at all", () => {
	assert(browsersWithoutSupportForFeatures(ES_MODULE_FEATURE_NAME, SHADOW_DOM_FEATURE_NAME, CUSTOM_ELEMENTS_FEATURE_NAME).some(part => part.includes("ie")));
});

await test("matchBrowserslistOnUserAgent() => Will not match Firefox > 54 for a Firefox v54 user agent", () => {
	assert(!matchBrowserslistOnUserAgent(firefox("54"), ["Firefox > 54"]));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox v62 supports es6-module", () => {
	assert(userAgentSupportsFeatures(firefox(63), "es6-module"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that iOS 14.4.2 supports web-animation", () => {
	assert(
		userAgentSupportsFeatures(
			`Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBDV/iPhone11,8;FBMD/iPhone;FBSN/iOS;FBSV/14.4.2;FBSS/2;FBID/phone;FBLC/it_IT;FBOP/5]`,
			"web-animation"
		)
	);
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox 109 on Android supports Shadow DOM", () => {
	assert(userAgentSupportsFeatures(firefox.androidPhone(109), "shadowdomv1"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox 109 on Android supports the fetch API", () => {
	assert(userAgentSupportsFeatures(firefox.androidPhone(109), "fetch"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox 50 on Android supports the fetch API", () => {
	assert(userAgentSupportsFeatures(firefox.androidPhone(50), "fetch"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox 38 on Android *doesn't* support the fetch API", () => {
	assert(!userAgentSupportsFeatures(firefox.androidPhone(38), "fetch"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox 29 on Android supports Promises", () => {
	assert(userAgentSupportsFeatures(firefox.androidPhone(29), "promises"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox 109 on Android supports Promises", () => {
	assert(userAgentSupportsFeatures(firefox.androidPhone(109), "promises"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox 25 on Android *doesn't* supports Promises", () => {
	assert(!userAgentSupportsFeatures(firefox.androidPhone(25), "promises"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Chrome 32 on Android supports Promises", () => {
	assert(userAgentSupportsFeatures(chrome.androidPhone("32"), "promises"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Chrome 100 on Android supports Promises", () => {
	assert(userAgentSupportsFeatures(chrome.androidPhone("100"), "promises"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Chrome 30 on Android *doesn't* support Promises", () => {
	assert(!userAgentSupportsFeatures(chrome.androidPhone("30"), "promises"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox 47 on Android supports Object.values", () => {
	assert(userAgentSupportsFeatures(firefox.androidPhone(47), "object-values"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox 109 on Android supports Object.values", () => {
	assert(userAgentSupportsFeatures(firefox.androidPhone(109), "object-values"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox 30 on Android *doesn't* support Object.values", () => {
	assert(!userAgentSupportsFeatures(firefox.androidPhone(30), "object-values"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Chrome 54 on Android supports Object.values", () => {
	assert(userAgentSupportsFeatures(chrome.androidPhone("54"), "object-values"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Chrome 100 on Android supports Object.values", () => {
	assert(userAgentSupportsFeatures(chrome.androidPhone("100"), "object-values"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Chrome 50 on Android *doesn't* support Object.values", () => {
	assert(!userAgentSupportsFeatures(chrome.androidPhone("50"), "object-values"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox 14 on Android supports MutationObserver", () => {
	assert(userAgentSupportsFeatures(firefox.androidPhone(14), "mutationobserver"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox 109 on Android supports MutationObserver", () => {
	assert(userAgentSupportsFeatures(firefox.androidPhone(109), "mutationobserver"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox 10 on Android *doesn't* support MutationObserver", () => {
	assert(!userAgentSupportsFeatures(firefox.androidPhone(10), "mutationobserver"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Chrome 26 on Android supports MutationObserver", () => {
	assert(userAgentSupportsFeatures(chrome.androidPhone("26"), "mutationobserver"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Chrome 100 on Android supports MutationObserver", () => {
	assert(userAgentSupportsFeatures(chrome.androidPhone("100"), "mutationobserver"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Chrome 20 on Android *doesn't* support MutationObserver", () => {
	assert(!userAgentSupportsFeatures(chrome.androidPhone("20"), "mutationobserver"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox 63 on Android supports Custom Elements", () => {
	assert(userAgentSupportsFeatures(firefox.androidPhone(63), "custom-elementsv1"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox 109 on Android supports Custom Elements", () => {
	assert(userAgentSupportsFeatures(firefox.androidPhone(109), "custom-elementsv1"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox 62 on Android *doesn't* support Custom Elements", () => {
	assert(!userAgentSupportsFeatures(firefox.androidPhone(62), "custom-elementsv1"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Chrome 54 on Android supports Custom Elements", () => {
	assert(userAgentSupportsFeatures(chrome.androidPhone("54"), "custom-elementsv1"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Chrome 100 on Android supports Custom Elements", () => {
	assert(userAgentSupportsFeatures(chrome.androidPhone("100"), "custom-elementsv1"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Chrome 45 on Android *doesn't* support Custom Elements", () => {
	assert(!userAgentSupportsFeatures(chrome.androidPhone("45"), "custom-elementsv1"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox 22 on Android supports HTMLTemplateElement", () => {
	assert(userAgentSupportsFeatures(firefox.androidPhone(22), "html.elements.template"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox 109 on Android supports HTMLTemplateElement", () => {
	assert(userAgentSupportsFeatures(firefox.androidPhone(109), "html.elements.template"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox 20 on Android *doesn't* support HTMLTemplateElement", () => {
	assert(!userAgentSupportsFeatures(firefox.androidPhone(20), "html.elements.template"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Chrome 26 on Android supports HTMLTemplateElement", () => {
	assert(userAgentSupportsFeatures(chrome.androidPhone("26"), "html.elements.template"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Chrome 100 on Android supports HTMLTemplateElement", () => {
	assert(userAgentSupportsFeatures(chrome.androidPhone("100"), "html.elements.template"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Chrome 20 on Android *doesn't* support HTMLTemplateElement", () => {
	assert(!userAgentSupportsFeatures(chrome.androidPhone("20"), "html.elements.template"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Edge Mobile 45 on Android supports web-animation", () => {
	assert(
		userAgentSupportsFeatures(
			`Mozilla/5.0 (Linux; Android 10; SM-A315F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.116 Mobile Safari/537.36 EdgA/45.04.4.4995`,
			"web-animation"
		)
	);
});

await test(`userAgentSupportsFeatures() => Supports the old stock Android browser. #1`, () => {
	assert(
		matchBrowserslistOnUserAgent(`Mozilla/5.0 (Linux;U;Android 4.4.2;zh-cn;Lenovo A3300-HV Build/KOT49H) AppleWebkit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/537.306`, [
			"android >= 4.4"
		])
	);
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox v63 supports javascript.builtins.Map. #1", () => {
	assert(userAgentSupportsFeatures(firefox(63), "javascript.builtins.Map.@@iterator"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox on Android v68 doesn't support `pointer`. #1", () => {
	assert(!userAgentSupportsFeatures(`Mozilla/5.0 (Android 8.0.0; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0`, "pointer"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox on Android v79 *does*  support `pointer`. #1", () => {
	assert(userAgentSupportsFeatures(`Mozilla/5.0 (Android 8.0.0; Mobile; rv:79.0) Gecko/79.0 Firefox/79.0`, "pointer"));
});

await test("userAgentSupportsFeatures() => Will correctly determine that Firefox v63 supports custom-elementsv1. #1", () => {
	assert(userAgentSupportsFeatures(firefox(63), CUSTOM_ELEMENTS_FEATURE_NAME));
});

await test("matchBrowserslistOnUserAgent() => Will match Firefox >= 54 for a Firefox v54 user agent. #1", () => {
	assert(matchBrowserslistOnUserAgent(firefox("54"), ["Firefox >= 54"]));
});

await test("matchBrowserslistOnUserAgent() => Will match Chrome 68 for a Chrome v68 user agent. #1", () => {
	assert(matchBrowserslistOnUserAgent(chrome("68"), ["Chrome >= 68"]));
});

await test("matchBrowserslistOnUserAgent() => Will match Chrome for an Android Chrome v18 user agent. #1", () => {
	assert(matchBrowserslistOnUserAgent(chrome.androidPhone("18"), ["chrome >= 18"]));
});

await test("matchBrowserslistOnUserAgent() => Will match iOS Chrome but treat it as iOS safari. #1", () => {
	assert(matchBrowserslistOnUserAgent(chrome.iOS("10.3"), ["ios_saf >= 10"]));
});

await test("matchBrowserslistOnUserAgent() => Supports Samsung Browser 8.2 (e.g. Samsung Internet). #1", () => {
	assert(
		matchBrowserslistOnUserAgent(
			"Mozilla/5.0 (Linux; Android 7.0; SAMSUNG SM-A510F Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/8.2 Chrome/63.0.3239.111 Mobile Safari/537.36",
			["samsung >= 8.2"]
		)
	);
});

await test("matchBrowserslistOnUserAgent() => Supports Samsung Browser via Samsung Internet's CrossApp feature, but treat it as Chrome as it doesn't report a usable version. #1", () => {
	assert(
		matchBrowserslistOnUserAgent(
			`Mozilla/5.0 (Linux; Android 7.0; SM-T813 Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/90.0.4430.210 Safari/537.36 SamsungBrowser/CrossApp/0.1.136`,
			["chrome >= 90"]
		)
	);
});

await test("matchBrowserslistOnUserAgent() => Will match Safari v11. #1", () => {
	assert(matchBrowserslistOnUserAgent(safari("11"), ["safari 11"]));
});

await test("matchBrowserslistOnUserAgent() => Will match iOS Safari v11. #1", () => {
	assert(matchBrowserslistOnUserAgent(safari.iOS("11.2"), ["ios_saf 11"]));
});

await test("matchBrowserslistOnUserAgent() => Will match iOS Safari v14.4. #1", () => {
	assert(
		matchBrowserslistOnUserAgent(
			`Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 YJApp-IOS jp.co.yahoo.ios.sports.sportsnavi/1.39.6`,
			["ios_saf >= 14.4"]
		)
	);
});

await test("matchBrowserslistOnUserAgent() => Will match iOS Safari in a WebView v11. #1", () => {
	assert(matchBrowserslistOnUserAgent(safari.iOSWebview("11.2"), ["ios_saf 11"]));
});

await test("matchBrowserslistOnUserAgent() => Will match iOS Firefox but treat it as iOS Safari. #1", () => {
	assert(matchBrowserslistOnUserAgent(firefox.iOS("8.3"), ["ios_saf >= 8"]));
});

await test("matchBrowserslistOnUserAgent() => Will match Iceweasel on Linux but treat it as Firefox. #1", () => {
	assert(matchBrowserslistOnUserAgent(`Mozilla/5.0 (X11; Linux x86_64; rv:31.0) Gecko/20100101 Firefox/31.0 Iceweasel/31.6.0`, ["firefox >= 31"]));
});

await test("matchBrowserslistOnUserAgent() => Will match IceDragon but treat it as Firefox. #1", () => {
	assert(matchBrowserslistOnUserAgent(`Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0 IceDragon/65.0.2`, ["firefox >= 65"]));
});

await test("matchBrowserslistOnUserAgent() => Will match the Facebook browser on iOS and detect it as iOS Safari. #1", () => {
	assert(matchBrowserslistOnUserAgent(`[FBAN/FBIOS;FBDV/iPhone9,3;FBMD/iPhone;FBSN/iOS;FBSV/13.6.1;FBSS/2;FBID/phone;FBLC/es_LA;FBOP/5]`, ["ios_saf >= 13"]));
});

await test("matchBrowserslistOnUserAgent() => Will match the Instagram browser on iOS and detect it as iOS Safari. #1", () => {
	assert(matchBrowserslistOnUserAgent(`Instagram 187.0.0.32.120 (iPhone7,2; iOS 12_4_9; sv_SE; sv-SE; scale=2.00; 750x1334; 289678855) AppleWebKit/420+`, ["ios_saf 11.3-11.4"]));
});

await test("matchBrowserslistOnUserAgent() => Will match the Instagram browser on iOS and detect it as iOS Safari. #2", () => {
	assert(matchBrowserslistOnUserAgent(`Instagram 187.0.0.32.120 (iPhone9,4; iOS 13_7; es_CO; es-ES; scale=2.61; 1080x1920; 289678855) AppleWebKit/420+`, ["ios_saf 12.2-12.5"]));
});

await test("matchBrowserslistOnUserAgent() => Will match Safari on iPad as iOS Safari. #1", () => {
	assert(matchBrowserslistOnUserAgent(`Mobile/7B334b Safari/531.21.10`, ["ios_saf >= 3.2"]));
});

await test("matchBrowserslistOnUserAgent() => Will match CFNetwork UAs as Mac/iOS. #1", () => {
	assert(matchBrowserslistOnUserAgent(`CFNetwork/1237 Darwin/20.4.0`, ["ios_saf >= 14.4"]));
});

await test("matchBrowserslistOnUserAgent() => Will match WAP browsers on Nokia devices as IE 8 (because Caniuse has no fitting browsers, so we'll have to pick something very old here). #1", () => {
	assert(matchBrowserslistOnUserAgent(`Nokia6280/2.0 (03.60) Profile/MIDP-2.0 Configuration/CLDC-1.1`, ["ie >= 8"]));
});

await test("matchBrowserslistOnUserAgent() => Will match non-Chromium based MiuiBrowser on Android. #1", () => {
	assert(
		matchBrowserslistOnUserAgent(
			`Xiaomi_MDT1_TD-LTE/V1 Linux/3.1.31 Android/7.1 Release/10.10.2017 Browser/AppleWebKit537.36 Mobile Safari/537.36 System/Android 7.1 XiaoMi/MiuiBrowser/9.2.1`,
			["chrome >= 53"]
		)
	);
});

await test("matchBrowserslistOnUserAgent() => Will match Pale Moon, but treat it as Firefox. #1", () => {
	assert(matchBrowserslistOnUserAgent(`Mozilla/5.0 (Windows NT 5.1; rv:4.8) Goanna/20210507 PaleMoon/28.10.3a1`, ["firefox >= 38"]));
});

await test("matchBrowserslistOnUserAgent() => Will match Pale Moon, but treat it as Firefox. #2", () => {
	assert(matchBrowserslistOnUserAgent(`Mozilla/5.0 (Windows NT 6.1; WOW64; rv:68.0) Gecko/20100101 Goanna/4.8 Firefox/68.0 PaleMoon/29.1.1`, ["firefox >= 68"]));
});

await test("matchBrowserslistOnUserAgent() => Will match Sogou Explorer, but treat it as Chrome. #1", () => {
	assert(
		matchBrowserslistOnUserAgent(`Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.3 (KHTML, like Gecko) Chrome/6.0.472.33 Safari/534.3 SE 2.X MetaSr 1.0`, [
			"chrome >= 6"
		])
	);
});

await test("matchBrowserslistOnUserAgent() => Will match HeyTapBrowser, but treat it as Chrome (unless on iOS, where it will match as ios_saf). #1", () => {
	assert(matchBrowserslistOnUserAgent(`Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 HeyTapBrowser/45.7.7.1`, ["chrome >= 70"]));
});

await test("matchBrowserslistOnUserAgent() => Will match wkhtmltoimage. #1", () => {
	assert(matchBrowserslistOnUserAgent(`Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.34 (KHTML, like Gecko) wkhtmltoimage Safari/534.34`, ["safari >= 5"]));
});

await test("matchBrowserslistOnUserAgent() => Will match Dalvik, but treat it as a bot. #1", () => {
	assert(matchBrowserslistOnUserAgent(`Dalvik/2.1.0 (Linux; U; Android 11; SM-N986B Build/RP1A.200720.012)`, ["ie >= 11"]));
});

await test("matchBrowserslistOnUserAgent() => Will match chrome as an Android WebView (as android)", () => {
	assert(matchBrowserslistOnUserAgent(chrome.androidWebview("4.4.4"), ["android >= 4"]));
});

await test("matchBrowserslistOnUserAgent() => Will match Android Chrome on a Phone (as regular chrome)", () => {
	assert(matchBrowserslistOnUserAgent(chrome.androidPhone("66"), ["chrome >= 66"]));
});

await test("matchBrowserslistOnUserAgent() => Will match Android Chrome on a Tablet (as regular Chrome)", () => {
	assert(matchBrowserslistOnUserAgent(chrome.androidTablet("66"), ["chrome >= 66"]));
});

await test("matchBrowserslistOnUserAgent() => Will match Android Chrome on a Chromecast (as chrome)", () => {
	assert(matchBrowserslistOnUserAgent(chrome.chromecast("66"), ["chrome >= 66"]));
});

await test("matchBrowserslistOnUserAgent() => Will match Headless Chrome as Chrome", () => {
	assert(
		matchBrowserslistOnUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/72.0.3617.0 Safari/537.36", [
			"chrome >= 72",
			UNRELEASED_VERSIONS
		])
	);
});

await test("matchBrowserslistOnUserAgent() => Will match Chromium as Chrome", () => {
	assert(
		matchBrowserslistOnUserAgent(`Mozilla/5.0 (SMART-TV; X11; Linux armv7l) AppleWebkit/537.42 (KHTML, like Gecko) Chromium/25.0.1349.2 Chrome/25.0.1349.2 Safari/537.42`, [
			"chrome >= 25"
		])
	);
});

await test("matchBrowserslistOnUserAgent() => Will match GoogleBot as Chrome v74. #1", () => {
	assert(matchBrowserslistOnUserAgent(googleBot(), ["chrome >= 74"]));
});

await test("matchBrowserslistOnUserAgent() => Will match GoogleBot as Chrome v74. #2", () => {
	assert(matchBrowserslistOnUserAgent(`AdsBot-Google (+http://www.google.com/adsbot.html)`, ["chrome >= 74"]));
});

await test("matchBrowserslistOnUserAgent() => Will match GoogleBot as Chrome v74. #3", () => {
	assert(
		matchBrowserslistOnUserAgent(`Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Safari/537.36`, ["chrome >= 74"])
	);
});

await test("matchBrowserslistOnUserAgent() => Will match random bots as IE 11. #1", () => {
	assert(matchBrowserslistOnUserAgent("StatusCak_Pagespeed_Indev", ["ie >= 11"]));
});

await test("matchBrowserslistOnUserAgent() => Will match random bots as IE 11. #2", () => {
	assert(
		matchBrowserslistOnUserAgent(
			`Mozilla/5.0 (compatible; Yahoo Ad monitoring; https://help.yahoo.com/kb/yahoo-ad-monitoring-SLN24857.html)  tands-prod-eng.hlfs-prod---sieve.hlfs-desktop/1621432877-0`,
			["ie >= 11"]
		)
	);
});

await test("matchBrowserslistOnUserAgent() => Will match random bots as IE 11. #3", () => {
	assert(matchBrowserslistOnUserAgent(`bitdiscovery`, ["ie >= 11"]));
});

await test("matchBrowserslistOnUserAgent() => Will match random bots as IE 11. #4", () => {
	assert(matchBrowserslistOnUserAgent(`placid.app/v1`, ["ie >= 11"]));
});

await test("matchBrowserslistOnUserAgent() => Will match random bots as IE 11. #5", () => {
	assert(matchBrowserslistOnUserAgent(`Asana/1.4.0 WebsiteMetadataRetriever`, ["ie >= 11"]));
});

await test("matchBrowserslistOnUserAgent() => Will match random bots as IE 11. #6", () => {
	assert(matchBrowserslistOnUserAgent(`Mozilla/5.0 (compatible; aa/1.0)`, ["ie >= 11"]));
});

await test("matchBrowserslistOnUserAgent() => Will match BingBot as IE 11", () => {
	assert(matchBrowserslistOnUserAgent(bingBot(), ["ie >= 11"]));
});

await test("matchBrowserslistOnUserAgent() => Will match YahooBot as IE 11", () => {
	assert(matchBrowserslistOnUserAgent(bingBot(), ["ie >= 11"]));
});

await test("matchBrowserslistOnUserAgent() => Will match Internet Explorer", () => {
	assert(matchBrowserslistOnUserAgent(ie("9"), ["ie 9"]));
});

await test("matchBrowserslistOnUserAgent() => Will match Internet Explorer Mobile", () => {
	assert(matchBrowserslistOnUserAgent(ie.windowsPhone("10"), ["ie_mob 10"]));
});

await test("matchBrowserslistOnUserAgent() => Will match Microsoft Edge", () => {
	assert(matchBrowserslistOnUserAgent(edge("16"), ["edge >= 16"]));
});

await test("generateBrowserslistFromUseragent() => Will fall back to 'UNKNOWN_CANIUSE_BROWSER' when a User Agent is provided that simply cannot be parsed in any meaningful way  #1", () => {
	assert(matchBrowserslistOnUserAgent(`Mozilla/5.0 (Macintosh; Intel Mac OS X)`, ["chrome >= 80"]));
});

await test("matchBrowserslistOnUserAgent() => Won't match an unreleased version that doesn't support the given features #1", () => {
	assert(!matchBrowserslistOnUserAgent(firefox("61"), browsersWithSupportForFeatures(ES_MODULE_FEATURE_NAME, SHADOW_DOM_FEATURE_NAME, CUSTOM_ELEMENTS_FEATURE_NAME)));
});

await test("matchBrowserslistOnUserAgent() => Won't match an unreleased version that doesn't support the given features #2", () => {
	assert(matchBrowserslistOnUserAgent(firefox("61"), browsersWithoutSupportForFeatures(ES_MODULE_FEATURE_NAME, SHADOW_DOM_FEATURE_NAME, CUSTOM_ELEMENTS_FEATURE_NAME)));
});

await test("browserslistSupportsFeatures() => Will correctly determine if a browserslist support the given set of features #1", () => {
	const browserslist = browsersWithSupportForFeatures(ES_MODULE_FEATURE_NAME, SHADOW_DOM_FEATURE_NAME, CUSTOM_ELEMENTS_FEATURE_NAME);
	assert(browserslistSupportsFeatures(browserslist, ES_MODULE_FEATURE_NAME, SHADOW_DOM_FEATURE_NAME, CUSTOM_ELEMENTS_FEATURE_NAME));
});

await test("browserslistSupportsFeatures() => Will correctly determine if a browserslist support the given set of features #2", () => {
	const browserslist = browsersWithoutSupportForFeatures(ES_MODULE_FEATURE_NAME, SHADOW_DOM_FEATURE_NAME, CUSTOM_ELEMENTS_FEATURE_NAME);
	assert(!browserslistSupportsFeatures(browserslist, ES_MODULE_FEATURE_NAME, SHADOW_DOM_FEATURE_NAME, CUSTOM_ELEMENTS_FEATURE_NAME));
});

await test("browserslistSupportsFeatures() => Will correctly determine if a browserslist support the given set of features #3", () => {
	const browserslist = browsersWithSupportForFeatures(ES_MODULE_FEATURE_NAME, SHADOW_DOM_FEATURE_NAME, CUSTOM_ELEMENTS_FEATURE_NAME);
	assert(browserslistSupportsFeatures(browserslist, ES_MODULE_FEATURE_NAME));
});

await test("browserslistSupportsFeatures() => Will correctly determine if a browserslist support the given set of features #4", () => {
	const browserslist = browsersWithSupportForFeatures(ES_MODULE_FEATURE_NAME);
	assert(!browserslistSupportsFeatures(browserslist, ES_MODULE_FEATURE_NAME, SHADOW_DOM_FEATURE_NAME, CUSTOM_ELEMENTS_FEATURE_NAME));
});

await test("Android versions above v4.4.4 will report the Chrome version #1", () => {
	const browserMap = getFirstVersionsWithFullSupport("es6-class");
	const androidVersion = browserMap.get("android");
	// Assert that no android version is reported
	assert(androidVersion == null);
});

await test("userAgentSupportsFeatures() => Correctly determines that Chrome 63 supports Promise.finally #1", () => {
	assert(userAgentSupportsFeatures(chrome("63"), PROMISE_FINALLY));
});

await test("userAgentSupportsFeatures() => Correctly determines that Safari 10 doesn't support Promise.finally #1", () => {
	assert(!userAgentSupportsFeatures(safari("10"), PROMISE_FINALLY));
});

await test("browserslistSupportsFeatures() => Will correctly determine if a browserslist support the given set of Mdn features #1", () => {
	const browserslist = browsersWithoutSupportForFeatures(PROMISE_FINALLY, "javascript.builtins.TypedArray.@@species");
	assert(!browserslistSupportsFeatures(browserslist, PROMISE_FINALLY, "javascript.builtins.TypedArray.@@species"));
});

await test("userAgentSupportsFeatures() => Correctly determines that IE 11 supports Object.defineProperty #1", () => {
	assert(userAgentSupportsFeatures(ie("11"), "javascript.builtins.Object.defineProperty"));
});

await test("userAgentSupportsFeatures() => Correctly determines that IE 11 doesn't support WeakSets #1", () => {
	assert(!userAgentSupportsFeatures(ie("11"), "javascript.builtins.WeakSet"));
});

await test("userAgentSupportsFeatures() => Correctly determines that Chrome 70 supports TypedArray.find #1", () => {
	assert(userAgentSupportsFeatures(chrome("70"), "javascript.builtins.TypedArray.find"));
});

await test("generateBrowserslistFromUseragent() => Will fall back to the latest known version if given a version of a browser that is newer than what is known by Caniuse #1", () => {
	assert.doesNotThrow(() => generateBrowserslistFromUseragent(firefox("9999")));
});

await test("generateBrowserslistFromUseragent() => Will fall back to the latest known version if given a version of a browser that is newer than what is known by Caniuse #2", () => {
	assert.doesNotThrow(() => generateBrowserslistFromUseragent(chrome("9999")));
});

await test("generateBrowserslistFromUseragent() => Will fall back to the latest known version if given a version of a browser that is newer than what is known by Caniuse #3", () => {
	assert.doesNotThrow(() => generateBrowserslistFromUseragent(safari("9999")));
});

await test("generateBrowserslistFromUseragent() => Will fall back to the latest known version if given a version of a browser that is newer than what is known by Caniuse #4", () => {
	assert.doesNotThrow(() =>
		generateBrowserslistFromUseragent(
			`Mozilla/5.0 (iPhone; CPU iPhone OS 9999_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 187.0.0.32.120 (iPhone13,4; iOS 9999_0; en_US; en-US; scale=3.00; 1284x2778; 289678855)`
		)
	);
});

await test("userAgentSupportsFeatures() => Correctly determines that Chrome 70 supports Web Animations (even though support is partial) #1", () => {
	assert(userAgentSupportsFeatures(chrome("70"), "web-animation"));
});

await test("userAgentSupportsFeatures() => Correctly determines that Chromium-based Edge supports Web Animations #1", () => {
	assert(
		userAgentSupportsFeatures(`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.74 Safari/537.36 Edg/79.0.309.43`, "web-animation")
	);
});

await test("userAgentSupportsFeatures() => Correctly determines that Edge 15 supports api.Element.classList (even though support is partial) #1", () => {
	assert(userAgentSupportsFeatures(edge("15"), "api.Element.classList"));
});

await test("userAgentSupportsFeatures() => Correctly determines that Safari 12.0.2 doesn't support Web Animations #1", () => {
	assert(!userAgentSupportsFeatures(safari("12.0.2"), "web-animation"));
});

await test("userAgentSupportsFeatures() => Correctly determines that Chrome 83 doesn't support :focus-visible #1", () => {
	assert(!userAgentSupportsFeatures(chrome("83"), "css-focus-visible"));
});

await test("userAgentSupportsFeatures() => Correctly determines that QQ 9 doesn't support String.prototype.padStart #1", () => {
	assert(
		!userAgentSupportsFeatures(
			`Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36 QBCore/4.0.1301.400 QQBrowser/9.0.2524.400 Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2875.116 Safari/537.36 NetType/WIFI MicroMessenger/7.0.5 WindowsWechat`,
			"javascript.builtins.String.padStart"
		)
	);
});

await test("userAgentSupportsFeatures() => Correctly determines that Chrome 71 on Android doesn't support Intl.ListFormat #1", () => {
	assert(
		!userAgentSupportsFeatures(
			`Mozilla/5.0 (Linux; U; Android 10; en-us; SM-G975F Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/71.0.3578.141 Mobile Safari/537.36 XiaoMi/MiuiBrowser/12.1.3-g`,
			"javascript.builtins.Intl.ListFormat"
		)
	);
});

await test("userAgentSupportsFeatures() => Correctly determines that Chrome 71 on Android doesn't support Intl.ListFormat #2", () => {
	assert(!userAgentSupportsFeatures(chrome("71"), "javascript.builtins.Intl.ListFormat"));
});

await test("userAgentSupportsFeatures() => Correctly determines that Safari 12.1 doesn't support Web Animations #1", () => {
	assert(!userAgentSupportsFeatures(safari("12.1"), "web-animation"));
});

await test("userAgentSupportsFeatures() => Correctly determines that Safari 12.1.1 doesn't support Web Animations #1", () => {
	assert(!userAgentSupportsFeatures(safari("12.1.1"), "web-animation"));
});

await test("userAgentSupportsFeatures() => Correctly determines that Safari 13.0 doesn't support Web Animations #1", () => {
	assert(!userAgentSupportsFeatures(safari("13.0"), "web-animation"));
});

await test("userAgentSupportsFeatures() => Correctly determines that Edge 16.16299 doesn't support the URL constructor #1", () => {
	assert(!userAgentSupportsFeatures(edge("16.16299"), "url", "urlsearchparams"));
});

await test("userAgentSupportsFeatures() => Correctly determines that Safari 14.0.1 *doesn't* support ResizeObserver #1", () => {
	assert(!userAgentSupportsFeatures(safari("14.0.1"), "resizeobserver"));
});

await test("userAgentSupportsFeatures() => Correctly determines that Safari 13 *doesn't* support ResizeObserver #1", () => {
	assert(!userAgentSupportsFeatures(safari("13.0"), "resizeobserver"));
});

await test("userAgentSupportsFeatures() => Correctly determines that Safari 13.3 *doesn't* support ResizeObserver #1", () => {
	assert(!userAgentSupportsFeatures(FBAN_SAFARI_13_3_USER_AGENT, "resizeobserver"));
});

await test("browsersWithSupportForEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES3 doesn't support ES5 features #1", () => {
	assert(!browserslistSupportsFeatures(browsersWithSupportForEcmaVersion("es3"), "es5"));
});

await test("browsersWithSupportForEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES5 doesn't support ES2015 features #1", () => {
	assert(!browserslistSupportsFeatures(browsersWithSupportForEcmaVersion("es5"), "es6-class"));
});

await test("browsersWithSupportForEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES2015 doesn't support ES2016 features #1", () => {
	assert(!browserslistSupportsFeatures(browsersWithSupportForEcmaVersion("es2015"), "javascript.operators.exponentiation"));
});

await test("browsersWithSupportForEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES2016 doesn't support ES2017 features #1", () => {
	assert(!browserslistSupportsFeatures(browsersWithSupportForEcmaVersion("es2016"), "async-functions"));
});

await test("browsersWithSupportForEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES2017 doesn't support ES2018 features #1", () => {
	assert(!browserslistSupportsFeatures(browsersWithSupportForEcmaVersion("es2017"), "javascript.operators.spread.spread_in_object_literals"));
});

await test("browsersWithSupportForEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES2018 does support LATEST features #1", () => {
	assert(browserslistSupportsFeatures(browsersWithSupportForEcmaVersion("es2018"), "javascript.operators.spread.spread_in_object_literals"));
});

await test("browserslistSupportsEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES3 doesn't support ES5 features #1", () => {
	assert(!browserslistSupportsEcmaVersion(browsersWithSupportForEcmaVersion("es3"), "es5"));
});

await test("browserslistSupportsEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES5 doesn't support ES2015 features #1", () => {
	assert(!browserslistSupportsEcmaVersion(browsersWithSupportForEcmaVersion("es5"), "es2015"));
});

await test("browserslistSupportsEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES2015 doesn't support ES2016 features #1", () => {
	assert(!browserslistSupportsEcmaVersion(browsersWithSupportForEcmaVersion("es2015"), "es2016"));
});

await test("browserslistSupportsEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES2016 doesn't support ES2017 features #1", () => {
	assert(!browserslistSupportsEcmaVersion(browsersWithSupportForEcmaVersion("es2016"), "es2017"));
});

await test("browserslistSupportsEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES2017 doesn't support ES2018 features #1", () => {
	assert(!browserslistSupportsEcmaVersion(browsersWithSupportForEcmaVersion("es2017"), "es2018"));
});

await test("browserslistSupportsEcmaVersion() => Correctly determines that a Browserslist generated for targeting ES2018 does support LATEST features #1", () => {
	assert(browserslistSupportsEcmaVersion(browsersWithSupportForEcmaVersion("es2018"), "es2018"));
});

await test("getAppropriateEcmaVersionForBrowserslist() => Correctly determines that the most appropriate Ecma version for a Browserslist targeting browsers only compatible with ES3 is indeed ES3 #1", () => {
	assert.deepEqual(getAppropriateEcmaVersionForBrowserslist(browsersWithSupportForEcmaVersion("es3")), "es3");
});

await test("getAppropriateEcmaVersionForBrowserslist() => Correctly determines that the most appropriate Ecma version for a Browserslist targeting browsers only compatible with ES5 is indeed ES5 #1", () => {
	assert.deepEqual(getAppropriateEcmaVersionForBrowserslist(browsersWithSupportForEcmaVersion("es5")), "es5");
});

await test("getAppropriateEcmaVersionForBrowserslist() => Correctly determines that the most appropriate Ecma version for a Browserslist targeting browsers only compatible with ES2015 is indeed ES2015 #1", () => {
	assert.deepEqual(getAppropriateEcmaVersionForBrowserslist(browsersWithSupportForEcmaVersion("es2015")), "es2015");
});

await test("getAppropriateEcmaVersionForBrowserslist() => Correctly determines that the most appropriate Ecma version for a Browserslist targeting browsers only compatible with ES2016 is indeed ES2016 #1", () => {
	assert.deepEqual(getAppropriateEcmaVersionForBrowserslist(browsersWithSupportForEcmaVersion("es2016")), "es2016");
});

await test("getAppropriateEcmaVersionForBrowserslist() => Correctly determines that the most appropriate Ecma version for a Browserslist targeting browsers only compatible with ES2017 is indeed ES2017 #1", () => {
	assert.deepEqual(getAppropriateEcmaVersionForBrowserslist(browsersWithSupportForEcmaVersion("es2017")), "es2017");
});

await test("getAppropriateEcmaVersionForBrowserslist() => Correctly determines that the most appropriate Ecma version for a Browserslist targeting browsers only compatible with ES2018 is indeed ES2018 #1", () => {
	assert.deepEqual(getAppropriateEcmaVersionForBrowserslist(browsersWithSupportForEcmaVersion("es2018")), "es2018");
});

await test("getAppropriateEcmaVersionForBrowserslist() => Correctly determines that the most appropriate Ecma version for a Browserslist targeting browsers only compatible with ES2019 is indeed ES2019 #1", () => {
	assert.deepEqual(getAppropriateEcmaVersionForBrowserslist(browsersWithSupportForEcmaVersion("es2019")), "es2019");
});

await test("getAppropriateEcmaVersionForBrowserslist() => Correctly determines that the most appropriate Ecma version for a Browserslist targeting browsers only compatible with ES2020 is indeed ES2020 #1", () => {
	assert.deepEqual(getAppropriateEcmaVersionForBrowserslist(browsersWithSupportForEcmaVersion("es2020")), "es2020");
});

await test("getAppropriateEcmaVersionForBrowserslist() => Correctly determines that the most appropriate Ecma version for a Browserslist targeting browsers only compatible with ES2021 is indeed ES2021 #1", () => {
	assert.deepEqual(getAppropriateEcmaVersionForBrowserslist(browsersWithSupportForEcmaVersion("es2021")), "es2021");
});

await test("getAppropriateEcmaVersionForBrowserslist() => Correctly determines that the most appropriate Ecma version for a Browserslist targeting browsers only compatible with ES2022 is indeed ES2022 #1", () => {
	assert.deepEqual(getAppropriateEcmaVersionForBrowserslist(browsersWithSupportForEcmaVersion("es2022")), "es2022");
});

await test("getAppropriateEcmaVersionForBrowserslist() => Correctly determines that the most appropriate Ecma version for the last 1 versions of Chrome is ES2024 #1", () => {
	assert.deepEqual(getAppropriateEcmaVersionForBrowserslist(["last 1 and_chr versions"]), "es2024");
});
