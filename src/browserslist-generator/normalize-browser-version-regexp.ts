/**
 * A Regular Expression that captures the part of a browser version that should be kept
 * @type {RegExp}
 */
export const NORMALIZE_BROWSER_VERSION_REGEXP = /(?![\d.,]+-)-*(.*)/;