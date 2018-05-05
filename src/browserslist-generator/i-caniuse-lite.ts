export declare type CaniuseLiteBrowser = "and_chr"|"and_ff"|"and_qq"|"and_uc"|"android"|"baidu"|"bb"|"chrome"|"edge"|"firefox"|"ie"|"ie_mob"|"ios_saf"|"op_mini"|"op_mob"|"opera"|"safari"|"samsung";

export enum CaniuseSupportKind {
	AVAILABLE = "AVAILABLE",
	UNAVAILABLE = "UNAVAILABLE",
	PARTIAL_SUPPORT = "PARTIAL_SUPPORT",
	PREFIXED = "PREFIXED"
}

export declare type CaniuseLiteStats = {
	[Key in CaniuseLiteBrowser]: {[key: string]: string};
};

export declare type CaniuseLiteStatsNormalized = {
	[Key in CaniuseLiteBrowser]: {[key: string]: CaniuseSupportKind};
};

export interface ICaniuseLiteAgents {

}

export interface ICaniuseLiteAgent {
	usage_global: {[key: string]: number};
	prefix: string;
	browser: string;
	release_date: {[key: string]: number};
}

export interface ICaniuseLiteFeature {
	title: string;
	status: string;
	stats: CaniuseLiteStats;
}

export interface ICaniuseLiteFeatureNormalized extends ICaniuseLiteFeature {
	stats: CaniuseLiteStatsNormalized;
}