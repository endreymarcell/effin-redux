import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { counterSlice } from "./slices/counter";

const appReducer = combineReducers({ counter: counterSlice.reducer });

export function createAppStore() {
  return configureStore({
    reducer: appReducer,
  });
}
