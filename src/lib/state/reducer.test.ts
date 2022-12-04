import { describe, test, expect, expectTypeOf } from "vitest";
import { buildInitialState, buildReducerMatrix } from "./reducer";
import { counterSlice, CounterState } from "$app/slices/counter";
import { infoSlice, InfoState } from "$app/slices/info";
import { fizzBuzzSlice, FizzBuzzState } from "$app/slices/fizzBuzz";
import { configureStore } from "@reduxjs/toolkit";

type ExpectedAppState = {
  counter: CounterState;
  info: InfoState;
  fizzBuzz: FizzBuzzState;
};

describe("buildInitialState", () => {
  test("combine + layer", () => {
    const layers = [[counterSlice, infoSlice], [fizzBuzzSlice]] as const;
    const initialState = buildInitialState<ExpectedAppState>(layers);

    expectTypeOf(initialState).toMatchTypeOf<ExpectedAppState>();
    expectTypeOf(initialState.counter).not.toBeAny();
    expectTypeOf(initialState.counter).toMatchTypeOf<CounterState>();
    expectTypeOf(initialState.info).not.toBeAny();
    expectTypeOf(initialState.info).toMatchTypeOf<InfoState>();
    expectTypeOf(initialState.fizzBuzz).not.toBeAny();
    expectTypeOf(initialState.fizzBuzz).toMatchTypeOf<FizzBuzzState>();

    expect(initialState).toMatchObject({
      counter: counterSlice.getInitialState(),
      info: infoSlice.getInitialState(),
      fizzBuzz: fizzBuzzSlice.getInitialState(),
    });
  });
});

describe("buildReducerMatrix", () => {
  test("combine + layer", () => {
    const matrix = buildReducerMatrix<ExpectedAppState>([[counterSlice, infoSlice], [fizzBuzzSlice]]);
    const store = configureStore({ reducer: matrix });

    expectTypeOf(store.getState()).not.toBeUnknown();
    expectTypeOf(store.getState()).toMatchTypeOf<ExpectedAppState>();
    expect(store.getState().counter.count).toBe(0);
    expect(store.getState().info.appStatus).toMatchObject({ type: "good" });
    expect(store.getState().fizzBuzz.value).toBe(null);

    store.dispatch(counterSlice.actions.startCountingClicked());
    store.dispatch(counterSlice.actions.increaseCountClicked());
    expect(store.getState().counter.count).toBe(1);

    const error = "No, this is Patrick!";
    store.dispatch(infoSlice.actions.gotBadNews({ error }));
    expect(store.getState().info.appStatus).toMatchObject({ type: "bad", error });

    type FizzBuzzStateWithMaybeAppState = FizzBuzzState & { $$appState: unknown };
    const fizzBuzzStateWithMaybeAppState = store.getState().fizzBuzz as FizzBuzzStateWithMaybeAppState;
    expect(fizzBuzzStateWithMaybeAppState.$$appState).toBeUndefined();
  });
});
