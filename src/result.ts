export class Ok {
	/**
	 * Identity function of the Ok class. Useful for things like mapping a result:
	 * ```
	 *  result.map({ ok: Ok.Iden })
	 * ```
	 */
	public static Iden(..._: unknown[]) {
		return new Ok();
	}
}
export class Err {
	/**
	 * Identity function of the Err class. Useful for things like mapping a result:
	 * ```
	 *  result.map({ err: Err.Iden })
	 * ```
	 */
	public static Iden(..._: unknown[]) {
		return new Ok();
	}
}

export class Result<O = Ok, E = Err> {
	constructor(public readonly value: O | E, private _isOk = true) {}

	/**
	 * Checks whether the value is ok.
	 */
	public isOk(): this is Result<O, never> {
		return this._isOk;
	}

	/**
	 * Checks whether the value is an error.
	 */
	public isErr(): this is Result<never, E> {
		return !this._isOk;
	}

	/**
	 * @throws Will throw an error if the value is not ok.
	 */
	public unwrap() {
		if (this.isOk()) return this.value as O;
		throw new Error("Result is not ok!");
	}

	/**
	 * Return value if it is ok, otherwise return supplied default.
	 */
	public unwrapOr(d: O) {
		if (this.isOk()) return this.value as O;
		return d;
	}

	/**
	 * Maps ok and/or err values to another value.
	 * ```
	 *  const result: Result<number, string[]> = //...
	 *  result.map({
	 *      ok: (o) => o * 20,
	 *      err: (e) => e[0]
	 *  })
	 * ```
	 */
	public map<NO = O, NE = E>(transform: {
		ok?: (v: O) => NO;
		err?: (v: E) => NE;
	}) {
		const val = this._isOk
			? transform.ok?.(this.value as O) ?? (this.value as NO)
			: transform.err?.(this.value as E) ?? (this.value as NE);
		return new Result<NO, NE>(val, this.isOk());
	}

	/**
	 * Takes an array of results, and if any of those are an error, returns an error. Otherwise returns ok.
	 */
	public static all(results: Result<unknown, unknown>[]): Result {
		if (results.some((r) => r.isErr())) return err();
		return ok();
	}

	/**
	 * Takes an array of results and flattens them into a single result.
	 */
	public static collect<T extends Result<unknown, unknown>[]>(results: T) {
		type OkType = T extends Result<infer x, unknown>[] ? x : never;
		type ErrType = T extends Result<unknown, infer x>[] ? x : never;

		const okList: OkType[] = [];
		const errList: ErrType[] = [];

		for (const res of results) {
			if (res.isOk()) {
				okList.push(res.value as OkType);
				continue;
			}
			errList.push(res.value as ErrType);
		}

		const isOk = errList.length === 0;
		return new Result<OkType[], ErrType[]>(isOk ? okList : errList, isOk);
	}

	/**
	 * Converts a throwable function into `Result<T, unknown>`.
	 */
	public static catch<T>(f: () => T): Result<T, unknown> {
		try {
			return ok(f());
		} catch (e) {
			return err(e);
		}
	}

	/**
	 * Resolves a promise and catches errors.
	 */
	public static async resolve<T>(p: Promise<T>): AsyncResult<T, unknown> {
		try {
			return ok(await p);
		} catch (e) {
			return err(e);
		}
	}
}

export type AsyncResult<O = Ok, E = Err> = Promise<Result<O, E>>;

export function ok(): Result<Ok, never>;
export function ok<O>(v: O): Result<O, never>;

export function ok<O>(v?: O) {
	if (v === undefined) return new Result<Ok, never>(new Ok());
	return new Result<O, never>(v);
}

export function err(): Result<never, Err>;
export function err<E>(v: E): Result<never, E>;

export function err<E>(v?: E) {
	if (v === undefined) return new Result<never, Err>(new Err(), false);
	return new Result<never, E>(v, false);
}
