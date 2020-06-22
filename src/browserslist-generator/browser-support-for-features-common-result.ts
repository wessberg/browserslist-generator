import {CaniuseBrowser} from "./i-caniuse";

export interface BrowserSupportForFeaturesCommonResult {
	query: string[];
	browsers: Set<CaniuseBrowser>;
}
