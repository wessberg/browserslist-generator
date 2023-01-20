import {CaniuseBrowser} from "./i-caniuse.js";

export interface BrowserSupportForFeaturesCommonResult {
	query: string[];
	browsers: Set<CaniuseBrowser>;
}
