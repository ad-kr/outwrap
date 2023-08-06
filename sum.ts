/** Generic record */
export type GR = Record<string, unknown>;

export type Sum<T extends GR> = Partial<T>;
export type SumInstance<T extends Sum<GR>> = {
	[K in keyof T]-?: { variant: K; value: T[K] };
}[keyof T];
export type SumArr<T extends Sum<GR>> = {
	[K in keyof Required<T>]-?: [variant: K, value: Required<T>[K]];
}[keyof Required<T>];

export function sum<T extends Sum<GR>>(...args: SumArr<T>): T {
	const res = { [args[0]]: args[1] };
	return res as T;
}
