import { AnyAction, combineReducers } from "redux";
import { counterSlice, CounterState } from "../app/slices/counter";
import { infoSlice, InfoState } from "../app/slices/info";
import { fizzBuzzSlice, FizzBuzzState } from "../app/slices/fizzBuzz";
import { typedObjectFromEntries } from "../utils";

type FirstLayer = [typeof counterSlice, typeof infoSlice];
type SecondLayer = [typeof fizzBuzzSlice];

type Layers = [FirstLayer, SecondLayer];
type AppState = { counter: CounterState; info: InfoState; fizzBuzz: FizzBuzzState };

export function buildInitialState(layers: Layers) {
  const allSlicesFlattened = layers.flat();
  type AllSliceNames = typeof allSlicesFlattened[number]["name"];
  const allInitialStates: Array<[key: AllSliceNames, value: any]> = allSlicesFlattened.map((slice) => [
    slice.name,
    slice.getInitialState(),
  ]);
  return typedObjectFromEntries(allInitialStates);
}

export function buildReducerMatrix<TState = AppState>(layers: Layers) {
  return (state: TState | undefined, action: AnyAction) => {
    if (state === undefined) {
      return buildInitialState(layers);
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
