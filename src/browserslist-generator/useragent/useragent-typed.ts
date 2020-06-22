import {UseragentBrowserKind} from "./useragent-browser-kind";
import {UseragentEngineKind} from "./useragent-engine-kind";
import {UseragentOsKind} from "./useragent-os-kind";
import {UseragentVendorKind} from "./useragent-vendor-kind";

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
}
