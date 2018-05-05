import {UseragentBrowser} from "./useragent-browser";
import {UseragentOS} from "./useragent-os";
import {UseragentVendor} from "./useragent-vendor";

export interface IUseragentBrowser {

	name: UseragentBrowser | undefined;

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

export interface IUseragentDevice {
	/**
	 * Determined dynamically
	 */
	model: string | undefined;
	type: string | undefined;
	vendor: UseragentVendor | undefined;
}

export interface IUseragentOS {

	name: UseragentOS | undefined;
	/**
	 * Determined dynamically
	 */
	version: string | undefined;
}