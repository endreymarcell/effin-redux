import { setStoreForScheduledEffects } from "../effects";
import { withEffects } from "../effects";
import { configureStore as originalConfigureStore, ConfigureStoreOptions, Reducer } from "@reduxjs/toolkit";
import { replaceEffect, restoreEffect } from "../effects/replaceEffect";

type TestUtils = {
  replaceEffect: typeof replaceEffect;
  restoreEffect: typeof restoreEffect;
};

export function configureStore<State>({
  reducer,
  ...rest
}: { reducer: Reducer<State> } & Omit<ConfigureStoreOptions<State>, "reducer">) {
  const store = originalConfigureStore({ ...rest, reducer: withEffects(reducer) });
  setStoreForScheduledEffects(store);
  const storeWithTestUtils: typeof store & { testUtils: TestUtils } = store as any;
  storeWithTestUtils.testUtils = {
    replaceEffect,
    restoreEffect,
  };
  return storeWithTestUtils;
}
