import { describe, test, expect, expectTypeOf } from "vitest";
import { createEffectInputs, createEffects, forSlice } from "./createEffects";

describe("createEffects", () => {
  test("effect with no argument", () => {
    const inputs = createEffectInputs<{}>()({
      fetchCount: async () => 99,
    });
    const effects = createEffects(inputs, forSlice("test"));

    type FetchCount = typeof effects.fetchCount;
    type FetchCountArgs = Parameters<FetchCount>;
    type FetchTypeReturns = ReturnType<FetchCount>;

    expectTypeOf<FetchCount>().not.toBeAny();
    expectTypeOf<FetchCount>().toBeFunction();

    expectTypeOf<FetchCountArgs>().not.toBeAny();
    expectTypeOf<FetchCountArgs>().toMatchTypeOf();

    expectTypeOf<FetchTypeReturns>().not.toBeAny();
    expectTypeOf<FetchTypeReturns["args"]>().not.toBeAny();
    expectTypeOf<FetchTypeReturns>().toMatchTypeOf<{ sliceName: string; effectName: string; args: any }>();

    // @ts-expect-error
    effects.fetchCount("unexpected-argument");

    expect(effects.fetchCount()).toMatchObject({
      sliceName: "test",
      effectName: "fetchCount",
      args: undefined,
    });
  });

  test("effect with argument", () => {
    const inputs = createEffectInputs<{}>()({
      setNumber: async ({ whichNumber }: { whichNumber: number }) => whichNumber,
    });
    const effects = createEffects(inputs, forSlice("test"));

    type SetNumber = typeof effects.setNumber;
    type SetNumberArgs = Parameters<SetNumber>;
    type FirstParamOfSetNumber = SetNumberArgs[0];
    type SetNumberReturns = ReturnType<SetNumber>;

    expectTypeOf<SetNumber>().not.toBeAny();
    expectTypeOf<SetNumber>().toBeFunction();

    expectTypeOf<FirstParamOfSetNumber>().not.toBeAny();
    expectTypeOf<FirstParamOfSetNumber>().toMatchTypeOf<{ whichNumber: number } | undefined>(); // TODO no undefined

    expectTypeOf<SetNumberReturns>().not.toBeAny();
    expectTypeOf<SetNumberReturns["args"]>().not.toBeAny();
    expectTypeOf<SetNumberReturns>().toMatchTypeOf<{
      sliceName: string;
      effectName: string;
      args: { whichNumber: number };
    }>();

    // @ts-expect-error
    effects.setNumber();

    // @ts-expect-error
    effects.setNumber({ areTheseTheDroidsYouAreLookingFor: false });

    expect(effects.setNumber({ whichNumber: 88 })).toMatchObject({
      sliceName: "test",
      effectName: "setNumber",
      args: { whichNumber: 88 },
    });
  });
});
