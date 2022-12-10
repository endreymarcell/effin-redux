import { describe, test, expect } from "vitest";
import { createAppStore } from "$app";
import { counterSlice, CounterState } from "./counter";

const { actions, reducer, getInitialState } = counterSlice;
const initialState = getInitialState();
type NewState = CounterState & { $$effects?: any };

describe("counter slice", () => {
  describe("test the reducer in isolation", () => {
    test("simple action", () => {
      expect(initialState.count).toBe(0);
      const newState: NewState = reducer(initialState, actions.increaseCountClicked());
      expect(newState.count).toBe(1);
    });

    test("action with side effect", () => {
      const newState: NewState = reducer(initialState, actions.externalNumberRequested());
      expect(newState.$$effects[0]).toMatchObject({
        sliceName: "counter",
        effectName: "fetchExternalNumber",
        args: undefined,
      });
    });

    test("action with side effect that takes an argument", () => {
      const newState: NewState = reducer(initialState, actions.specificNumberRequested({ requestedNumber: 54 }));
      expect(newState.$$effects[0]).toMatchObject({
        sliceName: "counter",
        effectName: "setSpecificNumber",
        args: { requestedNumber: 54 },
      });
    });
  });

  describe("test as part of the store", () => {
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
});
