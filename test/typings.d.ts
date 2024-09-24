declare module "useragent-generator" {
	type Fn = (version?: string | number) => string;
	interface Browser {
		androidPhone: Fn;
		androidTablet: Fn;
		androidWebview: Fn;
		windowsPhone: Fn;
		iOS: Fn;
		iOSWebview: Fn;
		chromecast: Fn;
		(version?: string | number): string;
	}

	export const firefox: Browser;
	export const chrome: Browser;
	export const edge: Browser;
	export const bingBot: Browser;
	export const googleBot: Browser;
	export const ie: Browser;
	export const safari: Browser;
}
