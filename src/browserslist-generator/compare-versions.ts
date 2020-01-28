/**
 * Compares two versions, a and b
 */
export function compareVersions(a: string, b: string): number {
	const normalizedA = isNaN(parseFloat(a)) ? a : parseFloat(a);
	const normalizedB = isNaN(parseFloat(b)) ? b : parseFloat(b);

	if (typeof normalizedA === "string" && typeof normalizedB !== "string") {
		return 1;
	}

	if (typeof normalizedB === "string" && typeof normalizedA !== "string") {
		return -1;
	}

	if (normalizedA < normalizedB) return -1;
	if (normalizedA > normalizedB) return 1;
	return 0;
}
