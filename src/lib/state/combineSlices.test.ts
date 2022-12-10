import { counterSlice, CounterState } from "$app/slices/counter";
import { fizzBuzzSlice, FizzBuzzState } from "$app/slices/fizzBuzz";
import { infoSlice, InfoState } from "$app/slices/info";
import { describe, test, expect, expectTypeOf } from "vitest";
import { getInitialState } from "./combineSlices";

describe("getInitialState", () => {
  test("works with a single slice", () => {
    const slices = [infoSlice] as const;
    const initialState = getInitialState(slices);

    type ExpectedState = {
      info: InfoState;
    };

    expect(initialState).toMatchObject({
      info: infoSlice.getInitialState(),
    });
    expectTypeOf(initialState).toMatchTypeOf<ExpectedState>();
  });

  test("works with multiple slices", () => {
    const slices = [infoSlice, fizzBuzzSlice, counterSlice] as const;
    const initialState = getInitialState(slices);

    type ExpectedState = {
      info: InfoState;
      fizzBuzz: FizzBuzzState;
      counter: CounterState;
    };

    expect(initialState).toMatchObject({
      info: infoSlice.getInitialState(),
      fizzBuzz: fizzBuzzSlice.getInitialState(),
      counter: counterSlice.getInitialState(),
    });
    expectTypeOf(initialState).toMatchTypeOf<ExpectedState>();
  });
});
