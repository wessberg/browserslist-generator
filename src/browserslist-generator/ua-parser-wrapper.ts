import {coerce} from "semver";
import {UAParser} from "ua-parser-js";
import isbot from "isbot";
import {UseragentBrowser, UseragentDevice, UseragentEngine, UseragentOs} from "./useragent/useragent-typed";

const FIREFOX_MATCH = /Firefox\/([\d.]+)/i;

// These extension provide ua-parser-js with support for additional browsers
// such as Sogou Explorer
const PARSER_EXTENSIONS = {
	engine: [
		[
			/(Chrome)\/([\d.]+)/i
		],
		[
			"blink",
			"version"
		]
	],
	browser: [
		[
			/(MetaSr)\s*([\d.]+)/i
		],
		[
			"Sogou Explorer",
			"version"
		]
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
		return this.parser.getOS() as UseragentOs;
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
				result.major = String(coerce(engine.version)?.major ?? result.version);
			}
		}

		// Check if it is a bot and match it if so
		// Also treat Dalvik/ as a bot
		if (result.name !== "Chrome Headless" && (isbot(this.userAgent) || (result.name == null && this.userAgent.includes("Dalvik/")))) {
			if (
				this.userAgent.includes("http://www.google.com/bot.htm") ||
				this.userAgent.includes("http://www.google.com/adsbot.htm")
			) {
				// As far as we know, the last reported update to Googlebot was the intent
				// to keep it evergreen, but so far it seems 74 is the latest official version
				result.name = "Chrome";
				result.version = "74";
				// noinspection JSDeprecatedSymbols
				result.major = "74";
			}

			// Treat all other bots as IE 11
			else {
				result.name = "IE";
				result.version = "11";
				// noinspection JSDeprecatedSymbols
				result.major = "11";
			}
		}

		if (result["Sogou Explorer"] != null) {
			result.name = "Sogou Explorer";
			delete result["Sogou Explorer"];
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
}
