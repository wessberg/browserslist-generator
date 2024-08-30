export type CaniuseBrowser =
	| "and_chr"
	| "and_ff"
	| "and_qq"
	| "and_uc"
	| "android"
	| "baidu"
	| "kaios"
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

export interface VersionedCaniuseBrowser {
	browser: CaniuseBrowser;
	version: string;
}

export const enum CaniuseSupportKind {
	AVAILABLE = "AVAILABLE",
	UNAVAILABLE = "UNAVAILABLE",
	PARTIAL_SUPPORT = "PARTIAL_SUPPORT",
	PREFIXED = "PREFIXED"
}

export type CaniuseStats = {[Key in CaniuseBrowser]: {[key: string]: string}};

export type CaniuseStatsNormalized = {[Key in CaniuseBrowser]: {[key: string]: CaniuseSupportKind}};

export interface CaniuseFeature {
	title: string;
	status: string;
	stats: CaniuseStats;
}

export interface CaniuseDataCorrection {
	kind: CaniuseSupportKind;
	version: string;
}

export type CaniuseBrowserCorrection = {[Key in CaniuseBrowser]?: CaniuseDataCorrection[]};
