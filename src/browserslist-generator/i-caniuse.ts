export declare type CaniuseBrowser =
	| "and_chr"
	| "and_ff"
	| "and_qq"
	| "and_uc"
	| "android"
	| "baidu"
	| "bb"
	| "chrome"
	| "edge"
	| "firefox"
	| "ie"
	| "ie_mob"
	| "ios_saf"
	| "op_mini"
	| "op_mob"
	| "opera"
	| "safari"
	| "samsung";

export const enum CaniuseSupportKind {
	AVAILABLE = "AVAILABLE",
	UNAVAILABLE = "UNAVAILABLE",
	PARTIAL_SUPPORT = "PARTIAL_SUPPORT",
	PREFIXED = "PREFIXED"
}

export declare type CaniuseStats = {[Key in CaniuseBrowser]: {[key: string]: string}};

export declare type CaniuseStatsNormalized = {[Key in CaniuseBrowser]: {[key: string]: CaniuseSupportKind}};

export interface CaniuseFeature {
	title: string;
	status: string;
	stats: CaniuseStats;
}

export interface CaniuseDataCorrection {
	kind: CaniuseSupportKind;
	version: string;
}

export declare type CaniuseBrowserCorrection = {[Key in CaniuseBrowser]?: CaniuseDataCorrection[]};
