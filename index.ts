import { Sum, SumInstance } from "./sum";

type Result = Sum<{ Ok: string; None: number }>;

const res2: SumInstance<Result> = { variant: "None", value: 0 };
