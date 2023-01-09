import { describe, test, expect, expectTypeOf } from "vitest";
import { createEffectInputs, createEffects, forSlice } from "./createEffects";

describe("createEffectInputs", () => {
  test("function must be async", () => {
    createEffectInputs<{}>()({
      correctVoid: () => {},
      correctAsync: async () => null,
      // @ts-expect-error
      incorrectNonAsync: () => null,
    });
  });
});

describe("createEffects", () => {
  test("effect with no argument", () => {
    const inputs = createEffectInputs<{}>()({
      fetchCount: async () => 99,
    });
    const effects = createEffects<{}>()(inputs, forSlice("test"));

    type FetchCount = typeof effects.fetchCount;
    type FetchCountArgs = Parameters<FetchCount>;
    type SerializedFetchCountInstance = ReturnType<FetchCount>;

    expectTypeOf<FetchCount>().not.toBeAny();
    expectTypeOf<FetchCount>().toBeFunction();

    expectTypeOf<FetchCountArgs>().not.toBeAny();
    expectTypeOf<FetchCountArgs>().toMatchTypeOf();

    expectTypeOf<SerializedFetchCountInstance>().not.toBeAny();
    expectTypeOf<SerializedFetchCountInstance["args"]>().not.toBeAny();
    expectTypeOf<SerializedFetchCountInstance>().toMatchTypeOf<{ sliceName: string; effectName: string; args: any }>();

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
    const effects = createEffects<{}>()(inputs, forSlice("test"));

    type SetNumber = typeof effects.setNumber;
    type SetNumberArgs = Parameters<SetNumber>;
    type FirstParamOfSetNumber = SetNumberArgs[0];
    type SerializedSetNumberInstance = ReturnType<SetNumber>;

    expectTypeOf<SetNumber>().not.toBeAny();
    expectTypeOf<SetNumber>().toBeFunction();

    expectTypeOf<FirstParamOfSetNumber>().not.toBeAny();
    expectTypeOf<FirstParamOfSetNumber>().toMatchTypeOf<{ whichNumber: number } | undefined>(); // TODO no undefined

    expectTypeOf<SerializedSetNumberInstance>().not.toBeAny();
    expectTypeOf<SerializedSetNumberInstance["args"]>().not.toBeAny();
    expectTypeOf<SerializedSetNumberInstance>().toMatchTypeOf<{
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

    type EffectFulfilledActionPayload = ReturnType<typeof effects.setNumber.fulfilled>["payload"];
    expectTypeOf<EffectFulfilledActionPayload>().not.toBeAny();
    expectTypeOf<EffectFulfilledActionPayload>().toMatchTypeOf<Awaited<number>>();
  });
});
