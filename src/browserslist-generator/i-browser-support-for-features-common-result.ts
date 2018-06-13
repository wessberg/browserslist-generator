import {CaniuseBrowser} from "./i-caniuse";

export interface IBrowserSupportForFeaturesCommonResult {
	query: string[];
	browsers: Set<CaniuseBrowser>;
}