import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { counterSlice } from "./slices/counter";
import { infoSlice } from "./slices/info";

const appReducer = combineReducers({
  counter: counterSlice.reducer,
  info: infoSlice.reducer,
});

export function createAppStore() {
  return configureStore({
    reducer: appReducer,
  });
}
