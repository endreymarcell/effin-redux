import { configureStore } from "@reduxjs/toolkit";
import { counterSlice } from "./slices/counter";
import { infoSlice } from "./slices/info";
import { buildReducerMatrix } from "../lib/reducer";
import { fizzBuzzSlice } from "./slices/fizzBuzz";

const appReducer = buildReducerMatrix([[counterSlice, infoSlice], [fizzBuzzSlice]]);

export function createAppStore() {
  return configureStore({
    reducer: appReducer,
  });
}
