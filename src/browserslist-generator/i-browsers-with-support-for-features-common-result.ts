import {CaniuseBrowser} from "./i-caniuse";

export interface IBrowsersWithSupportForFeaturesCommonResult {
	query: string[];
	browsers: Set<CaniuseBrowser>;
}