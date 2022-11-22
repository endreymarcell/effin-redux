import { describe, test, expect, expectTypeOf } from "vitest";
import { buildInitialState, buildReducerMatrix } from "./reducer";
import { counterSlice, CounterState } from "../app/slices/counter";
import { infoSlice, InfoState } from "../app/slices/info";
import { fizzBuzzSlice, FizzBuzzState } from "../app/slices/fizzBuzz";
import { configureStore, Slice } from "@reduxjs/toolkit";
import { typedObjectFromEntries } from "../utils";
import { typedFlatten } from "../utils/arrays";

type ExpectedAppState = {
  counter: CounterState;
  info: InfoState;
  fizzBuzz: FizzBuzzState;
};

function getEntryForSlice<TName extends string, TState>(slice: Slice<TState, any, TName>): [TName, TState] {
  return [slice.name, slice.getInitialState()];
}

type SliceToEntry<TSlice> = TSlice extends Slice<infer TState, any, infer TName> ? [TName, TSlice] : never;

type SlicesToEntries<Tuple extends [...any[]]> = {
  [Index in keyof Tuple]: SliceToEntry<Tuple[Index]>;
} & { length: Tuple["length"] };

function mapOverTuple<TTuple extends [...any[]], TMapper extends (arg: any) => unknown>(
  tuple: Readonly<TTuple>,
  mapper: TMapper,
): {
  [Index in keyof TTuple]: SliceToEntry<TTuple[Index]>;
} & { length: TTuple["length"] } {
  return tuple.map(mapper) as any;
}

describe("buildInitialState", () => {
  test("combine + layer", () => {
    const layers = [[counterSlice, infoSlice], [fizzBuzzSlice]] as const;
    const slices = typedFlatten(layers);
    const allInitialStates = mapOverTuple(slices, getEntryForSlice);
    const initialState = typedObjectFromEntries(allInitialStates);

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
    const matrix = buildReducerMatrix([[counterSlice, infoSlice], [fizzBuzzSlice]]);
    const store = configureStore({ reducer: matrix });

    expectTypeOf(store.getState()).not.toBeUnknown();
    expectTypeOf(store.getState()).toMatchTypeOf<ExpectedAppState>();
    expect(store.getState().counter.count).toBe(0);
    expect(store.getState().info.appStatus).toMatchObject({ type: "good" });
    expect(store.getState().fizzBuzz.value).toBe(null);

    store.dispatch(counterSlice.actions.startCountingClicked());
    store.dispatch(counterSlice.actions.increaseCountClicked());
    expect(store.getState().counter.count).toBe(1);

    const error = "I can't get no";
    store.dispatch(infoSlice.actions.gotBadNews({ error }));
    expect(store.getState().info.appStatus).toMatchObject({ type: "bad", error });
  });
});
