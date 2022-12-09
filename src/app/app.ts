import { configureStore } from "@reduxjs/toolkit";
import { setStoreForScheduledEffects, withEffects } from "$lib";
import { getHelpers } from "$lib/helpers";

import { counterSlice } from "./slices/counter";
import { infoSlice } from "./slices/info";
import { fizzBuzzSlice } from "./slices/fizzBuzz";
import { combineSlices } from "$lib/state/combineSlices";

const appReducer = combineSlices([counterSlice, infoSlice, fizzBuzzSlice] as const);

export function createAppStore() {
  const store = configureStore({ reducer: withEffects(appReducer) });
  setStoreForScheduledEffects(store);
  return store;
}

export type AppState = ReturnType<ReturnType<typeof createAppStore>["getState"]>;
export const { addEffect, readAppState } = getHelpers<AppState>();
