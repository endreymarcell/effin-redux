import { ActionReducerMapBuilder, PayloadAction } from "@reduxjs/toolkit";
import { StateWithEffects } from "../../lib";

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
