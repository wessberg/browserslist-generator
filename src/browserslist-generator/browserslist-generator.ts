// @ts-ignore
import {getSupport} from "caniuse-api";

/**
 * Generates a Browserslist based on browser support for the given features
 * @param {string[]} features
 * @returns {string}
 */
export function browsersWithSupportForFeatures (...features: string[]): string[] {
	// A map between browser names and their required versions
	const browserMap: Map<string, number> = new Map();

	for (const feature of features) {
		const support = getSupport(feature);
		Object.entries(support).forEach(([browser, stats]) => {
			const version = (<{y: number}>stats).y;

			if (version != null) {
				// Get the existing version, if any
				const existingVersion = browserMap.get(browser);
				// If there is no existing version, or if the required version is greater than the existing one, update it
				if (existingVersion == null || version > existingVersion) {
					browserMap.set(browser, version);
				}
			}
		});
	}
	// Finally, generate a string array of the browsers
	return Array.from(browserMap.entries())
		.map(([browser, version]) => `${browser} >= ${version}`);
}