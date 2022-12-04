import { createAppStore } from "$app";
import { counterSlice } from "$app/slices/counter";

const store = createAppStore();
store.dispatch(counterSlice.actions.externalNumberRequested());
setTimeout(() => console.log(store.getState()), 1000);
