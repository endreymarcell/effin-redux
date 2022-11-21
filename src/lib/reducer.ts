import { AnyAction, combineReducers } from "redux";
import { CounterState } from "../app/slices/counter";
import { InfoState } from "../app/slices/info";
import { FizzBuzzState } from "../app/slices/fizzBuzz";
import { typedObjectFromEntries } from "../utils";
import { Slice } from "@reduxjs/toolkit";

type Layers = Array<Array<Slice>>;
type AppState = { counter: CounterState; info: InfoState; fizzBuzz: FizzBuzzState };

export function buildInitialState<TSlices extends Slice[]>(slices: TSlices) {
  type SliceNames = typeof slices[number]["name"];
  const allInitialStates: Array<[key: SliceNames, value: any]> = slices.map((slice) => [
    slice.name,
    slice.getInitialState(),
  ]);
  const result: { [key in SliceNames]: ReturnType<TSlices[0]["getInitialState"]> } =
    typedObjectFromEntries(allInitialStates);
  return result;
}

export function buildReducerMatrix<TState = AppState>(layers: Layers) {
  return (state: TState | undefined, action: AnyAction) => {
    if (state === undefined) {
      return buildInitialState(layers.flat());
    }

    let newState: TState = state;
    layers.forEach((layer) => {
      type LayerKeys = typeof layer[number]["name"];
      const layerEntries: Array<[key: LayerKeys, value: any]> = layer.map((slice) => [slice.name, slice.reducer]);
      const layerReducers = typedObjectFromEntries(layerEntries);
      const layerCombinedReducer = combineReducers(layerReducers);
      const layerState = layerCombinedReducer(newState, action);
      newState = {
        ...newState,
        ...layerState,
      };
    });
    return newState;
  };
}
