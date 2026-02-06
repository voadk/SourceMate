export function getFirstOrNull<T>(arr: T[]): T | null {
	return arr.length > 0 ? arr[0] : null;
}
export function getFirstOrThrow<T>(arr: T[]): T {
	const first = getFirstOrNull(arr);
	if (first === null) throw new Error('Array is empty');
	return first;
}
export function tryOrNull<T>(fn: () => T): T | null {
	try {
		return fn();
	} catch {
		return null;
	}
}
