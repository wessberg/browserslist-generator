import {CaniuseBrowser} from "./i-caniuse-lite";

export interface IBrowsersWithSupportForFeaturesCommonResult {
	query: string[];
	browsers: Set<CaniuseBrowser>;
}