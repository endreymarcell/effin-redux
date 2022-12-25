import { setStoreForScheduledEffects } from "../effects/scheduling";
import { withEffects } from "../effects/withEffects";
import { configureStore as originalConfigureStore, Reducer } from "@reduxjs/toolkit";

export function configureStore<Store>(appReducer: Reducer<Store>) {
  const store = originalConfigureStore({ reducer: withEffects(appReducer) });
  setStoreForScheduledEffects(store);
  return store;
}
