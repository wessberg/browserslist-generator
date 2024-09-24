import type {StatsByAgentID} from "caniuse-lite";

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

export const CAN_I_USE_SUPPORT_KIND = ["available", "unavailable", "partial_support", "prefixed"] as const;
export type CaniuseSupportKind = (typeof CAN_I_USE_SUPPORT_KIND)[number];

export type CaniuseStatsNormalized = {[Key in CaniuseBrowser]: Record<string, CaniuseSupportKind>};

export interface CaniuseFeature {
	title: string;
	status: string;
	stats: StatsByAgentID;
}

export interface CaniuseDataCorrection {
	kind: CaniuseSupportKind;
	version: string;
}

export type CaniuseBrowserCorrection = {[Key in CaniuseBrowser]?: CaniuseDataCorrection[]};
