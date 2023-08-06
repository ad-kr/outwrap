import { GR, Sum } from "./sum";

type MatchObject<T extends Sum<GR>> = {
	[K in keyof Required<T>]: (v: Required<T>[K]) => unknown;
};

type OptionalMatchObject<T extends Sum<GR>> = {
	[K in keyof T]: (v: T[K]) => unknown;
} & { _: () => void };

export function match<T extends Sum<GR>>(value: T, matches: MatchObject<T>) {
	const key: keyof T | undefined = Object.keys(value)[0];
	if (key === undefined) throw new Error("No match found!");

	const val = value[key];
	const func = matches[key];
	func(val);
}

export function optionalMatch<T extends Sum<GR>>(
	value: T,
	matches: OptionalMatchObject<T>
) {
	const key: keyof T | undefined = Object.keys(value)[0];
	if (key === undefined) {
		matches["_"]();
		return;
	}
	const func: OptionalMatchObject<T>[keyof T] | undefined = matches[key];

	if (func === undefined) {
		matches["_"]();
		return;
	}

	const val = value[key];
	(func as MatchObject<T>[keyof T])(val);
}
