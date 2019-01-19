import {UseragentBot} from "./useragent-bot";

export type BotToUserAgentsMap = {[Key in UseragentBot]: (agent: string) => boolean};

export const BOT_TO_USER_AGENTS_MAP: BotToUserAgentsMap = {
	GoogleBot: agent => agent.includes("http://www.google.com/bot.htm"),
	BingBot: agent => agent.includes("http://www.bing.com/bingbot.htm"),
	YahooBot: agent => agent.includes("http://help.yahoo.com/help/us/ysearch/slurp")
};
