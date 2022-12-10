import { counterSlice } from "./slices/counter";
import { infoSlice } from "./slices/info";
import { fizzBuzzSlice } from "./slices/fizzBuzz";
import { getHelpers } from "$lib/helpers";
import { combineSlices } from "$lib/state/combineSlices";
import { configureStore } from "$lib/state/appStore";

const appReducer = combineSlices([counterSlice, infoSlice, fizzBuzzSlice] as const);
export const createAppStore = () => configureStore(appReducer); // Expose store creator function for tests
export const store = createAppStore();

export type AppState = ReturnType<typeof store.getState>;
export const { addEffect, readAppState } = getHelpers<AppState>();
