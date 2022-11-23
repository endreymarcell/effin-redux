import { AnyAction, combineReducers } from "redux";
import { typedObjectFromEntries } from "../utils";
import { Slice } from "@reduxjs/toolkit";
import { typedFlatten } from "../utils/arrays";
import { myCombineReducers } from "./combineReducers";

type SliceToNameAndState<TSlice> = TSlice extends Slice<infer TState, any, infer TName> ? [TName, TState] : never;

export function slicesToNameAndStatePairs<TSlices extends Readonly<Slice[]>>(
  slices: Readonly<TSlices>,
): {
  [Index in keyof TSlices]: Readonly<SliceToNameAndState<TSlices[Index]>>;
} {
  return slices.map((slice: Slice) => [slice.name, slice.getInitialState()]) as any;
}

// TODO make type inference work properly rather than forcing a type assertion
export function buildInitialState<AppState extends {}>(layers: ReadonlyArray<unknown>): AppState {
  const slices = typedFlatten(layers);
  const allInitialStates = slicesToNameAndStatePairs(slices);
  const initialState = typedObjectFromEntries(allInitialStates);
  return initialState as AppState;
}

// TODO make it work without passing the TState type parameter
export function buildReducerMatrix<TState extends {}>(layers: ReadonlyArray<ReadonlyArray<Slice>>) {
  return (state: TState | undefined, action: AnyAction): TState => {
    if (state === undefined) {
      return buildInitialState(layers) as TState;
    }

    let newState: TState = state;
    layers.forEach((layer) => {
      const layerEntries = layer.map((slice) => [slice.name, slice.reducer]);
      const layerReducers = typedObjectFromEntries(layerEntries);
      const layerCombinedReducer = myCombineReducers(layerReducers, newState);
      const layerState = layerCombinedReducer(newState, action);
      newState = {
        ...newState,
        ...layerState,
      };
    });
    return newState as TState;
  };
}
