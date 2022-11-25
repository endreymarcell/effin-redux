import { configureStore } from "@reduxjs/toolkit";
import { buildReducerMatrix } from "$lib";

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

export function createAppStore() {
  return configureStore({
    reducer: appReducer,
  });
}