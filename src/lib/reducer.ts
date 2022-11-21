import { AnyAction, combineReducers } from "redux";
import { typedObjectFromEntries } from "../utils";
import { Slice } from "@reduxjs/toolkit";

type Layers = Slice[][];

export function buildInitialState<TSlices extends Slice[]>(slices: TSlices) {
  type SliceNames = typeof slices[number]["name"];
  const allInitialStates: ReadonlyArray<[key: SliceNames, value: any]> = slices.map(
    (slice) => [slice.name, slice.getInitialState()] as const,
  );
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
