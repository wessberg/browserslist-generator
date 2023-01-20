import {UseragentBrowserKind} from "./useragent-browser-kind.js";
import {UseragentEngineKind} from "./useragent-engine-kind.js";
import {UseragentOsKind} from "./useragent-os-kind.js";
import {UseragentVendorKind} from "./useragent-vendor-kind.js";

/* eslint-disable @typescript-eslint/naming-convention */

export interface UseragentBrowser {
	name: UseragentBrowserKind | undefined;

	/**
	 * Determined dynamically
	 */
	version: string | undefined;

	/**
	 * Determined dynamically
	 * @deprecated
	 */
	major: string | undefined;

	// Workarounds that allows for extending ua-parser-js with custom browser names
	"Sogou Explorer"?: string;
	HeyTapBrowser?: string;
	"Samsung Browser"?: string;
	WAP?: string;
}

export interface UseragentDevice {
	/**
	 * Determined dynamically
	 */
	model: string | undefined;
	type: string | undefined;
	vendor: UseragentVendorKind | undefined;
}

export interface UseragentOs {
	name: UseragentOsKind | undefined;
	/**
	 * Determined dynamically
	 */
	version: string | undefined;
}

export interface UseragentEngine {
	name: UseragentEngineKind | undefined;
	/**
	 * Determined dynamically
	 */
	version: string | undefined;

	// Workaround that allows for extending ua-parser-js
	blink?: string;
}
