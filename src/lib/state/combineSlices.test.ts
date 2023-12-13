import { counterSlice, CounterState } from "../../demo-app/slices/counter";
import { fizzBuzzSlice, FizzBuzzState } from "../../demo-app/slices/fizzBuzz";
import { infoSlice, InfoState } from "../../demo-app/slices/info";
import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest";
import { combineSlices, getInitialState, SlicesToState } from "./combineSlices";
import { createSlice } from "@reduxjs/toolkit";
import { configureStore } from "./appStore";

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

const errorSlice = createSlice({
  name: "error",
  initialState: {},
  reducers: {
    testAction: () => {
      throw new Error("Catch me if you can");
    },
  },
});

describe("exceptions thrown from the reducers", () => {
  beforeEach(() => {
    global.console.error = vi.fn();
  });

  test("exceptions are being caught", () => {
    const store = configureStore({ reducer: combineSlices([errorSlice] as const) });
    expect(() => store.dispatch(errorSlice.actions.testAction())).not.toThrow();
  });

  test("onError callback is being called", () => {
    const onError = vi.fn();
    const store = configureStore({ reducer: combineSlices([errorSlice] as const, onError) });

    store.dispatch(errorSlice.actions.testAction());

    expect(onError).toHaveBeenCalled();
  });
});
