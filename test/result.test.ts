import { expect, test } from "vitest";
import { Err, Result, err, ok } from "../src/result";

test("Result mapping", () => {
	const okResult = ok(42);
	const errResult = err("Hello ");

	const emptyMap = okResult.map({
		err: () => {
			throw new Error("This function should not run!");
		},
	});
	const mappedOk = okResult.map({ ok: (o) => o * 3 });
	const mappedErr = errResult.map({ err: (e) => e + "world!" });

	expect(emptyMap.value).toBe(42);
	expect(mappedOk.value).toBe(126);
	expect(mappedErr.value).toBe("Hello world!");
});

test("Result catching", () => {
	function throwError() {
		throw new Error();
	}

	function returnNumber() {
		return 42;
	}

	const throwRes = Result.catch(throwError);
	const normalRes = Result.catch(returnNumber);

	expect(throwRes.value).instanceOf(Error);
	expect(normalRes.value).toBe(42);
});

test("Result all", () => {
	const resArray = [ok(42), err("Error!"), ok(true), err(500)];
	const result = Result.all(resArray);

	expect(result.value).instanceOf(Err);
});

test("Result all resolved", async () => {
	async function promiseOk(input: unknown) {
		return ok(input);
	}

	async function promiseErr(input: unknown) {
		return err(input);
	}

	const resArray = [
		promiseOk(42),
		promiseErr("Error!"),
		promiseOk(true),
		promiseErr(500),
	];
	const result = await Result.allResolved(resArray);

	expect(result.value).instanceOf(Err);
});

test("Result collect", () => {
	const okArray = [ok(42), ok(true)];
	const errArray = [ok(42), err("Error!"), ok(true), err(500)];
	const okResult = Result.collect(okArray);
	const errResult = Result.collect(errArray);

	expect(okResult.value).toStrictEqual([42, true]);
	expect(errResult.value).toStrictEqual(["Error!", 500]);
});

test("Result collect resolved", async () => {
	async function promiseOk(input: unknown) {
		return ok(input);
	}

	async function promiseErr(input: unknown) {
		return err(input);
	}

	const okArray = [promiseOk(42), promiseOk(true)];
	const errArray = [
		promiseOk(42),
		promiseErr("Error!"),
		promiseOk(true),
		promiseErr(500),
	];
	const okResult = await Result.collectResolved(okArray);
	const errResult = await Result.collectResolved(errArray);

	expect(okResult.value).toStrictEqual([42, true]);
	expect(errResult.value).toStrictEqual(["Error!", 500]);
});
