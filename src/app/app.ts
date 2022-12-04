import { configureStore } from "@reduxjs/toolkit";
import { buildReducerMatrix, setStoreForScheduledEffects, withEffects } from "$lib";
import { getHelpers } from "$lib/helpers";

import { counterSlice } from "./slices/counter";
import { infoSlice } from "./slices/info";
import { fizzBuzzSlice } from "./slices/fizzBuzz";

// TODO this should just be inferred
export type AppState = {
  counter: ReturnType<typeof counterSlice["getInitialState"]>;
  info: ReturnType<typeof infoSlice["getInitialState"]>;
  fizzBuzz: ReturnType<typeof fizzBuzzSlice["getInitialState"]>;
};

const sliceLayers = [[counterSlice, infoSlice], [fizzBuzzSlice]] as const;
const appReducer = buildReducerMatrix<AppState>(sliceLayers);
export const { addEffect, readAppState } = getHelpers<AppState>();

export function createAppStore() {
  // TODO type param should not be necessary
  const store = configureStore<AppState>({
    reducer: withEffects(appReducer),
  });
  // TODO to be fair, this is also pretty bad
  setStoreForScheduledEffects(store);
  return store;
}
