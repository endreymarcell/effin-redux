import { describe, test, expect, expectTypeOf } from "vitest";
import { createEffectInputs, createEffects, forSlice } from "./createEffects";

describe("createEffects", () => {
  test("effect with no argument", () => {
    const inputs = createEffectInputs<{}>()({
      fetchCount: async () => 99,
    });
    const effects = createEffects(inputs, forSlice("test"));

    type FetchCount = typeof effects.fetchCount;

    expectTypeOf<FetchCount>().not.toBeAny();
    expectTypeOf<FetchCount>().toBeFunction();

    expectTypeOf<Parameters<FetchCount>>().not.toBeAny();
    expectTypeOf<Parameters<FetchCount>>().toMatchTypeOf();

    expectTypeOf<ReturnType<FetchCount>>().not.toBeAny();
    expectTypeOf<ReturnType<FetchCount>["args"]>().not.toBeAny();
    expectTypeOf<ReturnType<FetchCount>>().toMatchTypeOf<{ sliceName: string; effectName: string; args: any }>();

    expect(effects.fetchCount).toMatchObject({
      sliceName: "test",
      effectName: "fetchCount",
      args: undefined,
    });
  });

  test.only("effect with argument", () => {
    const inputs = createEffectInputs<{}>()({
      setNumber: async ({ whichNumber }: { whichNumber: number }) => whichNumber,
    });
    const effects = createEffects(inputs, forSlice("test"));

    type SetNumber = typeof effects.setNumber;
    type FirstParamOfSetNumber = Parameters<SetNumber>[0];

    expectTypeOf<SetNumber>().not.toBeAny();
    expectTypeOf<SetNumber>().toBeFunction();

    expectTypeOf<FirstParamOfSetNumber>().not.toBeAny();
    expectTypeOf<FirstParamOfSetNumber>().toMatchTypeOf<{ whichNumber: number } | undefined>(); // TODO no undefined

    expectTypeOf<ReturnType<SetNumber>>().not.toBeAny();
    expectTypeOf<ReturnType<SetNumber>["args"]>().not.toBeAny();
    expectTypeOf<ReturnType<SetNumber>>().toMatchTypeOf<{
      sliceName: string;
      effectName: string;
      args: { whichNumber: number };
    }>();

    expect(effects.setNumber({ whichNumber: 88 })).toMatchObject({
      sliceName: "test",
      effectName: "setNumber",
      args: { whichNumber: 88 },
    });
  });
});
