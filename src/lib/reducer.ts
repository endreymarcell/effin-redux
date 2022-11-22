import { AnyAction, combineReducers } from "redux";
import { typedObjectFromEntries } from "../utils";
import { Slice } from "@reduxjs/toolkit";

type Layers = Slice[][];

type Tuple1<T> = [T];
type Tuple2<T> = [T, T];
type Tuple3<T> = [T, T, T];
type Tuple4<T> = [T, T, T, T];
type Tuple5<T> = [T, T, T, T, T];
type Tuple<T> = Tuple1<T> | Tuple2<T> | Tuple3<T> | Tuple4<T> | Tuple5<T>;

type SliceEntry<TSlice> = TSlice extends Slice<infer TState, infer TReducers, infer TName> ? [TName, TState] : never;

function getEntryForSlice<TState, TName extends string>(slice: Slice<TState, any, TName>): [TName, TState] {
  return [slice.name, slice.getInitialState()];
}

export function buildInitialState<TSlices extends Tuple<Slice>>(slices: TSlices) {
  const allInitialStates = slices.map(getEntryForSlice);
  const result = typedObjectFromEntries(allInitialStates);
  return result;
}

export function buildReducerMatrix<TState>(layers: Layers) {
  return (state: TState | undefined, action: AnyAction): TState => {
    if (state === undefined) {
      return buildInitialState(layers.flat()) as TState;
    }

    let newState: TState = state;
    layers.forEach((layer) => {
      const layerEntries = layer.map((slice) => [slice.name, slice.reducer]);
      const layerReducers = typedObjectFromEntries(layerEntries);
      const layerCombinedReducer = combineReducers(layerReducers);
      const layerState = layerCombinedReducer(newState, action);
      newState = {
        ...newState,
        ...layerState,
      };
    });
    return newState as TState;
  };
}
