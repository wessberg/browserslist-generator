import {UAParser} from "ua-parser-js";
import {BOT_TO_USER_AGENTS_MAP} from "./useragent/bot/bot-to-user-agents-map";
import {IUseragentBrowser, IUseragentDevice, IUseragentEngine, IUseragentOS} from "./useragent/useragent-typed";

// tslint:disable

/**
 * A class that wraps UAParser
 */
export class UaParserWrapper {
	/**
	 * An instanceof UAParser
	 */
	private readonly parser: InstanceType<typeof UAParser>;

	constructor(private readonly userAgent: string) {
		this.parser = new UAParser(userAgent);
	}

	/**
	 * Gets the IUserAgentBrowser based on the UAParser
	 */
	getBrowser(): IUseragentBrowser {
		return this.extendGetBrowserResult(this.parser.getBrowser() as IUseragentBrowser);
	}

	/**
	 * Gets the IUserAgentOS based on the UAParser
	 */
	getOS(): IUseragentOS {
		return this.parser.getOS() as IUseragentOS;
	}

	/**
	 * Gets the IUserAgentDevice based on the UAParser
	 *
	 * @returns
	 */
	getDevice(): IUseragentDevice {
		return this.parser.getDevice() as IUseragentDevice;
	}

	/**
	 * Gets the IEngine based on the UAParser
	 */
	getEngine(): IUseragentEngine {
		return this.parser.getEngine() as IUseragentEngine;
	}

	/**
	 * Gets the ICPU based on the UAParser
	 */
	getCPU(): ReturnType<InstanceType<typeof UAParser>["getCPU"]> {
		return this.parser.getCPU();
	}

	/**
	 * Extends the result of calling 'getBrowser' on the UAParser and always takes bots into account
	 */
	private extendGetBrowserResult(result: IUseragentBrowser): IUseragentBrowser {
		// If the parse result already includes a Browser, use it as-is
		if (result.name != null) return result;

		// Otherwise, check if it is a bot and match it if so
		if (BOT_TO_USER_AGENTS_MAP.GoogleBot(this.userAgent)) {
			result.name = "Chrome";
			result.version = "41";
			// noinspection JSDeprecatedSymbols
			result.major = "41";
		}

		// BingBot, The Facebook Crawler, and Yahoo's "Slurp" can render JavaScript, but they are very limited in what they can do. Mimic IE8 to reflect the limitations of these engines
		if (
			BOT_TO_USER_AGENTS_MAP.BingBot(this.userAgent) ||
			BOT_TO_USER_AGENTS_MAP.YahooBot(this.userAgent) ||
			BOT_TO_USER_AGENTS_MAP.FacebookCrawler(this.userAgent)
		) {
			result.name = "IE";
			result.version = "8";
			// noinspection JSDeprecatedSymbols
			result.major = "8";
		}

		return result;
	}
}
