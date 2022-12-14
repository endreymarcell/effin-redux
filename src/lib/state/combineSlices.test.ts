import { counterSlice, CounterState } from "../../demo-app/slices/counter";
import { fizzBuzzSlice, FizzBuzzState } from "../../demo-app/slices/fizzBuzz";
import { infoSlice, InfoState } from "../../demo-app/slices/info";
import { describe, test, expect, expectTypeOf } from "vitest";
import { getInitialState, SlicesToState } from "./combineSlices";

describe("SlicesToState type helper", () => {
  test("single slice", () => {
    const slices = [infoSlice] as const;
    type ExpectedState = {
      info: InfoState;
    };
    type ResultState = SlicesToState<typeof slices>;
    expectTypeOf<ExpectedState>().toMatchTypeOf<ResultState>();
  });

  test("multiple slices", () => {
    const slices = [infoSlice, fizzBuzzSlice, counterSlice] as const;
    type ExpectedState = {
      info: InfoState;
      fizzBuzz: FizzBuzzState;
      counter: CounterState;
    };
    type ResultState = SlicesToState<typeof slices>;
    expectTypeOf<ExpectedState>().toMatchTypeOf<ResultState>();
  });
});

describe("getInitialState", () => {
  test("single slice", () => {
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

  test("multiple slices", () => {
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
