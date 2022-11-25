import { describe, test, expect } from "vitest";
import { createAppStore } from "../app";
import { counterSlice } from "./counter";

describe("counter slice", () => {
  test("actions work as expected", () => {
    const store = createAppStore();
    expect(store.getState().counter.count).toBe(0);

    store.dispatch(counterSlice.actions.startCountingClicked());
    expect(store.getState().counter.count).toBe(0);

    store.dispatch(counterSlice.actions.increaseCountClicked());
    expect(store.getState().counter.count).toBe(1);

    store.dispatch(counterSlice.actions.stopCountingClicked());
    expect(store.getState().counter.count).toBe(1);

    store.dispatch(counterSlice.actions.increaseCountClicked());
    expect(store.getState().counter.count).toBe(1);

    store.dispatch(counterSlice.actions.resetCountClicked());
    expect(store.getState().counter.count).toBe(0);
  });
});
