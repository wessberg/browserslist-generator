import {UseragentBrowserKind} from "./useragent-browser-kind";
import {UseragentEngineKind} from "./useragent-engine-kind";
import {UseragentOsKind} from "./useragent-os-kind";
import {UseragentVendorKind} from "./useragent-vendor-kind";

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
	"HeyTapBrowser"?: string;
	"Samsung Browser"?: string;
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

	// Workarounds that allows for extending ua-parser-js with custom browser names
	"iOS3.2"?: string;
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
