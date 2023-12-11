import { setStoreForScheduledEffects } from "../effects";
import { withEffects } from "../effects";
import { configureStore as originalConfigureStore, Reducer } from "@reduxjs/toolkit";
import { replaceEffect } from "../effects/thunkLookupTable";

type TestUtils = {
  replaceEffect: typeof replaceEffect;
};

export function configureStore<Store>(appReducer: Reducer<Store>) {
  const store = originalConfigureStore({ reducer: withEffects(appReducer) });
  setStoreForScheduledEffects(store);
  const storeWithTestUtils: typeof store & { testUtils: TestUtils } = store as any;
  storeWithTestUtils.testUtils = { replaceEffect };
  return storeWithTestUtils;
}
