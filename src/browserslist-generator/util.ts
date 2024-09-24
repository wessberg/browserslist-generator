export function assertNonEmptyArray<T>(array: T[], message = "Array is empty"): asserts array is [first: T, ...rest: T[]] {
	if (array.length === 0) {
		throw new Error(message);
	}

	return;
}
