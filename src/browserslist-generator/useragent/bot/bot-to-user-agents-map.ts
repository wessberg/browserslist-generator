import {UseragentBotKind} from "./useragent-bot-kind";

export type BotToUserAgentsMap = {[Key in UseragentBotKind]: (agent: string) => boolean};

export const BOT_TO_USER_AGENTS_MAP: BotToUserAgentsMap = {
	/* eslint-disable @typescript-eslint/naming-convention */
	GoogleBot: agent => agent.includes("http://www.google.com/bot.htm"),
	BingBot: agent => agent.includes("http://www.bing.com/bingbot.htm"),
	YahooBot: agent => agent.includes("http://help.yahoo.com/help/us/ysearch/slurp"),
	FacebookCrawler: agent => agent.includes("http://www.facebook.com/externalhit_uatext.php")
	/* eslint-enable @typescript-eslint/naming-convention */
};
