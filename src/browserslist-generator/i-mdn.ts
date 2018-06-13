export declare type MdnBrowserName = "webview_android"|"chrome"|"chrome_android"|"edge"|"edge_mobile"|"firefox"|"firefox_android"|"ie"|"nodejs"|"opera"|"opera_android"|"safari"|"safari_ios"|"samsunginternet_android";

export interface IMdnSupportDict {
	version_added: string|boolean;
}

export declare type MdnSupportMapper = {
	[Key in MdnBrowserName]: IMdnSupportDict;
};

// tslint:disable:no-any
export interface IMdn {
	__compat: {
		mdn_url: string;
		support: MdnSupportMapper;
	};
}