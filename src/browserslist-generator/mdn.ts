export type MdnBrowserName =
	| "webview_android"
	| "chrome"
	| "chrome_android"
	| "edge"
	| "edge_mobile"
	| "firefox"
	| "firefox_android"
	| "ie"
	| "nodejs"
	| "opera"
	| "opera_android"
	| "safari"
	| "safari_ios"
	| "samsunginternet_android";

export interface MdnSupportDict {
	/* eslint-disable @typescript-eslint/naming-convention */
	version_added: string | boolean;
	/* eslint-enable @typescript-eslint/naming-convention */
}

export type MdnSupportMapper = {[Key in MdnBrowserName]: MdnSupportDict};

export interface Mdn {
	/* eslint-disable @typescript-eslint/naming-convention */
	__compat: {
		mdn_url: string;
		support: MdnSupportMapper;
		/* eslint-enable @typescript-eslint/naming-convention */
	};
}
