export type Sum<T extends Record<string, any>> = T;
export type SumInstance<T extends Sum<Record<string, any>>> = {[K in keyof T]-?: {variant: K, value: T[K]}}[keyof T];