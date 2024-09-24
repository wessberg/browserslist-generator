import {coerce} from "semver";
import {UAParser} from "ua-parser-js";
import {createIsbotFromList, list} from "isbot";
import type {UseragentBrowser, UseragentDevice, UseragentEngine, UseragentOs} from "./useragent/useragent-typed.js";

const FIREFOX_MATCH = /Firefox\/([\d.]+)/i;
const IOS_REGEX_1 = /(iPhone)|(iPad)/i;
const IOS_REGEX_2 = /(iOS)\s*([\d._]+)/i;
const UNDERSCORED_VERSION_REGEX = /\d+_/;
const FBSV_IOS_VERSION_REGEX = /FBSV\/([\d.]+)/i;
const IOS_14_5_UA_1 = /(CFNetwork\/1237\s+Darwin\/20.4)/i;
const IOS_3_2_UA_1 = /(^Mobile\/7B334b)/i;

// Extend 'isbot' with more matches
const isbot = createIsbotFromList([...list, "bitdiscovery", "Dalvik/", "placid.app/v1", "WebsiteMetadataRetriever", "(compatible; aa/1.0)"]);

// These extension provide ua-parser-js with support for additional browsers
// such as Sogou Explorer
const PARSER_EXTENSIONS = {
	engine: [[/(Chrome)\/([\d.]+)/i], ["blink", "version"]],
	browser: [
		[/(MetaSr)\s*([\d.]+)/i],
		["Sogou Explorer", "version"],
		[/(HeyTapBrowser)\/([\d.]+)/i],
		["HeyTapBrowser", "version"],
		[/(SamsungBrowser)\/CrossApp/i],
		["Samsung Browser"],
		[/(Nokia\d+\/[\d.]+.*Profile\/MIDP)/i],
		["WAP"]
	]
};

/**
 * A class that wraps UAParser
 */
export class UaParserWrapper {
	/**
	 * An instanceof UAParser
	 */
	private readonly parser: InstanceType<typeof UAParser>;

	constructor(private readonly userAgent: string) {
		this.parser = new UAParser(userAgent, PARSER_EXTENSIONS);
	}

	/**
	 * Gets the IUserAgentBrowser based on the UAParser
	 */
	getBrowser(): UseragentBrowser {
		return this.extendGetBrowserResult(this.parser.getBrowser() as UseragentBrowser);
	}

	/**
	 * Gets the IUserAgentOS based on the UAParser
	 */
	getOS(): UseragentOs {
		return this.extendGetOsResult(this.parser.getOS() as UseragentOs);
	}

	/**
	 * Gets the IUserAgentDevice based on the UAParser
	 */
	getDevice(): UseragentDevice {
		return this.parser.getDevice() as UseragentDevice;
	}

	/**
	 * Gets the IEngine based on the UAParser
	 */
	getEngine(): UseragentEngine {
		return this.extendGetEngineResult(this.parser.getEngine() as UseragentEngine);
	}

	/**
	 * Extends the result of calling 'getBrowser' on the UAParser and always takes bots into account
	 */
	private extendGetBrowserResult(result: UseragentBrowser): UseragentBrowser {
		// Ensure that the EdgeHTML version is used
		if (result.name === "Edge") {
			const engine = this.parser.getEngine() as UseragentEngine;
			if (engine.name === "EdgeHTML") {
				result.version = engine.version;

				// eslint-disable-next-line @typescript-eslint/no-deprecated
				result.major = String(coerce(engine.version)?.major ?? result.version);
			}
		}

		// Check if it is a bot and match it if so
		// Also treat Dalvik/ as a bot
		if (result.name !== "Chrome Headless" && Boolean(isbot(this.userAgent))) {
			if (this.userAgent.includes("http://www.google.com/bot.htm") || this.userAgent.includes("http://www.google.com/adsbot.htm")) {
				// As far as we know, the last reported update to Googlebot was the intent
				// to keep it evergreen, but so far it seems 74 is the latest official version
				result.name = "Chrome";
				result.version = "74";

				// eslint-disable-next-line @typescript-eslint/no-deprecated
				result.major = "74";
			}

			// Treat all other bots as IE 11
			else {
				result.name = "IE";
				result.version = "11";

				// eslint-disable-next-line @typescript-eslint/no-deprecated
				result.major = "11";
			}
		}

		if (result["Sogou Explorer"] != null) {
			result.name = "Sogou Explorer";
			delete result["Sogou Explorer"];
		} else if (result.HeyTapBrowser != null) {
			result.name = "HeyTapBrowser";
			delete result.HeyTapBrowser;
		} else if (result["Samsung Browser"] != null) {
			result.name = "Samsung Browser";
			delete result["Samsung Browser"];
		} else if (result.WAP != null) {
			result.name = "IE";
			result.version = "8";
			delete result.WAP;
		}

		return result;
	}

	/**
	 * Extends the result of calling 'getEngine'
	 */
	private extendGetEngineResult(result: UseragentEngine): UseragentEngine {
		if (result.blink != null) {
			result.name = "Blink";
			delete result.blink;
		}

		// The User Agent may hold additional information, such as the equivalent Firefox version
		if (result.name === "Goanna") {
			const ffMatch = this.userAgent.match(FIREFOX_MATCH);
			if (ffMatch != null) {
				result.name = "Gecko";
				result.version = ffMatch[1];
			}
		}

		return result;
	}

	/**
	 * Extends the result of calling 'getOS'
	 */
	private extendGetOsResult(result: UseragentOs): UseragentOs {
		if (result.version != null && UNDERSCORED_VERSION_REGEX.test(result.version)) {
			result.version = result.version.replace(/_/g, ".");
		}

		if ((result.name == null || result.name === "iOS") && (IOS_REGEX_1.test(this.userAgent) || IOS_REGEX_2.test(this.userAgent))) {
			result.name = "iOS";

			if (result.version == null) {
				// If it is the Facebook browser, the iOS version may be reported
				// through its FBSV/{version} part
				const fbsvMatch = this.userAgent.match(FBSV_IOS_VERSION_REGEX);
				if (fbsvMatch != null) {
					result.version = fbsvMatch[1]?.replace(/_/g, ".");
				} else {
					const iosRegex2Match = this.userAgent.match(IOS_REGEX_2);
					if (iosRegex2Match != null) {
						result.version = iosRegex2Match[2]?.replace(/_/g, ".");
					}
				}
			}
		}

		if ((result.name == null || result.name === "iOS") && IOS_14_5_UA_1.test(this.userAgent)) {
			result.name = "iOS";
			result.version = "14.5";
		}

		if ((result.name == null || result.name === "iOS") && IOS_3_2_UA_1.test(this.userAgent)) {
			result.name = "iOS";
			result.version = "3.2";
		}

		return result;
	}
}
