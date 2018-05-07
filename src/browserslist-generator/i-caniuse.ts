export declare type CaniuseBrowser = "and_chr"|"and_ff"|"and_qq"|"and_uc"|"android"|"baidu"|"bb"|"chrome"|"edge"|"firefox"|"ie"|"ie_mob"|"ios_saf"|"op_mini"|"op_mob"|"opera"|"safari"|"samsung";

export enum CaniuseSupportKind {
	AVAILABLE = "AVAILABLE",
	UNAVAILABLE = "UNAVAILABLE",
	PARTIAL_SUPPORT = "PARTIAL_SUPPORT",
	PREFIXED = "PREFIXED"
}

export declare type CaniuseStats = {
	[Key in CaniuseBrowser]: {[key: string]: string};
};

export declare type CaniuseStatsNormalized = {
	[Key in CaniuseBrowser]: {[key: string]: CaniuseSupportKind};
};

export interface ICaniuseAgents {

}

export interface ICaniuseAgent {
	usage_global: {[key: string]: number};
	prefix: string;
	browser: string;
	release_date: {[key: string]: number};
}

export interface ICaniuseFeature {
	title: string;
	status: string;
	stats: CaniuseStats;
}

export interface ICaniuseFeatureNormalized extends ICaniuseFeature {
	stats: CaniuseStatsNormalized;
}

export interface ICaniuseDataCorrection {
	kind: CaniuseSupportKind;
	version: string;
}

export declare type ICaniuseBrowserCorrection = {
	[Key in CaniuseBrowser]?: ICaniuseDataCorrection[];
};