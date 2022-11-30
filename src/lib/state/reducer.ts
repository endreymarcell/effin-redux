import { AnyAction } from "redux";
import { ActionReducerMapBuilder, PayloadAction, Slice } from "@reduxjs/toolkit";
import { typedObjectFromEntries, typedObjectKeys } from "$utils";
import { typedFlatten } from "$utils";
import { myCombineReducers } from "./combineReducers";
import { StateWithEffects } from "../effects/withEffects";
import produce from "immer";

type ReducersForState<State> = Record<string, (state: StateWithEffects<State>, action: PayloadAction<any>) => void>;

export function createReducers<State extends {}>() {
  return function inner<Reducers extends ReducersForState<State>>(reducers: Reducers) {
    return reducers;
  };
}

export function createExtraReducers<State extends {}>(
  extraReducers: (builder: ActionReducerMapBuilder<State>) => void,
) {
  return extraReducers;
}

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
    newState = withoutAppStates(newState);
    return newState as TState;
  };
}

type SliceStateWithMaybeAppState = {
  [key: string]: unknown;
  $$appState?: unknown;
};

function withoutAppStates<State extends { [key: string]: SliceStateWithMaybeAppState }>(state: State): State {
  return produce(state, (draft) => {
    typedObjectKeys(draft).forEach((sliceName) => {
      if ("$$appState" in draft[sliceName]) {
        delete draft[sliceName].$$appState;
      }
    });
  });
}
