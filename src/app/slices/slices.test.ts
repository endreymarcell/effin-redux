import { describe, test, expect } from "vitest";
import { createAppStore } from "$app";
import { counterSlice } from "./counter";

describe("counter slice", () => {
  test("increase and reset", () => {
    const store = createAppStore();
    expect(store.getState().counter.count).toBe(0);

    store.dispatch(counterSlice.actions.increaseCountClicked());
    expect(store.getState().counter.count).toBe(1);

    store.dispatch(counterSlice.actions.increaseCountClicked());
    expect(store.getState().counter.count).toBe(2);

    store.dispatch(counterSlice.actions.resetCountClicked());
    expect(store.getState().counter.count).toBe(0);
  });

  test("automated counting", async () => {
    const store = createAppStore();
    expect(store.getState().counter.count).toBe(0);

    store.dispatch(counterSlice.actions.startCountingClicked());
    expect(store.getState().counter.isCounting).toBe(false);

    await new Promise(process.nextTick);
    expect(store.getState().counter.isCounting).toBe(true);

    store.dispatch(counterSlice.actions.countIntervalTicked());
    expect(store.getState().counter.count).toBe(1);
  });
});
